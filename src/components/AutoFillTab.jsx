import { useState } from "react";

function buildFormPrompt(target, data) {
  const formatCustomFields = (item) => {
    if (!item.customFields || item.customFields.length === 0) return "";
    return " / " + item.customFields.map(f => `${f.label}: ${f.value}`).join(" / ");
  };

  const certs = (data.certs || []).map(c =>
    `- ${c.name} / ${c.number} / ${c.date} / ${c.issuer}${formatCustomFields(c)}`
  ).join("\n");

  const basic = (data.basic || []).map(b =>
    `- ${b.label}: ${b.value}${formatCustomFields(b)}`
  ).join("\n");

  const education = (data.education || []).map(e =>
    `- ${e.name} / ${e.period} / 총학점 ${e.gpa_total} / 전공학점 ${e.gpa_major} / 이수학점 ${e.credits_total} / 전공이수 ${e.credits_major} / 장학금 ${e.scholarship}${formatCustomFields(e)}`
  ).join("\n");

  const career = (data.career || []).map(c =>
    `- ${c.org} / ${c.type} / ${c.period}${c.dept ? " / " + c.dept : ""}${c.position ? " / " + c.position : ""} / ${c.desc}${formatCustomFields(c)}`
  ).join("\n");

  const projects = (data.projects || []).map(p =>
    `- ${p.name} / ${p.period} / ${p.stack} / 역할: ${p.role} / 목표: ${p.goal} / 성과: ${p.result} / ${p.desc}${formatCustomFields(p)}`
  ).join("\n");

  const coursework = (data.coursework || []).map(c =>
    `- ${c.name}${c.category ? " [" + c.category + "]" : ""} / ${c.period} / ${c.grade}(${c.score}) / ${c.credits}학점${formatCustomFields(c)}`
  ).join("\n");

  return `당신은 채용사이트 입력 전문 도우미입니다.
지원 목적: ${target}

아래 내 스펙 정보를 바탕으로 현재 열려있는 채용사이트 입력폼을 채워주세요.

## 중요 지침

**입력 방식**
- 일반 텍스트 입력 필드는 직접 클릭해서 타이핑하는 방식으로 입력해줘.
- 주소, 학교명, 회사명 등 "찾기" 또는 "검색" 버튼이 있는 필드는 반드시 그 버튼을 클릭해서 팝업/검색창을 통해 입력해줘. 절대 JavaScript로 값을 직접 수정하지 마.
- 날짜 선택, 카테고리 선택 등 별도 UI가 있는 경우도 해당 UI를 직접 조작해줘.
- JavaScript로 값을 직접 변경하는 방식(element.value = ...)은 절대 사용하지 마. 반드시 실제 사용자처럼 클릭하고 타이핑하는 방식으로만 입력해줘.

**팝업/알림 처리**
- 작업 중 확인 팝업이나 알림창이 뜨면 반드시 확인/닫기 버튼을 눌러줘.
- 오류 팝업도 확인 후 계속 진행해줘.

**항목 개수 제한**
- 자격증, 학력, 경력 등 여러 개를 입력할 때, 추가 버튼이 비활성화되거나 "더 이상 추가할 수 없습니다" 같은 메시지가 뜨면 즉시 멈춰줘.
- 최신순 또는 중요도 순으로 입력하고, 제한에 걸리면 나머지는 생략해줘.

**사이트 양식 준수**
- 입력 필드 근처에 형식 안내가 있으면 반드시 그 형식에 맞게 입력해줘.
- 안내가 없을 경우에만 내 데이터 형식 그대로 입력해줘.

**언어 자격증 처리**
- TOEIC, TOEIC SPEAKING, OPIc 등 어학 자격증은 사이트에 별도 어학 탭/섹션이 있으면 거기에 입력해줘.
- 어학 탭에 이미 입력했으면 일반 자격증 탭에서는 생략해줘.

**자격증 구분 처리**
- 사이트에서 자격증을 종류별로 구분하는 경우 아래 분류를 참고해줘:
  - 데이터/IT 관련: ADSP, SQLD, 빅데이터분석기사, 정보처리기사, 컴퓨터활용능력 1급, Tableau Desktop Certificate
  - 어학: TOEIC, TOEIC SPEAKING AL, OPIc IH
  - 한국사: 한국사능력검정시험 1급
- 구분이 애매하면 사이트 안내를 우선으로 판단해줘.

**드롭다운/라디오/체크박스**
- 선택 가능한 항목은 내 스펙에 맞게 최대한 선택해줘.

---

## 내 스펙 정보

[기본정보]
${basic || "없음"}

[자격증] (최신순 입력 권장)
${certs || "없음"}

[학력] (최신순 입력 권장)
${education || "없음"}

[경력/봉사] (최신순 입력 권장)
${career || "없음"}

[프로젝트]
${projects || "없음"}

[교육사항]
${coursework || "없음"}`;
}

