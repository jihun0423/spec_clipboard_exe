import { useState } from "react";

function buildPrompt(data) {
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

  return `당신은 채용사이트 입력 전문 도우미입니다. 아래 내 스펙 정보를 바탕으로 현재 열려있는 채용사이트 입력폼을 채워주세요.

## 중요 지침

**팝업/알림 처리**
- 작업 중 확인 팝업이나 알림창이 뜨면 반드시 확인/닫기 버튼을 눌러줘.
- 오류 팝업도 확인 후 계속 진행해줘.

**항목 개수 제한**
- 자격증, 학력, 경력 등 여러 개를 입력할 때, 추가 버튼이 비활성화되거나 "더 이상 추가할 수 없습니다" 같은 메시지가 뜨면 즉시 멈춰줘.
- 최신순 또는 중요도 순으로 입력하고, 제한에 걸리면 나머지는 생략해줘.

**사이트 양식 준수**
- 입력 필드 근처에 형식 안내(예: "ㅇㅇ고로 입력", "영문 대문자로", "YYYY.MM 형식")가 있으면 반드시 그 형식에 맞게 입력해줘.
- 안내가 없을 경우에만 내 데이터 형식 그대로 입력해줘.

**언어 자격증 처리**
- TOEIC, TOEIC SPEAKING, OPIc 등 어학 자격증은 사이트에 별도 어학 탭/섹션이 있으면 거기에 입력해줘.
- 어학 탭에 이미 입력했으면 일반 자격증 탭에서는 생략해줘.

**자격증 구분 처리**
- 사이트에서 자격증을 종류별로 구분하는 경우(유관/무관, 국가기술/민간/어학 등) 아래 분류를 참고해줘:
  - 데이터/IT 관련: ADSP, SQLD, 빅데이터분석기사, 정보처리기사, 컴퓨터활용능력 1급, Tableau Desktop Certificate
  - 어학: TOEIC, TOEIC SPEAKING AL, OPIc IH
  - 한국사: 한국사능력검정시험 1급
- 구분이 애매하면 사이트 안내를 우선으로 판단해줘.

**드롭다운/라디오/체크박스**
- 선택 가능한 항목은 내 스펙에 맞게 최대한 선택해줘.
- 입력할 수 없는 항목은 건너뛰어줘.

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

export default function AutoFillTab({ data, theme }) {
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";
  const accent = "#ec4899";

  const handleGenerate = () => {
    setCopied(false);
    setPrompt(buildPrompt(data));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "4px" }}>
      <div style={{ background: surface, border: `1px solid ${border}`,
        borderRadius: "10px", padding: "14px", marginBottom: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: text, marginBottom: "8px" }}>
          🤖 AI 자동입력 프롬프트 생성
        </div>
        <div style={{ fontSize: "11px", color: textMut, lineHeight: 1.8, marginBottom: "12px" }}>
          1. 아래 버튼을 눌러 프롬프트를 생성하세요<br/>
          2. 복사 버튼으로 프롬프트를 복사하세요<br/>
          3. Claude in Chrome 사이드패널에 붙여넣으세요
        </div>
        <button onClick={handleGenerate} style={{
          width: "100%", background: accent, color: "#fff",
          border: "none", borderRadius: "8px", padding: "10px",
          fontSize: "13px", fontWeight: 700, cursor: "pointer",
        }}>
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