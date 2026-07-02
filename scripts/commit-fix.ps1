# Commit the product edit field fixes
Write-Host "=== Staging files ===" -ForegroundColor Cyan
git add prisma/schema.prisma
git add src/app/admin/products/[id]/edit/page.tsx
git add src/app/admin/products/new/page.tsx
git add src/app/api/admin/products/[id]/route.ts
git add src/app/api/admin/products/route.ts
git add .env

Write-Host "`n=== Committing ===" -ForegroundColor Cyan
git commit -m @'
fix: product edit fields (subtitle, highlightTag, SEO) save & load correctly

- Add highlightTagFa/En columns to Prisma schema
- GET /api/admin/products/[id] now returns all fields (subtitle, highlightTag, SEO, metaKeywords)
- PUT/PATCH whitelist now includes all SEO fields (metaTitle, ogTitle, twitterTitle, canonicalUrl, schemaType, metaKeywords)
- Edit page now loads from admin API (with credentials) instead of public API
- New product page: add highlightTagFa/En state, payload, and UI fields
- .env: add NEXT_WORKER_COUNT=2 to fix Jest worker crash

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@

Write-Host "`n=== Done ===" -ForegroundColor Green
git log --oneline -1
