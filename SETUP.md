# Mission Control — Setup Guide

## Quick Setup (2 minutes)

### Step 1: Add Alias to Your Shell

Open your shell config file:

```bash
nano ~/.zshrc
```

(If you use Bash, use `~/.bashrc` instead)

### Step 2: Paste This Line at the End

```bash
alias mc="bash '/Users/jd/Library/Mobile Documents/com~apple~CloudDocs/0ne/02 - Projects/mission-control/bin-mc.sh'"
```

### Step 3: Save & Reload

- Press `Ctrl+X`, then `Y`, then Enter (in nano)
- Then run:

```bash
source ~/.zshrc
```

### Step 4: Test It

```bash
mc help
```

You should see the help menu. If you do, you're done!

---

## Now You Can Use Commands Like:

```bash
# Add a task
mc add "Build something awesome" --priority high --due 2026-03-15

# See your backlog
mc list backlog

# See all tasks
mc list

# Check my progress
mc stats
```

---

## Troubleshooting

**Command not found: mc**
- Did you run `source ~/.zshrc` after editing?
- Are you in a new terminal window?
- Try: `bash '/Users/jd/Library/Mobile Documents/com~apple~CloudDocs/0ne/02 - Projects/mission-control/bin-mc.sh' help`

**Tasks not showing up**
- The board file is at: `/Users/jd/Library/Mobile Documents/com~apple~CloudDocs/0ne/02 - Projects/mission-control/board.md`
- Open it in Obsidian to see all tasks
- Run: `mc stats` to verify tasks exist

**Permission denied**
- Try: `chmod +x /Users/jd/Library/Mobile Documents/com~apple~CloudDocs/0ne/02 - Projects/mission-control/bin-mc.sh`

---

## What You Just Set Up

You now have:
1. **Full visibility** into what I'm building (backlog → in progress → done)
2. **Simple task assignment** (one command: `mc add`)
3. **Automatic status tracking** (move tasks with `mc move`)
4. **Velocity metrics** (see completion rate with `mc stats`)
5. **Obsidian integration** (view `board.md` in Obsidian for visual kanban)

---

## First Task

Try this right now:

```bash
mc add "Your first task here" --priority high --due 2026-03-15
```

Then:

```bash
mc list backlog
```

You'll see it! That's all there is to it.

---

**Questions?** Check `README.md` in the same directory.
