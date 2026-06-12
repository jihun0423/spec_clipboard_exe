import { useState } from "react";
import CardItem from "./CardItem";
import { FormBox } from "./CertTab";

const EMPTY = { label: "", value: "" };

export default function BasicTab({ data, loading, accent, onAdd, onUpdate, onDelete, theme }) {
  const [form, setForm] = useState(null);
  const [draft, setDraft] = useState(EMPTY);

  const openAdd = () => { setDraft(EMPTY); setForm("add"); };
  const openEdit = (item) => { setDraft(item); setForm(item.id); };
  const close = () => { setForm(null); setDraft(EMPTY); };

  const handleSave = async () => {
    if (!draft.label) return;
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
      }}>+ 항목 추가</button>

      {form && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[["항목명", "label"], ["값", "value"]]}
          onSave={handleSave} onClose={close} accent={accent} theme={theme} />
      )}

      {loading ? <p style={{ color: theme?.textMut || "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <CardItem key={item.id}
            title={item.label}
            subtitle={item.value}
            accent={accent}
            theme={theme}
            fields={[
              { label: "항목명", value: item.label },
              { label: "값",     value: item.value },
            ]}
            onEdit={() => openEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))
      }
    </div>
  );
}