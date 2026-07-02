# Apply Prisma schema changes to database
# Run this after schema changes to add highlightTagFa/En columns
npx prisma db push 2>&1
Write-Host "`n--- Done ---"
