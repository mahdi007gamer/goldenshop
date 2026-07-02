import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";
import { generateLicenseKey } from "@/lib/services/auth.service";
import { getServerExchangeRate, roundToNearestTomanUnit } from "@/lib/pricing/server";
import crypto from "crypto";

// GET /api/orders — List current user's orders
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const take = parsePositiveInt(searchParams.get("take"), 20);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: auth.user.id },
        include: {
          items: { select: { productName: true, price: true, quantity: true, billingCycle: true } },
          licenseInventory: { select: { id: true, licenseKey: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.order.count({ where: { userId: auth.user.id } }),
    ]);
    return NextResponse.json({ success: true, data: { orders, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "ORDERS_ERROR", message: "Failed to load orders" } }, { status: 500 });
  }
}

// POST /api/orders — Create order from cart
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const items = body.items as Array<{ productId: string; billingCycle: string; quantity: number }>;
    const paymentMethod = sanitizeString(body.paymentMethod, 50) || "card-to-card";

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Order items are required" } }, { status: 400 });
    }

    // Check for existing pending order
    const existingPendingOrder = await prisma.order.findFirst({
      where: { userId: auth.user.id, status: "payment_submitted" },
    });
    if (existingPendingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PENDING_ORDER",
            message: "شما یک پرداخت در انتظار تایید دارید. لطفاً منتظر تایید ادمین بمانید.",
            orderId: existingPendingOrder.id,
          },
        },
        { status: 409 }
      );
    }

    // Fetch products and calculate total
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Get exchange rate for Toman price calculation (with timeout fallback)
    let exchangeRate = 500000;
    try {
      const result = await Promise.race([
        getServerExchangeRate(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ]);
      exchangeRate = result.rate;
    } catch {
      console.warn("[orders] exchange rate fetch failed, using fallback:", exchangeRate);
    }

    const orderItems: Array<{ productId: string; productName: string; price: number; quantity: number; billingCycle: string }> = [];
    let total = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: `Product ${item.productId} not found` } }, { status: 404 });
      }
      let price = product.price;
      if (item.billingCycle === "lifetime" && product.priceLifetime) {
        price = product.priceLifetime;
      } else if (item.billingCycle === "weekly" && product.priceWeekly) {
        price = product.priceWeekly;
      } else if (item.billingCycle === "daily" && product.priceDaily) {
        price = product.priceDaily;
      } else if (item.billingCycle === "monthly" && product.priceMonthly) {
        price = product.priceMonthly;
      }
      const qty = Math.min(Math.max(typeof item.quantity === "number" ? item.quantity : parseInt(item.quantity) || 1, 1), 10);
      orderItems.push({ productId: product.id, productName: product.name, price, quantity: qty, billingCycle: item.billingCycle });
      total += price * qty;
    }

    // Calculate Toman pricing (LOCKED at creation — immutable)
    const totalToman = roundToNearestTomanUnit(total * exchangeRate);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: auth.user.id,
        subtotal: total,
        total,
        exchangeRate,
        priceUSD: total,
        priceToman: totalToman,
        status: paymentMethod === "wallet" ? "paid" : "pending_payment",
        paymentMethod,
        billingCycle: items[0]?.billingCycle || "monthly",
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // If wallet payment, deduct balance and generate licenses
    if (paymentMethod === "wallet") {
      await prisma.user.update({ where: { id: auth.user.id }, data: { walletBalance: { decrement: total } } });
      await prisma.walletTransaction.create({
        data: { userId: auth.user.id, type: "purchase", amount: -total, balance: 0, description: `Order ${order.id}`, status: "completed" },
      });

      // Generate licenses
      const licensePromises = orderItems.map((item) =>
        prisma.license.create({
          data: {
            key: generateLicenseKey(),
            orderId: order.id,
            userId: auth.user.id,
            productId: item.productId,
            productName: item.productName,
            game: productMap.get(item.productId)?.game || "Unknown",
            status: "active",
            expiresAt: new Date(Date.now() + (item.billingCycle === "lifetime" ? 3650 : 30) * 24 * 60 * 60 * 1000),
          },
        })
      );
      await Promise.all(licensePromises);
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error("[POST /api/orders] Create order error:", err instanceof Error ? err.message : err, err instanceof Error ? err.stack : "");
    return NextResponse.json({ success: false, error: { code: "ORDER_ERROR", message: "Failed to create order", detail: err instanceof Error ? err.message : "unknown" } }, { status: 500 });
  }
}
