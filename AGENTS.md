# Agent Guide

This repository now uses `AGENTS.md` as the primary instruction format for coding agents.

## Scope

- This root file covers repository-level guidance only.
- Backend-specific rules live in [backend/AGENTS.md](backend/AGENTS.md).
- Frontend-specific rules live in [frontend/AGENTS.md](frontend/AGENTS.md).
- If a deeper `AGENTS.md` exists in a subdirectory, it overrides this file for that subtree.

## Repository Layout

- `frontend/`: React + Vite application
- `backend/`: Node.js + Express API
- `docker/`: Docker Compose stack
- `.github/`: CI/CD workflows

## Shared Rules

These apply across the whole repository, frontend and backend alike.

- **No magic strings or numbers.** Use typed enums, union types, or centralized constants. Never scatter raw literals (`"sent"`, `401`, `"api-key"`, …) through business logic — define them once and import them.
- **Keep the linter green.** Run `npm run lint` in any package you change and fix what it reports before considering the work done.

## Source Of Truth

- Prefer `AGENTS.md` files for agent instructions.
- `CLAUDE.md` files should stay as lightweight compatibility shims that point back to `AGENTS.md`.
- Avoid duplicating the same rules in both places.

## Analysis Of Existing Claude Files

Current Claude-specific files in the repository:

- [backend/CLAUDE.md](backend/CLAUDE.md): detailed backend working guide. Its content has been moved to `backend/AGENTS.md`.
- [.claude/settings.local.json](.claude/settings.local.json): Claude local permission/config file. Useful for Claude, but not a repository convention document.
- [frontend/.claude/settings.local.json](frontend/.claude/settings.local.json): same role as above, scoped to frontend.
- `.claude/skills/create-component/SKILL.md`
- `.claude/skills/create-store/SKILL.md`
- `.claude/skills/frontend-design/SKILL.md`

## How To Treat `.claude/`

- `settings.local.json` files are tool configuration, not architecture or coding standards.
- Repository skills live physically in `.agents/skills/` for Codex.
- `.claude/skills/` is kept as a compatibility junction so Claude Code can read the same skill set without duplication.
- `SKILL.md` files are reusable skills/prompts, not the main source of truth for repository conventions.
- Non-Claude agents should not depend on `.claude/settings.local.json` as an instruction source.

## Frontend Note

Frontend has a lightweight local guide in [frontend/AGENTS.md](frontend/AGENTS.md).

## Maintenance Rule

When rules change:

1. update the relevant `AGENTS.md`
2. keep any `CLAUDE.md` as a short pointer only
3. do not maintain two full copies of the same guidance
