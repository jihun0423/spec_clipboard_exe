import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";
import FileSection from "./FileSection";

const EMPTY = { org: "", dept: "", position: "", type: "", period: "", desc: "", retire_reason: "" };

export default function CareerTab({ data, loading, accent, onAdd, onUpdate, onDelete, uid, theme }) {
  const [form, setForm] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [uploading, setUploading] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const openAdd = () => { setDraft(EMPTY); setForm("add"); setFormFile(null); setEditingId(null); };
  const openEdit = (item) => { setDraft(item); setForm(item.id); setFormFile(null); setEditingId(item.id); };
  const close = () => { setForm(null); setDraft(EMPTY); setFormFile(null); setEditingId(null); };

  const handleSave = async () => {
    if (!draft.org) return;
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
      const fileRef = ref(storage, `users/${uid}/career/${item.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: url, fileName: file.name });
    } catch (e) { console.error(e); }
    setUploading(prev => ({ ...prev, [item.id]: false }));
  };

  const handleFileDelete = async (item) => {
    if (!item.fileUrl) return;
    try {
      const fileRef = ref(storage, `users/${uid}/career/${item.id}/${item.fileName}`);
      await deleteObject(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: null, fileName: null });
    } catch (e) { console.error(e); }
  };

  const CAREER_FIELDS = [
    ["기관명",     "org"],
    ["부서",       "dept"],
    ["직급",       "position"],
    ["구분",       "type"],
    ["기간",       "period"],
    ["업무내용",   "desc"],
    ["퇴직사유",   "retire_reason"],
  ];

  return (
    <div>
      <button onClick={openAdd} style={{
        width: "100%", background: accent, color: "#fff", border: "none",
        borderRadius: "8px", padding: "8px", fontSize: "12px",
        fontWeight: 600, cursor: "pointer", marginBottom: "8px",
      }}>+ 경력/봉사 추가</button>

      {form === "add" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={CAREER_FIELDS}
          onSave={handleSave} onClose={close} accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile} />
      )}

      {loading ? <p style={{ color: theme?.textMut || "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <div key={item.id}>
            <CardItem
              title={`[${item.type}] ${item.org}`}
              subtitle={`${item.dept ? item.dept + " · " : ""}${item.position ? item.position + " · " : ""}${item.period}`}
              accent={accent} theme={theme}
              fields={[
                { label: "기관명",   value: item.org },
                { label: "부서",     value: item.dept },
                { label: "직급",     value: item.position },
                { label: "구분",     value: item.type },
                { label: "기간",     value: item.period },
                { label: "업무내용", value: item.desc },
                { label: "퇴직사유", value: item.retire_reason },
                ...(item.customFields || []).map(f => ({ label: f.label, value: f.value })),
              ]}
              allCopyText={`${item.org}${item.dept ? " " + item.dept : ""}${item.position ? " " + item.position : ""} (${item.type}) ${item.period}\n${item.desc}`}
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
                fields={CAREER_FIELDS}
                onSave={handleSave} onClose={close} accent={accent} theme={theme}
                formFile={formFile} setFormFile={setFormFile} />
            )}
          </div>
        ))
      }
    </div>
  );
}
