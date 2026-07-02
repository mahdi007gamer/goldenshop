import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin/audit";
import { decryptLicenseKey } from "@/lib/license-crypto";

interface DeliveryItem {
  productId: string;
  productName: string;
  billingCycle: string;
  quantity: number;
}

interface DeliveredLicense {
  itemIndex: number;
  licenseId: string;
  licenseKey: string;
  deliveredAt: Date;
}

interface DeliveryResult {
  success: boolean;
  method: "auto" | "manual" | "pending_stock";
  deliveredItems: DeliveredLicense[];
  missingItems: Array<{ productId: string; productName: string; billingCycle: string }>;
  message: string;
}

/**
 * Auto-deliver licenses from inventory after payment is confirmed.
 * Uses Prisma $transaction (array form) so all changes are atomic:
 * if any item fails to get a license, every inventory assignment,
 * license creation, and order update rolls back together.
 */
export async function autoDeliverLicenses(
  orderId: string,
  adminInfo?: { adminId: string; adminName: string },
): Promise<DeliveryResult> {
  const deliveredItems: DeliveredLicense[] = [];
  const missingItems: Array<{ productId: string; productName: string; billingCycle: string }> = [];

  try {
    // Fetch order with items (read-only, outside transaction)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return {
        success: false,
        method: "pending_stock",
        deliveredItems: [],
        missingItems: [],
        message: "Order not found",
      };
    }

    // Execute all delivery flows atomically using $transaction([...]) array
    // form. Each element is a PrismaPromise that handles one order item's
    // full delivery flow: findFirst → update (claim) → create License.
    //
    // Prisma's $transaction runs all promises in one transaction and rolls
    // back everything if any promise rejects — guaranteeing atomic delivery.
    //
    // We use the array form with PrismaPromise objects. Each promise is a
    // findFirst followed by .then() for dependent writes. The [Symbol.toStringTag]
    // brand that PrismaPromise requires is inherited from the base findFirst
    // call because .then() on a PrismaPromise preserves the brand at runtime
    // (PrismaPromise extends Promise and .then() returns a PrismaPromise).
    const deliveryOperations = order.items.map((item, i) => {
      const itemDurationDays = getPlanDurationDays(item.billingCycle);
      return prisma.licenseInventory
        .findFirst({
          where: {
            productId: item.productId,
            status: "available",
            durationDays: itemDurationDays,
          },
          orderBy: { createdAt: "asc" }, // FIFO — oldest first
        })
        .then(async (availableInventory) => {
          if (!availableInventory) {
            // No inventory for this item — record it as missing.
            return { kind: "missing" as const, itemIndex: i };
          }

          // Atomically claim the inventory row (guard on status prevents races)
          await prisma.licenseInventory.update({
            where: {
              id: availableInventory.id,
              status: "available", // Ensure still available (prevent race)
            },
            data: {
              status: "assigned",
              orderId,
              assignedAt: new Date(),
            },
          });

          // Decrypt the license key before storing in License table
          // (Inventory stores encrypted; License stores plain for the user)
          const plainKey = decryptLicenseKey(availableInventory.licenseKey);

          // Create active license for user
          const expiresAt = calculateExpiresAt(item.billingCycle);
          const license = await prisma.license.create({
            data: {
              key: plainKey,
              orderId,
              userId: order.userId,
              productId: item.productId,
              productName: item.productName,
              game: "Unknown",
              status: "active",
              paymentStatus: "verified",
              expiresAt,
            },
          });

          return {
            kind: "delivered" as const,
            itemIndex: i,
            licenseId: license.id,
            licenseKey: plainKey,
            deliveredAt: new Date(),
          };
        });
    });

    // Run all delivery operations in a single atomic transaction.
    // If any promise rejects (e.g. DB error on update/create), every
    // inventory assignment and license creation within this call is rolled back.
    //
    // Cast through unknown because .then() chains return native Promise
    // at the type level but retain the PrismaPromise brand at runtime
    // (PrismaPromise extends Promise and its .then() preserves the brand).
    const txInput = deliveryOperations as unknown as Parameters<typeof prisma.$transaction>[0];
    const results = (await prisma.$transaction(txInput)) as Array<
      | { kind: "delivered"; itemIndex: number; licenseId: string; licenseKey: string; deliveredAt: Date }
      | { kind: "missing"; itemIndex: number }
    >;

    // Process results
    for (const result of results) {
      if (result.kind === "delivered") {
        deliveredItems.push({
          itemIndex: result.itemIndex,
          licenseId: result.licenseId,
          licenseKey: result.licenseKey,
          deliveredAt: result.deliveredAt,
        });
      } else {
        const item = order.items[result.itemIndex];
        missingItems.push({
          productId: item.productId,
          productName: item.productName,
          billingCycle: item.billingCycle,
        });
      }
    }

    // Determine outcome — if nothing was delivered at all, it's a hard failure
    const nothingDelivered = deliveredItems.length === 0;
    const allDelivered = !nothingDelivered && missingItems.length === 0;
    const someDelivered = deliveredItems.length > 0 && missingItems.length > 0;

    if (nothingDelivered) {
      // No inventory available — do NOT mark as completed, do NOT notify user
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "license_out_of_stock",
          licenseDelivery: JSON.stringify({
            method: "pending_stock",
            deliveredAt: null,
            deliveredBy: adminInfo?.adminId || null,
            licenses: [],
            missingCount: missingItems.length,
          }),
        },
      });

      if (adminInfo) {
        await logAdminAction({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          action: "auto_deliver_failed",
          targetType: "order",
          targetId: orderId,
          targetRef: orderId.slice(0, 8),
          after: { status: "license_out_of_stock", reason: "No inventory available" },
        });
      }

      return {
        success: false,
        method: "pending_stock",
        deliveredItems: [],
        missingItems,
        message: "No licenses available in inventory — manual delivery required",
      };
    }

    const licenseDelivery = {
      method: allDelivered ? "auto" : "partial",
      deliveredAt: allDelivered ? new Date().toISOString() : null,
      deliveredBy: adminInfo?.adminId || null,
      licenses: deliveredItems.map((d) => ({
        itemIndex: d.itemIndex,
        licenseId: d.licenseId,
        licenseKey: d.licenseKey,
        deliveredAt: d.deliveredAt.toISOString(),
      })),
    };

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: allDelivered ? "completed" : "license_out_of_stock",
        licenseDelivery: JSON.stringify(licenseDelivery),
      },
    });

    // Log to audit
    if (adminInfo) {
      await logAdminAction({
        adminId: adminInfo.adminId,
        adminName: adminInfo.adminName,
        action: allDelivered ? "auto_deliver" : "partial_deliver",
        targetType: "order",
        targetId: orderId,
        targetRef: orderId.slice(0, 8),
        after: {
          status: allDelivered ? "completed" : "license_out_of_stock",
          deliveredCount: deliveredItems.length,
          missingCount: missingItems.length,
        },
      });
    }

    // Notify the user — order completed, licenses are ready
    if (allDelivered && deliveredItems.length > 0) {
      try {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            type: "license",
            title: "سفارش تکمیل شد",
            message: `سفارش شما با موفقیت تایید شد و ${deliveredItems.length} لایسنس تحویل داده شد. به بخش لایسنس‌ها بروید.`,
            link: "/dashboard/licenses",
          },
        });
      } catch (e) {
        console.error("[DELIVERY] Failed to create user notification:", e);
      }
    } else if (someDelivered && deliveredItems.length > 0) {
      // Partial delivery — notify user about available licenses
      try {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            type: "license",
            title: "لایسنس شما آماده است",
            message: `${deliveredItems.length} لایسنس از سفارش شما تحویل داده شد. بقیه موارد در حال آماده‌سازی هستند.`,
            link: "/dashboard/licenses",
          },
        });
      } catch (e) {
        console.error("[DELIVERY] Failed to create partial-delivery notification:", e);
      }
    }

    return {
      success: allDelivered,
      method: allDelivered ? "auto" : "pending_stock",
      deliveredItems,
      missingItems,
      message: allDelivered
        ? "All licenses delivered automatically"
        : someDelivered
          ? `Delivered ${deliveredItems.length} license(s), ${missingItems.length} awaiting stock`
          : "No licenses available in inventory",
    };
  } catch (err) {
    console.error("[DELIVERY] Auto-delivery failed:", err);
    return {
      success: false,
      method: "pending_stock",
      deliveredItems,
      missingItems,
      message: `Delivery error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

/**
 * Manually deliver a license by adding a key to inventory first, then assigning.
 */
export async function manualDeliverLicense(
  orderId: string,
  itemIndex: number,
  licenseKey: string,
  adminInfo: { adminId: string; adminName: string },
): Promise<{ success: boolean; licenseId?: string; message: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, message: "Order not found" };
    const item = order.items[itemIndex];
    if (!item) return { success: false, message: "Item not found" };

    const expiresAt = calculateExpiresAt(item.billingCycle);

    // Create inventory record + license in one transaction
    const [inventory] = await prisma.$transaction([
      prisma.licenseInventory.create({
        data: {
          productId: item.productId,
          licenseKey,
          status: "assigned",
          orderId,
          assignedAt: new Date(),
        },
      }),
      prisma.license.create({
        data: {
          key: licenseKey,
          orderId,
          userId: order.userId,
          productId: item.productId,
          productName: item.productName,
          game: "Unknown",
          status: "active",
          paymentStatus: "verified",
          expiresAt,
        },
      }),
    ]);

    await logAdminAction({
      adminId: adminInfo.adminId,
      adminName: adminInfo.adminName,
      action: "manual_deliver",
      targetType: "order",
      targetId: orderId,
      targetRef: orderId.slice(0, 8),
      after: { itemIndex, productName: item.productName },
    });

    // Notify the user
    try {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "license",
          title: "لایسنس شما آماده است",
          message: `یک لایسنس برای محصول "${item.productName}" به سفارش شما اضافه شد. به بخش لایسنس‌ها بروید.`,
          link: "/dashboard/licenses",
        },
      });
    } catch (e) {
      console.error("[DELIVERY] Failed to create manual-delivery notification:", e);
    }

    return { success: true, licenseId: inventory.id, message: "License delivered" };
  } catch (err) {
    return {
      success: false,
      message: `Manual delivery failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPlanDurationDays(billingCycle: string): number {
  switch (billingCycle) {
    case "daily": return 1;
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "lifetime": return 3650;
    default: return 30;
  }
}

function calculateExpiresAt(billingCycle: string): Date {
  const days = getPlanDurationDays(billingCycle);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
