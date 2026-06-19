import { useState } from "react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";
import FileSection from "./FileSection";

const PRESET_CATEGORIES = [
  { key: "cooperation",  label: "🤝 협업능력",  color: "#5b6cff" },
  { key: "conflict",     label: "⚡ 갈등해결",  color: "#f87171" },
  { key: "problem",      label: "🔧 문제해결",  color: "#f59e0b" },
  { key: "leadership",   label: "👑 리더십",    color: "#a78bfa" },
  { key: "responsibility", label: "💪 책임감",  color: "#34d399" },
];

const EMPTY = { title: "", content: "" };

export default function FreeTab({ data, loading, accent, onAdd, onUpdate, onDelete, uid, theme }) {
  const [form, setForm] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [uploading, setUploading] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";

  const openAdd = (presetTitle = "") => {
    setDraft({ ...EMPTY, title: presetTitle });
    setForm("add");
    setFormFile(null);
    setEditingId(null);
  };
  const openEdit = (item) => { setDraft(item); setForm(item.id); setFormFile(null); setEditingId(item.id); };
  const close = () => { setForm(null); setDraft(EMPTY); setFormFile(null); setEditingId(null); };

  const handleSave = async () => {
    if (!draft.title) return;
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
      const fileRef = ref(storage, `users/${uid}/free/${item.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: url, fileName: file.name });
    } catch (e) { console.error(e); }
    setUploading(prev => ({ ...prev, [item.id]: false }));
  };

  const handleFileDelete = async (item) => {
    if (!item.fileUrl) return;
    try {
      const fileRef = ref(storage, `users/${uid}/free/${item.id}/${item.fileName}`);
      await deleteObject(fileRef);
      await onUpdate(item.id, { ...item, fileUrl: null, fileName: null });
    } catch (e) { console.error(e); }
  };

  // 카테고리 필터링
  const filteredData = activeCategory === "all"
    ? (data || [])
    : activeCategory === "etc"
    ? (data || []).filter(item => !PRESET_CATEGORIES.some(p => item.title === p.label))
    : (data || []).filter(item => {
        const preset = PRESET_CATEGORIES.find(p => p.key === activeCategory);
        return preset && item.title === preset.label;
      });

  const getItemAccent = (item) => {
    const preset = PRESET_CATEGORIES.find(p => p.label === item.title);
    return preset?.color || accent;
  };

  return (
    <div>
      {/* 자소서 프리셋 버튼 */}
      <div style={{ background: surface, border: `1px solid ${border}`,
        borderRadius: "10px", padding: "10px", marginBottom: "8px" }}>
        <div style={{ fontSize: "11px", color: textMut, fontWeight: 700,
          marginBottom: "8px" }}>✍️ 자기소개서 항목</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {PRESET_CATEGORIES.map(cat => {
            const exists = (data || []).some(d => d.title === cat.label);
            return (
              <button key={cat.key}
                onClick={() => !exists && openAdd(cat.label)}
                style={{
                  background: exists ? "rgba(52,211,153,0.1)" : cat.color,
                  color: exists ? "#34d399" : "#fff",
                  border: exists ? "1px solid #34d399" : "none",
                  borderRadius: "6px", padding: "5px 10px",
                  fontSize: "11px", fontWeight: 600,
                  cursor: exists ? "default" : "pointer",
                }}>
                {exists ? "✓ " : ""}{cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 일반 추가 버튼 */}
      <button onClick={() => openAdd()} style={{
        width: "100%", background: accent, color: "#fff", border: "none",
        borderRadius: "8px", padding: "8px", fontSize: "12px",
        fontWeight: 600, cursor: "pointer", marginBottom: "8px",
      }}>+ 항목 추가</button>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "8px",
        overflowX: "auto", scrollbarWidth: "none" }}>
        {[
          { key: "all", label: "전체" },
          ...PRESET_CATEGORIES,
          { key: "etc", label: "기타" },
        ].map(cat => (
          <button key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              background: activeCategory === cat.key ? accent : surface2,
              color: activeCategory === cat.key ? "#fff" : textMut,
              border: "none", borderRadius: "6px", padding: "4px 10px",
              fontSize: "11px", fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>{cat.label}</button>
        ))}
      </div>

      {/* 추가 폼 */}
      {form === "add" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[["제목", "title"]]}
          onSave={handleSave} onClose={close} accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile}
          textAreaField={{ key: "content", label: "내용" }}
        />
      )}

      {loading ? <p style={{ color: textMut, fontSize: "12px" }}>로딩 중...</p> :
        filteredData.map((item) => (
          <div key={item.id}>
            <CardItem
              title={item.title}
              subtitle={item.content?.slice(0, 40) + (item.content?.length > 40 ? "..." : "")}
              accent={getItemAccent(item)} theme={theme}
              fields={[
                { label: "제목", value: item.title },
                { label: "내용", value: item.content },
                ...(item.customFields || []).map(f => ({ label: f.label, value: f.value })),
              ]}
              allCopyText={`${item.title}\n${item.content}`}
              onEdit={() => openEdit(item)}
              onDelete={() => onDelete(item.id)}
              footer={
                <FileSection item={item} uploading={uploading[item.id]}
                  onUpload={(file) => uploadFile(item, file)}
                  onDelete={() => handleFileDelete(item)}
                  accent={getItemAccent(item)} theme={theme} />
              }
            />
            {editingId === item.id && (
              <FormBox draft={draft} setDraft={setDraft}
                fields={[["제목", "title"]]}
                onSave={handleSave} onClose={close} accent={getItemAccent(item)} theme={theme}
                formFile={formFile} setFormFile={setFormFile}
                textAreaField={{ key: "content", label: "내용" }}
              />
            )}
          </div>
        ))
      }
    </div>
  );
}
