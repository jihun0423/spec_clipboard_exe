import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";
import FileSection from "./FileSection";

const EMPTY = { name: "", period: "", category: "", grade: "", score: "", credits: "", desc: "" };

export default function CourseTab({ data, loading, accent, onAdd, onUpdate, onDelete, uid, theme }) {
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
      const fileRef = ref(storage, `users/${uid}/coursework/${item.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: url, fileName: file.name });
    } catch (e) { console.error(e); }
    setUploading(prev => ({ ...prev, [item.id]: false }));
  };

  const handleFileDelete = async (item) => {
    if (!item.fileUrl) return;
    try {
      const fileRef = ref(storage, `users/${uid}/coursework/${item.id}/${item.fileName}`);
      await deleteObject(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: null, fileName: null });
    } catch (e) { console.error(e); }
  };

  const COURSE_FIELDS = [
    ["과목명",   "name"],
    ["수강기간", "period"],
    ["성적",     "grade"],
    ["평점",     "score"],
    ["학점",     "credits"],
    ["내용",     "desc"],
  ];

  const SELECT_FIELDS = [
    {
      label: "이수구분",
      key: "category",
      options: ["전공필수", "전공선택", "교양", "기타"],
    }
  ];

  return (
    <div>
      <button onClick={openAdd} style={{
        width: "100%", background: accent, color: "#fff", border: "none",
        borderRadius: "8px", padding: "8px", fontSize: "12px",
        fontWeight: 600, cursor: "pointer", marginBottom: "8px",
      }}>+ 교육사항 추가</button>

      {form === "add" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={COURSE_FIELDS}
          selectFields={SELECT_FIELDS}
          onSave={handleSave} onClose={close} accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile} />
      )}

      {loading ? <p style={{ color: theme?.textMut || "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <div key={item.id}>
            <CardItem
              title={item.name}
              subtitle={`${item.category ? "[" + item.category + "] " : ""}${item.period} · ${item.grade}(${item.score}) / ${item.credits}학점`}
              accent={accent} theme={theme}
              fields={[
                { label: "과목명",   value: item.name },
                { label: "이수구분", value: item.category },
                { label: "수강기간", value: item.period },
                { label: "성적",     value: item.grade },
                { label: "평점",     value: item.score },
                { label: "학점",     value: item.credits },
                { label: "내용",     value: item.desc },
                ...(item.customFields || []).map(f => ({ label: f.label, value: f.value })),
              ]}
              allCopyText={`${item.name}${item.category ? " [" + item.category + "]" : ""} (${item.period}) 성적: ${item.grade}(${item.score}점) ${item.credits}학점\n${item.desc}`}
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
                fields={COURSE_FIELDS}
                selectFields={SELECT_FIELDS}
                onSave={handleSave} onClose={close} accent={accent} theme={theme}
                formFile={formFile} setFormFile={setFormFile} />
            )}
          </div>
        ))
      }
    </div>
  );
}
