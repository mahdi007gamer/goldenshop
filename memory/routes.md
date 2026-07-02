# Routes

## App pages (`src/app`)

» folders in parentheses are **route groups** — they shape layout, not URL. `[…]` are dynamic slugs.

`/(auth)/forgot-password` — `src/app/(auth)/forgot-password/page.tsx` — ForgotPasswordPage
`/(auth)` — `src/app/(auth)/layout.tsx` — AuthLayout
`/(auth)/login` — `src/app/(auth)/login/page.tsx` — Form fields
`/(auth)/register` — `src/app/(auth)/register/page.tsx` — RegisterPage
`/[lang]/blog/[slug]` — `src/app/[lang]/blog/[slug]/page.tsx` — Next.js may pass percent-encoded bytes for non-ASCII slugs
`/[lang]/blog` — `src/app/[lang]/blog/page.tsx` — Canonical + hreflang are set by the root layout via x-url header (server-side in initial HTML).
`/[lang]/courses/[slug]` — `src/app/[lang]/courses/[slug]/page.tsx` — Render the client component with the course data
`/[lang]` — `src/app/[lang]/layout.tsx` — Validate lang parameter
`/[lang]` — `src/app/[lang]/page.tsx` — page
`/[lang]/products/[slug]` — `src/app/[lang]/products/[slug]/page.tsx` — Set canonical + hreflang via client-side (runs after hydration)
`/[lang]/products` — `src/app/[lang]/products/page.tsx` — ── Types ────────────────────────────────────────────────────────────────
`/admin/articles/[id]/edit` — `src/app/admin/articles/[id]/edit/page.tsx` — eslint-disable-next-line @next/next/no-img-element
`/admin/articles/new` — `src/app/admin/articles/new/page.tsx` — eslint-disable-next-line @next/next/no-img-element
`/admin/courses/[id]/edit` — `src/app/admin/courses/[id]/edit/page.tsx` — CourseEditRedirectPage
`/admin/courses/[id]` — `src/app/admin/courses/[id]/page.tsx` — CourseEditPage
`/admin/courses/new` — `src/app/admin/courses/new/page.tsx` — NewCoursePage
`/admin` — `src/app/admin/page.tsx` — ─── Types ───────────────────────────────────────────────────────────────────
`/admin/products/[id]/edit` — `src/app/admin/products/[id]/edit/page.tsx` — Form state
`/admin/products/[id]` — `src/app/admin/products/[id]/page.tsx` — eslint-disable-next-line @next/next/no-img-element
`/admin/products/new` — `src/app/admin/products/new/page.tsx` — Form state
`/admin/products` — `src/app/admin/products/page.tsx` — eslint-disable-next-line @next/next/no-img-element
`/api/admin/ai/seo-fill` — `src/app/api/admin/ai/seo-fill/route.ts` — ─── Sanitize Unicode for fetch body ───────────────────────────────────────────
`/api/admin/articles/[id]` — `src/app/api/admin/articles/[id]/route.ts` — FA fields
`/api/admin/articles` — `src/app/api/admin/articles/route.ts` — route-handler
`/api/admin/bank-cards/[id]` — `src/app/api/admin/bank-cards/[id]/route.ts` — route-handler
`/api/admin/bank-cards` — `src/app/api/admin/bank-cards/route.ts` — Basic card number validation (16 digits)
`/api/admin/courses/[id]/lessons` — `src/app/api/admin/courses/[id]/lessons/route.ts` — route-handler
`/api/admin/courses/[id]` — `src/app/api/admin/courses/[id]/route.ts` — route-handler
`/api/admin/courses` — `src/app/api/admin/courses/route.ts` — route-handler
`/api/admin/games/[id]` — `src/app/api/admin/games/[id]/route.ts` — route-handler
`/api/admin/games/reorder` — `src/app/api/admin/games/reorder/route.ts` — Update each game's sortOrder based on its index in the array.
`/api/admin/games` — `src/app/api/admin/games/route.ts` — route-handler
`/api/admin/licenses/[id]` — `src/app/api/admin/licenses/[id]/route.ts` — route-handler
`/api/admin/licenses/add` — `src/app/api/admin/licenses/add/route.ts` — Verify product exists
`/api/admin/licenses/assign` — `src/app/api/admin/licenses/assign/route.ts` — Fetch the order
`/api/admin/licenses/bulk` — `src/app/api/admin/licenses/bulk/route.ts` — Verify product exists
`/api/admin/licenses/deliver` — `src/app/api/admin/licenses/deliver/route.ts` — Fetch order with items and existing licenses
`/api/admin/licenses/inventory/[id]` — `src/app/api/admin/licenses/inventory/[id]/route.ts` — route-handler
`/api/admin/licenses/inventory` — `src/app/api/admin/licenses/inventory/route.ts` — Aggregate stock per product+billingCycle
`/api/admin/licenses/list` — `src/app/api/admin/licenses/list/route.ts` — Mask license keys for list view (full key only shown on copy/click)
`/api/admin/licenses/product/[productId]` — `src/app/api/admin/licenses/product/[productId]/route.ts` — route-handler
`/api/admin/licenses` — `src/app/api/admin/licenses/route.ts` — Validate userId if provided
`/api/admin/notifications` — `src/app/api/admin/notifications/route.ts` — Get notifications for this admin user
`/api/admin/orders/[id]/deliver` — `src/app/api/admin/orders/[id]/deliver/route.ts` — Fetch order
`/api/admin/orders/[id]` — `src/app/api/admin/orders/[id]/route.ts` — route-handler
`/api/admin/orders/actions` — `src/app/api/admin/orders/actions/route.ts` — Update order metadata (status will be set by autoDeliverLicenses)
`/api/admin/orders` — `src/app/api/admin/orders/route.ts` — Mask license keys (show only last 8 chars)
`/api/admin/orders/stats` — `src/app/api/admin/orders/stats/route.ts` — route-handler
`/api/admin/orders/verify-payment` — `src/app/api/admin/orders/verify-payment/route.ts` — Fetch order with items
`/api/admin/products/[id]` — `src/app/api/admin/products/[id]/route.ts` — Parse JSON array fields
`/api/admin/products` — `src/app/api/admin/products/route.ts` — PATCH — admin update (the admin form currently sends PUT; we accept PATCH too)
`/api/admin/seo/analyze` — `src/app/api/admin/seo/analyze/route.ts` — route-handler
`/api/admin/stats` — `src/app/api/admin/stats/route.ts` — route-handler
`/api/admin/tickets/[id]` — `src/app/api/admin/tickets/[id]/route.ts` — route-handler
`/api/admin/tickets` — `src/app/api/admin/tickets/route.ts` — route-handler
`/api/admin/upload` — `src/app/api/admin/upload/route.ts` — Determine upload type
`/api/admin/users/[id]` — `src/app/api/admin/users/[id]/route.ts` — Prevent self-deletion
`/api/admin/users` — `src/app/api/admin/users/route.ts` — route-handler
`/api/articles/[slug]` — `src/app/api/articles/[slug]/route.ts` — Increment views count
`/api/articles` — `src/app/api/articles/route.ts` — route-handler
`/api/articles/slug-map` — `src/app/api/articles/slug-map/route.ts` — route-handler
`/api/auth/forgot-password` — `src/app/api/auth/forgot-password/route.ts` — Rate limiting
`/api/auth/login` — `src/app/api/auth/login/route.ts` — route-handler
`/api/auth/login/sms` — `src/app/api/auth/login/sms/route.ts` — Rate limiting
`/api/auth/login/sms/verify` — `src/app/api/auth/login/sms/verify/route.ts` — route-handler
`/api/auth/logout` — `src/app/api/auth/logout/route.ts` — route-handler
`/api/auth/register` — `src/app/api/auth/register/route.ts` — Rate limiting check
`/api/auth/session` — `src/app/api/auth/session/route.ts` — route-handler
`/api/bank-cards` — `src/app/api/bank-cards/route.ts` — route-handler
`/api/courses/[slug]` — `src/app/api/courses/[slug]/route.ts` — route-handler
`/api/courses` — `src/app/api/courses/route.ts` — route-handler
`/api/currency` — `src/app/api/currency/route.ts` — GET /api/currency — returns current USD→Toman exchange rate
`/api/games` — `src/app/api/games/route.ts` — Get distinct games from products
`/api/licenses` — `src/app/api/licenses/route.ts` — GET /api/licenses — List current user's licenses
`/api/notifications` — `src/app/api/notifications/route.ts` — GET /api/notifications — List current user's notifications
`/api/orders/[id]` — `src/app/api/orders/[id]/route.ts` — GET /api/orders/[id] — Get single order (user's own)
`/api/orders/[id]/status` — `src/app/api/orders/[id]/status/route.ts` — Rate limit per (user, IP) so a single user/account can't flood polling
`/api/orders` — `src/app/api/orders/route.ts` — GET /api/orders — List current user's orders
`/api/orders/submit-receipt` — `src/app/api/orders/submit-receipt/route.ts` — Fetch and validate order
`/api/products/[id]/reviews/can-review` — `src/app/api/products/[id]/reviews/can-review/route.ts` — GET /api/products/[id]/reviews/can-review — Check if current user can review
`/api/products/[id]/reviews` — `src/app/api/products/[id]/reviews/route.ts` — GET /api/products/[id]/reviews — List reviews for a product
`/api/products/[id]` — `src/app/api/products/[id]/route.ts` — GET /api/products/:id — single product by id or slug
`/api/products/by-slug/[slug]` — `src/app/api/products/by-slug/[slug]/route.ts` — Fetch a single product by either English slug or Persian slugFa
`/api/products` — `src/app/api/products/route.ts` — route-handler
`/api/tickets/[id]` — `src/app/api/tickets/[id]/route.ts` — GET /api/tickets/[id] — Get ticket details (only own tickets)
`/api/tickets` — `src/app/api/tickets/route.ts` — GET /api/tickets — List current user's tickets
`/api/users/[id]` — `src/app/api/users/[id]/route.ts` — GET /api/users/[id] — Get user profile (own profile or admin)
`/api/wallet/card-to-card` — `src/app/api/wallet/card-to-card/route.ts` — POST /api/wallet/card-to-card — Submit a card-to-card payment request
`/api/wallet` — `src/app/api/wallet/route.ts` — GET /api/wallet — Get wallet balance and transactions
`/blog/[slug]` — `src/app/blog/[slug]/page.tsx` — Redirect to default locale (fa) — the [lang]/blog/[slug] route handles both FA and EN
`/blog` — `src/app/blog/page.tsx` — BlogPage
`/cart` — `src/app/cart/page.tsx` — Fallback: if persist rehydrate never fires (e.g. parse error), unblock after 1s
`/checkout/[id]` — `src/app/checkout/[id]/page.tsx` — Fetch order and bank cards
`/courses/[slug]/[lessonOrder]` — `src/app/courses/[slug]/[lessonOrder]/page.tsx` — Handle YouTube URLs
`/courses/[slug]` — `src/app/courses/[slug]/page.tsx` — page
`/courses` — `src/app/courses/page.tsx` — eslint-disable-next-line @next/next/no-img-element
`/dashboard/courses` — `src/app/dashboard/courses/page.tsx` — ─── Types ───────────────────────────────────────────────────────────────────
`/dashboard` — `src/app/dashboard/layout.tsx` — Check session on mount
`/dashboard/licenses` — `src/app/dashboard/licenses/page.tsx` — ─── Status configuration ───────────────────────────────────────────────────
`/dashboard/notifications` — `src/app/dashboard/notifications/page.tsx` — ─── Types ───────────────────────────────────────────────────────────────────
`/dashboard/orders/[id]` — `src/app/dashboard/orders/[id]/page.tsx` — ─── Icon map for status badges ──────────────────────────────────────────────
`/dashboard/orders` — `src/app/dashboard/orders/page.tsx` — ─── Icon map for status badges ──────────────────────────────────────────────
`/dashboard` — `src/app/dashboard/page.tsx` — DashboardOverview
`/dashboard/profile` — `src/app/dashboard/profile/page.tsx` — Profile form — initialize from user data (user is guaranteed by dashboard layout)
`/dashboard/tickets/[id]` — `src/app/dashboard/tickets/[id]/page.tsx` — TicketDetailPage
`/dashboard/tickets` — `src/app/dashboard/tickets/page.tsx` — TicketsPage
`/dashboard/wallet` — `src/app/dashboard/wallet/page.tsx` — Transaction history state
`/layout.tsx` — `src/app/layout.tsx` — Cast to User type — getSession returns a generic object from Prisma select
`/not-found.tsx` — `src/app/not-found.tsx` — NotFound
`/page.tsx` — `src/app/page.tsx` — Home
`/products/[slug]` — `src/app/products/[slug]/page.tsx` — page
`/products` — `src/app/products/page.tsx` — LegacyProductsRedirect

## API routes (`src/app/api`)

### `[id]`

`GET|PATCH /api/orders/[id]` — `src/app/api/orders/[id]/route.ts` — GET /api/orders/[id] — Get single order (user's own)
`GET /api/orders/[id]/status` — `src/app/api/orders/[id]/status/route.ts` — Rate limit per (user, IP) so a single user/account can't flood polling
`GET /api/products/[id]/reviews/can-review` — `src/app/api/products/[id]/reviews/can-review/route.ts` — GET /api/products/[id]/reviews/can-review — Check if current user can review
`GET|POST /api/products/[id]/reviews` — `src/app/api/products/[id]/reviews/route.ts` — GET /api/products/[id]/reviews — List reviews for a product
`GET /api/products/[id]` — `src/app/api/products/[id]/route.ts` — GET /api/products/:id — single product by id or slug
`GET|POST /api/tickets/[id]` — `src/app/api/tickets/[id]/route.ts` — GET /api/tickets/[id] — Get ticket details (only own tickets)
`GET|PUT /api/users/[id]` — `src/app/api/users/[id]/route.ts` — GET /api/users/[id] — Get user profile (own profile or admin)

### `[slug]`

`GET /api/articles/[slug]` — `src/app/api/articles/[slug]/route.ts` — Increment views count
`GET /api/courses/[slug]` — `src/app/api/courses/[slug]/route.ts` — endpoint

### `by-slug`

`GET /api/products/by-slug/[slug]` — `src/app/api/products/by-slug/[slug]/route.ts` — Fetch a single product by either English slug or Persian slugFa

### `card-to-card`

`POST /api/wallet/card-to-card` — `src/app/api/wallet/card-to-card/route.ts` — POST /api/wallet/card-to-card — Submit a card-to-card payment request

### `forgot-password`

`POST /api/auth/forgot-password` — `src/app/api/auth/forgot-password/route.ts` — Rate limiting

### `login`

`POST /api/auth/login` — `src/app/api/auth/login/route.ts` — endpoint
`POST /api/auth/login/sms` — `src/app/api/auth/login/sms/route.ts` — Rate limiting
`POST /api/auth/login/sms/verify` — `src/app/api/auth/login/sms/verify/route.ts` — endpoint

### `logout`

`POST /api/auth/logout` — `src/app/api/auth/logout/route.ts` — endpoint

### `register`

`POST /api/auth/register` — `src/app/api/auth/register/route.ts` — Rate limiting check

### `root`

`GET /api/articles` — `src/app/api/articles/route.ts` — endpoint
`GET /api/bank-cards` — `src/app/api/bank-cards/route.ts` — endpoint
`GET /api/courses` — `src/app/api/courses/route.ts` — endpoint
`GET /api/currency` — `src/app/api/currency/route.ts` — GET /api/currency — returns current USD→Toman exchange rate
`GET /api/games` — `src/app/api/games/route.ts` — Get distinct games from products
`GET /api/licenses` — `src/app/api/licenses/route.ts` — GET /api/licenses — List current user's licenses
`GET|PUT /api/notifications` — `src/app/api/notifications/route.ts` — GET /api/notifications — List current user's notifications
`GET|POST /api/orders` — `src/app/api/orders/route.ts` — GET /api/orders — List current user's orders
`GET /api/products` — `src/app/api/products/route.ts` — endpoint
`GET|POST /api/tickets` — `src/app/api/tickets/route.ts` — GET /api/tickets — List current user's tickets
`GET /api/wallet` — `src/app/api/wallet/route.ts` — GET /api/wallet — Get wallet balance and transactions

### `session`

`GET /api/auth/session` — `src/app/api/auth/session/route.ts` — endpoint

### `slug-map`

`GET /api/articles/slug-map` — `src/app/api/articles/slug-map/route.ts` — endpoint

### `submit-receipt`

`POST /api/orders/submit-receipt` — `src/app/api/orders/submit-receipt/route.ts` — Fetch and validate order

### `admin/*`

`POST /api/admin/ai/seo-fill` — `src/app/api/admin/ai/seo-fill/route.ts` — ─── Sanitize Unicode for fetch body ───────────────────────────────────────────
`GET|PUT|DELETE /api/admin/articles/[id]` — `src/app/api/admin/articles/[id]/route.ts` — FA fields
`GET|POST /api/admin/articles` — `src/app/api/admin/articles/route.ts` — endpoint
`PUT|DELETE /api/admin/bank-cards/[id]` — `src/app/api/admin/bank-cards/[id]/route.ts` — endpoint
`GET|POST /api/admin/bank-cards` — `src/app/api/admin/bank-cards/route.ts` — Basic card number validation (16 digits)
`POST|PUT|DELETE /api/admin/courses/[id]/lessons` — `src/app/api/admin/courses/[id]/lessons/route.ts` — endpoint
`GET|PUT|DELETE /api/admin/courses/[id]` — `src/app/api/admin/courses/[id]/route.ts` — endpoint
`GET|POST /api/admin/courses` — `src/app/api/admin/courses/route.ts` — endpoint
`GET|PUT|DELETE /api/admin/games/[id]` — `src/app/api/admin/games/[id]/route.ts` — endpoint
`POST /api/admin/games/reorder` — `src/app/api/admin/games/reorder/route.ts` — Update each game's sortOrder based on its index in the array.
`GET|POST /api/admin/games` — `src/app/api/admin/games/route.ts` — endpoint
`PUT|DELETE /api/admin/licenses/[id]` — `src/app/api/admin/licenses/[id]/route.ts` — endpoint
`POST /api/admin/licenses/add` — `src/app/api/admin/licenses/add/route.ts` — Verify product exists
`POST /api/admin/licenses/assign` — `src/app/api/admin/licenses/assign/route.ts` — Fetch the order
`POST /api/admin/licenses/bulk` — `src/app/api/admin/licenses/bulk/route.ts` — Verify product exists
`POST /api/admin/licenses/deliver` — `src/app/api/admin/licenses/deliver/route.ts` — Fetch order with items and existing licenses
`DELETE /api/admin/licenses/inventory/[id]` — `src/app/api/admin/licenses/inventory/[id]/route.ts` — endpoint
`GET|POST /api/admin/licenses/inventory` — `src/app/api/admin/licenses/inventory/route.ts` — Aggregate stock per product+billingCycle
`GET /api/admin/licenses/list` — `src/app/api/admin/licenses/list/route.ts` — Mask license keys for list view (full key only shown on copy/click)
`GET /api/admin/licenses/product/[productId]` — `src/app/api/admin/licenses/product/[productId]/route.ts` — endpoint
`GET|POST /api/admin/licenses` — `src/app/api/admin/licenses/route.ts` — Validate userId if provided
`GET|POST|PUT /api/admin/notifications` — `src/app/api/admin/notifications/route.ts` — Get notifications for this admin user
`POST /api/admin/orders/[id]/deliver` — `src/app/api/admin/orders/[id]/deliver/route.ts` — Fetch order
`GET|PATCH|PUT /api/admin/orders/[id]` — `src/app/api/admin/orders/[id]/route.ts` — endpoint
`POST /api/admin/orders/actions` — `src/app/api/admin/orders/actions/route.ts` — Update order metadata (status will be set by autoDeliverLicenses)
`GET /api/admin/orders` — `src/app/api/admin/orders/route.ts` — Mask license keys (show only last 8 chars)
`GET /api/admin/orders/stats` — `src/app/api/admin/orders/stats/route.ts` — endpoint
`POST /api/admin/orders/verify-payment` — `src/app/api/admin/orders/verify-payment/route.ts` — Fetch order with items
`GET|PUT|PATCH|DELETE /api/admin/products/[id]` — `src/app/api/admin/products/[id]/route.ts` — Parse JSON array fields
`GET|POST|PATCH|DELETE /api/admin/products` — `src/app/api/admin/products/route.ts` — PATCH — admin update (the admin form currently sends PUT; we accept PATCH too)
`POST /api/admin/seo/analyze` — `src/app/api/admin/seo/analyze/route.ts` — endpoint
`GET /api/admin/stats` — `src/app/api/admin/stats/route.ts` — endpoint
`GET|PUT /api/admin/tickets/[id]` — `src/app/api/admin/tickets/[id]/route.ts` — endpoint
`GET /api/admin/tickets` — `src/app/api/admin/tickets/route.ts` — endpoint
`POST /api/admin/upload` — `src/app/api/admin/upload/route.ts` — Determine upload type
`GET|PUT|DELETE /api/admin/users/[id]` — `src/app/api/admin/users/[id]/route.ts` — Prevent self-deletion
`GET|POST /api/admin/users` — `src/app/api/admin/users/route.ts` — endpoint

---

_Regenerated from `src/app/**/*.tsx|ts`._
