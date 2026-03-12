import React, { useState, useEffect, useCallback } from "react";
import { Task } from "./types";
import Board from "./components/Board";
import SettingsModal from "./components/SettingsModal";
import PlanModal from "./components/PlanModal";
import { getToken, updateTaskStatus, deleteTask as deleteTaskGH } from "./utils/github";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [planTask, setPlanTask] = useState<Task | null>(null);
  const [hasToken, setHasToken] = useState(!!getToken());

  // Fetch tasks from static JSON
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("./tasks.json");
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

  const handleDrop = useCallback(
    async (taskId: string, newStatus: string) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus as Task["status"] }
            : t
        )
      );

      if (getToken()) {
        try {
          await updateTaskStatus(taskId, newStatus);
        } catch (err) {
          console.error("Failed to update task status:", err);
          // Revert on failure
          fetchTasks();
        }
      }

      // Show plan modal if dropping to in_progress
      if (newStatus === "in_progress") {
        const task = tasks.find((t) => t.id === taskId);
        if (task) setPlanTask(task);
      }
    },
    [tasks]
  );

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!getToken()) {
      alert("Add GitHub token in ⚙️ Settings to enable delete");
      return;
    }

    if (!window.confirm("Delete this task?")) {
      return;
    }

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await deleteTaskGH(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      // Revert on failure
      fetchTasks();
    }
  }, []);

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
            onClick={() => setShowSettings(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
            title={hasToken ? "Settings configured" : "Configure GitHub token"}
          >
            ⚙️
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: hasToken ? "#38a169" : "#e53e3e",
              }}
            />
          </button>
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

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          setHasToken(!!getToken());
        }}
      />
      <PlanModal task={planTask} onClose={() => setPlanTask(null)} />
    </div>
  );
};

export default App;
