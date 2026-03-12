import React from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Task } from "../types";
import Column from "./Column";

interface BoardProps {
  tasks: Task[];
  onDrop: (taskId: string, newStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

const Board: React.FC<BoardProps> = ({ tasks, onDrop, onDeleteTask }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onDrop(active.id as string, over.id as string);
    }
  };

  // Group tasks by status
  const columns = [
    {
      status: "backlog" as const,
      label: "Backlog",
      color: "#e53e3e",
    },
    {
      status: "in_progress" as const,
      label: "In Progress",
      color: "#d69e2e",
    },
    {
      status: "in_review" as const,
      label: "In Review",
      color: "#dd6b20",
    },
    {
      status: "done" as const,
      label: "Done",
      color: "#38a169",
    },
  ];

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "16px",
          overflowX: "auto",
          height: "calc(100vh - 60px)",
        }}
      >
        {columns.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            color={col.color}
            tasks={tasks.filter((t) => t.status === col.status)}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default Board;
