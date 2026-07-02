---
title: Golden Cheat SaaS Platform — Architecture Design
date: 2026-06-19
status: approved
---

# Golden Cheat SaaS Platform — Full Architecture Design

## 1. Executive Summary

Convert the existing Golden Cheat storefront (tab-based SPA) into a full SaaS platform with route-based architecture, including User Dashboard, Admin Panel, Blog System, and production-ready API layer.

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router) |
| UI | React 19.2.4, Tailwind CSS 4 |
| Animation | Framer Motion 12.40 |
| Icons | Lucide React 1.21 |
| State (Client) | Zustand 5 |
| State (Server) | Next.js API Routes |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + CSS Variables |
| Auth | Session-based (API routes → httpOnly cookie) |
| Data Store | In-memory (seed data) → swappable to real DB |

## 3. Route Structure

```
/                               → Storefront (home page)
/products/[id]                  → Product detail

/auth/login                     → Login page
/auth/register                  → Register page
/auth/forgot-password           → Forgot password
/auth/reset-password            → Reset password

/dashboard                      → User dashboard (overview)
/dashboard/orders               → Order list
/dashboard/orders/[id]          → Order detail
/dashboard/licenses             → License management
/dashboard/wallet               → Wallet & transactions
/dashboard/tickets              → Support tickets
/dashboard/tickets/[id]         → Ticket detail
/dashboard/courses              → Courses & tutorials
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

## 4. Folder Structure

```
src/
├── app/
│   ├── (storefront)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── products/[id]/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
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
│   │   ├── layout.tsx
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
│   │   │   ├── forgot-password/route.ts
│   │   │   ├── reset-password/route.ts
│   │   │   └── session/route.ts
│   │   ├── products/[id]/route.ts
│   │   ├── orders/route.ts
│   │   ├── orders/[id]/route.ts
│   │   ├── licenses/route.ts
│   │   ├── licenses/[id]/route.ts
│   │   ├── tickets/route.ts
│   │   ├── tickets/[id]/route.ts
│   │   ├── wallet/route.ts
│   │   ├── wallet/transactions/route.ts
│   │   ├── courses/route.ts
│   │   ├── courses/[id]/route.ts
│   │   ├── articles/route.ts
│   │   ├── articles/[id]/route.ts
│   │   ├── notifications/route.ts
│   │   ├── users/route.ts
│   │   ├── users/[id]/route.ts
│   │   └── admin/stats/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── ui/           (Button, Input, Modal, Badge, Toast, Card, Table, ...)
│   ├── layout/       (Sidebar, Header, Footer, MobileNav)
│   ├── storefront/   (Hero, Features, Stats, Testimonials, ProductCard)
│   ├── auth/         (LoginForm, RegisterForm, ForgotPasswordForm)
│   ├── dashboard/    (DashboardCard, StatCard, ChartWidget, ...)
│   ├── admin/        (AdminTable, AdminChart, AdminStats, ...)
│   └── blog/         (ArticleCard, TOC, ShareButtons, ...)
│
├── features/
│   ├── auth/         (api.ts, hooks.ts, types.ts)
│   ├── products/     (api.ts, hooks.ts)
│   ├── orders/       (api.ts, hooks.ts)
│   ├── licenses/     (api.ts, hooks.ts)
│   ├── tickets/      (api.ts, hooks.ts)
│   ├── wallet/       (api.ts, hooks.ts)
│   ├── courses/      (api.ts, hooks.ts)
│   ├── articles/     (api.ts, hooks.ts)
│   ├── notifications/(api.ts, hooks.ts)
│   └── users/        (api.ts, hooks.ts)
│
├── store/            (Zustand stores)
│   ├── auth-store.ts
│   ├── cart-store.ts
│   ├── ui-store.ts
│   └── notification-store.ts
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── error-handler.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── license.service.ts
│   │   ├── ticket.service.ts
│   │   ├── wallet.service.ts
│   │   ├── course.service.ts
│   │   ├── article.service.ts
│   │   ├── user.service.ts
│   │   └── notification.service.ts
│   ├── repositories/
│   │   ├── base.repo.ts
│   │   ├── auth.repo.ts
│   │   ├── product.repo.ts
│   │   ├── order.repo.ts
│   │   ├── license.repo.ts
│   │   ├── ticket.repo.ts
│   │   ├── wallet.repo.ts
│   │   ├── course.repo.ts
│   │   ├── article.repo.ts
│   │   ├── user.repo.ts
│   │   └── notification.repo.ts
│   ├── middleware.ts
│   ├── utils.ts
│   ├── validations.ts
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
│   ├── seed.ts
│   └── mock/
│
├── context/
│   └── LangContext.tsx
│
└── i18n/
    └── translations.ts
```

## 5. Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  game: GameType;
  category: CategoryType;
  price: number;
  salePrice?: number;
  rating: number;
  reviewsCount: number;
  features: string[];
  description: string;
  longDescription?: string;
  isPopular: boolean;
  status: "active" | "inactive";
  bypassRate: string;
  updateStatus: "Undetected" | "Updating" | "Testing";
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "pending" | "paid" | "active" | "expired" | "cancelled" | "refunded";
  paymentMethod: "wallet" | "card" | "crypto";
  billingCycle: "monthly" | "lifetime";
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  billingCycle: "monthly" | "lifetime";
}
```

