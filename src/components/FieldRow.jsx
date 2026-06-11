import { useState } from "react";

export default function FieldRow({ label, value, accent = "#5b6cff" }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      background: "#22263a",
      borderRadius: "7px",
      padding: "7px 10px",
      marginBottom: "5px",
    }}>
      <span style={{
        fontSize: "11px",
        color: "#7a80a0",
        width: "52px",
        flexShrink: 0,
        paddingTop: "2px",
        fontWeight: 500,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "12px",
        color: "#e8eaf0",
        flex: 1,
        wordBreak: "break-all",
        lineHeight: "1.5",
      }}>
        {value}
      </span>
      <button onClick={handleCopy} style={{
        background: copied ? "rgba(52,211,153,0.15)" : "transparent",
        color: copied ? "#34d399" : accent,
        border: "none",
        borderRadius: "5px",
        padding: "3px 8px",
        fontSize: "11px",
        fontWeight: 600,
        cursor: "pointer",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}>
        {copied ? "✓" : "복사"}
      </button>
    </div>
  );
}