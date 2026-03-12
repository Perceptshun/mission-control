/**
 * Daily Sync Script
 * Reads latest ideas from app-and-coding-ideas.md
 * Appends new ones to board.md as Backlog tasks
 * Runs daily at 8:05am via GitHub Actions
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const IDEAS_PATH = resolve(import.meta.dir, "../../../05 - Memory/app-and-coding-ideas.md");
const BOARD_PATH = resolve(import.meta.dir, "../board.md");

interface Idea {
  id: string;
  title: string;
  description: string;
  type: "app" | "coding";
}

// Parse app-and-coding-ideas.md for ideas
function parseIdeas(): Idea[] {
  const content = readFileSync(IDEAS_PATH, "utf-8");
  const ideas: Idea[] = [];

  // Extract app ideas
  const appSections = content.match(/### Idea \d+: ([^\n]+)\n\n\*\*Core Purpose\*\*: ([^\n]+)/g) || [];
  appSections.forEach((section, idx) => {
    const match = section.match(/### Idea \d+: ([^\n]+)\n\n\*\*Core Purpose\*\*: ([^\n]+)/);
    if (match) {
      ideas.push({
        id: `idea-app-${idx + 1}`,
        title: match[1].trim(),
        description: match[2].trim(),
        type: "app",
      });
    }
  });

  // Extract coding project ideas
  const codingSections = content.match(/### Project \d+: ([^\n]+)\n\n\*\*Tech Stack\*\*: ([^\n]+)/g) || [];
  codingSections.forEach((section, idx) => {
    const match = section.match(/### Project \d+: ([^\n]+)\n\n\*\*Tech Stack\*\*: ([^\n]+)/);
    if (match) {
      ideas.push({
        id: `idea-coding-${idx + 1}`,
        title: match[1].trim(),
        description: match[2].trim(),
        type: "coding",
      });
    }
  });

  return ideas;
}

// Check if idea already exists in board
function ideaExists(board: string, ideaId: string): boolean {
  return board.includes(`id: ${ideaId}`);
}

// Format idea as board.md task
function formatTask(idea: Idea): string {
  const now = new Date();
  const timestamp = now.toISOString().split("T")[0];
  const tag = idea.type === "app" ? "app-idea" : "coding-idea";

  return `---
id: ${idea.id}
title: ${idea.title}
description: ${idea.description}
status: backlog
priority: high
assigned_to: jd
due_date:
created_at: ${timestamp}
completed_at:
tags: [${tag}, daily-sync]
estimate_hours:
actual_hours:
---

**Auto-synced from daily ideas database**

---`;
}

// Main sync function
async function syncIdeas() {
  console.log("🔄 Syncing ideas to Mission Control board...");

  if (!existsSync(IDEAS_PATH)) {
    console.error(`❌ Ideas file not found: ${IDEAS_PATH}`);
    process.exit(1);
  }

  if (!existsSync(BOARD_PATH)) {
    console.error(`❌ Board file not found: ${BOARD_PATH}`);
    process.exit(1);
  }

  const ideas = parseIdeas();
  let board = readFileSync(BOARD_PATH, "utf-8");

  let addedCount = 0;
  const backlogInsertPoint = board.indexOf("## 🔴 Backlog (Priority Queue)") + "## 🔴 Backlog (Priority Queue)".length + 1;

  if (backlogInsertPoint === 0) {
    console.error("❌ Could not find Backlog section in board");
    process.exit(1);
  }

  for (const idea of ideas) {
    if (!ideaExists(board, idea.id)) {
      const taskStr = formatTask(idea);
      board = board.slice(0, backlogInsertPoint) + "\n" + taskStr + "\n" + board.slice(backlogInsertPoint);
      addedCount++;
      console.log(`✅ Added: ${idea.title}`);
    }
  }

  if (addedCount > 0) {
    // Update last sync timestamp
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0];
    board = board.replace(/\*\*Last Updated\*\*: .+\n/, `**Last Updated**: ${dateStr} ${timeStr}\n`);

    writeFileSync(BOARD_PATH, board);
    console.log(`\n✅ Synced ${addedCount} new idea(s) to board`);
  } else {
    console.log("ℹ️  No new ideas to sync");
  }
}

syncIdeas().catch(console.error);
