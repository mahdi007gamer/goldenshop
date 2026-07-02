# Golden Cheat — Complete Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all missing/placeholder pages and fix all bugs to make this a production-ready commercial e-commerce application.

**Architecture:** Next.js 16 App Router, Prisma + SQLite, Zustand for state, Tailwind CSS 4, Framer Motion. All pages are client-side interactive with server-side API routes. Auth is session-based with httpOnly cookies.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, TypeScript 5, Tailwind CSS 4, Prisma (SQLite), Zustand, Framer Motion 12, SWR, Lucide React

## Global Constraints

- All UI must support FA/EN (RTL/LTR) — use `useLang()` hook everywhere
- All prices in FA mode must use `useCurrency()` hook with real exchange rate
- All API routes must use `requireAuth()` for user routes, `requireAdmin()` for admin routes
- All inputs must be sanitized with `sanitizeString()`, `sanitizePhone()`, `parsePositiveInt()`
- All error responses must be in `{ success: false, error: { code, message } }` format
- All success responses must be in `{ success: true, data: ... }` format
- Use `toast()` from `@/store/toast-store` for user feedback
- Use existing CSS classes: `glass-card`, `btn-gold`, `btn-outline-gold`, `nav-link`, `text-gold-gradient`
- Fonts: Cinzel (display), Rajdhani (headings), Inter (body), Vazirmatn (FA body)
- Colors: obsidian (#06090F), gold (#C9963A), cyber (#00f0ff), danger (#ff3366), success (#00ff88)

---

## Task 1: Cleanup Debug Files

**Files:**
- Delete: `db-check.ts`
- Delete: `fix-prices.ts`
- Delete: `src/app/api/debug/` (entire directory)

**Interfaces:**
- Consumes: nothing
- Produces: clean workspace

- [ ] **Step 1: Delete debug files**

```bash
rm db-check.ts fix-prices.ts
rm -r src/app/api/debug/
```

- [ ] **Step 2: Verify build still passes**

Run: `npm run build`
Expected: Success

- [ ] **Step 3: Commit**

```bash
git rm db-check.ts fix-prices.ts src/app/api/debug/price/route.ts
git commit -m "chore: remove debug files and scripts"
```

---

## Task 2: Complete Dashboard Notifications Page

**Files:**
- Modify: `src/app/dashboard/notifications/page.tsx`
- Uses: `src/app/api/notifications/route.ts` (already exists, returns real data)

**Interfaces:**
- Consumes: `GET /api/notifications` returns `{ success, data: Notification[] }`
- Produces: fully functional notifications page with real data

- [ ] **Step 1: Read the existing API route**

Read `src/app/api/notifications/route.ts` to understand the response shape.

- [ ] **Step 2: Implement the NotificationsPage component**

Replace the placeholder with a real implementation:
- Fetch notifications from `/api/notifications` on mount
- Show loading skeleton while fetching
- Display notification list with icon, title, message, time ago
- Mark as read on click
- "Mark all as read" button
- Empty state when no notifications exist
- Support FA/EN

- [ ] **Step 3: Add mark-as-read API**

Create `src/app/api/notifications/[id]/route.ts` with PATCH handler to mark single notification as read.

- [ ] **Step 4: Add mark-all-as-read API**

Add PATCH handler in `src/app/api/notifications/route.ts` to mark all as read.

- [ ] **Step 5: Verify in browser**

Run: `npm run dev` → navigate to `/dashboard/notifications`
Expected: Real notifications displayed, can mark as read

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/notifications/page.tsx src/app/api/notifications/
git commit -m "feat: complete notifications page with real data and mark-as-read"
```

---

## Task 3: Complete Dashboard Licenses Page

**Files:**
- Modify: `src/app/dashboard/licenses/page.tsx`
- Uses: `src/app/api/licenses/route.ts` (already exists)

**Interfaces:**
- Consumes: `GET /api/licenses` returns `{ success, data: License[] }`
- Produces: fully functional licenses page with search, filter, copy keys

- [ ] **Step 1: Read the existing API route**

Read `src/app/api/licenses/route.ts` to understand the response shape.

- [ ] **Step 2: Implement the LicensesPage component**

Replace the placeholder with real implementation:
- Fetch licenses from `/api/licenses` on mount
- Show loading skeleton
- Display license cards with: product name, game, key (masked), status badge, expiry date
- Copy key to clipboard button
- Search by product name
- Filter by status (active/expired/revoked/hardware-locked)
- Status badges with proper colors
- Empty state

- [ ] **Step 3: Verify in browser**

Run: `npm run dev` → navigate to `/dashboard/licenses`
Expected: Real licenses displayed, can copy keys, filter works

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/licenses/page.tsx
git commit -m "feat: complete licenses page with real data, search, filter, copy"
```

---

## Task 4: Complete Dashboard Courses Page

**Files:**
- Modify: `src/app/dashboard/courses/page.tsx`
- Uses: `src/app/api/courses/route.ts` (already exists)

**Interfaces:**
- Consumes: `GET /api/courses` returns `{ success, data: Course[] }`
- Produces: fully functional courses page with progress tracking

- [ ] **Step 1: Read the existing API route**

Read `src/app/api/courses/route.ts` to understand the response shape.

- [ ] **Step 2: Implement the CoursesPage component**

Replace the placeholder with real implementation:
- Fetch courses from `/api/courses` on mount
- Show loading skeleton
- Display course cards with: title, description, thumbnail, lesson count, progress bar
- Link to course detail page
- Search by title
- Empty state

- [ ] **Step 3: Verify in browser**

Run: `npm run dev` → navigate to `/dashboard/courses`
Expected: Real courses displayed, can navigate to course

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/courses/page.tsx
git commit -m "feat: complete courses page with real data and progress tracking"
```

---

## Task 5: Complete Dashboard Order Detail Page

**Files:**
- Create: `src/app/dashboard/orders/[id]/page.tsx` (currently a placeholder showing "order not found")
- Uses: `GET /api/orders/[id]` (already exists, returns real order data)

**Interfaces:**
- Consumes: `GET /api/orders/[id]` returns `{ success, data: Order }`
- Produces: full order detail page with items, status timeline, license keys, payment info

- [ ] **Step 1: Implement the OrderDetailPage component**

Create a full order detail page:
- Fetch order from `/api/orders/${orderId}` on mount
- Show loading skeleton
- Display order header: ID, date, status badge, total
- Display order items list with product name, billing cycle, price, quantity
- Display status timeline (pending → submitted → confirmed → completed)
- Display license keys if order is completed
- Display payment info if payment was submitted
- Display rejection reason if payment was rejected
- Action buttons: "Continue Payment" (if pending), "Cancel" (if pending), "Back to Orders"
- Error state if order not found

- [ ] **Step 2: Verify in browser**

Run: `npm run dev` → navigate to `/dashboard/orders/{orderId}`
Expected: Full order details displayed with all information

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/orders/[id]/page.tsx
git commit -m "feat: complete order detail page with full information display"
```

---

## Task 6: Complete Dashboard Wallet Page

**Files:**
- Modify: `src/app/dashboard/wallet/page.tsx` (currently partial — has deposit form but no transaction history)
- Uses: `GET /api/wallet` (returns wallet balance + transactions)
- Uses: `GET /api/bank-cards` (returns admin bank cards for deposit)

**Interfaces:**
- Consumes: wallet balance, transaction history, bank cards
- Produces: full wallet page with balance, deposit form, transaction history

- [ ] **Step 1: Read existing wallet API**

Read `src/app/api/wallet/route.ts` to understand response shape.

- [ ] **Step 2: Add transaction history to wallet API**

Enhance `GET /api/wallet` to also return recent transactions (from `WalletTransaction` model).

- [ ] **Step 3: Implement full WalletPage component**

Add to existing:
- Current balance display (prominent)
- Deposit form (already exists)
- Transaction history list with type, amount, date, description
- Filter by transaction type
- Empty state for no transactions

- [ ] **Step 4: Verify in browser**

Run: `npm run dev` → navigate to `/dashboard/wallet`
Expected: Balance shown, deposit form works, transaction history visible

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/wallet/page.tsx src/app/api/wallet/route.ts
git commit -m "feat: complete wallet page with transaction history and deposit"
```

---

## Task 7: Fix Missing API Routes (Dynamic [id] routes)

**Files:**
- Create: `src/app/api/orders/[id]/route.ts` (currently 0 lines — empty file)
- Create: `src/app/api/users/[id]/route.ts` (currently 0 lines)
- Create: `src/app/api/tickets/[id]/route.ts` (currently 0 lines)
- Create: `src/app/api/products/[id]/route.ts` (currently 0 lines)
- Create: `src/app/api/products/[id]/reviews/route.ts` (currently 0 lines)
- Create: `src/app/api/products/[id]/reviews/can-review/route.ts` (currently 0 lines)

**Interfaces:**
- Each route handles GET (single item), PATCH (update), DELETE as appropriate
- All require auth, some require admin

- [ ] **Step 1: Implement /api/orders/[id]/route.ts**

Already partially exists with GET and PATCH. Add:
- DELETE for admin to delete orders
- Ensure proper error handling

- [ ] **Step 2: Implement /api/users/[id]/route.ts**

GET: Get user profile (own or admin)
PUT: Update user profile (username, phone)
DELETE: Admin can delete/suspend user
PUT for password change (used by profile page)

- [ ] **Step 3: Implement /api/tickets/[id]/route.ts**

GET: Get single ticket with messages
POST: Add message to ticket
PATCH: Update ticket status (admin only)

- [ ] **Step 4: Implement /api/products/[id]/route.ts**

GET: Get single product by ID (public)
PATCH: Update product (admin only)
DELETE: Delete product (admin only)

- [ ] **Step 5: Implement /api/products/[id]/reviews/route.ts**

GET: Get reviews for a product
POST: Create a review (authenticated, verified purchase)

- [ ] **Step 6: Implement /api/products/[id]/reviews/can-review/route.ts**

GET: Check if user can review a product (has purchased, hasn't reviewed yet)

- [ ] **Step 7: Verify all routes**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 8: Commit**

```bash
git add src/app/api/
git commit -m "feat: implement all missing API routes for CRUD operations"
```

---

## Task 8: Fix Missing Admin API Routes

**Files:**
- Create: `src/app/api/admin/users/[id]/route.ts`
- Create: `src/app/api/admin/tickets/[id]/route.ts`
- Create: `src/app/api/admin/products/[id]/route.ts`
- Create: `src/app/api/admin/orders/[id]/route.ts`
- Create: `src/app/api/admin/licenses/[id]/route.ts`
- Create: `src/app/api/admin/courses/[id]/route.ts`
- Create: `src/app/api/admin/courses/[id]/lessons/route.ts`
- Create: `src/app/api/admin/bank-cards/[id]/route.ts`
- Create: `src/app/api/admin/articles/[id]/route.ts`

**Interfaces:**
- All require admin role
- Handle GET, PATCH, DELETE as appropriate

- [ ] **Step 1: Implement admin/users/[id]**

GET: Get user details
PATCH: Update user (role, status)
DELETE/SUSPEND: Change user status

- [ ] **Step 2: Implement admin/tickets/[id]**

GET: Get ticket with messages
POST: Reply to ticket
PATCH: Update status (open/answered/closed)

- [ ] **Step 3: Implement admin/products/[id]**

GET: Get product details
PATCH: Update product
DELETE: Delete product

- [ ] **Step 4: Implement admin/orders/[id]**

GET: Get order details (all fields)
PATCH: Update order status (confirm/reject payment)
POST: Generate licenses on confirmation

- [ ] **Step 5: Implement admin/licenses/[id]**

GET: Get license details
PATCH: Update license (revoke, extend)
DELETE: Delete license

- [ ] **Step 6: Implement admin/courses/[id] and lessons**

GET: Course with lessons
PATCH: Update course
DELETE: Course
POST: Add lesson to course

- [ ] **Step 7: Implement admin/bank-cards/[id]**

GET: Get card details
PATCH: Update card
DELETE: Remove card

- [ ] **Step 8: Implement admin/articles/[id]**

GET: Get article
PATCH: Update article
DELETE: Delete article

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 10: Commit**

```bash
git add src/app/api/admin/
git commit -m "feat: implement all admin API routes for full CRUD operations"
```

---

## Task 9: Enhance Landing Page — Hero Section with Featured Products

**Files:**
- Modify: `src/app/page.tsx` (main landing page — check current structure)
- Modify: `src/components/GameCheats.tsx` (already has banner fix, enhance further)

**Interfaces:**
- Consumes: product data from `/api/products`
- Produces: visually stunning landing page with featured products

- [ ] **Step 1: Review current landing page structure**

Read `src/app/page.tsx` to understand current tab layout.

- [ ] **Step 2: Enhance product cards with better visual design**

Ensure product cards show:
- Banner image (already fixed)
- Game badge with color
- Category icon
- Star rating
- Price in correct currency
- "Buy Now" button with hover animation
- Smooth loading skeleton

- [ ] **Step 3: Add featured products section**

Show top 4 rated products in a hero section above the main grid.

- [ ] **Step 4: Verify in browser**

Run: `npm run dev` → navigate to `/`
Expected: Beautiful product grid with banner images

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/GameCheats.tsx
git commit -m "feat: enhance landing page with featured products and better visuals"
```

---

## Task 10: Add Missing UI Components

**Files:**
- Create: `src/components/ui/Input.tsx` (check if exists)
- Create: `src/components/ui/Button.tsx` (check if exists)
- Create: `src/components/ui/Textarea.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/Modal.tsx` (check if exists)
- Create: `src/components/ui/Badge.tsx` (check if exists)
- Create: `src/components/ui/Toggle.tsx`
- Create: `src/components/ui/Tabs.tsx`

**Interfaces:**
- Consistent styling with the dark medieval-tech theme
- Support RTL/LTR
- Support disabled state
- Support error state

- [ ] **Step 1: Check which UI components already exist**

Glob for `src/components/ui/*.tsx`

- [ ] **Step 2: Create missing components**

Each component should:
- Accept standard HTML props
- Have variants (size, color)
- Support disabled state
- Use Tailwind CSS 4 classes
- Match the project's design system

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add missing UI components (Textarea, Select, Toggle, Tabs)"
```

---

## Task 11: Final Polish & Bug Fixes

**Files:**
- Various as needed

**Interfaces:**
- All pages working, no console errors

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Zero errors, zero warnings

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Test critical user flows**

Manual testing checklist:
- [ ] Register → Login → Dashboard
- [ ] Add to cart → Checkout → Place order
- [ ] Submit payment (card-to-card)
- [ ] View order in dashboard
- [ ] Admin: View order → Confirm payment
- [ ] User: See license keys after confirmation
- [ ] Profile: Update info, change password
- [ ] Wallet: View balance, see transactions
- [ ] Notifications: View list, mark as read
- [ ] Licenses: View keys, copy to clipboard

- [ ] **Step 4: Fix any issues found**

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: final polish, bug fixes, and verification"
```

---

## Task 12: Database Migration & Seed

**Files:**
- Modify: `prisma/schema.prisma` (ensure all relations are correct)
- Run: `npx prisma migrate dev`
- Run: `npx prisma db seed`

**Interfaces:**
- Clean database with all tables and seed data

- [ ] **Step 1: Review Prisma schema**

Ensure all models have correct relations and fields.

- [ ] **Step 2: Create migration**

Run: `npx prisma migrate dev --name complete-project`
Expected: Migration created and applied

- [ ] **Step 3: Run seed**

Run: `npx prisma db seed`
Expected: All products, categories, sample data seeded

- [ ] **Step 4: Verify data**

Run: `npx prisma studio` and check all tables have data.

- [ ] **Step 5: Commit**

```bash
git add prisma/migrations/ prisma/prisma/dev.db prisma/seed.ts
git commit -m "chore: database migration and seed data"
```

---

## Execution Order

1. **Task 1** (Cleanup) — do first
2. **Task 7 + 8** (API routes) — do before frontend
3. **Task 2, 3, 4, 5, 6** (Dashboard pages) — after API routes
4. **Task 9** (Landing page) — after dashboard
5. **Task 10** (UI components) — as needed
6. **Task 11** (Polish) — do last
7. **Task 12** (Database) — do after all code is correct

---

## Summary

| Task | Priority | Est. Time |
|------|----------|-----------|
| 1. Cleanup | HIGH | 5 min |
| 2. Notifications | MEDIUM | 30 min |
| 3. Licenses | MEDIUM | 45 min |
| 4. Courses | LOW | 30 min |
| 5. Order Detail | HIGH | 60 min |
| 6. Wallet | MEDIUM | 45 min |
| 7. Missing APIs | HIGH | 90 min |
| 8. Admin APIs | HIGH | 120 min |
| 9. Landing Page | MEDIUM | 60 min |
| 10. UI Components | LOW | 45 min |
| 11. Polish | HIGH | 60 min |
| 12. Database | MEDIUM | 15 min |
