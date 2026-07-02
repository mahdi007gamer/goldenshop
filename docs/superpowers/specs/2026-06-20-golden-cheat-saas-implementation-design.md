---
title: Golden Cheat SaaS — Implementation Design
date: 2026-06-20
status: approved
---

# Golden Cheat SaaS — Implementation Design

## 1. Executive Summary

Refactor the existing Golden Cheat storefront (tab-based SPA with Context API) into a full SaaS platform using Next.js App Router with route-based architecture. Reuse existing UI components, styles, and patterns — refactor them into the new modular architecture instead of rewriting from scratch.

## 2. Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.2.9 (App Router) | Route-based, not tab-based |
| UI | React 19.2.4, Tailwind CSS 4 | Existing styles reused |
| Animation | Framer Motion 12.40 | Existing |
| Icons | Lucide React 1.21 | Only Lucide, no Heroicons |
| State (Client) | Zustand 5 + Context | Zustand for data, Context for Lang only |
| State (Server) | Next.js API Routes | RESTful endpoints |
| Language | TypeScript 5 (strict) | |
| Auth | Session-based (httpOnly cookie) | Manual, no NextAuth |
| Database | SQLite + Prisma | File-based, zero-config |
| SMS | Kavenegar API | OTP + password reset |

## 3. Auth System Design

### 3.1 Registration
- **Fields**: username, phone (11 digits, starts with `09`), password
- **No email field** — phone is the primary contact
- **Flow**: Fill form → Send OTP via Kavenegar → Verify → Create account

### 3.2 Login
- **Method A**: Username or Phone + Password
- **Method B**: Phone + SMS OTP (passwordless)
- **Flow**: Enter phone → Send OTP → Verify → Login

### 3.3 Password Reset
- **Flow**: Enter phone → Send OTP via Kavenegar → Verify → Set new password

### 3.4 Kavenegar Config
- **API Key**: `6A42677659444F74536B77467678745132456C4F364D494A43617572757639424775454243317A313974453D`
- **Sender ID**: `306685`
- **Template**: `verify`
- **Pattern**: `کد ویژه شما\n%token`

### 3.5 Auth Page Layout
- **Split layout**: Left side = cyberpunk/neon image (user provides `public/images/auth-bg.png`), Right side = animated form
- **Form transition**: Animated flip/switch between Login ↔ Register
- **RTL aware**: In RTL, image on right, form on left
- **Image style**: Cyberpunk/neon aesthetic (purple/blue/cyber highlights) matching the obsidian/gold/cyber theme

## 4. Route Structure

```
/                               → Storefront (home page)
/products/[id]                  → Product detail

/auth/login                     → Login page (split layout)
/auth/register                  → Register page (same split layout, animated switch)
/auth/forgot-password           → Forgot password (SMS reset)

/dashboard                      → User dashboard (overview)
/dashboard/orders               → Order list
/dashboard/orders/[id]          → Order detail
/dashboard/licenses             → License management
/dashboard/wallet               → Wallet & transactions (card-to-card + promo code)
/dashboard/tickets              → Support tickets
/dashboard/tickets/[id]         → Ticket detail
/dashboard/courses              → Courses & tutorials (cheat installation guides)
/dashboard/notifications        → Notification center
/dashboard/profile              → Profile settings

/admin                          → Admin dashboard
/admin/products                 → Product management
/admin/orders                   → Order management
/admin/licenses                 → License management
/admin/articles                 → Blog management
/admin/articles/[id]            → Article editor
/admin/tickets                  → Ticket management
/admin/users                    → User management
/admin/settings                 → System settings

/blog                           → Blog listing
/blog/[slug]                    → Article detail
/blog/category/[slug]           → Category page
```

## 5. Folder Structure

