import { useState } from "react";
import { FormBox } from "./CertTab";

const PERSONAL_FIELDS = [
  ["이름(한국어)",     "name_ko"],
  ["이름(영어)",       "name_en"],
  ["이름(한자)",       "name_hanja"],
  ["생일",             "birthday"],
  ["성별",             "gender"],
  ["핸드폰",           "phone"],
  ["비상연락처",       "emergency_phone"],
  ["비상연락처 관계",  "emergency_relation"],
  ["이메일",           "email"],
  ["기본주소",         "address_main"],
  ["세부주소",         "address_detail"],
  ["우편번호",         "address_zip"],
];

const MILITARY_SELECT_FIELDS = [
  {
    label: "군필여부",
    key: "military_done",
    options: ["군필", "미필", "면제", "해당없음"],
  },
  {
    label: "군별",
    key: "military_branch",
    options: ["육군", "해군", "공군", "해병대", "의무경찰", "사회복무요원", "산업기능요원", "기타", "해당없음"],
  },
  {
    label: "계급",
    key: "military_rank",
    options: ["이병", "일병", "상병", "병장", "하사", "중사", "상사", "원사", "해당없음"],
  },
  {
    label: "전역사유",
    key: "military_reason",
    options: ["만기전역", "의병전역", "소집해제", "해당없음"],
  },
];

const MILITARY_TEXT_FIELDS = [
  ["병과", "military_branch_detail"],
  ["기간", "military_period"],
];

const PERSONAL_EMPTY = Object.fromEntries(PERSONAL_FIELDS.map(([, k]) => [k, ""]));
const MILITARY_EMPTY = {
  military_done: "",
  military_branch: "",
  military_branch_detail: "",
  military_rank: "",
  military_reason: "",
  military_period: "",
};

export default function BasicTab({ data, loading, accent, onAdd, onUpdate, onDelete, theme }) {
  const [activeSection, setActiveSection] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [expanded, setExpanded] = useState({ personal: true, military: true });

  const personalItem = (data || []).find(d => d._type === "personal");
  const militaryItem = (data || []).find(d => d._type === "military");

  const toggleExpand = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const openEdit = (item, section) => {
    setDraft(item);
    setActiveSection(section);
    setEditingId(item.id);
    setFormFile(null);
  };

  const close = () => {
    setDraft({});
    setActiveSection(null);
    setEditingId(null);
    setFormFile(null);
  };

  const handleSave = async (type) => {
    if (editingId) {
      await onUpdate(editingId, draft);
    } else {
      await onAdd({ ...draft, _type: type });
    }
    close();
  };

  const openAdd = (type) => {
    if (type === "personal") setDraft({ ...PERSONAL_EMPTY, _type: "personal" });
    else setDraft({ ...MILITARY_EMPTY, _type: "military" });
    setActiveSection(type);
    setEditingId(null);
    setFormFile(null);
  };

  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";

  const SectionHeader = ({ title, hasItem, onEdit, onAddClick, expandKey }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: "6px", marginTop: "12px",
    }}>
      <div onClick={() => toggleExpand(expandKey)} style={{
        display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", flex: 1,
      }}>
        <span style={{ fontSize: "10px", color: textMut,
          transform: expanded[expandKey] ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.15s", display: "inline-block" }}>▶</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: text }}>{title}</span>
      </div>
      {hasItem ? (
        <button onClick={onEdit} style={{
          background: surface2, color: textMut, border: "none",
          borderRadius: "6px", padding: "3px 10px", fontSize: "11px",
          fontWeight: 600, cursor: "pointer",
        }}>✎ 수정</button>
      ) : (
        <button onClick={onAddClick} style={{
          background: accent, color: "#fff", border: "none",
          borderRadius: "6px", padding: "3px 10px", fontSize: "11px",
          fontWeight: 600, cursor: "pointer",
        }}>+ 추가</button>
      )}
    </div>
  );

  const InfoGrid = ({ item, fields, selectFields }) => (
    <div style={{ background: surface, border: `1px solid ${border}`,
      borderRadius: "10px", overflow: "hidden", marginBottom: "4px" }}>
      {fields && fields.map(([label, key]) => item[key] ? (
        <FieldRow key={key} label={label} value={item[key]} accent={accent} theme={theme} />
      ) : null)}
      {selectFields && selectFields.map(({ label, key }) => item[key] ? (
        <FieldRow key={key} label={label} value={item[key]} accent={accent} theme={theme} />
      ) : null)}
      {(item.customFields || []).map((f, i) => (
        <FieldRow key={"cf" + i} label={f.label} value={f.value} accent={accent} theme={theme} />
      ))}
    </div>
  );

  if (loading) return <p style={{ color: textMut, fontSize: "12px" }}>로딩 중...</p>;

  return (
    <div style={{ padding: "4px" }}>

      {/* 인적사항 */}
      <SectionHeader
        title="👤 인적사항"
        hasItem={!!personalItem}
        onEdit={() => openEdit(personalItem, "personal")}
        onAddClick={() => openAdd("personal")}
        expandKey="personal"
      />
      {expanded.personal && activeSection === "personal" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={PERSONAL_FIELDS}
          onSave={() => handleSave("personal")}
          onClose={close}
          accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile} />
      )}
      {expanded.personal && personalItem && activeSection !== "personal" && (
        <InfoGrid item={personalItem} fields={PERSONAL_FIELDS} />
      )}

      {/* 병역사항 */}
      <SectionHeader
        title="🪖 병역사항"
        hasItem={!!militaryItem}
        onEdit={() => openEdit(militaryItem, "military")}
        onAddClick={() => openAdd("military")}
        expandKey="military"
      />
      {expanded.military && activeSection === "military" && (
        <FormBox draft={draft} setDraft={setDraft}
          fields={MILITARY_TEXT_FIELDS}
          selectFields={MILITARY_SELECT_FIELDS}
          onSave={() => handleSave("military")}
          onClose={close}
          accent={accent} theme={theme}
          formFile={formFile} setFormFile={setFormFile} />
      )}
      {expanded.military && militaryItem && activeSection !== "military" && (
        <InfoGrid
          item={militaryItem}
          fields={MILITARY_TEXT_FIELDS}
          selectFields={MILITARY_SELECT_FIELDS}
        />
      )}

    </div>
  );
}

function FieldRow({ label, value, accent, theme }) {
  const [copied, setCopied] = useState(false);
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div onClick={handleCopy} style={{
      display: "flex", alignItems: "center", gap: "8px",
      background: copied ? "rgba(52,211,153,0.08)" : surface2,
      borderBottom: `1px solid ${border}`,
      padding: "7px 10px", cursor: "pointer",
    }}>
      <span style={{ fontSize: "11px", color: textMut, width: "80px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "12px", color: text, flex: 1 }}>{value}</span>
      <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} style={{
        background: "transparent", color: copied ? "#34d399" : accent,
        border: "none", fontSize: "11px", fontWeight: 600,
        cursor: "pointer", flexShrink: 0,
      }}>{copied ? "✓" : "복사"}</button>
    </div>
  );
}