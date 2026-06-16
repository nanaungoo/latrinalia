---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->
Anyone who's ever sat in a public toilet, read the graffiti on the stall door, and felt the urge to add something. The anonymous scribbler. The bathroom philosopher. The person who wants to be heard but doesn't want to be known.

---

<!-- slide 2 -->
# Their problem
Physical toilet graffiti is stuck on one wall, in one stall, in one building. You can't take it with you. You can't see what people are writing across town. And app stores ban anonymous UGC apps — so there's no digital home for this culture. The stall door was the last unmoderated social network. Nobody brought it online properly.

---

<!-- slide 3 -->
# What I built
Latrinalia — a Progressive Web App that digitizes the toilet graffiti wall. Pick a stall, scribble text stickers, drag them around, watch walls evolve. No accounts, no names, no app store. Just a tile wall, some fonts that look like marker ink, and whatever people leave behind. Plus a Janitor Mode that sweeps old stickers every 7 days — just like the real thing.

---

<!-- slide 4 -->
# How I built it
- MCP: SQLite MCP server in .mcp.json — zero API keys, Claude queries and modifies the database directly
- Skill: graffiti-wall in .claude/skills/graffiti-wall/SKILL.md — teaches Claude to bootstrap stalls, seed stickers, run janitor cleanup
- Agent: sticker-reviewer in .claude/agents/sticker-reviewer.md — content moderation agent that reviews every sticker: keep, warn, or remove

---

<!-- slide 5 -->
# Why it matters
This project proves that real-time, location-based social apps don't need cloud accounts, vendor lock-in, or app store approval. SQLite + a PWA is enough. And Claude Code's three extension points aren't just checkboxes — each one solved a real problem: database access without writing CRUD boilerplate, domain knowledge without bloated docs, and content moderation without a third-party API.

---

<!-- slide 6 -->
# Done checklist
- [X] repo public
- [X] MCP + skill + agent used
- [x] report.md in team repo