```
src/
├── app/
│   ├── (storefront)/
│   │   ├── layout.tsx           ← Reuses existing Header, Footer, Hero, etc.
│   │   ├── page.tsx             ← Refactored from current page.tsx
│   │   └── products/[id]/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx           ← Split layout (image + form)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx           ← Sidebar + Header
│   │   ├── page.tsx             ← Overview
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   ├── licenses/page.tsx
│   │   ├── wallet/page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── tickets/[id]/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/
│   │   ├── layout.tsx           ← Admin sidebar + header
│   │   ├── page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── licenses/page.tsx
│   │   ├── articles/page.tsx
│   │   ├── articles/[id]/page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── users/page.tsx
│   │   └── settings/page.tsx
│   ├── blog/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx
│   │   └── category/[slug]/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── verify-otp/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   ├── reset-password/route.ts
│   │   │   └── session/route.ts
│   │   ├── products/[id]/route.ts
│   │   ├── orders/route.ts
│   │   ├── orders/[id]/route.ts
│   │   ├── licenses/route.ts
│   │   ├── tickets/route.ts
│   │   ├── tickets/[id]/route.ts
│   │   ├── wallet/
│   │   │   ├── route.ts
│   │   │   ├── transactions/route.ts
│   │   │   ├── card-to-card/route.ts
│   │   │   └── promo-code/route.ts
│   │   ├── courses/route.ts
│   │   ├── courses/[id]/route.ts
│   │   ├── articles/route.ts
│   │   ├── articles/[id]/route.ts
│   │   ├── notifications/route.ts
│   │   ├── users/[id]/route.ts
│   │   └── admin/stats/route.ts
│   ├── layout.tsx               ← Root: LangProvider > Providers
│   ├── globals.css              ← Existing 458 lines, kept
│   └── not-found.tsx            ← Existing
│
├── components/
│   ├── ui/                      ← Reused & refactored from existing
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx            ← From existing ui/Modal.tsx
│   │   ├── Toast.tsx            ← From existing ui/Toast.tsx
│   │   ├── Badge.tsx            ← From existing ui/Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── LoadingSkeleton.tsx  ← From existing ui/LoadingSkeleton.tsx
│   │   └── index.ts             ← Barrel export
│   ├── layout/
│   │   ├── Header.tsx           ← From existing Header.tsx
│   │   ├── Footer.tsx           ← From existing Footer.tsx
│   │   ├── Sidebar.tsx          ← Dashboard sidebar
│   │   ├── AdminSidebar.tsx     ← Admin sidebar
│   │   └── MobileNav.tsx
│   ├── storefront/
│   │   ├── Hero.tsx             ← From existing Hero.tsx
│   │   ├── Features.tsx         ← From existing Features.tsx
│   │   ├── Stats.tsx            ← From existing Stats.tsx
│   │   ├── Storefront.tsx       ← From existing Storefront.tsx
│   │   ├── Testimonials.tsx     ← From existing Testimonials.tsx
│   │   ├── CTA.tsx              ← From existing CTA.tsx
│   │   └── ProductCard.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── OtpInput.tsx
│   │   └── AuthImage.tsx        ← Cyberpunk image component
│   ├── dashboard/
│   │   ├── DashboardCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── WalletCard.tsx
│   │   └── RecentOrders.tsx
│   ├── admin/
│   │   ├── AdminStats.tsx
│   │   ├── AdminTable.tsx
│   │   └── AdminChart.tsx
│   ├── blog/
│   │   ├── ArticleCard.tsx
│   │   ├── TOC.tsx
│   │   └── ShareButtons.tsx
│   └── courses/
│       ├── CourseCard.tsx
│       ├── LessonList.tsx
│       └── FileUploader.tsx
│
├── features/                    ← Feature-based modules
│   ├── auth/
│   │   ├── api.ts               ← Auth API calls
│   │   ├── hooks.ts             ← useAuth, useOtp
│   │   ├── types.ts             ← Auth types
│   │   └── validations.ts       ← Zod schemas
│   ├── products/
│   │   ├── api.ts
│   │   └── hooks.ts
│   ├── orders/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── licenses/
│   │   ├── api.ts
│   │   └── hooks.ts
│   ├── tickets/
│   │   ├── api.ts
│   │   └── hooks.ts
│   ├── wallet/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── courses/
│   │   ├── api.ts
│   │   └── hooks.ts
│   ├── articles/
│   │   ├── api.ts
│   │   └── hooks.ts
│   └── notifications/
│       ├── api.ts
│       └── hooks.ts
│
├── store/                       ← Zustand stores
│   ├── auth-store.ts
│   ├── cart-store.ts
│   ├── ui-store.ts
│   └── notification-store.ts
│
├── lib/
│   ├── prisma.ts                ← Prisma client singleton
│   ├── api/
│   │   ├── client.ts            ← Fetch wrapper
│   │   ├── endpoints.ts         ← API endpoint constants
│   │   └── error-handler.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── kavenegar.service.ts ← SMS service
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── license.service.ts
│   │   ├── ticket.service.ts
│   │   ├── wallet.service.ts
│   │   ├── course.service.ts
│   │   ├── article.service.ts
│   │   └── notification.service.ts
│   ├── middleware.ts            ← Auth middleware
│   ├── utils.ts
│   ├── validations.ts           ← Shared Zod schemas
│   └── constants.ts
│
├── types/
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── license.types.ts
│   ├── ticket.types.ts
│   ├── wallet.types.ts
│   ├── course.types.ts
│   ├── article.types.ts
│   ├── user.types.ts
│   └── index.ts
│
├── data/
│   ├── seed.ts                  ← Database seeder
│   └── mock/                    ← Keep existing mockData.ts as fallback
│
├── context/
│   └── LangContext.tsx          ← Keep existing, remove AppContext
│
├── i18n/
│   └── translations.ts          ← Keep existing, expand as needed
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## 6. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  phone         String    @unique
  passwordHash  String
  avatar        String?
  role          String    @default("user") // "user" | "admin"
  status        String    @default("active") // "active" | "suspended"
  walletBalance Float     @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  orders        Order[]
  licenses      License[]
  tickets       Ticket[]
  sessions      Session[]
  notifications Notification[]
  transactions  WalletTransaction[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}

model OtpCode {
  id        String   @id @default(cuid())
  phone     String
  code      String
  purpose   String   // "register" | "login" | "reset-password"
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([phone, code])
}

model Product {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  game          String
  category      String
  price         Float
  salePrice     Float?
  rating        Float    @default(0)
  reviewsCount  Int      @default(0)
  features      String   @default("[]") // JSON array
  description   String
  longDescription String?
  isPopular     Boolean  @default(false)
  status        String   @default("active") // "active" | "inactive"
  bypassRate    String   @default("100%")
  updateStatus  String   @default("Undetected")
  imageUrl      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  orderItems    OrderItem[]
  licenses      License[]
}

model Order {
  id            String   @id @default(cuid())
  userId        String
  subtotal      Float
  discount      Float    @default(0)
  total         Float
  status        String   @default("pending") // "pending" | "paid" | "active" | "expired" | "cancelled" | "refunded"
  paymentMethod String   @default("wallet") // "wallet" | "card-to-card"
  billingCycle  String   // "monthly" | "lifetime"
  promoCode     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])
  items         OrderItem[]
  licenses      License[]
}

model OrderItem {
  id            String @id @default(cuid())
  orderId       String
  productId     String
  productName   String
  price         Float
  quantity      Int    @default(1)
  billingCycle  String // "monthly" | "lifetime"

  order         Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product       Product @relation(fields: [productId], references: [id])
}

model License {
  id            String   @id @default(cuid())
  key           String   @unique
  orderId       String
  userId        String
  productId     String
  productName   String
  game          String
  status        String   @default("active") // "active" | "expired" | "revoked" | "hardware-locked"
  hwid          String?
  activatedAt   DateTime?
  expiresAt     DateTime
  createdAt     DateTime @default(now())

  order         Order  @relation(fields: [orderId], references: [id])
  user          User   @relation(fields: [userId], references: [id])
  product       Product @relation(fields: [productId], references: [id])
}

model Ticket {
  id        String   @id @default(cuid())
  userId    String
  subject   String
  game      String
  status    String   @default("open") // "open" | "answered" | "pending" | "closed"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  messages  TicketMessage[]
}

model TicketMessage {
  id        String   @id @default(cuid())
  ticketId  String
  userId    String
  text      String
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}

model WalletTransaction {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "deposit" | "withdrawal" | "purchase" | "refund" | "promo"
  amount      Float
  balance     Float    // balance after transaction
  description String
  referenceId String?
  status      String   @default("completed") // "completed" | "pending" | "failed"
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@index([userId])
}

model PromoCode {
  id          String   @id @default(cuid())
  code        String   @unique
  discount    Float    // percentage or fixed amount
  discountType String  // "percent" | "fixed"
  maxUses     Int?
  usedCount   Int      @default(0)
  expiresAt   DateTime?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model CardToCardPayment {
  id          String   @id @default(cuid())
  userId      String
  amount      Float
  cardNumber  String   // admin's card number
  reference   String   // user's transfer reference
  status      String   @default("pending") // "pending" | "approved" | "rejected"
  createdAt   DateTime @default(now())
  approvedAt  DateTime?

  user        User     @relation(fields: [userId], references: [id])
}

model Course {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  description   String
  thumbnail     String?
  category      String
  game          String
  status        String   @default("published") // "published" | "draft"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  lessons       Lesson[]
}

model Lesson {
  id        String   @id @default(cuid())
  courseId  String
  title     String
  content   String
  videoUrl  String?
  duration  Int      @default(0) // minutes
  order     Int      @default(0)
  resources String   @default("[]") // JSON: [{name, url, type}]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
}

model Article {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  excerpt         String
  content         String
  coverImage      String?
  authorId        String
  authorName      String
  category        String
  tags            String   @default("[]") // JSON array
  status          String   @default("draft") // "published" | "draft"
  readingTime     Int      @default(0)
  views           Int      @default(0)
  metaTitle       String?
  metaDescription String?
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "order" | "license" | "ticket" | "system" | "wallet"
  title     String
  message   String
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
}
```