### License
```typescript
interface License {
  id: string;
  key: string;
  orderId: string;
  userId: string;
  productId: string;
  productName: string;
  game: string;
  status: "active" | "expired" | "revoked" | "hardware_locked";
  hwid?: string;
  activatedAt?: string;
  expiresAt: string;
  createdAt: string;
}
```

### Ticket
```typescript
interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: string;
  game: string;
  status: "open" | "answered" | "pending" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  role: "user" | "admin" | "staff";
  text: string;
  attachments?: string[];
  createdAt: string;
}
```

### WalletTransaction
```typescript
interface WalletTransaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "purchase" | "refund";
  amount: number;
  balance: number;
  description: string;
  referenceId?: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}
```

### Course
```typescript
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  game: string;
  lessons: Lesson[];
  totalDuration: number;
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  resources: Resource[];
}

interface Resource {
  name: string;
  url: string;
  type: "pdf" | "zip" | "link";
}
```

### Article (Blog)
```typescript
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  status: "published" | "draft";
  readingTime: number;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  type: "order" | "license" | "ticket" | "system" | "wallet";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
```

## 6. API Design

### Response Format
```typescript
// Success
{
  "success": true,
  "data": T,
  "meta?: { page, limit, total, totalPages }
}

// Error
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details?: any
  }
}
```

### Auth Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login with username/password |
| POST | /api/auth/register | Register new account |
| POST | /api/auth/logout | Logout & clear session |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password with token |
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
| POST | /api/wallet/deposit | Add funds |
| GET | /api/wallet/transactions | Transaction history |
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
| PUT | /api/users/[id]/suspend | Suspend user |

## 7. State Management (Zustand)

### Auth Store
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username, password) => Promise<void>;
  register: (data) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateProfile: (data) => Promise<void>;
}
```

### Cart Store
```typescript
interface CartState {
  items: CartItem[];
  addItem: (product, billingCycle) => void;
  removeItem: (id) => void;
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
  theme: "dark" | "light";
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
  markAsRead: (id) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

## 8. Authentication Flow

```
Login:
  User submits form → POST /api/auth/login
  → Validate credentials → Create session
  → Set httpOnly cookie + return user data
  → Zustand auth store update → redirect /dashboard

Protected Routes:
  /dashboard/* → middleware checks session → if none, redirect /auth/login
  /admin/* → middleware checks session + role → if not admin, redirect /dashboard
  /auth/* → middleware checks session → if logged in, redirect /dashboard

Session:
  Stored as httpOnly cookie (secure, httpOnly, sameSite)
  Zustand store hydrates from /api/auth/session on page load
```

## 9. Design System

### Colors (CSS Variables)
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

### Typography
```css
--font-sans: "Inter", system-ui, sans-serif;
--font-display: "Orbitron", "Inter", sans-serif;
--font-fa: "Kalameh", "Inter", sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

### Component Library
- **Button**: variants (primary, secondary, ghost, danger), sizes (sm, md, lg), loading state
- **Input**: with label, error, icon support, RTL-aware
- **Modal**: with overlay, animation, sizes
- **Card**: glass-card, stat-card, chart-card
- **Table**: sortable, filterable, paginated
- **Badge**: status indicators with glow
- **Toast**: notification toasts
- **Sidebar**: collapsible, nested navigation
- **Chart**: revenue chart, stats chart

## 10. SEO Strategy (Blog)

### Per Article Page
- Unique `<title>` and `<meta description>`
- OpenGraph tags (title, description, image, url)
- Twitter Card tags
- JSON-LD structured data (Article, BreadcrumbList)
- Canonical URL
- Semantic HTML (article, section, h1-h6 hierarchy)
- Reading time display
- Table of contents (auto-generated from headings)
- Related articles (same category/tag)
- Social sharing buttons

### Blog Listing Page
- Paginated article grid
- Category filter
- Tag cloud
- Search functionality
- SEO-optimized pagination (rel=next/prev)

## 11. Implementation Phases

### Phase 1: Foundation
- Set up folder structure
- Create type definitions
- Build data layer (repositories + seed data)
- Build API client + error handling
- Create Zustand stores
- Build UI component library (Button, Input, Modal, Card, Badge, Toast)

### Phase 2: Auth System
- Auth API routes (login, register, logout, session, forgot/reset password)
- Auth middleware
- Login page
- Register page
- Forgot password page
- Reset password page
- Auth hooks

### Phase 3: Storefront (Refactor)
- Move existing storefront to (storefront) group
- Product detail page
- Cart functionality
- Checkout flow

### Phase 4: User Dashboard
- Dashboard layout (sidebar + header)
- Dashboard overview page
- Orders pages
- Licenses page
- Wallet page
- Tickets pages
- Courses page
- Notifications page
- Profile page

### Phase 5: Admin Panel
- Admin layout (sidebar + header)
- Admin dashboard with stats/charts
- Product management
- Order management
- License management
- Article management
- Ticket management
- User management
- Settings page

### Phase 6: Blog System
- Blog layout
- Blog listing page
- Article detail page (full SEO)
- Category pages
- Search functionality

### Phase 7: Polish
- Responsive design refinement
- Animation polish
- Performance optimization
- Accessibility audit
- Final testing
