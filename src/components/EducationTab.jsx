import { useState } from "react";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";

const EMPTY = { name: "", period: "", gpa_total: "", gpa_major: "", credits_total: "", credits_major: "", scholarship: "" };

export default function EducationTab({ data, loading, accent, onAdd, onUpdate, onDelete }) {
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
      }}>+ 학력 추가</button>

      {form && (
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
          onSave={handleSave} onClose={close} accent={accent} />
      )}

      {loading ? <p style={{ color: "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <CardItem key={item.id}
            title={item.name}
            subtitle={item.period}
            accent={accent}
            fields={[
              { label: "학교명",   value: item.name },
              { label: "재학기간", value: item.period },
              { label: "전체학점", value: item.gpa_total },
              { label: "전공학점", value: item.gpa_major },
              { label: "이수학점", value: item.credits_total },
              { label: "전공이수", value: item.credits_major },
              { label: "장학금",   value: item.scholarship },
            ]}
            allCopyText={`${item.name} (${item.period})\n전체학점: ${item.gpa_total} / 전공학점: ${item.gpa_major}\n이수학점: ${item.credits_total} / 전공이수: ${item.credits_major}\n장학금: ${item.scholarship}`}
            onEdit={() => openEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))
      }
    </div>
  );
}