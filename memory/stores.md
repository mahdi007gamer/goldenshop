# State

## Zustand stores (`src/store`)

### `auth-store`
State: `user`, `isAuthenticated`, `isLoading`, `error`, `pendingRegister`, `sessionChecked`, `login`, `loginWithSms`, `verifySmsLogin`, `register`, `verifyRegister`, `logout`, `checkSession`, `forgotPassword`, `resetPassword`, `updateProfile`, `clearError`, `setUser`.

### `cart-store`
State: `items`, `isHydrated`, `addItem`, `removeItem`, `clearCart`, `total`, `itemCount`, `setHydrated`.
Persist: `gc_cart`

### `notification-store`
State: `notifications`, `unreadCount`, `isLoading`, `fetchNotifications`, `markAsRead`, `markAllAsRead`.

### `toast-store`
State: `toasts`, `addToast`, `removeToast`, `clearAll`.

### `ui-store`
State: `sidebarOpen`, `mobileMenuOpen`, `theme`, `toggleSidebar`, `toggleMobileMenu`, `setSidebarOpen`, `setMobileMenuOpen`.

## Context providers (`src/context`)

- `AppContext.tsx` — Toast helpers
- `AuthContext.tsx` — AuthProvider receives initialUser from the server (layout.tsx).
- `LangContext.tsx` — Derive lang from URL pathname:

## Hooks (`src/hooks`)

- `useAuthSync.ts` — Sync context → store (server-provided user takes priority)
- `useCartHydration.ts` — If already hydrated, no need for timeout
- `useCheckoutGuard.ts` — Only allow proceeding after hydration is complete AND cart has items
- `useCurrency.ts` — hook
- `useInViewSafe.ts` — If already triggered once, don't re-attach
- `useLoadingState.ts` — hook
- `useMouseParallax.ts` — hook
- `useScrolled.ts` — Set initial state

---

_Regenerated from `src/store`, `src/context`, `src/hooks`._
