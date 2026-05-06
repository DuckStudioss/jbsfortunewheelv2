const Database = require('better-sqlite3');
const db = new Database('spins4.db');
const rows = db.prepare('SELECT * FROM spins').all();
console.log(JSON.stringify(rows, null, 2));
db.close();
