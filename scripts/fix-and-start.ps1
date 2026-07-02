# Fix Product Edit Issues + DB Push + Start Dev Server
# Run this script from project root: scripts/fix-and-start.ps1

Write-Host "=== Step 1: Clear .next cache ===" -ForegroundColor Cyan
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "Cache cleared!" -ForegroundColor Green
} else {
    Write-Host "No cache to clear" -ForegroundColor Yellow
}

Write-Host "`n=== Step 2: Prisma db push ===" -ForegroundColor Cyan
npx prisma db push 2>&1

Write-Host "`n=== Step 3: Prisma generate ===" -ForegroundColor Cyan
npx prisma generate 2>&1

Write-Host "`n=== Step 4: Start dev server ===" -ForegroundColor Cyan
Write-Host "Starting dev server on http://localhost:3000 ..." -ForegroundColor Green
npm run dev
