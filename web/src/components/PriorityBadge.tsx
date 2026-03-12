import React from "react";

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getColor = () => {
    switch (priority) {
      case "high":
        return "#fc4949";
      case "medium":
        return "#d69e2e";
      case "low":
        return "#4a5568";
    }
  };

  const getLabel = () => {
    switch (priority) {
      case "high":
        return "HIGH";
      case "medium":
        return "MED";
      case "low":
        return "LOW";
    }
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        backgroundColor: getColor(),
        color: "#fff",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "0.5px",
        opacity: 0.9,
      }}
    >
      {getLabel()}
    </span>
  );
};

export default PriorityBadge;
