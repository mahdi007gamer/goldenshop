# Memory Index

## Startup (read only these + the one you need)

At the start of every session:

1. Read `rules.md` (business invariants — do not edit unless asked)
2. mtime gate: compare `package.json` and `prisma/schema.prisma` live mtime against the `>` stamp header at top of `project.md`. If either is newer (or files missing), run `npm run scan`.
3. Load **only the per-topic file you need** (don't preload all):

| You're working on… | Read this |
|---|---|
| structure, stack, providers | `project.md` |
| data model, tables | `schema.md` |
| routes, endpoints | `routes.md` |
| components | `components.md` |
| state, context, hooks | `stores.md` |
| business rules, billing, auth | `rules.md` |
| session history | `session-log.md` |

## Files

- [Project map](project.md) — stack, providers, layout, middleware, env names, lib surface
- [DB schema](schema.md) — 20 Prisma models + fields + relations (filePassword added to Lesson 2026-07-01)
- [Routes](routes.md) — App pages + API endpoints (method → path → source)
- [Components](components.md) — component catalog by folder
- [State](stores.md) — Zustand stores + contexts + hooks
- [Rules](rules.md) — localStorage keys, admin, billing, RTL, mock data, licenses, SEO
- [Session Log](session-log.md) — history
- [Admin Orders Plan](admin-orders-plan.md) — برنامه پیاده‌سازی سیستم مدیریت سفارشات (۸ تسک)
