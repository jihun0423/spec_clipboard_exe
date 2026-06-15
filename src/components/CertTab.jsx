import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import CardItem from "./CardItem";

const EMPTY = { name: "", number: "", date: "", issuer: "" };

export default function CertTab({ data, loading, accent, onAdd, onUpdate, onDelete, uid, theme }) {
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
      const fileRef = ref(storage, `users/${uid}/certs/${item.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: url, fileName: file.name });
    } catch (e) { console.error(e); }
    setUploading(prev => ({ ...prev, [item.id]: false }));
  };

  const handleFileDelete = async (item) => {
    if (!item.fileUrl) return;
    try {
      const fileRef = ref(storage, `users/${uid}/certs/${item.id}/${item.fileName}`);
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
      }}>+ 자격증 추가</button>

      {form === "add" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[["자격증명","name"],["번호","number"],["취득일","date"],["발급기관","issuer"]]}
          onSave={handleSave} onClose={close} accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile} />
      )}

      {loading ? <p style={{ color: theme?.textMut || "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <div key={item.id}>
            <CardItem
              title={item.name}
              subtitle={`${item.issuer} · ${item.date}`}
              accent={accent} theme={theme}
              fields={[
                { label: "자격증명", value: item.name },
                { label: "번호",     value: item.number },
                { label: "취득일",   value: item.date },
                { label: "발급기관", value: item.issuer },
                ...(item.customFields || []).map(f => ({ label: f.label, value: f.value })),
              ]}
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
                fields={[["자격증명","name"],["번호","number"],["취득일","date"],["발급기관","issuer"]]}
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
          <input type="file" accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={(e) => onUpload(e.target.files[0])}
            disabled={uploading} />
        </label>
      )}
    </div>
  );
}

export function FormBox({ draft, setDraft, fields, onSave, onClose, accent, theme, formFile, setFormFile, selectFields }) {
  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";

  const customFields = draft.customFields || [];

  const addCustomField = () => {
    setDraft({ ...draft, customFields: [...customFields, { label: "", value: "" }] });
  };

  const updateCustomField = (idx, key, val) => {
    const updated = customFields.map((f, i) => i === idx ? { ...f, [key]: val } : f);
    setDraft({ ...draft, customFields: updated });
  };

  const removeCustomField = (idx) => {
    setDraft({ ...draft, customFields: customFields.filter((_, i) => i !== idx) });
  };

  return (
    <div style={{ background: surface, border: `1px solid ${accent}`,
      borderRadius: "10px", padding: "12px", marginBottom: "8px" }}>

      {fields.map(([label, key]) => (
        <div key={key} style={{ display: "flex", alignItems: "center",
          gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", color: textMut, width: "52px", flexShrink: 0 }}>{label}</span>
          <input value={draft[key] || ""} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            style={{ flex: 1, background: surface2, border: `1px solid ${border}`,
              borderRadius: "6px", padding: "5px 8px", fontSize: "12px",
              color: text, outline: "none" }} />
        </div>
      ))}

      {selectFields && selectFields.map(({ label, key, options }) => (
        <div key={key} style={{ display: "flex", alignItems: "center",
          gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", color: textMut, width: "52px", flexShrink: 0 }}>{label}</span>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {options.map(opt => (
              <button key={opt} onClick={() => setDraft({ ...draft, [key]: draft[key] === opt ? "" : opt })} style={{
                background: draft[key] === opt ? accent : surface2,
                color: draft[key] === opt ? "#fff" : textMut,
                border: "none", borderRadius: "6px", padding: "4px 10px",
                fontSize: "11px", fontWeight: 600, cursor: "pointer",
              }}>{opt}</button>
            ))}
          </div>
        </div>
      ))}

      {customFields.map((f, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center",
          gap: "6px", marginBottom: "6px" }}>
          <input placeholder="항목명" value={f.label}
            onChange={(e) => updateCustomField(idx, "label", e.target.value)}
            style={{ width: "72px", flexShrink: 0, background: surface2,
              border: `1px solid ${border}`, borderRadius: "6px",
              padding: "5px 8px", fontSize: "11px", color: text, outline: "none" }} />
          <input placeholder="값" value={f.value}
            onChange={(e) => updateCustomField(idx, "value", e.target.value)}
            style={{ flex: 1, background: surface2, border: `1px solid ${border}`,
              borderRadius: "6px", padding: "5px 8px", fontSize: "12px",
              color: text, outline: "none" }} />
          <button onClick={() => removeCustomField(idx)} style={{
            background: "#f87171", color: "#fff", border: "none",
            borderRadius: "5px", padding: "3px 7px", fontSize: "12px",
            cursor: "pointer", flexShrink: 0,
          }}>✕</button>
        </div>
      ))}

      <button onClick={addCustomField} style={{
        width: "100%", background: "transparent",
        color: accent, border: `1px dashed ${accent}`,
        borderRadius: "6px", padding: "5px", fontSize: "11px",
        fontWeight: 600, cursor: "pointer", marginBottom: "8px",
      }}>+ 항목 추가</button>

      {setFormFile && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", color: textMut, width: "52px", flexShrink: 0 }}>📎 파일</span>
          {formFile ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: text, flex: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formFile.name}
              </span>
              <button onClick={() => setFormFile(null)} style={{
                background: "#f87171", color: "#fff", border: "none",
                borderRadius: "5px", padding: "2px 6px", fontSize: "11px",
                cursor: "pointer", flexShrink: 0,
              }}>✕</button>
            </div>
          ) : (
            <label style={{
              background: surface2, color: accent, border: `1px solid ${border}`,
              borderRadius: "6px", padding: "4px 10px", fontSize: "11px",
              fontWeight: 600, cursor: "pointer",
            }}>
              📤 파일 선택
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.zip,.docx,.xlsx"
                style={{ display: "none" }}
                onChange={(e) => setFormFile(e.target.files[0])} />
            </label>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <button onClick={onSave} style={{
          flex: 1, background: accent, color: "#fff", border: "none",
          borderRadius: "6px", padding: "6px", fontSize: "12px",
          fontWeight: 600, cursor: "pointer",
        }}>저장</button>
        <button onClick={onClose} style={{
          flex: 1, background: surface2, color: textMut, border: "none",
          borderRadius: "6px", padding: "6px", fontSize: "12px",
          fontWeight: 600, cursor: "pointer",
        }}>취소</button>
      </div>
    </div>
  );
}