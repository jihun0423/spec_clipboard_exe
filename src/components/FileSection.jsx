export default function FileSection({ item, uploading, onUpload, onDelete, accent, theme }) {
  const border = theme?.border || "#2e3350";
  const textMut = theme?.textMut || "#7a80a0";
  const surface2 = theme?.surface2 || "#22263a";

  const ext = (item.fileName?.split(".").pop() || "").toLowerCase();
  const isPreviewable = ["jpg", "jpeg", "png", "gif", "webp", "pdf"].includes(ext);

  const handleDownload = () => {
    if (window.electronAPI) window.electronAPI.downloadFile(item.fileUrl, item.fileName);
    else window.open(item.fileUrl, "_blank");
  };

  const handlePreview = () => {
    if (window.electronAPI) window.electronAPI.previewFile(item.fileUrl, item.fileName);
    else window.open(item.fileUrl, "_blank");
  };

  return (
    <div style={{ borderTop: `1px solid ${border}`, padding: "8px 10px",
      display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "11px", color: textMut, flexShrink: 0 }}>📎 파일</span>
      {item.fileUrl ? (
        <>
          <span style={{
            fontSize: "11px", color: textMut, flex: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{item.fileName}</span>
          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
            {isPreviewable && (
              <button onClick={handlePreview} style={{
                background: accent, color: "#fff", border: "none",
                borderRadius: "5px", padding: "3px 8px", fontSize: "11px",
                fontWeight: 600, cursor: "pointer",
              }}>👁 보기</button>
            )}
            <button onClick={handleDownload} style={{
              background: surface2, color: accent, border: "none",
              borderRadius: "5px", padding: "3px 8px", fontSize: "11px",
              fontWeight: 600, cursor: "pointer",
            }}>⬇ 저장</button>
            <button onClick={onDelete} style={{
              background: "#f87171", color: "#fff", border: "none",
              borderRadius: "5px", padding: "3px 8px", fontSize: "11px",
              fontWeight: 600, cursor: "pointer",
            }}>삭제</button>
          </div>
        </>
      ) : (
        <label style={{
          background: uploading ? surface2 : accent,
          color: uploading ? textMut : "#fff",
          borderRadius: "5px", padding: "3px 10px",
          fontSize: "11px", fontWeight: 600, cursor: "pointer", flexShrink: 0,
        }}>
          {uploading ? "업로드 중..." : "📤 업로드"}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.zip,.docx,.xlsx"
            style={{ display: "none" }}
            onChange={(e) => onUpload(e.target.files[0])}
            disabled={uploading} />
        </label>
      )}
    </div>
  );
}