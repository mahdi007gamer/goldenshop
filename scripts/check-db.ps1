# Check if highlightTag columns exist in the database
Write-Host "=== Checking DB Schema ===" -ForegroundColor Cyan
try {
    $output = sqlite3 prisma/dev.db ".schema Product" 2>&1
    if ($output -match "highlightTag") {
        Write-Host "highlightTag columns FOUND in DB" -ForegroundColor Green
    } else {
        Write-Host "highlightTag columns NOT found — need: npx prisma db push" -ForegroundColor Red
    }
} catch {
    Write-Host "sqlite3 not available. Run manually: npx prisma db push" -ForegroundColor Yellow
}

Write-Host "`n=== Checking Prisma schema ===" -ForegroundColor Cyan
$schema = Get-Content prisma/schema.prisma | Select-String "highlightTag"
if ($schema) {
    Write-Host "Schema has highlightTag:" -ForegroundColor Green
    $schema | ForEach-Object { Write-Host $_.Line }
} else {
    Write-Host "Schema MISSING highlightTag fields!" -ForegroundColor Red
}
