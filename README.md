# 🚽 Latrinalia — Digital Toilet Graffiti Wall

A Progressive Web App that brings the age-old culture of anonymous toilet graffiti into the digital age. Drop text stickers on virtual stall doors, drag them around, and let the next person find your message.

## How it works

1. Pick a stall from the lobby
2. Scribble your anonymous text — pick a font, a color, and slap it on the door
3. Drag any sticker to reposition it anywhere on the canvas
4. A janitor sweeps old stickers periodically so the wall stays fresh

## Tech stack

| Layer | What |
|-------|------|
| Frontend | React 18 + Vite (canvas-based drag-and-drop via `react-draggable`) |
| Backend | Express.js REST API on port 3001 |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| AI tooling | Claude Code with SQLite MCP server, a graffiti-wall skill, and a sticker-reviewer content-moderation agent |
| PWA | `manifest.json` + 192/512px icons — installable from Chrome |

## Project structure

```
.
├── index.html              # Vite entry point
├── vite.config.js          # Vite + React plugin, proxies /api → :3001
├── .mcp.json               # SQLite MCP server config for Claude
├── package.json
├── latrinalia.db           # SQLite database (auto-created on first run)
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── icon-192.png
│   └── icon-512.png
├── server/
│   └── index.js            # Express API — CRUD for toilets & stickers
├── scripts/
│   └── db-init.js          # Seed script for dev/test data
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Lobby → StallCanvas router
│   ├── index.css           # Global styles (dark stall theme)
│   ├── lib/
│   │   └── api.js          # fetch wrappers for the REST API
│   └── components/
│       ├── StallCanvas.jsx       # Canvas overlay with drag layer
│       ├── DraggableSticker.jsx  # Individual draggable text sticker
│       └── StickerForm.jsx       # Compose new graffiti sticker
├── dist/                   # Production build output
├── supabase/
│   └── migrations/         # Reference SQL schemas
└── .claude/
    ├── skills/graffiti-wall/SKILL.md   # Claude skill for managing stalls
    └── agents/sticker-reviewer.md      # Content-moderation Claude agent
```

## Getting started

```bash
# Install dependencies
npm install

# Start both server (:3001) and Vite dev server (:3000)
npm run dev

# Or run them separately
npm run server   # Express API on http://localhost:3001
npm run client   # Vite dev server on http://localhost:3000
```

## Database

```bash
# Initialize / reset the database with seed data
npm run db:init
```

The database auto-creates on first server start if `latrinalia.db` doesn't exist. Three default stalls are seeded: Downtown, The Bar, and Gas Station.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/toilets` | List all stalls |
| `GET` | `/api/toilets/:id/stickers` | Get stickers on a stall |
| `POST` | `/api/toilets/:id/stickers` | Add a sticker |
| `DELETE` | `/api/stickers/:id` | Remove a sticker |
| `POST` | `/api/toilets/:id/janitor` | Sweep stickers older than N days |

## Claude Code integration

This project uses three Claude Code features, all with real paths in the repo:

- **MCP** — [`.mcp.json`](.mcp.json): SQLite server so Claude can query/modify the database directly
- **Skill** — [`.claude/skills/graffiti-wall/SKILL.md`](.claude/skills/graffiti-wall/SKILL.md): Bootstraps stalls, seeds test data, runs janitor mode, and handles migrations
- **Agent** — [`.claude/agents/sticker-reviewer.md`](.claude/agents/sticker-reviewer.md): Content moderation via haiku model — reviews graffiti and returns `keep | warn | remove` verdicts

## Building for production

```bash
npm run build     # Outputs to dist/
npm run preview   # Preview the production build locally
```

The Express server also serves `dist/` as static files, so a single `node server/index.js` runs the full app in production.
