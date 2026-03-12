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
  extended_description?: string;
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

  // Split content into blocks (separated by ---)
  const allBlocks = content.split(/\n---\n/);

  let i = 1; // Skip header block
  while (i < allBlocks.length) {
    const block = allBlocks[i];
    const lines = block.split("\n");
    const task: any = {};
    let isYamlBlock = false;

    // Check if this block contains YAML (starts with id:)
    for (const line of lines) {
      if (line.trim().startsWith("id:")) {
        isYamlBlock = true;
        break;
      }
    }

    if (isYamlBlock) {
      // Parse YAML fields
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

      // Check if next block is extended description (content block, not YAML)
      if (i + 1 < allBlocks.length) {
        const nextBlock = allBlocks[i + 1];
        const nextIsYaml = nextBlock.split("\n").some((line) =>
          line.trim().startsWith("id:")
        );

        if (!nextIsYaml && nextBlock.trim().length > 0) {
          task.extended_description = nextBlock.trim();
          i++; // Skip the extended description block
        }
      }

      if (task.id && task.title) {
        tasks.push(task as Task);
      }
    }

    i++;
  }

  return tasks;
}

const boardContent = readFileSync(BOARD_PATH, "utf-8");
const tasks = parseBoard(boardContent);

writeFileSync(OUTPUT_PATH, JSON.stringify({ tasks }, null, 2));
console.log(`✅ Generated tasks.json with ${tasks.length} tasks`);
