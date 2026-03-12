/**
 * Task Parser for Mission Control
 * Extracted from mission-control-cli.ts with async/await support
 */

import { existsSync } from "fs";

export interface Task {
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

export function generateId(): string {
  return `task-${Date.now().toString(36).slice(-8)}`;
}

export function getCurrentTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/T/, " ").slice(0, 16);
}

export async function parseAllTasks(boardPath: string): Promise<Task[]> {
  if (!existsSync(boardPath)) return [];

  try {
    const content = await Bun.file(boardPath).text();
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
  } catch (error) {
    console.error("Error parsing tasks:", error);
    return [];
  }
}

/**
 * Update a single field in a task block in-place
 * This preserves markdown body content below each task
 */
export async function updateTaskField(
  boardPath: string,
  taskId: string,
  field: string,
  value: string
): Promise<string> {
  const content = await Bun.file(boardPath).text();

  // Find the task block by ID
  const taskBlockRegex = new RegExp(
    `(^---\\s*\\nid:\\s*${taskId}\\n[\\s\\S]*?\\n)(${field}:\\s*[^\\n]*)`,
    "m"
  );

  const match = content.match(taskBlockRegex);
  if (!match) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Replace only the specific field line
  const newContent = content.replace(
    taskBlockRegex,
    `$1${field}: ${value}`
  );

  // Write back
  await Bun.write(boardPath, newContent);
  return newContent;
}

/**
 * Construct a full markdown task block (for new tasks)
 */
export function taskToMarkdown(task: Task, bodyContent: string = ""): string {
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

  return `${frontmatter}\n\n${bodyContent}\n\n`;
}
