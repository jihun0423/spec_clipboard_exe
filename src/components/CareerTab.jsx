import { useState } from "react";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";

const EMPTY = { org: "", type: "", period: "", desc: "" };

export default function CareerTab({ data, loading, accent, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(null);
  const [draft, setDraft] = useState(EMPTY);

  const openAdd = () => { setDraft(EMPTY); setForm("add"); };
  const openEdit = (item) => { setDraft(item); setForm(item.id); };
  const close = () => { setForm(null); setDraft(EMPTY); };

  const handleSave = async () => {
    if (!draft.org) return;
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
      }}>+ 경력/봉사 추가</button>

      {form && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[
            ["기관명",   "org"],
            ["구분",     "type"],
            ["기간",     "period"],
            ["업무내용", "desc"],
          ]}
          onSave={handleSave} onClose={close} accent={accent} />
      )}

      {loading ? <p style={{ color: "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <CardItem key={item.id}
            title={`[${item.type}] ${item.org}`}
            subtitle={item.period}
            accent={accent}
            fields={[
              { label: "기관명",   value: item.org },
              { label: "구분",     value: item.type },
              { label: "기간",     value: item.period },
              { label: "업무내용", value: item.desc },
            ]}
            allCopyText={`${item.org} (${item.type}) ${item.period}\n${item.desc}`}
            onEdit={() => openEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))
      }
    </div>
  );
}