function buildCoverLetterPrompt(target, data) {
  const formatCustomFields = (item) => {
    if (!item.customFields || item.customFields.length === 0) return "";
    return "\n  " + item.customFields.map(f => `${f.label}: ${f.value}`).join("\n  ");
  };

  const basic = (data.basic || []).map(b =>
    `- ${b.label}: ${b.value}`
  ).join("\n");

  const certs = (data.certs || []).map(c =>
    `- ${c.name} / ${c.date} / ${c.issuer}`
  ).join("\n");

  const education = (data.education || []).map(e =>
    `- ${e.name} / ${e.period} / 총학점 ${e.gpa_total} / 전공학점 ${e.gpa_major}`
  ).join("\n");

  const career = (data.career || []).map(c =>
    `- ${c.org} (${c.type}) / ${c.period}\n  업무: ${c.desc}${formatCustomFields(c)}`
  ).join("\n");

  const projects = (data.projects || []).map(p =>
    `- ${p.name} / ${p.period} / ${p.stack}\n  역할: ${p.role}\n  목표: ${p.goal}\n  성과: ${p.result}\n  내용: ${p.desc}${formatCustomFields(p)}`
  ).join("\n");

  const free = (data.free || []).map(f =>
    `[${f.title}]\n${f.content}${formatCustomFields(f)}`
  ).join("\n\n");

  return `당신은 자기소개서 작성 전문 도우미입니다.
지원 목적: ${target}

현재 페이지에 보이는 자기소개서 항목들을 아래 내 스펙과 자소서 관련 내용을 바탕으로 작성해줘.

## 작성 지침

- 각 항목의 글자수 제한을 반드시 지켜줘.
- 지원 직무(${target})와 관련된 경험을 중심으로 작성해줘.
- 구체적인 수치와 성과를 포함해줘 (예: f1-Score 0.364, RMSE 0.0476 등).
- 자연스럽고 진솔한 문체로 작성해줘.
- 항목별로 하나씩 순서대로 작성해줘.

---

## 내 스펙 정보

[기본정보]
${basic || "없음"}

[자격증]
${certs || "없음"}

[학력]
${education || "없음"}

[경력/봉사]
${career || "없음"}

[프로젝트]
${projects || "없음"}

---

## 자소서 관련 참고 내용 (자유 탭)
${free || "없음"}`;
}

export default function AutoFillTab({ data, theme }) {
  const [target, setTarget] = useState("");
  const [doForm, setDoForm] = useState(true);
  const [doCover, setDoCover] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";
  const accent = "#ec4899";

  const handleGenerate = () => {
    if (!doForm && !doCover) return;
    setCopied(false);

    let result = "";
    if (doForm && doCover) {
      result = buildFormPrompt(target, data) +
        "\n\n" + "=".repeat(50) + "\n\n" +
        buildCoverLetterPrompt(target, data);
    } else if (doForm) {
      result = buildFormPrompt(target, data);
    } else {
      result = buildCoverLetterPrompt(target, data);
    }
    setPrompt(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CheckBox = ({ checked, onChange, label }) => (
    <div
      onClick={() => onChange(!checked)}
      style={{ display: "flex", alignItems: "center", gap: "8px",
        cursor: "pointer", marginBottom: "8px" }}
    >
      <div style={{
        width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
        background: checked ? accent : surface2,
        border: `2px solid ${checked ? accent : border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: "12px", color: checked ? text : textMut, fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{ padding: "4px" }}>
      <div style={{ background: surface, border: `1px solid ${border}`,
        borderRadius: "10px", padding: "14px", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: text, marginBottom: "12px" }}>
          🤖 AI 프롬프트 생성
        </div>

        {/* 목적 입력 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", color: textMut, marginBottom: "6px" }}>지원 목적</div>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="예) 하나은행 IT직무, 국민건강보험공단 전산직..."
            style={{
              width: "100%", background: surface2,
              border: `1px solid ${border}`, borderRadius: "8px",
              padding: "8px 10px", fontSize: "12px",
              color: text, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* 체크박스 */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", color: textMut, marginBottom: "8px" }}>프롬프트 유형 선택</div>
          <CheckBox
            checked={doForm}
            onChange={setDoForm}
            label="📋 채용사이트 입력폼 자동완성"
          />
          <CheckBox
            checked={doCover}
            onChange={setDoCover}
            label="✍️ 자기소개서 작성"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!doForm && !doCover}
          style={{
            width: "100%",
            background: (!doForm && !doCover) ? surface2 : accent,
            color: (!doForm && !doCover) ? textMut : "#fff",
            border: "none", borderRadius: "8px", padding: "10px",
            fontSize: "13px", fontWeight: 700,
            cursor: (!doForm && !doCover) ? "default" : "pointer",
          }}
        >
          ✨ 프롬프트 생성
        </button>
      </div>

      {prompt && (
        <div style={{ background: surface, border: `1px solid ${border}`,
          borderRadius: "10px", padding: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: text }}>생성된 프롬프트</span>
            <button onClick={handleCopy} style={{
              background: copied ? "rgba(52,211,153,0.15)" : accent,
              color: copied ? "#34d399" : "#fff",
              border: "none", borderRadius: "6px",
              padding: "4px 12px", fontSize: "11px",
              fontWeight: 600, cursor: "pointer",
            }}>
              {copied ? "✓ 복사됨" : "📋 복사"}
            </button>
          </div>
          <textarea
            readOnly
            value={prompt}
            style={{
              width: "100%", minHeight: "200px",
              background: surface2, border: `1px solid ${border}`,
              borderRadius: "8px", padding: "10px",
              fontSize: "11px", color: text,
              lineHeight: 1.7, resize: "vertical",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      )}
    </div>
  );
}