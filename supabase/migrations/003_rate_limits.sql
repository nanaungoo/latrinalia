-- Latrinalia: Rate Limiting Table (D1)
-- Run: npx wrangler d1 execute latrinalia-db --file=supabase/migrations/003_rate_limits.sql

CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    window_start INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_window ON rate_limits(ip, window_start);
