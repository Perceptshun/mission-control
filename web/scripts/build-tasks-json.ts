/**
 * Build script: Convert board.md to tasks.json
 * Runs during vite build to generate static JSON
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "in_progress" | "in_review" | "done";
  priority: string;
  assigned_to: string;
  due_date: string;
  created_at: string;
  completed_at: string;
  tags: string[];
  estimate_hours?: string;
  actual_hours?: string;
}

const BOARD_PATH = resolve(import.meta.dir, "../../board.md");
const OUTPUT_PATH = resolve(import.meta.dir, "../public/tasks.json");

function parseBoard(content: string): Task[] {
  const tasks: Task[] = [];
  const taskBlocks = content.split(/\n---\n/).slice(1); // Skip header

  for (const block of taskBlocks) {
    const lines = block.split("\n");
    const task: any = {};

    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      const key = line.substring(0, colonIdx).trim();
      let value = line.substring(colonIdx + 1).trim();

      if (key === "tags") {
        const match = value.match(/\[(.*?)\]/);
        task.tags = match
          ? match[1]
              .split(",")
              .map((t: string) => t.trim())
              .filter((t: string) => t)
          : [];
      } else {
        task[key] = value;
      }
    }

    if (task.id && task.title) {
      tasks.push(task as Task);
    }
  }

  return tasks;
}

const boardContent = readFileSync(BOARD_PATH, "utf-8");
const tasks = parseBoard(boardContent);

writeFileSync(OUTPUT_PATH, JSON.stringify({ tasks }, null, 2));
console.log(`✅ Generated tasks.json with ${tasks.length} tasks`);
