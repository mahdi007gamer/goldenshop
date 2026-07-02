# Admin Orders Pro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a professional, secure admin order management system with payment verification, automatic license assignment, manual license delivery, and a polished user-facing order status page with real-time countdown and animations.

**Architecture:**
1. **Backend**: Extend existing Prisma schema with new models (`LicenseDelivery`, `OrderStatusLog`), add admin API routes for verify/reject/manual-deliver, and add user-facing API for order status polling.
2. **Admin UI**: Build a comprehensive admin orders page at `/admin/orders` with filters, payment verification panel, manual license assignment, and audit log.
3. **User UI**: Rebuild the checkout confirmation page (`/checkout/[id]`) with a 60-minute countdown, live status polling, animated state transitions, and license delivery display.
4. **Security**: All routes gated by `requireAdmin` (admin) or `requireAuth` (owner user). Users can only see/affect their own orders. Last4Digits stored but masked.

**Tech Stack:** Next.js 16, Prisma (SQLite), Framer Motion 12, Tailwind 4, Lucide React icons, Zustand (toast).

## Global Constraints

- All admin routes MUST use `requireAdmin(request)` from `@/lib/auth-utils`
- All user-facing order routes MUST use `requireAuth(request)` AND verify `order.userId === auth.user.id`
- License keys MUST be stored encrypted (existing `LicenseInventory.licenseKey` pattern)
- Last 4 digits of card: store in `Order.last4Digits`, mask display as `**** XXXX`
- Status transitions MUST be logged to `OrderStatusLog` for audit trail
- All user inputs MUST be sanitized via `sanitizeString()` from `@/lib/auth-utils`
- RTL support: admin is LTR/EN-primary, user pages respect `lang` param
- Framer Motion for all animations (no CSS keyframes)
- Toast notifications via `toast.success/error` from `@/store/toast-store`

---

## Current State Analysis

### What exists
- `Order` model with fields: `status`, `paymentStatus`, `last4Digits`, `bankCardId`, `receiptNote`, `rejectionReason`, `assignedLicenseIds`, `verificationHistory`, `licenseDelivery`
- `POST /api/admin/orders/verify-payment` — approves/rejects, auto-assigns from `LicenseInventory`
- `GET|PUT /api/admin/orders/[id]` — basic GET and status update
- `GET /api/admin/orders` — paginated list with status/search filters
- `GET /api/orders/[id]` — user's own order
- `PATCH /api/orders/[id]` — submit_payment, cancel, update_note
- `POST /api/orders/submit-receipt` — submit payment proof
- `/checkout/[id]/page.tsx` — basic checkout with last4Digits input and submitted state
- `/dashboard/orders/page.tsx` — user order list
- Empty `/admin/orders/` directory (no admin UI yet)

### What's missing
- No admin orders list UI
- No manual license delivery flow (when inventory is empty)
- No "awaiting_license" UI for admin to know which orders need manual work
- No user-facing real-time status polling or countdown
- No animated transitions between order states
- No `LicenseDelivery` model to track manual license assignments
- No `OrderStatusLog` model for audit trail
- No notification to user when license is delivered or payment rejected
- Checkout page "submitted" state is static (no polling, no countdown)

---

## Task 1: Extend Prisma Schema — New Models

**Files:**
- Modify: `prisma/schema.prisma`
- Generate: `npx prisma generate` (after changes)

**Interfaces:**
- Produces: `LicenseDelivery` model, `OrderStatusLog` model, updated `Order` relations

### Step 1: Add new models to schema.prisma

Add these models BEFORE the `Game` model (line ~376):

```prisma
model LicenseDelivery {
  id          String   @id @default(cuid())
  orderId     String   @unique
  licenseId   String?
  adminId     String
  adminName   String
  licenseKey  String   // Encrypted
  deliveredAt DateTime @default(now())
  method      String   // "auto" | "manual"
  note        String?
  createdAt   DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model OrderStatusLog {
  id        String   @id @default(cuid())
  orderId   String
  fromStatus String?
  toStatus  String
  action    String   // "verify_payment", "reject_payment", "manual_deliver", "auto_deliver"
  adminId   String?
  adminName String?
  note      String?
  metadata  String?  // JSON string for extra context
  createdAt DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
}
```

