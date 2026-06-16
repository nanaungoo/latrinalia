// Database initialization script — creates tables and seeds test data
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'latrinalia.db');

// Remove old DB if it exists
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Removed old database.');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// -- Run migrations from SQL files --
const migrationsDir = path.join(ROOT, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).sort();

for (const file of files) {
  if (!file.endsWith('.sql')) continue;
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
  db.exec(sql);
  console.log(`✓ ${file}`);
}

// Verify
const toiletCount = db.prepare('SELECT COUNT(*) as count FROM toilets').get();
const stickerCount = db.prepare('SELECT COUNT(*) as count FROM stickers').get();

console.log(`\nDatabase ready: ${toiletCount.count} toilets, ${stickerCount.count} stickers`);
console.log(`Path: ${DB_PATH}`);
db.close();
