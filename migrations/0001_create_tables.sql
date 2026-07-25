-- Migration 0001: Create initial tables for Latrinalia

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
