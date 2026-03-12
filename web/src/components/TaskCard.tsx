import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types";
import PriorityBadge from "./PriorityBadge";

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked for task:", task.id);
    onDelete?.(task.id);
  };

  const assigneeColor = task.assigned_to === "one" ? "#b362f5" : "#00d9ff";
  const assigneeLabel = task.assigned_to === "one" ? "One" : "JD";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="task-card"
      style={{
        ...style,
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "12px",
        marginBottom: "8px",
        cursor: "grab",
        transition: "var(--transition)",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-card)";
      }}
    >
      {/* Title + Delete button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--text-primary)",
            lineHeight: "1.3",
            wordBreak: "break-word",
            flex: 1,
          }}
        >
          {task.title}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            padding: 0,
            backgroundColor: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "14px",
            opacity: 0.6,
            transition: "opacity 0.2s",
            pointerEvents: "auto",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.color = "#fc4949";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.6";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          title="Delete task"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            marginBottom: "8px",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.description}
        </div>
      )}

      {/* Metadata row: Priority + Assignee + Due date */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}
      >
        <PriorityBadge priority={task.priority} />

        {/* Assignee */}
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "4px",
            backgroundColor: assigneeColor,
            color: "#fff",
            fontSize: "11px",
            fontWeight: "600",
            opacity: 0.85,
          }}
        >
          {assigneeLabel}
        </span>

        {/* Due date */}
        {task.due_date && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              padding: "2px 6px",
              backgroundColor: "var(--bg-base)",
              borderRadius: "3px",
              border: "1px solid var(--border)",
            }}
          >
            📅 {task.due_date}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          {task.tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-block",
                padding: "2px 6px",
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: "3px",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
