#!/usr/bin/env bun

/**
 * Mission Control CLI
 *
 * Kanban board management system for JD's task assignment + One's execution tracking.
 *
 * Usage:
 *   bun mission-control-cli.ts add "Task title" --priority high --due 2026-03-15
 *   bun mission-control-cli.ts move task-001 in_progress
 *   bun mission-control-cli.ts list backlog
 *   bun mission-control-cli.ts stats
 */

import Bun from "bun";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const BOARD_PATH = resolve(
  process.env.HOME,
  "Library/Mobile Documents/com~apple~CloudDocs/0ne/02 - Projects/mission-control/board.md"
);

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "backlog" | "in_progress" | "in_review" | "done";
  priority: "high" | "medium" | "low";
  assigned_to: "one" | "jd";
  due_date?: string;
  created_at: string;
  completed_at?: string;
  tags: string[];
  estimate_hours?: number;
  actual_hours?: number;
}

// ============================================================================
// Core Functions
// ============================================================================

function generateId(): string {
  return `task-${Date.now().toString(36).slice(-8)}`;
}

function getCurrentTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/T/, " ").slice(0, 16);
}

function parseAllTasks(): Task[] {
  if (!existsSync(BOARD_PATH)) return [];

  const content = readFileSync(BOARD_PATH, "utf-8");

  // Find all task blocks between --- markers
  const taskRegex = /^---\s*\nid:\s*(\S+)\n([\s\S]*?)(?=\n---(?:\s|$))/gm;
  const tasks: Task[] = [];

  let match;
  while ((match = taskRegex.exec(content)) !== null) {
    const id = match[1];
    const frontmatter = match[2];

    const task: any = { id };

    // Parse YAML-style front matter
    const lines = frontmatter.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;

      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      const key = line.substring(0, colonIdx).trim();
      let value = line.substring(colonIdx + 1).trim();

      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }

      switch (key) {
        case "title":
          task.title = value;
          break;
        case "description":
          task.description = value || undefined;
          break;
        case "status":
          task.status = value as any;
          break;
        case "priority":
          task.priority = value as any;
          break;
        case "assigned_to":
          task.assigned_to = value as any;
          break;
        case "due_date":
          task.due_date = value || undefined;
          break;
        case "created_at":
          task.created_at = value;
          break;
        case "completed_at":
          task.completed_at = value || undefined;
          break;
        case "tags":
          // Parse array: [tag1, tag2] or []
          const tagMatch = value.match(/\[(.*?)\]/);
          task.tags = tagMatch
            ? tagMatch[1]
              .split(",")
              .map((t: string) => t.trim())
              .filter((t: string) => t)
            : [];
          break;
        case "estimate_hours":
          task.estimate_hours = value ? parseInt(value) : undefined;
          break;
        case "actual_hours":
          task.actual_hours = value ? parseInt(value) : undefined;
          break;
      }
    }

    if (task.title) {
      tasks.push(task as Task);
    }
  }

  return tasks;
}

function taskToMarkdown(task: Task, content: string = ""): string {
  const tagsStr = task.tags?.length ? `[${task.tags.join(", ")}]` : "[]";
  const frontmatter = `---
id: ${task.id}
title: ${task.title}
description: ${task.description || ""}
status: ${task.status}
priority: ${task.priority}
assigned_to: ${task.assigned_to}
due_date: ${task.due_date || ""}
created_at: ${task.created_at}
completed_at: ${task.completed_at || ""}
tags: ${tagsStr}
estimate_hours: ${task.estimate_hours || ""}
actual_hours: ${task.actual_hours || ""}
---`;

  return `${frontmatter}\n\n${content}\n\n`;
}

function getBoardContent(): string {
  if (!existsSync(BOARD_PATH)) {
    return getInitialBoardTemplate();
  }
  return readFileSync(BOARD_PATH, "utf-8");
}

function setBoardContent(content: string): void {
  writeFileSync(BOARD_PATH, content, "utf-8");
}

function getInitialBoardTemplate(): string {
  return `# Mission Control — JD's Active Workstream

**Last Updated**: ${getCurrentTimestamp()}

---

## 🔴 Backlog (Priority Queue)
Tasks waiting to be started, sorted by priority.

## 🟡 In Progress (Active Work)
Tasks One is actively building, with deadline visibility.

## 🟠 In Review (Awaiting Approval)
Completed tasks, waiting for JD feedback.

## 🟢 Done (Closed)
Completed and approved tasks. Tracked for velocity metrics.

---
`;
}