## 7. API Design

### Response Format
```typescript
// Success
{ success: true, data: T, meta?: { page, limit, total, totalPages } }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

### Auth Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register (username, phone, password) |
| POST | /api/auth/register/verify | Verify OTP & create account |
| POST | /api/auth/login | Login with username/phone + password |
| POST | /api/auth/login/sms | Request SMS OTP for login |
| POST | /api/auth/login/sms/verify | Verify SMS OTP & login |
| POST | /api/auth/logout | Logout & clear session |
| POST | /api/auth/forgot-password | Request password reset SMS |
| POST | /api/auth/reset-password | Reset password with OTP |
| GET | /api/auth/session | Get current session |

### Resource Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List products |
| GET | /api/products/[id] | Get product detail |
| GET | /api/orders | List user orders |
| GET | /api/orders/[id] | Get order detail |
| POST | /api/orders | Create order |
| GET | /api/licenses | List user licenses |
| GET | /api/tickets | List user tickets |
| POST | /api/tickets | Create ticket |
| GET | /api/tickets/[id] | Get ticket detail |
| POST | /api/tickets/[id]/reply | Reply to ticket |
| GET | /api/wallet | Get wallet balance |
| GET | /api/wallet/transactions | Transaction history |
| POST | /api/wallet/card-to-card | Submit card-to-card payment |
| POST | /api/wallet/promo-code | Apply promo code |
| GET | /api/courses | List courses |
| GET | /api/courses/[id] | Get course detail |
| GET | /api/articles | List published articles |
| GET | /api/articles/[id] | Get article detail |
| GET | /api/notifications | List notifications |
| POST | /api/notifications/read | Mark as read |
| GET | /api/users/[id] | Get user profile |
| PUT | /api/users/[id] | Update profile |

### Admin Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/stats | Dashboard statistics |
| POST | /api/products | Create product |
| PUT | /api/products/[id] | Update product |
| DELETE | /api/products/[id] | Delete product |
| PUT | /api/orders/[id]/status | Update order status |
| POST | /api/licenses/generate | Generate licenses |
| PUT | /api/licenses/[id] | Update license |
| POST | /api/articles | Create article |
| PUT | /api/articles/[id] | Update article |
| DELETE | /api/articles/[id] | Delete article |
| PUT | /api/tickets/[id]/status | Update ticket status |
| GET | /api/users | List all users |
| PUT | /api/users/[id] | Update user |
| PUT | /api/wallet/card-to-card/[id]/approve | Approve card-to-card payment |
| PUT | /api/wallet/card-to-card/[id]/reject | Reject card-to-card payment |

## 8. State Management (Zustand)

### Auth Store
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrPhone: string, password: string) => Promise<void>;
  loginWithSms: (phone: string) => Promise<void>;
  verifySmsLogin: (phone: string, code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyRegister: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

### Cart Store
```typescript
interface CartState {
  items: CartItem[];
  addItem: (product: Product, billingCycle: BillingCycle) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
```

### UI Store
```typescript
interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  theme: "dark";
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}
```

### Notification Store
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

## 9. Authentication Flow

```
Registration:
  User fills form → POST /api/auth/register → Send OTP via Kavenegar
  → User enters OTP → POST /api/auth/register/verify
  → Create user in DB → Create session → Set httpOnly cookie → Redirect /dashboard

