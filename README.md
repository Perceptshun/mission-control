# Mission Control — Task Management System

Your personal kanban board for assigning tasks to me (One) and tracking execution. Inspired by Monday.com, built for markdown-first Obsidian workflow.

## Overview

**What it does:**
- You assign tasks to me via simple CLI commands
- Tasks move through 4 columns: Backlog → In Progress → In Review → Done
- Real-time visibility into what I'm building + deadlines
- Automatic velocity tracking (completion rate, cycle time)
- All data lives in `board.md` (Obsidian-viewable)

**Why this matters:**
- Clear handoff protocol (you ask, I deliver)
- No ambiguity about task status
- Persistent record of what gets built
- Measurable output (velocity, completion rate)

---

## Quick Start

### Setup (One-time)

Add alias to your shell (`~/.zshrc` or `~/.bashrc`):

```bash
alias mc="bash '/Users/jd/Library/Mobile Documents/com~apple~CloudDocs/0ne/02 - Projects/mission-control/bin-mc.sh'"
```

Then reload shell:
```bash
source ~/.zshrc
```

### Common Commands

**Add a task:**
```bash
mc add "Build landing page for website" --priority high --due 2026-03-15 --tag "website"
```

**Check your backlog:**
```bash
mc list backlog
```

**See all tasks:**
```bash
mc list
```

**Check my progress:**
```bash
mc stats
```

**I'll use these:**
```bash
mc move task-001 in_progress        # Starting work
mc move task-001 in_review          # Ready for your review
mc move task-001 done               # Completed + approved
```

---

## Task Structure

Each task has:

- **ID** — Unique identifier (e.g., `task-001`)
- **Title** — What needs to be done
- **Status** — Where it is in the pipeline
  - 🔴 **Backlog** — Waiting to start
  - 🟡 **In Progress** — I'm actively building
  - 🟠 **In Review** — Done, waiting for your approval
  - 🟢 **Done** — Completed + approved
- **Priority** — `high`, `medium`, or `low`
- **Due Date** — When you need it (YYYY-MM-DD format)
- **Tags** — Categories (e.g., `coding`, `website`, `lead-gen`)
- **Time Estimates** — For planning (hours)

---

## Workflow

### You Assign

1. **Think of a task** you want me to build
2. **Run:**
   ```bash
   mc add "Your task description" --priority high --due YYYY-MM-DD
   ```
3. **Task appears in Backlog** (red column in `board.md`)

### I Execute

1. **See your task** in Backlog
2. **Move to In Progress** when I start
3. **Keep you updated** (optional: update `estimate_hours` and `actual_hours`)
4. **Move to In Review** when done
   - Includes a summary of what was delivered

### You Approve

1. **Review the work** in In Review column
2. **Either**:
   - Approve: `mc move [task-id] done` ✅
   - Revise: I update and move back to In Review

---

## Examples

### Example 1: Build an app

```bash
mc add "Build DealFlow React Native app MVP" \
  --priority high \
  --due 2026-03-15 \
  --tag "coding,revenue"
```

This creates a task in your backlog. I pick it up, move it to In Progress, and keep you updated.

### Example 2: Quick feature

```bash
mc add "Add cancel button to modal" \
  --priority medium \
  --due 2026-03-12 \
  --tag "website"
```

### Example 3: Research task

```bash
mc add "Analyze top 5 competitor websites" \
  --priority low \
  --due 2026-03-20 \
  --tag "research"
```

---

## Stats & Metrics

Run:
```bash
mc stats
```

Shows:
- **Total tasks** across all columns
- **Velocity** — How many I complete per week
- **Active load** — Tasks in In Progress
- **Priority distribution** — High/medium/low split

---

## View in Obsidian

The `board.md` file syncs to your Obsidian vault automatically. Open it to see:
- Clean kanban layout (emoji columns)
- All task details + descriptions
- Color-coded priority
- Due dates visible at a glance

No special plugins needed—it's just markdown.

---

## File Structure

```
mission-control/
├── CLAUDE.md                    # Project instructions (for future Claude instances)
├── BUILD-STATE.md               # Session tracking (current progress)
├── README.md                    # This file
├── schema.md                    # Data structure documentation
├── board.md                     # Live kanban board (THE MAIN FILE)
├── mission-control-cli.ts       # TypeScript CLI (bun runtime)
└── bin-mc.sh                    # Shell alias helper
```

---

## Commands Reference

```bash
# Add a new task
mc add [title] --priority [high|medium|low] --due [YYYY-MM-DD] --tag [tag]

# List tasks (all or by status)
mc list                          # All tasks
mc list backlog                  # Just backlog
mc list in_progress              # Just in progress
mc list done                      # Just completed

# Move task between statuses
mc move [task-id] [status]
# Valid statuses: backlog, in_progress, in_review, done

# Show stats
mc stats

# Help
mc help
```

---

## How I'll Use This

When you assign a task:

1. I read it from the Backlog
2. I move it to **In Progress** immediately
3. I work on it (building, designing, researching, etc.)
4. When done, I move it to **In Review** with a summary
5. You review + approve
6. I move to **Done** once approved

All async—no back-and-forth meetings needed.

---

## Future Enhancements

Phase 2 (planned):
- Web dashboard (prettier UI than CLI)
- Email summaries (weekly completion report)
- Slack integration (get notifications when you assign tasks)
- Time tracking (auto-log actual hours spent)
- Dependencies (task A blocks task B)

---

## Notes

- Tasks are stored in plain markdown—version controlled + backed up
- No database needed (yet—can add later)
- All data queryable via regex or the CLI
- Portable: works anywhere with `bun` installed

---

**Start using it: Create your first task with `mc add`.**
