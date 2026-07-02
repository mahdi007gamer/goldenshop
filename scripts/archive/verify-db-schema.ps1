# Verify DB schema has required columns
Write-Host "=== Verifying DB Schema ===" -ForegroundColor Cyan

$prismaCheck = npx tsx scripts/verify-db-schema.ts 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $prismaCheck -ForegroundColor Green
} else {
    Write-Host "Prisma check failed. Output:" -ForegroundColor Red
    Write-Host $prismaCheck
    Write-Host ""
    Console.WriteLine("Run: npx prisma db push")
}
