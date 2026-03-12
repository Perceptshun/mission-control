/**
 * Mission Control Web Server
 * REST API + Static File Server
 * Runs on port 3000 by default
 */

import { parseAllTasks, updateTaskField, getCurrentTimestamp } from "./parser";
import { resolve } from "path";
import { existsSync } from "fs";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Get board.md path relative to this server file
const BOARD_PATH = resolve(
  import.meta.dir,
  "..",
  "..",
  "board.md"
);

console.log(`📁 Board path: ${BOARD_PATH}`);
console.log(`🚀 Starting Mission Control server on http://localhost:${PORT}`);

export default {
  port: PORT,
  async fetch(request: Request) {
    const url = new URL(request.url);

    // API Routes
    if (url.pathname.startsWith("/api/tasks")) {
      // GET /api/tasks — return all tasks as JSON
      if (request.method === "GET") {
        try {
          const tasks = await parseAllTasks(BOARD_PATH);
          return new Response(
            JSON.stringify({ tasks }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        } catch (error) {
          console.error("Error fetching tasks:", error);
          return new Response(
            JSON.stringify({ error: "Failed to fetch tasks" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // PATCH /api/tasks/:id — update task status
      if (request.method === "PATCH") {
        const parts = url.pathname.split("/");
        const taskId = parts[3];

        if (!taskId) {
          return new Response(
            JSON.stringify({ error: "Task ID required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          const body = await request.json() as { status?: string };
          const newStatus = body.status;

          if (!newStatus || !["backlog", "in_progress", "in_review", "done"].includes(newStatus)) {
            return new Response(
              JSON.stringify({ error: "Invalid status" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          // Update status field
          await updateTaskField(BOARD_PATH, taskId, "status", newStatus);

          // If moving to done, also set completed_at
          if (newStatus === "done") {
            const tasks = await parseAllTasks(BOARD_PATH);
            const task = tasks.find((t) => t.id === taskId);
            if (task && !task.completed_at) {
              await updateTaskField(BOARD_PATH, taskId, "completed_at", getCurrentTimestamp());
            }
          }

          // Return updated task
          const updatedTasks = await parseAllTasks(BOARD_PATH);
          const updatedTask = updatedTasks.find((t) => t.id === taskId);

          return new Response(
            JSON.stringify({ task: updatedTask }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        } catch (error) {
          console.error("Error updating task:", error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Failed to update task",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // DELETE /api/tasks/:id — delete a task
      if (request.method === "DELETE") {
        const parts = url.pathname.split("/");
        const taskId = parts[3];

        if (!taskId) {
          return new Response(
            JSON.stringify({ error: "Task ID required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          const content = await Bun.file(BOARD_PATH).text();

          // Verify task exists first
          const tasks = await parseAllTasks(BOARD_PATH);
          if (!tasks.find((t) => t.id === taskId)) {
            return new Response(
              JSON.stringify({ error: `Task ${taskId} not found` }),
              { status: 404, headers: { "Content-Type": "application/json" } }
            );
          }

          // Find and remove the task block using the parser's regex
          const taskBlockRegex = /^---\s*\nid:\s*(\S+)\n([\s\S]*?)(?=\n---(?:\s|$))/gm;
          let newContent = content;

          let match;
          while ((match = taskBlockRegex.exec(content)) !== null) {
            if (match[1] === taskId) {
              // Remove the entire block and following whitespace
              const blockStart = match.index;
              const blockEnd = taskBlockRegex.lastIndex;
              newContent = content.substring(0, blockStart) + content.substring(blockEnd + 2);
              break;
            }
          }

          await Bun.write(BOARD_PATH, newContent);

          return new Response(
            JSON.stringify({ success: true, message: `Task ${taskId} deleted` }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        } catch (error) {
          console.error("Error deleting task:", error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Failed to delete task",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
    }

    // Static file serving — serve dist/ (Vite build output)
    if (request.method === "GET") {
      let filePath = url.pathname;

      // Root → index.html
      if (filePath === "/") {
        filePath = "/index.html";
      }

      const fullPath = resolve(import.meta.dir, "..", "dist", filePath.slice(1));
      const file = Bun.file(fullPath);

      if (await file.exists()) {
        return new Response(file);
      }

      // If file not found and it's not /api, try index.html (for SPA routing)
      if (!filePath.includes("/api")) {
        const indexPath = resolve(import.meta.dir, "..", "dist", "index.html");
        const indexFile = Bun.file(indexPath);
        if (await indexFile.exists()) {
          return new Response(indexFile, {
            headers: { "Content-Type": "text/html" },
          });
        }
      }

      // 404
      return new Response("Not found", { status: 404 });
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