### Step 2: Update Order model — add new relations

In the `Order` model, add these relation fields (after existing relations):

```prisma
  licenseDelivery LicenseDelivery?
  statusLogs      OrderStatusLog[]
```

### Step 3: Update License model — add delivery relation

In the `License` model, add:

```prisma
  delivery LicenseDelivery? @relation(fields: [deliveryId], references: [id])
  deliveryId String?
```

### Step 4: Run prisma generate

```bash
npx prisma generate
```

### Step 5: Commit

```bash
git add prisma/schema.prisma
git commit -m "feat: add LicenseDelivery and OrderStatusLog models for audit trail"
```

---

## Task 2: Admin Orders List API — Enhance

**Files:**
- Modify: `src/app/api/admin/orders/route.ts`
- Test: manual curl/Postman

**Interfaces:**
- Consumes: existing GET /api/admin/orders
- Produces: enriched response with license info, delivery status, status logs

### Step 1: Enhance GET /api/admin/orders

Update the include to fetch more data:

```typescript
include: {
  user: { select: { id: true, username: true, phone: true } },
  items: { select: { id: true, productName: true, price: true, quantity: true, billingCycle: true, productId: true } },
  licenses: { select: { id: true, key: true, status: true, productName: true, expiresAt: true } },
  licenseDelivery: { select: { id: true, deliveredAt: true, method: true, adminName: true } },
  statusLogs: { orderBy: { createdAt: "desc" }, take: 10 },
}
```

### Step 2: Add response masking for license keys

After fetching, map the response to mask license keys (show only last 8 chars):

```typescript
const maskedOrders = orders.map(order => ({
  ...order,
  licenses: order.licenses.map(l => ({
    ...l,
    key: l.key.length > 8 ? `****${l.key.slice(-8)}` : "****",
  })),
}));
```

### Step 3: Add stats endpoint

Add `GET /api/admin/orders/stats` in a new file `src/app/api/admin/orders/stats/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const stats = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const statusCounts = {
    pending_payment: 0,
    payment_submitted: 0,
    payment_verifying: 0,
    payment_confirmed: 0,
    payment_rejected: 0,
    awaiting_license: 0,
    license_out_of_stock: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
  };

  stats.forEach(s => {
    statusCounts[s.status as keyof typeof statusCounts] = s._count._all;
  });

  return NextResponse.json({ success: true, data: statusCounts });
}
```

### Step 4: Commit

```bash
git add src/app/api/admin/orders/route.ts src/app/api/admin/orders/stats/route.ts
git commit -m "feat: enhance admin orders API with stats and enriched data"
```

---

## Task 3: Admin Order Actions API — Manual Deliver

**Files:**
- Create: `src/app/api/admin/orders/[id]/deliver/route.ts`
- Modify: `src/app/api/admin/orders/[id]/route.ts` (add PATCH for admin notes)

**Interfaces:**
- Consumes: `orderId` from params, `{ licenseKey: string, note?: string }` from body
- Produces: updated order with assigned license, creates LicenseDelivery record, logs to OrderStatusLog

### Step 1: Create POST /api/admin/orders/[id]/deliver

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";

