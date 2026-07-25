---
marp: true
paginate: true
size: 16:9
footer: 'Latrinalia — Digital Toilet Graffiti Wall | Presenter: Nan Aung Oo'
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;600;700&family=Inter:wght@400;600;800&display=swap');
:root { --bg:#fffdf9; --ink:#292524; --muted:#a8a29e; --accent:#d97706; --burnt:#9a3412; --line:#f1d9bf; --code:#1c1917; }
section {
  background:var(--bg); color:var(--ink);
  font-family:'Pyidaungsu','Noto Sans Myanmar','Inter',sans-serif;
  font-size:27px; line-height:1.7; padding:56px 72px;
}
h1 { color:var(--burnt); font-weight:700; border-bottom:4px solid var(--accent); padding-bottom:.2em; line-height:1.4; }
h2 { color:var(--accent); font-weight:600; line-height:1.5; }
h3 { color:var(--burnt); font-weight:600; }
strong { color:var(--burnt); }
a { color:#0369a1; text-decoration:none; }
ul,ol { line-height:1.7; }
code { background:#fff1e6; color:#be123c; padding:.06em .35em; border-radius:5px; font-family:'JetBrains Mono',ui-monospace,monospace; }
pre  { background:var(--code); border-radius:10px; }
pre code { background:none; color:#fde9d3; }
blockquote { border-left:4px solid var(--accent); background:#fffbeb; color:#57534e; padding:.5em 1em; }
table th { background:#fff1e6; color:var(--burnt); }
table td, table th { border-color:var(--line); }
header,footer,section::after { color:var(--muted); font-size:.5em; }
section.cover {
  background:linear-gradient(135deg,#7c2d12 0%, #b45309 50%, #d97706 100%);
  color:#fff7ed;
}
section.cover h1 { border-bottom:none; color:#fff7ed; font-size:2.1em; }
section.cover h2 { color:#ffedd5; font-weight:400; }
section.lead { background:linear-gradient(135deg,#fff7ed,#ffedd5); }
section.lead h1 { border-bottom:none; }
</style>

<!-- _class: cover -->

# Tech Stack

Latrinalia — Digital Toilet Graffiti Wall

---

## Frontend

- **React 18** — UI library
- **Vite** — dev server + bundler
- **react-draggable** — canvas-based drag-and-drop for stickers

### Pages

`Lobby` · `StallCanvas` · `StickerForm`

---

## Backend

- **Cloudflare Workers** — edge-native REST API
- **Hono** — lightweight routing framework

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/toilets` | List all stalls |
| `GET` | `/api/toilets/:id/stickers` | Get stickers on a stall |
| `POST` | `/api/toilets/:id/stickers` | Add a sticker |
| `DELETE` | `/api/stickers/:id` | Remove a sticker |
| `POST` | `/api/toilets/:id/janitor` | Sweep stickers older than N days |
| `GET` | `/api/analytics/visits` | Visit counter |

---

## Database

- **Cloudflare D1** — serverless SQLite at the edge
- Default stalls: Downtown, The Bar, Gas Station

---

## AI Tooling

- **Claude Code** — development environment
- **SQLite MCP server** — direct database queries via `.mcp.json`
- **Graffiti-wall skill** — manage stalls, seed data, run janitor, handle migrations
- **Sticker-reviewer agent** — content moderation via haiku model

### Agent Verdicts

`keep` · `warn` · `remove`

---

## PWA

- **manifest.json** — installable from Chrome
- **Icons** — 192px + 512px

---

## Deployment

- **Cloudflare Workers** — auto-deploy on push to `main` via GitHub Actions
- Static assets served from `dist/` via Workers asset binding
- D1 database bound via `wrangler.toml`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDFLARE_API_TOKEN` | API token for deployment | — |
| `ACCOUNT_ID` | Cloudflare account ID | — |
