const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const uuidv4 = () => crypto.randomUUID();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'latrinalia.db');

// CORS — restrict to known origins in production, allow all in dev
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin === '*' ? true : allowedOrigin }));

// Request body size limit — prevent memory exhaustion
app.use(express.json({ limit: '10kb' }));

// Rate limiting — 60 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', apiLimiter);

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
    delete_token TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_stickers_toilet_id ON stickers(toilet_id);
`);

// Ensure default toilets exist
const insertToilet = db.prepare(
  'INSERT OR IGNORE INTO toilets (id, name) VALUES (?, ?)'
);

// Migration: add delete_token column if it doesn't exist (for existing DBs)
try {
  db.prepare('SELECT delete_token FROM stickers LIMIT 1').get();
} catch {
  db.exec('ALTER TABLE stickers ADD COLUMN delete_token TEXT');
}
insertToilet.run('stall-1', 'Stall #1 — Downtown');
insertToilet.run('stall-2', 'Stall #2 — The Bar');
insertToilet.run('stall-3', 'Stall #3 — Gas Station');

// ---- Validation helpers ----
const VALID_FONTS = ['marker', 'scratched', 'cursive', 'stencil'];
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;
const MAX_TEXT_LENGTH = 500;

function validateStickerInput({ text_content, font_style, color, x_position, y_position, angle }) {
  if (!text_content || typeof text_content !== 'string' || text_content.trim().length === 0) {
    return 'text_content is required';
  }
  if (text_content.length > MAX_TEXT_LENGTH) {
    return `text_content must be ${MAX_TEXT_LENGTH} characters or fewer`;
  }
  if (font_style && !VALID_FONTS.includes(font_style)) {
    return `font_style must be one of: ${VALID_FONTS.join(', ')}`;
  }
  if (color && !HEX_COLOR_RE.test(color)) {
    return 'color must be a valid hex color (e.g. #ff0000)';
  }
  if (x_position !== undefined && (typeof x_position !== 'number' || x_position < 0 || x_position > 100)) {
    return 'x_position must be a number between 0 and 100';
  }
  if (y_position !== undefined && (typeof y_position !== 'number' || y_position < 0 || y_position > 100)) {
    return 'y_position must be a number between 0 and 100';
  }
  if (angle !== undefined && (typeof angle !== 'number' || angle < -180 || angle > 180)) {
    return 'angle must be a number between -180 and 180';
  }
  return null;
}

// ---- Routes ----

// Get all toilets
app.get('/api/toilets', (_req, res) => {
  const toilets = db.prepare('SELECT * FROM toilets ORDER BY created_at').all();
  res.json(toilets);
});

// Get stickers for a toilet (delete tokens excluded for privacy)
app.get('/api/toilets/:toiletId/stickers', (req, res) => {
  const stickers = db
    .prepare('SELECT id, toilet_id, text_content, font_style, color, x_position, y_position, angle, created_at FROM stickers WHERE toilet_id = ? ORDER BY created_at')
    .all(req.params.toiletId);
  res.json(stickers);
});

// Add a sticker
app.post('/api/toilets/:toiletId/stickers', (req, res) => {
  const { text_content, font_style, color, x_position, y_position, angle } = req.body;

  const validationError = validateStickerInput({ text_content, font_style, color, x_position, y_position, angle });
  if (validationError) {
    return res.status(400).json({ error: validationError });
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

  // Generate a delete token so only the creator can delete this sticker
  const delete_token = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO stickers (id, toilet_id, text_content, font_style, color, x_position, y_position, angle, delete_token, created_at)
    VALUES (@id, @toilet_id, @text_content, @font_style, @color, @x_position, @y_position, @angle, @delete_token, @created_at)
  `);
  stmt.run({ ...sticker, delete_token });
  res.status(201).json({ ...sticker, delete_token });
});

// Delete a sticker (requires delete_token from creation response)
app.delete('/api/stickers/:id', (req, res) => {
  // Accept token from header, query param, or body
  const delete_token = req.headers['x-delete-token'] || req.query.delete_token || req.body?.delete_token;

  if (!delete_token) {
    return res.status(403).json({ error: 'delete_token is required to remove a sticker' });
  }

  // Verify the sticker exists
  const sticker = db.prepare('SELECT * FROM stickers WHERE id = ?').get(req.params.id);
  if (!sticker) {
    return res.status(404).json({ error: 'Sticker not found' });
  }

  // Verify the delete token matches
  if (sticker.delete_token !== delete_token) {
    return res.status(403).json({ error: 'Invalid delete_token' });
  }

  db.prepare('DELETE FROM stickers WHERE id = ?').run(req.params.id);
  res.json({ deleted: true });
});

// Janitor mode: delete stickers older than N days for a toilet
app.post('/api/toilets/:toiletId/janitor', (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.body.days) || 7));
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

// SPA catch-all — serve index.html for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚽 Latrinalia server running on http://localhost:${PORT}`);
});
