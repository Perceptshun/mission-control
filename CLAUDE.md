# Mission Control — Project Management System

**Vision**: A Claude Code-native kanban board system that gives JD visibility into task backlog, active work, and completed items. Modeled after Monday.com but built for markdown-first, Obsidian-synced workflow.

**Tech Stack**: TypeScript (CLI + web view), PostgreSQL (optional for persistence), Markdown files (primary storage), Obsidian (viewing layer).

**Status**: Building Phase 1 (Core kanban structure + CLI interface)

**Key Files**:
- `CLAUDE.md` — This file
- `BUILD-STATE.md` — Session tracking
- `schema.md` — Data structure documentation
- `mission-control-cli.ts` — Main TypeScript CLI
- `board.md` — Live kanban board (syncs to Obsidian)

**How It Works**:
1. Tasks stored as structured markdown in `board.md`
2. CLI (`mission-control-cli.ts`) allows JD to: add tasks, move between columns, assign to me, set priority/deadline
3. Board auto-renders as clean kanban interface
4. Obsidian displays the live board for visual management
5. All data queryable + reportable (velocity, completion rate, etc.)

**For Next Claude Instance**: Read `BUILD-STATE.md` first, continue from where we left off.
