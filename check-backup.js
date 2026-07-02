const Database = require('better-sqlite3');
const db = new Database('prisma/dev.db.backup.1782857779');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);
tables.forEach(t => {
  try {
    const safeName = t.name === 'Order' ? '"Order"' : t.name;
    const count = db.prepare('SELECT COUNT(*) as c FROM ' + safeName).get();
    console.log(' -', t.name, ':', count.c, 'rows');
  } catch(e) {
    console.log(' -', t.name, ': ERROR', e.message);
  }
});
