# Restore Golden Cheat Database from Backup
# Run this script from the project root: scripts/restore-db.ps1

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🔄 RESTORING GOLDEN CHEAT DATABASE FROM BACKUP..." -ForegroundColor Cyan
Write-Host "===================================================`n" -ForegroundColor Cyan

$backupFile = "prisma/dev.db.backup.1782857779"
$targetFile = "prisma/dev.db"

if (-not (Test-Path $backupFile)) {
    Write-Host "❌ Error: Backup file not found at: $backupFile" -ForegroundColor Red
    exit 1
}

# 1. Backup the current database if it exists
if (Test-Path $targetFile) {
    $timestamp = [int][double]::Parse((Get-Date -UFormat %s))
    $preRestoreBackup = "prisma/dev.db.pre-restore.$timestamp"
    Write-Host "📦 Existing dev.db found. Backing it up to: $preRestoreBackup" -ForegroundColor Yellow
    try {
        Copy-Item $targetFile $preRestoreBackup -Force
        Write-Host "✅ Current database backed up successfully." -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Warning: Failed to backup current database" -ForegroundColor Yellow
    }
}

# 2. Copy backup to dev.db
Write-Host "`n📋 Copying backup $backupFile to $targetFile..." -ForegroundColor Cyan
try {
    Copy-Item $backupFile $targetFile -Force
    Write-Host "✅ Database copied successfully." -ForegroundColor Green
} catch {
    Write-Host "❌ Error copying database: $_" -ForegroundColor Red
    exit 1
}

# 3. Generate Prisma client
Write-Host "`n⚙️ Running 'npx prisma generate'..." -ForegroundColor Cyan
try {
    npx prisma generate 2>&1
    Write-Host "✅ Prisma client generated successfully." -ForegroundColor Green
} catch {
    Write-Host "❌ Error running 'npx prisma generate': $_" -ForegroundColor Red
}

# 4. Run db push to sync schema (if needed)
Write-Host "`n🔄 Running 'npx prisma db push' to sync any schema changes..." -ForegroundColor Cyan
try {
    npx prisma db push --skip-generate 2>&1
    Write-Host "✅ Schema pushed successfully." -ForegroundColor Green
} catch {
    Write-Host "❌ Error running 'npx prisma db push': $_" -ForegroundColor Red
}

Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "🎉 DATABASE RESTORE COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "   You can now run: npm run dev" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
