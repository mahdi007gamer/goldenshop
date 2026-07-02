const Database = require('better-sqlite3');

const dbBackup = new Database('prisma/dev.db.backup.1782857779');

try {
  const pragma = dbBackup.prepare("PRAGMA table_info(Article)").all();
  console.log("Article Columns in Backup:");
  pragma.forEach(col => {
    console.log(` - ${col.name} (${col.type})`);
  });
} catch (e) {
  console.error("Error inspecting backup Article columns:", e);
}
