import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Task } from "../types";
import TaskCard from "./TaskCard";

interface ColumnProps {
  status: "backlog" | "in_progress" | "in_review" | "done";
  label: string;
  color: string;
  tasks: Task[];
  onDeleteTask?: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ status, label, color, tasks, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: "var(--bg-base)",
        borderRadius: "var(--radius)",
        flex: "1",
        minWidth: "300px",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 120px)",
        overflow: "hidden",
      }}
    >
      {/* Column Header */}
      <div
        style={{
          backgroundColor: color,
          color: "#fff",
          padding: "12px",
          fontWeight: "600",
          fontSize: "13px",
          borderTopLeftRadius: "var(--radius)",
          borderTopRightRadius: "var(--radius)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{label}</span>
        <span
          style={{
            display: "inline-block",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "2px 8px",
            borderRadius: "3px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          backgroundColor: isOver ? "var(--bg-card-hover)" : "var(--bg-base)",
          transition: "var(--transition)",
        }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "12px",
              padding: "24px 12px",
              fontStyle: "italic",
            }}
          >
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
