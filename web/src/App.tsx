import React, { useState, useEffect, useCallback } from "react";
import { Task } from "./types";
import Board from "./components/Board";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks");
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

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }

      // Remove from local state
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      alert(`Failed to delete task: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  // Handle drag and drop
  const handleDrop = async (taskId: string, newStatus: string) => {
    // Optimistic update
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus as any } : task
    );
    const previousTasks = tasks;
    setTasks(updatedTasks);

    // Send to server
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      // Fetch fresh data to ensure consistency
      await fetchTasks();
    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      console.error("Error updating task:", err);
      alert(`Failed to move task: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
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
