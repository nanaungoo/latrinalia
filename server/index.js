const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'latrinalia.db');

app.use(cors());
app.use(express.json());

// Initialize DB (create tables if not exist)
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS toilets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stickers (
    id TEXT PRIMARY KEY,
    toilet_id TEXT NOT NULL REFERENCES toilets(id),
    text_content TEXT NOT NULL,
    font_style TEXT DEFAULT 'marker',
    color TEXT DEFAULT '#000000',
    x_position INTEGER NOT NULL,
    y_position INTEGER NOT NULL,
    angle INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_stickers_toilet_id ON stickers(toilet_id);
`);

// Ensure default toilets exist
const insertToilet = db.prepare(
  'INSERT OR IGNORE INTO toilets (id, name) VALUES (?, ?)'
);
insertToilet.run('stall-1', 'Stall #1 — Downtown');
insertToilet.run('stall-2', 'Stall #2 — The Bar');
insertToilet.run('stall-3', 'Stall #3 — Gas Station');

// ---- Routes ----

// Get all toilets
app.get('/api/toilets', (_req, res) => {
  const toilets = db.prepare('SELECT * FROM toilets ORDER BY created_at').all();
  res.json(toilets);
});

// Get stickers for a toilet
app.get('/api/toilets/:toiletId/stickers', (req, res) => {
  const stickers = db
    .prepare('SELECT * FROM stickers WHERE toilet_id = ? ORDER BY created_at')
    .all(req.params.toiletId);
  res.json(stickers);
});

// Add a sticker
app.post('/api/toilets/:toiletId/stickers', (req, res) => {
  const { text_content, font_style, color, x_position, y_position, angle } = req.body;

  if (!text_content || text_content.trim().length === 0) {
    return res.status(400).json({ error: 'text_content is required' });
  }

  const sticker = {
    id: uuidv4(),
    toilet_id: req.params.toiletId,
    text_content: text_content.trim(),
    font_style: font_style || 'marker',
    color: color || '#000000',
    x_position: x_position ?? Math.floor(Math.random() * 80) + 10,
    y_position: y_position ?? Math.floor(Math.random() * 80) + 10,
    angle: angle ?? Math.floor(Math.random() * 60) - 30,
    created_at: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    INSERT INTO stickers (id, toilet_id, text_content, font_style, color, x_position, y_position, angle, created_at)
    VALUES (@id, @toilet_id, @text_content, @font_style, @color, @x_position, @y_position, @angle, @created_at)
  `);
  stmt.run(sticker);
  res.status(201).json(sticker);
});

// Delete a sticker
app.delete('/api/stickers/:id', (req, res) => {
  const result = db.prepare('DELETE FROM stickers WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Sticker not found' });
  }
  res.json({ deleted: true });
});

// Janitor mode: delete stickers older than N days for a toilet
app.post('/api/toilets/:toiletId/janitor', (req, res) => {
  const days = req.body.days || 7;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const count = db
    .prepare('SELECT COUNT(*) as count FROM stickers WHERE toilet_id = ? AND created_at < ?')
    .get(req.params.toiletId, cutoff);

  if (count.count === 0) {
    return res.json({ removed: 0, message: 'Wall is clean — nothing to remove.' });
  }

  db.prepare('DELETE FROM stickers WHERE toilet_id = ? AND created_at < ?').run(
    req.params.toiletId,
    cutoff
  );

  res.json({
    removed: count.count,
    toilet_id: req.params.toiletId,
    cutoff,
    message: `Janitor swept ${count.count} sticker(s) from ${req.params.toiletId}.`,
  });
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.listen(PORT, () => {
  console.log(`🚽 Latrinalia server running on http://localhost:${PORT}`);
});
