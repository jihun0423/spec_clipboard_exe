import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";
import FileSection from "./FileSection";

const EMPTY = {
  name: "", period: "", gpa_total: "", gpa_major: "",
  credits_total: "", credits_major: "", scholarship: "",
  double_major: "", location: "", day_night: "", campus: ""
};

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
            ["복수전공", "double_major"],
            ["소재지",   "location"],
            ["주/야",    "day_night"],
            ["본교/분교","campus"],
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
                { label: "복수전공", value: item.double_major },
                { label: "소재지",   value: item.location },
                { label: "주/야",    value: item.day_night },
                { label: "본교/분교",value: item.campus },
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
                  ["복수전공", "double_major"],
                  ["소재지",   "location"],
                  ["주/야",    "day_night"],
                  ["본교/분교","campus"],
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
