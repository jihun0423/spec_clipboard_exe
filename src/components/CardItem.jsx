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
  footer,
  theme,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";

  const handleAllCopy = () => {
    navigator.clipboard.writeText(allCopyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div style={{
      background: surface,
      border: `1px solid ${open ? accent : border}`,
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
            background: surface2, color: textMut, border: "none",
            borderRadius: "6px", padding: "4px 8px", fontSize: "11px",
            fontWeight: 600, cursor: "pointer",
          }}>✎ 수정</button>
          <button onClick={onDelete} style={{
            background: "#f87171", color: "#fff", border: "none",
            borderRadius: "6px", padding: "4px 8px", fontSize: "11px",
            fontWeight: 600, cursor: "pointer",
          }}>✕ 삭제</button>
        </div>

        {/* 제목 */}
        <div style={{ flex: 1, minWidth: 0, order: -1 }}
          onClick={() => setOpen(!open)}>
          <div style={{
            fontSize: "13px", fontWeight: 600, color: text,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{title}</div>
          {subtitle && (
            <div style={{
              fontSize: "11px", color: textMut, marginTop: "2px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{subtitle}</div>
          )}
        </div>
      </div>

      {/* 펼쳐진 필드 */}
      {open && (
        <div style={{ borderTop: `1px solid ${border}` }}>
          <div style={{ padding: "8px 10px 4px" }}>
            {fields.map(({ label, value }) => (
              <FieldRow key={label} label={label} value={value} accent={accent} theme={theme} />
            ))}
          </div>
          {allCopyText && (
            <div style={{ padding: "0 10px 8px" }}>
              <button onClick={handleAllCopy} style={{
                width: "100%",
                background: copied ? "rgba(52,211,153,0.15)" : accent,
                color: copied ? "#34d399" : "#fff",
                border: "none", borderRadius: "7px",
                padding: "7px", fontSize: "12px",
                fontWeight: 600, cursor: "pointer",
              }}>
                {copied ? "✓ 복사됨" : "📋 전체 복사"}
              </button>
            </div>
          )}
          {footer && footer}
        </div>
      )}
    </div>
  );
}