-- Latrinalia: Core Schema (SQLite)
-- Run: sqlite3 latrinalia.db < supabase/migrations/001_create_tables.sql

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

-- Index for fast wall lookups
CREATE INDEX IF NOT EXISTS idx_stickers_toilet_id ON stickers(toilet_id);
CREATE INDEX IF NOT EXISTS idx_stickers_created_at ON stickers(created_at);

-- Seed toilets
INSERT OR IGNORE INTO toilets (id, name) VALUES
    ('stall-1', 'Stall #1 — Downtown'),
    ('stall-2', 'Stall #2 — The Bar'),
    ('stall-3', 'Stall #3 — Gas Station');