function addTask(
  title: string,
  priority: string = "medium",
  dueDate?: string,
  tags: string[] = []
): Task {
  const task: Task = {
    id: generateId(),
    title,
    status: "backlog",
    priority: (priority as "high" | "medium" | "low") || "medium",
    assigned_to: "one",
    due_date: dueDate,
    created_at: getCurrentTimestamp(),
    tags,
  };

  const board = getBoardContent();
  const newTaskBlock = taskToMarkdown(task);

  // Insert into Backlog section (after the "## 🔴 Backlog" header)
  const backlogIndex = board.indexOf("## 🔴 Backlog");
  if (backlogIndex === -1) {
    console.error("Error: Backlog section not found in board.md");
    return task;
  }

  const lineEnd = board.indexOf("\n", backlogIndex) + 1;
  const updatedBoard =
    board.slice(0, lineEnd) + newTaskBlock + board.slice(lineEnd);

  setBoardContent(updatedBoard);
  console.log(`✅ Task created: ${task.id} — "${title}"`);
  return task;
}

function moveTask(taskId: string, newStatus: string): void {
  const board = getBoardContent();
  const tasks = parseAllTasks();

  let found = false;
  let updatedBoard = board;

  for (const task of tasks) {
    if (task.id === taskId) {
      task.status = newStatus as any;
      if (newStatus === "done" && !task.completed_at) {
        task.completed_at = getCurrentTimestamp();
      }

      // Find old task block and replace with updated one
      const oldTaskRegex = new RegExp(
        `^---\\s*\\nid: ${taskId}[^]*?(?=\\n---(?:\\s|$))`,
        "m"
      );
      const updatedBlock = taskToMarkdown(task);

      updatedBoard = updatedBoard.replace(oldTaskRegex, updatedBlock.trim());
      found = true;
      break;
    }
  }

  if (!found) {
    console.error(`Error: Task ${taskId} not found`);
    return;
  }

  setBoardContent(updatedBoard);
  console.log(`✅ Task ${taskId} moved to: ${newStatus}`);
}

function listTasks(status?: string): void {
  const tasks = parseAllTasks();

  const filtered = status
    ? tasks.filter((t) => t.status === status)
    : tasks;

  if (filtered.length === 0) {
    console.log(
      `No tasks found${status ? ` with status: ${status}` : ""}`
    );
    return;
  }

  console.log(`\n📋 Tasks${status ? ` (${status})` : ""}:\n`);

  const statusEmojis: Record<string, string> = {
    backlog: "🔴",
    in_progress: "🟡",
    in_review: "🟠",
    done: "🟢",
  };

  for (const task of filtered) {
    const emoji = statusEmojis[task.status] || "⚪";
    const due = task.due_date ? ` | Due: ${task.due_date}` : "";
    const priority =
      task.priority === "high" ? "🔥" : task.priority === "low" ? "❄️" : "⚡";

    console.log(`${emoji} ${task.id} — ${task.title} ${priority}${due}`);
  }

  console.log("");
}

function showStats(): void {
  const tasks = parseAllTasks();

  const stats = {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === "backlog").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    in_review: tasks.filter((t) => t.status === "in_review").length,
    done: tasks.filter((t) => t.status === "done").length,
    high_priority: tasks.filter((t) => t.priority === "high").length,
  };

  console.log(`
📊 Mission Control Stats
━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tasks: ${stats.total}
  🔴 Backlog: ${stats.backlog}
  🟡 In Progress: ${stats.in_progress}
  🟠 In Review: ${stats.in_review}
  🟢 Done: ${stats.done}

Priority:
  🔥 High: ${stats.high_priority}

Velocity: ${stats.done} completed
  `);
}

// ============================================================================
// CLI Interface
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];

try {
  switch (command) {
    case "add": {
      const title = args[1];
      if (!title) {
        console.error("Usage: mc add [title] --priority [high|medium|low]");
        break;
      }

      const priorityIdx = args.indexOf("--priority");
      const priority =
        priorityIdx !== -1 ? args[priorityIdx + 1] : "medium";

      const dueIdx = args.indexOf("--due");
      const due = dueIdx !== -1 ? args[dueIdx + 1] : undefined;

      const tagIdx = args.indexOf("--tag");
      const tags = tagIdx !== -1 ? [args[tagIdx + 1]] : [];

      addTask(title, priority, due, tags);
      break;
    }

    case "move": {
      const taskId = args[1];
      const newStatus = args[2];
      if (!taskId || !newStatus) {
        console.error(
          "Usage: mc move [task-id] [backlog|in_progress|in_review|done]"
        );
        break;
      }
      moveTask(taskId, newStatus);
      break;
    }

    case "list": {
      const status = args[1];
      listTasks(status);
      break;
    }

    case "stats": {
      showStats();
      break;
    }

    case "help": {
      console.log(`
🎯 Mission Control CLI

Commands:
  add [title]              Add new task to backlog
    --priority [level]     Priority: high, medium, low
    --due [date]           Due date: YYYY-MM-DD
    --tag [tag]            Add tag (e.g., "coding", "website")

  move [id] [status]       Move task to new status
    Statuses: backlog, in_progress, in_review, done

  list [status]            Show tasks (optional: filter by status)

  stats                    Show velocity + active tasks

  help                     Show this help
      `);
      break;
    }

    default: {
      console.log(
        "Unknown command. Use 'bun mission-control-cli.ts help' for usage."
      );
    }
  }
} catch (error) {
  console.error("Error:", error instanceof Error ? error.message : error);
}
