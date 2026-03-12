import React, { useState, useEffect, useCallback } from "react";
import { Task } from "./types";
import Board from "./components/Board";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from static JSON
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/mission-control/tasks.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data.tasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-refresh every 30 seconds to pick up Obsidian edits
  useEffect(() => {
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  // Static version - no delete/drag functionality
  const handleDeleteTask = () => {
    alert("Edit board.md and push to GitHub to update the kanban board");
  };

  const handleDrop = () => {
    alert("Edit board.md and push to GitHub to update the kanban board");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      >
        <div>Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "var(--bg-base)",
          color: "var(--text-primary)",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "600" }}>Error</div>
        <div style={{ color: "var(--text-secondary)" }}>{error}</div>
        <button
          onClick={fetchTasks}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            backgroundColor: "#d69e2e",
            color: "#fff",
            borderRadius: "var(--radius)",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
          Mission Control
        </h1>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            color: "var(--text-secondary)",
            fontSize: "12px",
          }}
        >
          <span>Total: {tasks.length}</span>
          <button
            onClick={fetchTasks}
            style={{
              padding: "6px 12px",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Board */}
      <Board tasks={tasks} onDrop={handleDrop} onDeleteTask={handleDeleteTask} />
    </div>
  );
};

export default App;