Login (Password):
  User fills form → POST /api/auth/login
  → Validate credentials → Create session → Set httpOnly cookie → Redirect /dashboard

Login (SMS):
  User enters phone → POST /api/auth/login/sms → Send OTP via Kavenegar
  → User enters OTP → POST /api/auth/login/sms/verify
  → Create session → Set httpOnly cookie → Redirect /dashboard

Password Reset:
  User enters phone → POST /api/auth/forgot-password → Send OTP
  → User enters OTP + new password → POST /api/auth/reset-password
  → Update password → Redirect /auth/login

Protected Routes:
  /dashboard/* → middleware checks session → if none, redirect /auth/login
  /admin/* → middleware checks session + role → if not admin, redirect /dashboard
  /auth/* → middleware checks session → if logged in, redirect /dashboard

Session:
  Stored as httpOnly cookie (secure, httpOnly, sameSite)
  Zustand store hydrates from /api/auth/session on page load
```

## 10. Wallet & Payment Flow

### Card-to-Card Payment
1. User goes to `/dashboard/wallet`
2. Enters amount to deposit
3. System shows admin card number + generates a unique reference code
4. User transfers money via bank app
5. User submits reference code → POST /api/wallet/card-to-card
6. Admin reviews in `/admin/orders` → Approve/Reject
7. On approval: wallet balance increases, transaction recorded

### Promo Code
1. User enters promo code in wallet page
2. POST /api/wallet/promo-code with code
3. System validates: exists, active, not expired, not exceeded max uses
4. If valid: adds discount amount to wallet, increments used count
5. Transaction recorded with type "promo"

### Cryptocurrency (Disabled)
- UI shows "Coming Soon" badge on crypto payment option
- No backend implementation in this phase

## 11. Course System

### Content Structure
- **Course**: title, description, thumbnail, category, game
- **Lesson**: title, content (rich text), video URL, duration, order, resources
- **Resources**: files (PDF, ZIP, links) attached to lessons

### File Upload
- Admin can upload: images (PNG, JPG, WebP), videos (MP4, WebM), files (PDF, ZIP)
- Upload via API route → store in `/public/uploads/courses/`
- Max file size: 500MB for videos, 50MB for other files
- File manager in admin course editor

### Course Content
- Focused on cheat installation & usage tutorials
- Step-by-step guides with screenshots and videos
- Ordered lessons with progress tracking

## 12. Design System

### Colors (CSS Variables — Existing)
```css
--color-obsidian: #0B0B0B;
--color-obsidian-light: #141414;
--color-obsidian-lighter: #1f1f1f;
--color-gold: #FFD700;
--color-gold-dim: #b8960c;
--color-gold-dark: #8B6914;
--color-cyber: #00f0ff;
--color-cyber-dim: #00a8b3;
--color-danger: #ff3366;
--color-success: #00ff88;
--color-warning: #ffaa00;
```

### Typography (Existing)
```css
--font-sans: "Inter", system-ui, sans-serif;
--font-display: "Orbitron", "Inter", sans-serif;
--font-fa: "Kalameh", "Inter", "Segoe UI", system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

### Component Library (Refactored from existing)
- **Button**: variants (primary/gold, secondary, ghost, danger), sizes (sm, md, lg), loading state
- **Input**: with label, error, icon support, RTL-aware
- **Modal**: from existing `ui/Modal.tsx`
- **Toast**: from existing `ui/Toast.tsx`
- **Badge**: from existing `ui/Badge.tsx`
- **Card**: glass-card, stat-card
- **Table**: sortable, filterable, paginated
- **Sidebar**: collapsible, nested navigation (Lucide icons only)
- **LoadingSkeleton**: from existing `ui/LoadingSkeleton.tsx`

### Auth Page Image
- User provides `public/images/auth-bg.png` (or .svg)
- Style: cyberpunk/neon aesthetic (purple/blue/cyber)
- Split layout: image on one side, animated form on the other
- Responsive: image hides on mobile, form takes full width

## 13. Implementation Phases

### Phase 0: Foundation
- Install Prisma, set up SQLite, create schema
- Create folder structure
- Set up type definitions
- Create database seeder (existing mock data → DB)
- Build UI component library (refactor existing)
- Set up API client + error handling
- Create Zustand stores
- Set up middleware

### Phase 1: Auth System
- Auth API routes (register, login, SMS, logout, session, forgot/reset)
- Auth middleware
- Login page (split layout with cyberpunk image)
- Register page (animated switch from login)
- OTP input component
- Auth hooks + validations
- Kavenegar SMS service

### Phase 2: Storefront Refactor
- Move existing storefront to (storefront) group
- Product detail page
- Cart functionality (Zustand cart store)
- Checkout flow (card-to-card payment)
- Remove old tab-based navigation

### Phase 3: User Dashboard
- Dashboard layout (sidebar + header, Lucide icons)
- Dashboard overview page
- Orders pages
- Licenses page
- Wallet page (card-to-card + promo code, crypto disabled)
- Tickets pages
- Courses page
- Notifications page
- Profile page

### Phase 4: Admin Panel
- Admin layout (sidebar + header)
- Admin dashboard with stats
- Product management (CRUD)
- Order management (approve/reject card-to-card)
- License management
- Article management (CRUD)
- Ticket management (reply, close)
- User management (view, suspend)
- Settings page

### Phase 5: Blog System
- Blog layout
- Blog listing page (paginated, category filter)
- Article detail page (full SEO: OG, JSON-LD, canonical)
- Category pages
- Search functionality

### Phase 6: Courses System
- Course listing page
- Course detail page with lesson list
- Admin course editor
- File upload system (image, video, file)
- Lesson ordering
- Resource download

### Phase 7: Polish
- Responsive design refinement
- Animation polish (Framer Motion)
- Performance optimization
- Accessibility audit
- Final testing
- Seed data verification
