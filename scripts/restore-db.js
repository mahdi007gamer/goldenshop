const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===================================================');
console.log('🔄 RESTORING GOLDEN CHEAT DATABASE FROM BACKUP...');
console.log('===================================================\n');

const backupFile = path.join(__dirname, '../prisma/dev.db.backup.1782857779');
const targetFile = path.join(__dirname, '../prisma/dev.db');

if (!fs.existsSync(backupFile)) {
  console.error(`❌ Error: Backup file not found at: ${backupFile}`);
  process.exit(1);
}

// 1. Backup the current database if it exists
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

// 2. Copy backup to dev.db
console.log(`\n📋 Copying backup ${path.basename(backupFile)} to dev.db...`);
try {
  fs.copyFileSync(backupFile, targetFile);
  console.log('✅ Database copied successfully.');
} catch (err) {
  console.error('❌ Error copying database:', err.message);
  process.exit(1);
}

// 3. Generate Prisma client
console.log('\n⚙️ Running "npx prisma generate"...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully.');
} catch (err) {
  console.error('❌ Error running "npx prisma generate":', err.message);
}

// 4. Run db push to sync schema (if needed)
console.log('\n🔄 Running "npx prisma db push" to sync any schema changes...');
try {
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  console.log('✅ Schema pushed successfully.');
} catch (err) {
  console.error('❌ Error running "npx prisma db push":', err.message);
}

console.log('\n===================================================');
console.log('🎉 DATABASE RESTORE COMPLETED SUCCESSFULLY!');
console.log('   You can now run: npm run dev');
console.log('===================================================');
