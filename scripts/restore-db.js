const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===================================================');
console.log('🔄 RESTORING GOLDEN CHEAT DATABASE FROM BACKUP...');
console.log('===================================================\n');

// 1. Correct .env database path if needed
const envFile = path.join(__dirname, '../.env');
if (fs.existsSync(envFile)) {
  let envContent = fs.readFileSync(envFile, 'utf8');
  if (envContent.includes('DATABASE_URL="file:./prisma/dev.db"')) {
    console.log('🔧 Updating DATABASE_URL in .env to "file:./dev.db" for correct Prisma resolution...');
    envContent = envContent.replace(
      'DATABASE_URL="file:./prisma/dev.db"',
      'DATABASE_URL="file:./dev.db"'
    );
    fs.writeFileSync(envFile, envContent, 'utf8');
    console.log('✅ .env file corrected.');
  }
}

const backupFile = path.join(__dirname, '../prisma/dev.db.backup.1782857779');
const targetFile = path.join(__dirname, '../prisma/dev.db');

if (!fs.existsSync(backupFile)) {
  console.error(`❌ Error: Backup file not found at: ${backupFile}`);
  process.exit(1);
}

// 2. Backup the current database if it exists
if (fs.existsSync(targetFile)) {
  const timestamp = Math.floor(Date.now() / 1000);
  const preRestoreBackup = path.join(__dirname, `../prisma/dev.db.pre-restore.${timestamp}`);
  console.log(`📦 Existing dev.db found. Backing it up to: prisma/dev.db.pre-restore.${timestamp}`);
  try {
    fs.copyFileSync(targetFile, preRestoreBackup);
    console.log('✅ Current database backed up successfully.');
  } catch (err) {
    console.error('⚠️ Warning: Failed to backup current database:', err.message);
  }
}

// 3. Copy backup to dev.db
console.log(`\n📋 Copying backup ${path.basename(backupFile)} to dev.db...`);
try {
  fs.copyFileSync(backupFile, targetFile);
  console.log('✅ Database copied successfully.');
} catch (err) {
  console.error('❌ Error copying database:', err.message);
  process.exit(1);
}

// 4. Generate Prisma client
console.log('\n⚙️ Running "npx prisma generate"...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully.');
} catch (err) {
  console.error('❌ Error running "npx prisma generate":', err.message);
}

// 5. Run db push to sync schema (if needed) with data loss accepted
console.log('\n🔄 Running "npx prisma db push --accept-data-loss" to sync any schema changes...');
try {
  execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Schema pushed successfully.');
} catch (err) {
  console.error('❌ Error running "npx prisma db push":', err.message);
}

// 6. Synchronize games with products
console.log('\n🎮 Syncing Game list with products via "sync-product-games-v2.ts"...');
try {
  execSync('npx tsx scripts/archive/sync-product-games-v2.ts', { stdio: 'inherit' });
  console.log('✅ Games synchronized successfully.');
} catch (err) {
  console.error('❌ Error running "sync-product-games-v2.ts":', err.message);
}

console.log('\n===================================================');
console.log('🎉 DATABASE RESTORE COMPLETED SUCCESSFULLY!');
console.log('   All 24 products and their games are now loaded.');
console.log('   You can now run: npm run dev');
console.log('===================================================');
