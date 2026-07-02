---
name: rules
description: Business invariants for Golden Cheat — localStorage keys, admin, billing, RTL, mock data, licenses, SEO
metadata:
  type: project
---

# Project Rules

## Run commands
```bash
npm run dev    # localhost:3000, turbopack
npm run build
npm run lint
npm run scan   # regenerate memory/{project,schema,routes,components,stores}.md
```

## LocalStorage keys
- `gc_cart` — cart items (Zustand persist)
- `gc_licenses` — user licenses (legacy, AppContext)
- `gc_user_session` — legacy session (AppContext)
- `gc_session` (cookie, httpOnly) — JWT session token source of truth for auth
- `gc_usdt_rate` / `gc_usdt_rate_meta` — cached USD/Toman rate (client)

> Always grep `localStorage` before trusting a key name — code is source of truth.

## Admin access
- Login path: login as any user; server assigns role. The `/admin` UI + ALL `/api/admin/*` routes are guarded by `requireAdmin()` in `src/lib/auth-utils.ts`.
- API guard checks the httpOnly `gc_session` JWT + role claim.
- Removing admin role on the last admin is blocked.

## Billing
- Prices stored in USD. Converted to Toman at order creation using live rate (Zipodo/Nobitex via `lib/pricing/server.ts`).
- Round to nearest 5,000 Toman (`lib/pricing/shared.ts`).
- Billing cycles: `priceDaily`, `priceWeekly`, `priceMonthly`, `priceLifetime` per-product.
- Lifetime fallback: `price × 3` when `priceLifetime` is null.
- `salePrice` < `price` triggers discount badge on product card.

## i18n / RTL
- FA default. EN only via `/en/*` URL prefix.
- `lang` cookie set by middleware (`src/middleware.ts`) — 1 year, sameSite lax.
- `x-url` server header propagates the raw pathname for hreflang/canonical.
- `src/context/LangContext.tsx` syncs `<html lang dir>`.

## Mock data
- `src/data/mockData.ts` is **fallback only** (used when API fails). Do not treat as canonical data.
- The 23 products, 4 articles, courses, and user/order data live in SQLite via Prisma.

## License system
- Format: `XXXX-XXXX-XXXX-XXXX`, generated with `crypto.randomBytes` in `src/lib/services/auth.service.ts`.
- Pre-generated inventory in `LicenseInventory` (encrypted keys, `src/lib/services/license-crypto.ts`).
- Auto-delivery on payment verification via `src/lib/services/license/deliveryEngine.ts`.
- HWID-locked: `License.hwid` + `License.activatedAt`/`expiresAt`.

## Order flow
- Statuses: `pending_payment`, `payment_submitted`, `payment_verifying`, `payment_confirmed`, `payment_rejected`, `awaiting_license`, `license_out_of_stock`, `completed`, `cancelled`, `refunded`.
- Log every status change to `OrderStatusLog` (`fromStatus`, `toStatus`, `action`, `adminId`, `adminName`, `note`,      `metadata`).
- Track license deliveries in `LicenseDelivery` (`orderId`, `adminId`, `adminName`, `licenseKey`, `method: "auto" | "manual"`, `note`).
- After fixx admin verify, licen ise delivery is automatic from `LicenseInventory`. If inventory is empty, order state becomes `awaiting_license` or `license_out_of_stock` → admin delivers manually via `/api/admin/orders/[id]/deliver`.
- User-facing polling endpoint `GET /api/orders/[id]/status` returns current status + 60-min countdown + masked licenses, polled every 10s.

## Card-to-card payments
- User submits receipt → order moves to `payment_submitted`.
- Admin verifies/rejects via `/api/admin/orders/verify-payment` → completed/rejected.
- `CardToCardPayment` + bank cards in `BankCard` model.

## API security
- All `/api/*` responses are hardened with `withSecurityHeaders()` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`).
- `requireAdmin()` → `/api/admin/*`; `requireAuth()` → user routes. Always add ownership check (`order.userId === auth.user.id`) on user order routes.
- Input sanitization: `sanitizeString(value, maxLen)` on all text fields.
  - Accepted formats: (no hard rule set).
- Rate limiting (`src/lib/rate-limiter.ts`, in-memory):
  - List of endpoints (note): polling `/api/orders/[id]/status`. Limits:  emperical; the route uses 60 requests / 10s window keyed by `order_status:{userId}:{ip}`.
  - Phone: 3 e  code works (`cxod` `,window`).
  - IP OTP: 10 / 10 min.
- Default `retry-after` value:  window remaining ms ÷ 1000.
- License masking in admin list: show only last 8 chars via `/api/admin/orders`; `**** XXXX` for `last4Digits`.

## Wallet
- `User.walletBalance` (Float). Top-up + purchase deduction via `/api/wallet`.
- `WalletTransaction` records every change.

## SEO
- `lib/seo/analyzer.ts` runs 17+ checks (meta title/description, keyphrase density, slug, OG/Twitter, readability) — bilingual.
- `/api/admin/ai/seo-fill` calls OpenRouter to auto-fill 12 fields — `OPENROUTER_API_KEY` required.
- Every Product / Article / Game has full SEO fields (metaTitle/Description, focusKeyphrase, og*, twitter*, canonicalUrl).
- JSON-LD schemas emitted on product/article pages.

## HTML sanitization
- `src/lib/html-sanitizer.ts` — DOMPurify allowlist. Strips `on*` handlers and `javascript:`.
- TipTap editor in `src/components/ui/TipTapEditor.tsx` (products, articles).

## Theme / design tokens
- Colors: obsidian `#06090F`, obsidian-light `#0B0F1A`, gold `#C9963A`, gold-bright `#F0C060`, cyber `#00F0FF`, danger `#FF3366`, success `#00FF88`.
- Fonts: Cinzel Rajdhani (headings/nav), Vazirmatn/Kalameh (FA), Inter/JetBrains Mono (EN/mono).
- Key classes: `.glass-card`, `.glass-nav`, `.btn-gold`, `.btn-outline-gold`, `.nav-link`, `.text-gold-gradient`, `.icon-circle`, `.pricing-card`, `.game-card`, `.badge`, `.rune-particle`, `.smoke`. See `src/app/globals.css`.

## Data flow
1. User logs in → JWT set in `gc_session` cookie.
2. `/api/admin/*` routes verify JWT + `role === "admin"`.
3. Public `/api/products/*` return parsed JSON + SEO fields.
4. Cart → `/api/orders` (POST) → order created → receipt upload → admin verify → licenses delivered.

## Gotchas
- Next.js 16 has breaking changes — see `AGENTS.md`. Read `node_modules/next/dist/docs/` before writing framework code.
- `product.slugEn` (not `slugFa`) is the English slug for a product.
- Use `slug` field for both languages when no En version exists.
- `path` ≠ `path` on Windows: use the `rel()` helper (`scripts/scan-project.ts` shows the pattern).
