# Components

## Top-level (`src/components/*.tsx`)

- `BlogSection.tsx` — Priority: explicit prop > context lang > defaultLang (server fallback)
- `CTA.tsx` — CTA
- `CheckoutModal.tsx` — CheckoutModal
- `FAQ.tsx` — placeholder removed
- `Features.tsx` — Features
- `Footer.tsx` — Footer
- `GameCheats.tsx` — ─── Types ───────────────────────────────────────────────────────────────────
- `GoToTop.tsx` — GoToTop
- `Header.tsx` — Header
- `LanguageSwitcher.tsx` — Determine current lang from first segment
- `LicensePanel.tsx` — LicensePanel
- `LoginModal.tsx` — LoginModal
- `NotificationBell.tsx` — Silent fail — don't show error for notification fetch
- `OrderCompletionListener.tsx` — Optionally you can redirect to order status page if needed
- `OrderStatusTracker.tsx` — Poll for status updates
- `Pricing.tsx` — removed in-view detection
- `Stats.tsx` — Stats
- `Storefront.tsx` — ─── Constants ───────────────────────────────────────────────────────────────
- `SupportPanel.tsx` — Create form
- `Testimonials.tsx` — RTL: reverse the slide direction by negating the x offset
- `ToastProvider.tsx` — ToastProvider
- `product-modal.tsx` — Reset state when product changes

## `components/admin`

- `admin/AdminGuard.tsx` — network error — fall through with whatever user we have
- `admin/GamesTab.tsx` — Drag-and-drop reorder state
- `admin/OrdersTab.tsx` — ─── Types ───────────────────────────────────────────────────────────────────

## `components/auth`

(empty / reserved)

## `components/blog`

(empty / reserved)

## `components/courses`

(empty / reserved)

## `components/dashboard`

(empty / reserved)

## `components/hero`

- `hero/FeatureCards.tsx` — FeatureCards
- `hero/HeroCharacter.tsx` — LTR: character pinned to LEFT edge
- `hero/HeroContent.tsx` — HeroContent
- `hero/HeroSection.tsx` — HeroSection
- `hero/LightBeams.tsx` — LightBeams
- `hero/Navbar.tsx` — Helper to display price based on lang

## `components/layout`

(empty / reserved)

## `components/products`

- `products/ProductDescription.tsx` — ProductDescription
- `products/ProductFeatures.tsx` — ProductFeatures
- `products/ProductGallery.tsx` — Reset index if items change
- `products/ProductPageContent.tsx` — ─── SEO Types ───────────────────────────────────────────────────────────────

## `components/skeletons`

- `skeletons/AdminOrdersSkeleton.tsx` — AdminOrdersSkeleton
- `skeletons/CartSkeleton.tsx` — CartSkeleton
- `skeletons/OrderSkeleton.tsx` — OrderSkeleton
- `skeletons/ProductSkeleton.tsx` — ProductSkeleton

## `components/storefront`

(empty / reserved)

## `components/ui`

- `ui/Badge.tsx` — Badge
- `ui/Button.tsx` — Button
- `ui/FileUploadSection.tsx` — FileUploadSection
- `ui/GuideEditor.tsx` — GuideEditor
- `ui/ImageEditModal.tsx` — ImageEditModal
- `ui/Input.tsx` — component
- `ui/LoadingButton.tsx` — LoadingButton
- `ui/LoadingSkeleton.tsx` — Skeleton
- `ui/Modal.tsx` — Modal
- `ui/PasswordModal.tsx` — PasswordModal
- `ui/TipTapEditor.tsx` — Handle double-click on image nodes
- `ui/Toast.tsx` — Hook for easy toast usage
- `ui/index.ts` — component

---

_Regenerated from `src/components/**`._