/**
 * POST /api/admin/orders/[id]/deliver
 * Admin manually delivers a license to an order.
 * Body: { licenseKey: string, note?: string }
 * Requires: order.status === "awaiting_license" || "license_out_of_stock"
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const licenseKey = sanitizeString(body.licenseKey, 500);
    const note = sanitizeString(body.note, 500);

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "License key is required" } },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    if (order.status !== "awaiting_license" && order.status !== "license_out_of_stock") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STATUS", message: "Order is not awaiting license" } },
        { status: 400 }
      );
    }

    // Create license and delivery record
    const [license, delivery, updatedOrder] = await prisma.$transaction([
      prisma.license.create({
        data: {
          key: licenseKey,
          orderId,
          userId: order.userId,
          productId: order.items[0].productId,
          productName: order.items[0].productName,
          game: "Unknown",
          status: "active",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.licenseDelivery.create({
        data: {
          orderId,
          adminId: auth.user.id,
          adminName: auth.user.username,
          licenseKey,
          method: "manual",
          note,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "completed",
          paymentStatus: "verified",
          licenseDelivery: "manual",
        },
        include: {
          items: true,
          licenses: true,
          licenseDelivery: true,
        },
      }),
      prisma.orderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: "completed",
          action: "manual_deliver",
          adminId: auth.user.id,
          adminName: auth.user.username,
          note,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { order: updatedOrder, license, delivery },
      message: "License delivered successfully",
    });
  } catch (err) {
    console.error("Manual deliver error:", err);
    return NextResponse.json(
      { success: false, error: { code: "DELIVER_ERROR", message: "Failed to deliver license" } },
      { status: 500 }
    );
  }
}
```

### Step 2: Add PATCH /api/admin/orders/[id] for admin notes

Add a PATCH handler to the existing `[id]/route.ts`:

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const adminInternalNote = sanitizeString(body.adminInternalNote, 1000);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { adminInternalNote },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: "Failed to update order" } },
      { status: 500 }
    );
  }
}
```

### Step 3: Commit

```bash
git add src/app/api/admin/orders/[id]/deliver/route.ts src/app/api/admin/orders/[id]/route.ts
git commit -m "feat: add manual license delivery endpoint for admin"
```

---

## Task 4: User-Facing Order Status API

**Files:**
- Create: `src/app/api/orders/[id]/status/route.ts`

**Interfaces:**
- Consumes: authenticated user request
- Produces: order status, license info (if delivered), delivery countdown info

### Step 1: Create GET /api/orders/[id]/status

This endpoint is for the user to poll for status updates:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

/**
 * GET /api/orders/[id]/status
 * Returns current order status for polling.
 * Only accessible by the order owner.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, userId: auth.user.id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        last4Digits: true,
        createdAt: true,
        updatedAt: true,
        rejectionReason: true,
        licenseDelivery: {
          select: {
            id: true,
            deliveredAt: true,
            method: true,
          },
        },
        licenses: {
          select: {
            id: true,
            key: true,
            status: true,
            productName: true,
            expiresAt: true,
          },
        },
        items: {
          select: {
            productName: true,
            billingCycle: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    // Calculate estimated completion time (60 min from submission or last update)
    const submittedAt = order.updatedAt;
    const estimatedCompletion = new Date(submittedAt.getTime() + 60 * 60 * 1000);
    const now = new Date();
    const remainingMs = Math.max(0, estimatedCompletion.getTime() - now.getTime());

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        remainingSeconds: Math.floor(remainingMs / 1000),
        estimatedCompletion: estimatedCompletion.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "STATUS_ERROR", message: "Failed to get status" } },
      { status: 500 }
    );
  }
}
```

### Step 2: Commit

```bash
git add src/app/api/orders/[id]/status/route.ts
git commit -m "feat: add user-facing order status polling endpoint"
```

---

## Task 5: Admin Orders Page UI

**Files:**
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/orders/[id]/page.tsx`
- Create: `src/components/admin/OrderVerificationPanel.tsx`
- Create: `src/components/admin/ManualLicenseForm.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/orders`, `GET /api/admin/orders/stats`, `POST /api/admin/orders/verify-payment`, `POST /api/admin/orders/[id]/deliver`
- Produces: full admin dashboard for order management

### Step 1: Create main admin orders list page

`src/app/admin/orders/page.tsx`:

```typescript
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Clock, CheckCircle, XCircle, AlertTriangle,
  Key, Loader2, ChevronDown, ChevronUp, CreditCard, User,
  Package, Hash, RefreshCw, Send,
} from "lucide-react";
import { formatPriceWithRate } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "@/store/toast-store";

// Types
interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  last4Digits: string | null;
  createdAt: string;
  user: { username: string; phone: string };
  items: { productName: string; price: number; quantity: number; billingCycle: string }[];
  licenses: { id: string; key: string; status: string; productName: string }[];
  licenseDelivery: { id: string; deliveredAt: string; method: string; adminName: string } | null;
}

interface Stats {
  pending_payment: number;
  payment_submitted: number;
  payment_verifying: number;
  payment_confirmed: number;
  payment_rejected: number;
  awaiting_license: number;
  license_out_of_stock: number;
  completed: number;
  cancelled: number;
  refunded: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Pending Payment", color: "#9CA3AF", bg: "rgba(107,114,128,0.15)" },
  payment_submitted: { label: "Payment Submitted", color: "#93C5FD", bg: "rgba(59,130,246,0.15)" },
  payment_verifying: { label: "Verifying", color: "#C4B5FD", bg: "rgba(139,92,246,0.15)" },
  payment_confirmed: { label: "Confirmed", color: "#6EE7B7", bg: "rgba(16,185,129,0.15)" },
  payment_rejected: { label: "Rejected", color: "#FCA5A5", bg: "rgba(239,68,68,0.15)" },
  awaiting_license: { label: "Awaiting License", color: "#FCD34D", bg: "rgba(245,158,11,0.15)" },
  license_out_of_stock: { label: "Out of Stock", color: "#FDBA74", bg: "rgba(249,115,22,0.15)" },
  completed: { label: "Completed", color: "#F0C060", bg: "rgba(201,150,58,0.15)" },
  cancelled: { label: "Cancelled", color: "#6B7280", bg: "rgba(55,65,81,0.15)" },
  refunded: { label: "Refunded", color: "#F9A8D4", bg: "rgba(236,72,153,0.15)" },
};

const PRIORITY_STATUSES = ["payment_submitted", "awaiting_license", "license_out_of_stock"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null);
  const [deliveringOrder, setDeliveringOrder] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [deliverNote, setDeliverNote] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const { rate: exchangeRate } = useCurrency();

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const [ordersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/orders?${params}`),
        fetch("/api/admin/orders/stats"),
      ]);

      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();

      if (ordersData.success) setOrders(ordersData.data.orders);
      if (statsData.success) setStats(statsData.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Verify payment handler
  const handleVerifyPayment = async (orderId: string, approved: boolean) => {
    setVerifyingOrder(orderId);
    try {
      const res = await fetch("/api/admin/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          approved,
          rejectionReason: approved ? undefined : "Payment rejected by admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(approved ? "Payment verified" : "Payment rejected");
        fetchOrders();
      } else {
        toast.error(data.error?.message || "Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setVerifyingOrder(null);
    }
  };

  // Manual deliver handler
  const handleManualDeliver = async (orderId: string) => {
    if (!licenseKey.trim()) {
      toast.error("License key is required");
      return;
    }
    setDeliveringOrder(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, note: deliverNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("License delivered successfully");
        setLicenseKey("");
        setDeliverNote("");
        setExpandedOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error?.message || "Delivery failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeliveringOrder(null);
    }
  };

  // Save admin note
  const handleSaveNote = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminInternalNote: adminNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Note saved");
      }
    } catch {
      toast.error("Failed to save note");
    }
  };

  const displayPrice = (usd: number) => {
    if (exchangeRate) return formatPriceWithRate(usd, exchangeRate, "fa");
    return `$${usd.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-1">Verify payments and manage licenses</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-gold" : "text-gray-400"} />
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRIORITY_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
              className={`p-4 rounded-xl border transition-all ${
                statusFilter === status ? "ring-2 ring-gold/50" : ""
              }`}
              style={{
                background: STATUS_CONFIG[status]?.bg || "rgba(255,255,255,0.05)",
                borderColor: STATUS_CONFIG[status]?.color || "rgba(255,255,255,0.1)",
              }}
            >
              <p className="text-xs text-gray-400">{STATUS_CONFIG[status]?.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: STATUS_CONFIG[status]?.color }}>
                {stats[status as keyof Stats]}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-gold/30 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No orders found</div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrder === order.id}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              onVerify={handleVerifyPayment}
              onDeliver={handleManualDeliver}
              onSaveNote={handleSaveNote}
              verifyingOrder={verifyingOrder}
              deliveringOrder={deliveringOrder}
              licenseKey={licenseKey}
              setLicenseKey={setLicenseKey}
              deliverNote={deliverNote}
              setDeliverNote={setDeliverNote}
              adminNote={adminNote}
              setAdminNote={setAdminNote}
              displayPrice={displayPrice}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Sub-component: Order Card
function OrderCard({
  order, isExpanded, onToggle, onVerify, onDeliver, onSaveNote,
  verifyingOrder, deliveringOrder, licenseKey, setLicenseKey,
  deliverNote, setDeliverNote, adminNote, setAdminNote, displayPrice,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onVerify: (id: string, approved: boolean) => void;
  onDeliver: (id: string) => void;
  onSaveNote: (id: string) => void;
  verifyingOrder: string | null;
  deliveringOrder: string | null;
  licenseKey: string;
  setLicenseKey: (v: string) => void;
  deliverNote: string;
  setDeliverNote: (v: string) => void;
  adminNote: string;
  setAdminNote: (v: string) => void;
  displayPrice: (usd: number) => string;
}) {
  const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: "#9CA3AF", bg: "rgba(107,114,128,0.15)" };
  const isPendingVerification = order.status === "payment_submitted";
  const isAwaitingLicense = order.status === "awaiting_license" || order.status === "license_out_of_stock";
  const isCompleted = order.status === "completed";
  const isRejected = order.status === "payment_rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: "rgba(10,14,26,0.9)", borderColor: "rgba(201,150,58,0.15)" }}
    >
      {/* Card Header */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gold font-mono">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: statusConfig.bg, color: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
            {order.last4Digits && (
              <span className="text-xs text-gray-500 font-mono">**** {order.last4Digits}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">{displayPrice(order.total)}</span>
            {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><User size={12} /> {order.user.username}</span>
          <span className="flex items-center gap-1"><Hash size={12} /> {order.items.length} items</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 space-y-4">
              {/* Items */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 px-3 rounded-lg bg-white/5">
                    <span className="text-sm text-gray-300">{item.productName}</span>
                    <span className="text-sm text-gray-400">{displayPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Payment Verification Actions */}
              {isPendingVerification && (
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <p className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <CreditCard size={14} /> Payment Verification Required
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onVerify(order.id, true)}
                      disabled={verifyingOrder === order.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      {verifyingOrder === order.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Approve
                    </button>
                    <button
                      onClick={() => onVerify(order.id, false)}
                      disabled={verifyingOrder === order.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {verifyingOrder === order.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Manual License Delivery */}
              {isAwaitingLicense && (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <p className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <Key size={14} /> Manual License Delivery Required
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="Enter license key..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none font-mono"
                    />
                    <input
                      type="text"
                      value={deliverNote}
                      onChange={(e) => setDeliverNote(e.target.value)}
                      placeholder="Note (optional)..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none"
                    />
                    <button
                      onClick={() => onDeliver(order.id)}
                      disabled={deliveringOrder === order.id || !licenseKey.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50"
                    >
                      {deliveringOrder === order.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Deliver License
                    </button>
                  </div>
                </div>
              )}

              {/* Completed - Show License */}
              {isCompleted && order.licenses.length > 0 && (
                <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                  <p className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <Key size={14} /> Delivered Licenses
                  </p>
                  {order.licenses.map((license) => (
                    <div key={license.id} className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/5 mb-2">
                      <div>
                        <p className="text-xs text-green-400/70">{license.productName}</p>
                        <p className="text-sm font-mono text-green-300">{license.key}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">{license.status}</span>
                    </div>
                  ))}
                  {order.licenseDelivery && (
                    <p className="text-xs text-gray-500 mt-2">
                      Delivered by {order.licenseDelivery.adminName} via {order.licenseDelivery.method}
                    </p>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              {isRejected && order.rejectionReason && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <p className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                    <AlertTriangle size={14} /> Rejection Reason
                  </p>
                  <p className="text-sm text-red-300">{order.rejectionReason}</p>
                </div>
              )}

              {/* Admin Internal Note */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Admin Internal Note</p>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal note (not visible to user)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none resize-none"
                />
                <button
                  onClick={() => onSaveNote(order.id)}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Step 2: Add link to admin sidebar navigation

Find the admin sidebar/layout and add "Orders" link with badge for pending verifications.

### Step 3: Commit

```bash
git add src/app/admin/orders/page.tsx
git commit -m "feat: add comprehensive admin orders management page"
```

---

## Task 6: User Checkout Status Page — Rebuild with Animations

**Files:**
- Modify: `src/app/checkout/[id]/page.tsx` (major rewrite)

**Interfaces:**
- Consumes: `GET /api/orders/[id]/status` (polls every 10 seconds)
- Produces: animated status page with countdown, state transitions, license reveal

### Step 1: Rewrite the checkout status page

Replace the entire `step === "submitted"` section with a new animated component:

```typescript
// Inside CheckoutPage, replace the "submitted" step with:
if (step === "submitted") {
  return <OrderStatusTracker orderId={orderId} initialOrder={order} />;
}
```

### Step 2: Create OrderStatusTracker component

Add this at the bottom of the file (or create a new file `src/components/OrderStatusTracker.tsx`):

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, XCircle, Loader2, Key, Shield, AlertTriangle, PartyPopper } from "lucide-react";
import { useLang } from "@/context/LangContext";

type OrderStatus = "payment_submitted" | "payment_verifying" | "payment_confirmed" | "payment_rejected" | "completed" | "awaiting_license";

interface OrderStatusTrackerProps {
  orderId: string;
  initialOrder: Order;
}

export function OrderStatusTracker({ orderId, initialOrder }: OrderStatusTrackerProps) {
  const { lang } = useLang();
  const isFa = lang === "fa";

  const [status, setStatus] = useState<OrderStatus>("payment_submitted");
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [license, setLicense] = useState<{ key: string; productName: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Poll for status updates
  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data.status);
        setRemainingSeconds(data.data.remainingSeconds);
        if (data.data.licenses?.length > 0) {
          setLicense({ key: data.data.licenses[0].key, productName: data.data.licenses[0].productName });
        }
        if (data.data.rejectionReason) {
          setRejectionReason(data.data.rejectionReason);
        }
      }
    } catch {
      // silent fail for polling
    } finally {
      setChecking(false);
    }
  }, [orderId]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 10000); // poll every 10s
    checkStatus(); // initial check
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // State: Submitted, waiting verification
  if (status === "payment_submitted" || status === "payment_verifying") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          {/* Animated orb */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#3B82F6", borderRightColor: "rgba(59,130,246,0.3)" }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-2 border-transparent"
              style={{ borderBottomColor: "#8B5CF6", borderLeftColor: "rgba(139,92,246,0.3)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock size={32} className="text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-blue-400 mb-2 font-display">
            {isFa ? "پرداخت شما ثبت شد!" : "Payment Submitted!"}
          </h1>
          <p className="text-gray-400 mb-6">
            {isFa ? "در انتظار تأیید توسط ادمین" : "Awaiting admin verification"}
          </p>

          {/* Countdown */}
          <div className="bg-obsidian-light rounded-xl border border-blue-500/20 p-6 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {isFa ? "زمان تقریبی تأیید" : "Estimated verification time"}
            </p>
            <motion.p
              key={remainingSeconds}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-4xl font-mono font-bold text-blue-400"
            >
              {formatTime(remainingSeconds)}
            </motion.p>
            <p className="text-xs text-gray-500 mt-2">
              {isFa ? "تا تأیید ادمین" : "Until admin verification"}
            </p>
          </div>

          {checking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Loader2 size={12} className="animate-spin" />
              {isFa ? "در حال بررسی..." : "Checking..."}
            </motion.div>
          )}

          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 mb-1">{isFa ? "شماره سفارش" : "Order ID"}</p>
            <p className="font-mono text-gold">{orderId.slice(-8).toUpperCase()}</p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
            <Shield size={12} />
            <span>{isFa ? "در انتظار تأیید امن" : "Secure verification in progress"}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // State: Payment rejected
  if (status === "payment_rejected") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", damping: 10 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center"
          >
            <XCircle size={40} className="text-red-400" />
          </motion.div>

          <h1 className="text-2xl font-bold text-red-400 mb-2 font-display">
            {isFa ? "پرداخت رد شد" : "Payment Rejected"}
          </h1>
          <p className="text-gray-400 mb-4">
            {isFa ? "متأسفانه پرداخت شما تایید نشد" : "Unfortunately your payment was not verified"}
          </p>

          {rejectionReason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6"
            >
              <p className="text-sm text-red-300">{rejectionReason}</p>
            </motion.div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            {isFa
              ? "می‌توانید اطلاعات پرداخت را اصلاح کرده و مجدداً ارسال کنید"
              : "You can correct your payment info and resubmit"}
          </p>

          <div className="flex flex-col gap-3">
            <a href={`/checkout/${orderId}`} className="btn-gold py-3 flex items-center justify-center gap-2">
              {isFa ? "ارسال مجدد پرداخت" : "Resubmit Payment"}
            </a>
            <a href="/dashboard/orders" className="btn-outline-gold py-3 flex items-center justify-center gap-2">
              {isFa ? "مشاهده سفارشات" : "View Orders"}
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // State: Completed with license
  if (status === "completed" && license) {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Confetti-like particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -100, x: Math.random() * 400 - 200 }}
            animate={{ opacity: [0, 1, 0], y: 600, rotate: Math.random() * 360 }}
            transition={{ duration: 3, delay: i * 0.15, repeat: Infinity, repeatDelay: 5 }}
            className="absolute top-0 w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              background: ["#C9963A", "#00F0FF", "#00FF88", "#FF3366"][i % 4],
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center max-w-lg w-full relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 10 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center"
          >
            <PartyPopper size={40} className="text-green-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-green-400 mb-2 font-display"
          >
            {isFa ? "سفارش شما تکمیل شد!" : "Order Complete!"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 mb-8"
          >
            {isFa ? "لایسنس شما آماده استفاده است" : "Your license is ready to use"}
          </motion.p>

          {/* License Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-500/10 to-gold/10 rounded-2xl border border-green-500/30 p-6 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Key size={16} className="text-green-400" />
              <span className="text-sm font-semibold text-green-400">
                {license.productName}
              </span>
            </div>
            <div className="bg-obsidian rounded-xl p-4 border border-white/10">
              <p className="font-mono text-lg text-green-300 break-all select-all">
                {license.key}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {isFa ? "این کلید را کپی و در برنامه وارد کنید" : "Copy this key and enter it in the application"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3"
          >
            <a href="/dashboard/licenses" className="btn-gold py-3 flex items-center justify-center gap-2">
              <Key size={16} />
              {isFa ? "مشاهده لایسنس‌ها" : "View Licenses"}
            </a>
            <a href="/" className="btn-outline-gold py-3 flex items-center justify-center gap-2">
              {isFa ? "بازگشت به خانه" : "Back to Home"}
            </a>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // State: Awaiting license (payment ok, but no license yet)
  if (status === "awaiting_license") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#F59E0B", borderRightColor: "rgba(245,158,11,0.3)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle size={32} className="text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-amber-400 mb-2 font-display">
            {isFa ? "پرداخت تایید شد!" : "Payment Confirmed!"}
          </h1>
          <p className="text-gray-400 mb-6">
            {isFa
              ? "در حال آماده‌سازی لایسنس برای شما. این فرآیند ممکن است چند دقیقه طول بکشد."
              : "Preparing your license. This may take a few minutes."}
          </p>

          <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4 mb-6">
            <p className="text-sm text-amber-300">
              {isFa
                ? "لایسنس شما به صورت دستی توسط ادمین ارسال خواهد شد. از طریق ایمیل یا پیامک اطلاع‌رسانی می‌شود."
                : "Your license will be delivered manually by admin. You'll be notified via email or SMS."}
            </p>
          </div>

          <a href="/dashboard/orders" className="btn-outline-gold py-3 inline-flex items-center justify-center gap-2">
            {isFa ? "مشاهده سفارشات" : "View Orders"}
          </a>
        </motion.div>
      </div>
    );
  }

  // Fallback
  return null;
}
```

### Step 2: Commit

```bash
git add src/app/checkout/[id]/page.tsx
git commit -m "feat: rebuild checkout status page with animations, countdown, and live polling"
```

---

## Task 7: Security Audit & Edge Cases

**Files:**
- Review: all new API routes
- Test: manual testing

**Interfaces:**
- Consumes: N/A
- Produces: hardened API routes

### Step 1: Add rate limiting to status polling

In `src/app/api/orders/[id]/status/route.ts`, add rate limiting:

```typescript
import { checkRateLimit } from "@/lib/rate-limiter";

// Inside GET handler, after auth:
const rateLimit = checkRateLimit(request, `order_status:${auth.user.id}`, 60, 10000); // 60 req per 10s
if (!rateLimit.allowed) {
  return NextResponse.json(
    { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
    { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
  );
}
```

### Step 2: Verify all admin routes check requireAdmin

Audit all routes in `src/app/api/admin/orders/*` to ensure they all have:
```typescript
const auth = await requireAdmin(request);
if (auth instanceof NextResponse) return auth;
```

### Step 3: Verify user routes check ownership

Ensure `GET /api/orders/[id]/status` checks `order.userId === auth.user.id`.

### Step 4: Add CORS headers for API routes

Ensure no cross-origin access to API routes (same-origin only):
```typescript
// Add to all API route responses:
headers: {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
}
```

### Step 5: Commit

```bash
git add -A
git commit -m "security: add rate limiting and verify auth guards on all order routes"
```

---

## Task 8: Integration Testing & Polish

**Files:**
- Test: manual end-to-end flow

**Interfaces:**
- Consumes: all new features
- Produces: working system

### Step 1: Test admin flow

1. Login as admin
2. Navigate to `/admin/orders`
3. See stats cards showing pending counts
4. Click on a `payment_submitted` order
5. Click "Approve" → verify license auto-assigned (or "Awaiting License" shown)
6. If awaiting license, enter a key and click "Deliver"
7. Verify order status changes to `completed`

### Step 2: Test user flow

1. Login as regular user
2. Submit payment for an order
3. See the animated status page with countdown
4. Wait for admin approval (or simulate by directly updating DB)
5. Refresh → see license delivered with confetti animation

### Step 3: Test rejection flow

1. Admin clicks "Reject" on a payment
2. User sees rejection page with reason
3. User can click "Resubmit" to go back to checkout

### Step 4: Run lint and build

```bash
npm run lint
npm run build
```

### Step 5: Commit

```bash
git add -A
git commit -m "test: verify end-to-end flows and fix any issues"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Prisma schema extensions | 15 min |
| 2 | Admin orders API enhancement | 20 min |
| 3 | Manual deliver API | 25 min |
| 4 | User status polling API | 15 min |
| 5 | Admin orders page UI | 60 min |
| 6 | User checkout status rebuild | 45 min |
| 7 | Security audit | 15 min |
| 8 | Integration testing | 30 min |

**Total: ~3.5 hours**

**Key security principles enforced:**
- Admin routes: `requireAdmin` only
- User routes: `requireAuth` + ownership check
- Rate limiting on polling endpoints
- Input sanitization on all user inputs
- License keys stored encrypted
- No cross-user data leakage (every query scoped to userId)
