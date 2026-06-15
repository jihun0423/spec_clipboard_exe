import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";

const EMPTY = { name: "", period: "", gpa_total: "", gpa_major: "", credits_total: "", credits_major: "", scholarship: "" };

export default function EducationTab({ data, loading, accent, onAdd, onUpdate, onDelete, uid, theme }) {
  const [form, setForm] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [uploading, setUploading] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const openAdd = () => { setDraft(EMPTY); setForm("add"); setFormFile(null); setEditingId(null); };
  const openEdit = (item) => { setDraft(item); setForm(item.id); setFormFile(null); setEditingId(item.id); };
  const close = () => { setForm(null); setDraft(EMPTY); setFormFile(null); setEditingId(null); };

  const handleSave = async () => {
    if (!draft.name) return;
    if (form === "add") {
      const newId = await onAdd(draft);
      if (formFile && newId) await uploadFile({ id: newId, ...draft }, formFile);
    } else {
      await onUpdate(form, draft);
      if (formFile) await uploadFile({ id: form, ...draft }, formFile);
    }
    close();
  };

  const uploadFile = async (item, file) => {
    setUploading(prev => ({ ...prev, [item.id]: true }));
    try {
      const fileRef = ref(storage, `users/${uid}/education/${item.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: url, fileName: file.name });
    } catch (e) { console.error(e); }
    setUploading(prev => ({ ...prev, [item.id]: false }));
  };

  const handleFileDelete = async (item) => {
    if (!item.fileUrl) return;
    try {
      const fileRef = ref(storage, `users/${uid}/education/${item.id}/${item.fileName}`);
      await deleteObject(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: null, fileName: null });
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <button onClick={openAdd} style={{
        width: "100%", background: accent, color: "#fff", border: "none",
        borderRadius: "8px", padding: "8px", fontSize: "12px",
        fontWeight: 600, cursor: "pointer", marginBottom: "8px",
      }}>+ 학력 추가</button>

      {form === "add" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[
            ["학교명",   "name"],
            ["재학기간", "period"],
            ["전체학점", "gpa_total"],
            ["전공학점", "gpa_major"],
            ["이수학점", "credits_total"],
            ["전공이수", "credits_major"],
            ["장학금",   "scholarship"],
          ]}
          onSave={handleSave} onClose={close} accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile} />
      )}

      {loading ? <p style={{ color: theme?.textMut || "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <div key={item.id}>
            <CardItem
              title={item.name}
              subtitle={item.period}
              accent={accent} theme={theme}
              fields={[
                { label: "학교명",   value: item.name },
                { label: "재학기간", value: item.period },
                { label: "전체학점", value: item.gpa_total },
                { label: "전공학점", value: item.gpa_major },
                { label: "이수학점", value: item.credits_total },
                { label: "전공이수", value: item.credits_major },
                { label: "장학금",   value: item.scholarship },
                ...(item.customFields || []).map(f => ({ label: f.label, value: f.value })),
              ]}
              allCopyText={`${item.name} (${item.period})\n전체학점: ${item.gpa_total} / 전공학점: ${item.gpa_major}\n이수학점: ${item.credits_total} / 전공이수: ${item.credits_major}\n장학금: ${item.scholarship}`}
              onEdit={() => openEdit(item)}
              onDelete={() => onDelete(item.id)}
              footer={
                <FileSection item={item} uploading={uploading[item.id]}
                  onUpload={(file) => uploadFile(item, file)}
                  onDelete={() => handleFileDelete(item)}
                  accent={accent} theme={theme} />
              }
            />
            {editingId === item.id && (
              <FormBox draft={draft} setDraft={setDraft}
                fields={[
                  ["학교명",   "name"],
                  ["재학기간", "period"],
                  ["전체학점", "gpa_total"],
                  ["전공학점", "gpa_major"],
                  ["이수학점", "credits_total"],
                  ["전공이수", "credits_major"],
                  ["장학금",   "scholarship"],
                ]}
                onSave={handleSave} onClose={close} accent={accent} theme={theme}
                formFile={formFile} setFormFile={setFormFile} />
            )}
          </div>
        ))
      }
    </div>
  );
}

function FileSection({ item, uploading, onUpload, onDelete, accent, theme }) {
  const border = theme?.border || "#2e3350";
  const textMut = theme?.textMut || "#7a80a0";

  const handleDownload = () => {
    if (window.electronAPI) window.electronAPI.downloadFile(item.fileUrl, item.fileName);
    else window.open(item.fileUrl, "_blank");
  };

  return (
    <div style={{ borderTop: `1px solid ${border}`, padding: "8px 10px",
      display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "11px", color: textMut, flexShrink: 0 }}>📎 파일</span>
      {item.fileUrl ? (
        <>
          <button onClick={handleDownload} style={{
            fontSize: "11px", color: accent, flex: 1, background: "transparent",
            border: "none", textAlign: "left", cursor: "pointer", padding: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>⬇ {item.fileName}</button>
          <button onClick={onDelete} style={{
            background: "#f87171", color: "#fff", border: "none",
            borderRadius: "5px", padding: "3px 8px", fontSize: "11px",
            fontWeight: 600, cursor: "pointer", flexShrink: 0,
          }}>삭제</button>
        </>
      ) : (
        <label style={{
          background: uploading ? (theme?.surface2 || "#22263a") : accent,
          color: "#fff", borderRadius: "5px", padding: "3px 10px",
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