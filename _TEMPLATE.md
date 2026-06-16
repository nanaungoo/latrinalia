<!-- ch-3 personal-project report. Copy this file to ch-3/<your-github-username>/report.md -->
# ch-3 Personal Project — Report

github_username: nanaungoo
personal_repo_url: https://github.com/nanaungoo/latrinalia
project_summary: A Progressive Web App that digitizes the toilet graffiti wall — anonymous text stickers on virtual stall doors, drag to reposition, with SQLite backend and janitor cleanup
slides_url: slides/pechakucha-6x20.md

## Methodology
<!-- How you worked: project-based approach + your git workflow (commit as you build). 2-4 sentences. -->
Built the project in 12 incremental git commits, each one a self-contained logical step: project scaffold, MCP config, database schema, seed data, backend API, frontend core, React components, CSS theme, Claude skill, Claude agent, PWA assets, and documentation. Each commit represents a working state that can be reviewed in isolation. Committed as each piece was completed rather than in bulk at the end.

## Evidence — Claude Code usage
<!-- List the ACTUAL paths in your personal repo. The validator checks these exist. -->

### MCP
- path: .mcp.json
- what: SQLite MCP server — Claude queries and modifies the latrinalia.db database directly without writing CRUD boilerplate

### Skill
- path: .claude/skills/graffiti-wall/SKILL.md
- what: Teaches Claude to bootstrap toilet stalls, seed test stickers with realistic graffiti data, run janitor mode to clean old stickers, and execute database migrations

### Agent
- path: .claude/agents/sticker-reviewer.md
- what: Content moderation agent using haiku model — reviews graffiti text submissions and returns a JSON verdict (keep, warn, or remove) with reason and confidence level
