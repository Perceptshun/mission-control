import React, { useState } from "react";
import { getToken, setToken, clearToken } from "../utils/github";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const hasToken = !!getToken();

  const handleSave = () => {
    if (input.trim()) {
      setToken(input.trim());
      setInput("");
      onClose();
    }
  };

  const handleClear = () => {
    clearToken();
    setInput("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius)",
          padding: "24px",
          width: "90%",
          maxWidth: "400px",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginTop: 0,
            marginBottom: "12px",
          }}
        >
          GitHub Settings
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "16px",
            lineHeight: "1.5",
          }}
        >
          Enter your GitHub Personal Access Token to enable drag-and-drop and delete
          functionality.{" "}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00d9ff", textDecoration: "none" }}
          >
            Create one here
          </a>
          . Token is stored locally in browser storage only.
        </p>

        {hasToken && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--bg-base)",
              borderRadius: "4px",
              marginBottom: "16px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            ✓ Token is set
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "6px",
              color: "var(--text-secondary)",
            }}
          >
            GitHub PAT
          </label>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            placeholder="ghp_..."
            style={{
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontFamily: "monospace",
              boxSizing: "border-box",
            }}
          />
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
            Cancel
          </button>

          {hasToken && (
            <button
              onClick={handleClear}
              style={{
                padding: "8px 16px",
                backgroundColor: "#fc4949",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                color: "#fff",
              }}
            >
              Clear
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!input.trim()}
            style={{
              padding: "8px 16px",
              backgroundColor: input.trim() ? "#38a169" : "#999",
              border: "none",
              borderRadius: "4px",
              cursor: input.trim() ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
