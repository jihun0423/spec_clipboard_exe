import { useState } from "react";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";

const EMPTY = { name: "", period: "", grade: "", score: "", credits: "", desc: "" };

export default function CourseTab({ data, loading, accent, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(null);
  const [draft, setDraft] = useState(EMPTY);

  const openAdd = () => { setDraft(EMPTY); setForm("add"); };
  const openEdit = (item) => { setDraft(item); setForm(item.id); };
  const close = () => { setForm(null); setDraft(EMPTY); };

  const handleSave = async () => {
    if (!draft.name) return;
    if (form === "add") await onAdd(draft);
    else await onUpdate(form, draft);
    close();
  };

  return (
    <div>
      <button onClick={openAdd} style={{
        width: "100%", background: accent, color: "#fff", border: "none",
        borderRadius: "8px", padding: "8px", fontSize: "12px",
        fontWeight: 600, cursor: "pointer", marginBottom: "8px",
      }}>+ 교육사항 추가</button>

      {form && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[
            ["과목명",   "name"],
            ["수강기간", "period"],
            ["성적",     "grade"],
            ["평점",     "score"],
            ["학점",     "credits"],
            ["내용",     "desc"],
          ]}
          onSave={handleSave} onClose={close} accent={accent} />
      )}

      {loading ? <p style={{ color: "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <CardItem key={item.id}
            title={item.name}
            subtitle={`${item.period} · ${item.grade}(${item.score}) / ${item.credits}학점`}
            accent={accent}
            fields={[
              { label: "과목명",   value: item.name },
              { label: "수강기간", value: item.period },
              { label: "성적",     value: item.grade },
              { label: "평점",     value: item.score },
              { label: "학점",     value: item.credits },
              { label: "내용",     value: item.desc },
            ]}
            allCopyText={`${item.name} (${item.period}) 성적: ${item.grade}(${item.score}점) ${item.credits}학점\n${item.desc}`}
            onEdit={() => openEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))
      }
    </div>
  );
}