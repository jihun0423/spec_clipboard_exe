import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";
import FileSection from "./FileSection";

const EMPTY = { name: "", period: "", stack: "", role: "", goal: "", result: "", desc: "", url: "" };

export default function ProjectTab({ data, loading, accent, onAdd, onUpdate, onDelete, uid, theme }) {
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
      const fileRef = ref(storage, `users/${uid}/projects/${item.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: url, fileName: file.name });
    } catch (e) { console.error(e); }
    setUploading(prev => ({ ...prev, [item.id]: false }));
  };

  const handleFileDelete = async (item) => {
    if (!item.fileUrl) return;
    try {
      const fileRef = ref(storage, `users/${uid}/projects/${item.id}/${item.fileName}`);
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
      }}>+ 프로젝트 추가</button>

      {form === "add" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[
            ["프로젝트명", "name"],
            ["기간",       "period"],
            ["기술스택",   "stack"],
            ["역할",       "role"],
            ["목표",       "goal"],
            ["성과",       "result"],
            ["진행내용",   "desc"],
            ["URL",        "url"],
          ]}
          onSave={handleSave} onClose={close} accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile} />
      )}

      {loading ? <p style={{ color: theme?.textMut || "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <div key={item.id}>
            <CardItem
              title={item.name}
              subtitle={`${item.period} · ${item.stack}`}
              accent={accent} theme={theme}
              fields={[
                { label: "프로젝트명", value: item.name },
                { label: "기간",       value: item.period },
                { label: "기술스택",   value: item.stack },
                { label: "역할",       value: item.role },
                { label: "목표",       value: item.goal },
                { label: "성과",       value: item.result },
                { label: "진행내용",   value: item.desc },
                { label: "URL",        value: item.url },
                ...(item.customFields || []).map(f => ({ label: f.label, value: f.value })),
              ]}
              allCopyText={`[${item.name}]\n기간: ${item.period}\n기술스택: ${item.stack}\n역할: ${item.role}\n목표: ${item.goal}\n성과: ${item.result}\n내용: ${item.desc}\nURL: ${item.url}`}
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
                  ["프로젝트명", "name"],
                  ["기간",       "period"],
                  ["기술스택",   "stack"],
                  ["역할",       "role"],
                  ["목표",       "goal"],
                  ["성과",       "result"],
                  ["진행내용",   "desc"],
                  ["URL",        "url"],
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
