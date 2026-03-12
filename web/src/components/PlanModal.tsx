import React from "react";
import { Task } from "../types";

interface PlanModalProps {
  task: Task | null;
  onClose: () => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  // Extract tech stack from extended_description
  const techStackLine = task.extended_description
    ?.split("\n")
    .find((line) => /tech\s+stack:/i.test(line));

  const techStack = techStackLine
    ? techStackLine.replace(/.*tech\s+stack:\s*/i, "").trim()
    : "Not specified";

  // Build Claude command
  const claudeCommand = `cd "/Users/jd/Library/Mobile Documents/com~apple~CloudDocs/0ne" && claude "Starting: ${task.title}. Tech Stack: ${techStack}. Scaffold."`;

  const handleCopy = () => {
    navigator.clipboard.writeText(claudeCommand);
  };

  const handleGoAndClose = () => {
    navigator.clipboard.writeText(claudeCommand);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius)",
          padding: "24px",
          width: "90%",
          maxWidth: "600px",
          border: "1px solid var(--border)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginTop: 0,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📋 Starting: {task.title}
        </h2>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 0",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginTop: 0,
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Context
          </h3>
          <pre
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              margin: 0,
              fontFamily: "monospace",
              lineHeight: "1.5",
              maxHeight: "200px",
              overflow: "auto",
              padding: "8px",
              backgroundColor: "var(--bg-base)",
              borderRadius: "4px",
            }}
          >
            {task.extended_description || "No extended context"}
          </pre>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginTop: 0,
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            📟 Claude Command
          </h3>
          <div
            style={{
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "12px",
              fontFamily: "monospace",
              fontSize: "11px",
              color: "var(--text-primary)",
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
              lineHeight: "1.4",
            }}
          >
            {claudeCommand}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            Close
          </button>

          <button
            onClick={handleCopy}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            📋 Copy Command
          </button>

          <button
            onClick={handleGoAndClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#00d9ff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              color: "#000",
            }}
          >
            ✓ Go
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
