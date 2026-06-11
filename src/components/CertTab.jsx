import { useState } from "react";
import CardItem from "./CardItem";

const EMPTY = { name: "", number: "", date: "", issuer: "" };

export default function CertTab({ data, loading, accent, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(null); // null=닫힘, {}=추가, {id,...}=수정
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
      }}>+ 자격증 추가</button>

      {form && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={[["자격증명","name"],["번호","number"],["취득일","date"],["발급기관","issuer"]]}
          onSave={handleSave} onClose={close} accent={accent} />
      )}

      {loading ? <p style={{ color: "#7a80a0", fontSize: "12px" }}>로딩 중...</p> :
        data.map((item) => (
          <CardItem key={item.id}
            title={item.name}
            subtitle={`${item.issuer} · ${item.date}`}
            accent={accent}
            fields={[
              { label: "자격증명", value: item.name },
              { label: "번호",    value: item.number },
              { label: "취득일",  value: item.date },
              { label: "발급기관",value: item.issuer },
            ]}
            onEdit={() => openEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))
      }
    </div>
  );
}

export function FormBox({ draft, setDraft, fields, onSave, onClose, accent }) {
  return (
    <div style={{ background: "#1a1d27", border: `1px solid ${accent}`,
      borderRadius: "10px", padding: "12px", marginBottom: "8px" }}>
      {fields.map(([label, key]) => (
        <div key={key} style={{ display: "flex", alignItems: "center",
          gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", color: "#7a80a0", width: "52px", flexShrink: 0 }}>
            {label}
          </span>
          <input value={draft[key] || ""} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            style={{ flex: 1, background: "#22263a", border: "1px solid #2e3350",
              borderRadius: "6px", padding: "5px 8px", fontSize: "12px",
              color: "#e8eaf0", outline: "none" }} />
        </div>
      ))}
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <button onClick={onSave} style={{
          flex: 1, background: accent, color: "#fff", border: "none",
          borderRadius: "6px", padding: "6px", fontSize: "12px",
          fontWeight: 600, cursor: "pointer",
        }}>저장</button>
        <button onClick={onClose} style={{
          flex: 1, background: "#22263a", color: "#7a80a0", border: "none",
          borderRadius: "6px", padding: "6px", fontSize: "12px",
          fontWeight: 600, cursor: "pointer",
        }}>취소</button>
      </div>
    </div>
  );
}