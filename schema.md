---
name: Mission Control Data Schema
description: Structure for kanban board tasks and metadata
version: 1.0
---

# Task Data Structure

## Column States
Tasks move through four columns:
1. **Backlog** — Submitted by JD, not yet started. Priority waiting to be scheduled.
2. **In Progress** — Actively being worked on by One. Deadline visible.
3. **In Review** — Completed by One, waiting for JD feedback/approval.
4. **Done** — JD-approved, closed out. Tracked for velocity metrics.

## Task Object Format

Each task is stored as a structured markdown block with YAML front-matter:

```yaml
---
id: [uuid-short, e.g., "task-001"]
title: [String]
description: [Optional longer context]
status: [backlog|in_progress|in_review|done]
priority: [high|medium|low]
assigned_to: [one|jd]  # One handles tasks assigned to "one"
due_date: [YYYY-MM-DD, optional]
created_at: [YYYY-MM-DD HH:MM, auto-set]
completed_at: [YYYY-MM-DD HH:MM, auto-set when moved to done]
tags: [Array of tags, e.g., "website", "lead-gen", "feature"]
estimate_hours: [Optional, for velocity tracking]
actual_hours: [Auto-tracked, optional]
---

## Markdown Content

[Detailed task description, context, acceptance criteria, linked resources]

(Task markdown block separated by ---)
```

## Example Task

```yaml
---
id: task-001
title: Build DealFlow App MVP
description: React Native app for real estate pipeline intelligence
status: in_progress
priority: high
assigned_to: one
due_date: 2026-03-15
created_at: 2026-03-10 08:30
tags: [app-idea, coding, revenue]
estimate_hours: 40
---

## Acceptance Criteria
- [ ] React Native project scaffold
- [ ] Lead intake form (5 fields minimum)
- [ ] Scoring algorithm (20+ variables)
- [ ] Color-coded output (green/yellow/red)
- [ ] Stripe integration for payment
- [ ] Deployed to TestFlight (iOS)

## Context
DealFlow was identified in Monday 8am greeting as high-potential coding idea. Solves JD's lead qualification bottleneck. $450+ MRR potential by day 7 with 15 agents.

## Resources
- [App Idea Details](../../../05%20-%20Memory/app-and-coding-ideas.md)
- [Revenue Model](notion link, if exists)

---
```

## Column Structure in board.md

Board organized as:

```markdown
# Mission Control — JD's Active Workstream

[Meta info: Last updated, stats, filters]

## 🔴 Backlog (Priority Queue)
[Tasks waiting to be started, sorted by priority]

## 🟡 In Progress (Active Work)
[Tasks One is actively building, with deadline visibility]

## 🟠 In Review (Awaiting Approval)
[Completed tasks, waiting for JD feedback]

## 🟢 Done (Closed)
[Completed + approved tasks, tracked for metrics]
```

## Task Lifecycle Example

1. **JD Creates**: "Add a CLI tool for mission control"
   - Status: `backlog`
   - Priority: `high`
   - Assigned: `one`
   - Moved to **Backlog** column

2. **One Picks Up**: "Starting on mission control CLI"
   - Status: `in_progress`
   - Moved to **In Progress** column
   - Deadline visible

3. **One Completes**: CLI tool built, tested
   - Status: `in_review`
   - Moved to **In Review** column
   - JD reviews

4. **JD Approves**: "Looks good, integrated with Obsidian"
   - Status: `done`
   - Moved to **Done** column
   - Time tracked for velocity

## Metadata & Metrics

Tracked for visibility:
- **Velocity**: Tasks completed per week
- **Cycle Time**: Days from backlog → done
- **Active Load**: Number of in_progress tasks
- **Blocked**: Tasks with issues (separate status if needed)
- **Priority Distribution**: % high/medium/low across backlog

## CLI Commands to Support

```bash
mc add "Task title" --priority high --due 2026-03-15 --tag "coding"
mc move task-001 in_progress
mc list [column]  # Show all tasks in column
mc show task-001  # Full task details
mc complete task-001  # Mark for review
mc approve task-001  # JD marks as done
mc stats  # Velocity, cycle time, active load
mc search [keyword]  # Find tasks
```

## Storage Location

All tasks stored in: `/02 - Projects/mission-control/board.md`

Accessible:
- Via CLI (read/write programmatically)
- Via Obsidian (visual kanban + editing)
- Via Git (version history + backups)
