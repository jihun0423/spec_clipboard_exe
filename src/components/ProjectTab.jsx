import { useState } from "react";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";

const EMPTY = { name: "", period: "", stack: "", role: "", goal: "", result: "", desc: "", url: "" };

export default function ProjectTab({ data, loading, accent, onAdd, onUpdate, onDelete }) {
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
      }}>+ 프로젝트 추가</button>

      {form && (
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
          onSave={handleSave} onClose={close} accent={accent} />
      )}

      {loading ? <p style={{ color: "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <CardItem key={item.id}
            title={item.name}
            subtitle={`${item.period} · ${item.stack}`}
            accent={accent}
            fields={[
              { label: "프로젝트명", value: item.name },
              { label: "기간",       value: item.period },
              { label: "기술스택",   value: item.stack },
              { label: "역할",       value: item.role },
              { label: "목표",       value: item.goal },
              { label: "성과",       value: item.result },
              { label: "진행내용",   value: item.desc },
              { label: "URL",        value: item.url },
            ]}
            allCopyText={`[${item.name}]\n기간: ${item.period}\n기술스택: ${item.stack}\n역할: ${item.role}\n목표: ${item.goal}\n성과: ${item.result}\n내용: ${item.desc}\nURL: ${item.url}`}
            onEdit={() => openEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))
      }
    </div>
  );
}