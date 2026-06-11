import { useState } from "react";
import FieldRow from "./FieldRow";

export default function CardItem({
  title,
  subtitle,
  fields,
  accent = "#5b6cff",
  onEdit,
  onDelete,
  allCopyText,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAllCopy = () => {
    navigator.clipboard.writeText(allCopyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div style={{
      background: "#1a1d27",
      border: `1px solid ${open ? accent : "#2e3350"}`,
      borderRadius: "10px",
      marginBottom: "6px",
      overflow: "hidden",
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "9px 11px",
        cursor: "pointer",
        gap: "8px",
      }}>
        {/* 버튼 먼저 (밀림 방지) */}
        <div style={{ display: "flex", gap: "4px", flexShrink: 0, marginLeft: "auto" }}
          onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} style={{
            background: "#22263a", color: "#7a80a0", border: "none",
            borderRadius: "6px", padding: "4px 8px", fontSize: "11px",
            fontWeight: 600, cursor: "pointer",
          }}>✎ 수정</button>
          <button onClick={onDelete} style={{
            background: "#f87171", color: "#fff", border: "none",
            borderRadius: "6px", padding: "4px 8px", fontSize: "11px",
            fontWeight: 600, cursor: "pointer",
          }}>✕ 삭제</button>
        </div>

        {/* 제목 (클릭 시 토글) */}
        <div style={{ flex: 1, minWidth: 0, order: -1 }}
          onClick={() => setOpen(!open)}>
          <div style={{
            fontSize: "13px", fontWeight: 600, color: "#e8eaf0",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{title}</div>
          {subtitle && (
            <div style={{
              fontSize: "11px", color: "#7a80a0", marginTop: "2px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{subtitle}</div>
          )}
        </div>
      </div>

      {/* 펼쳐진 필드 */}
      {open && (
        <div style={{ padding: "0 10px 10px", borderTop: "1px solid #2e3350" }}>
          <div style={{ paddingTop: "8px" }}>
            {fields.map(({ label, value }) => (
              <FieldRow key={label} label={label} value={value} accent={accent} />
            ))}
          </div>
          {allCopyText && (
            <button onClick={handleAllCopy} style={{
              width: "100%",
              background: copied ? "rgba(52,211,153,0.15)" : accent,
              color: copied ? "#34d399" : "#fff",
              border: "none", borderRadius: "7px",
              padding: "7px", fontSize: "12px",
              fontWeight: 600, cursor: "pointer", marginTop: "4px",
            }}>
              {copied ? "✓ 복사됨" : "📋 전체 복사"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}