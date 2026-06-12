import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SettingTab({ user, accent, theme }) {
  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";

  const handleCopyUID = () => {
    navigator.clipboard.writeText(user.uid);
    alert("UID가 복사됐어요!");
  };

  const handleHelp = () => {
    if (window.electronAPI) {
      window.electronAPI.openExternal("https://github.com/jihun0423/spec_clipboard_exe#readme");
    } else {
      window.open("https://github.com/jihun0423/spec_clipboard_exe#readme", "_blank");
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <div style={{ padding: "4px" }}>

      {/* 계정 */}
      <Section title="👤 계정" textMut={textMut}>
        <Row label="이메일" value={user.email} surface2={surface2} textMut={textMut} text={text} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px",
          background: surface2, borderRadius: "7px", padding: "7px 10px", marginBottom: "5px" }}>
          <span style={{ fontSize: "11px", color: textMut, width: "52px", flexShrink: 0 }}>UID</span>
          <span style={{ fontSize: "11px", color: text, flex: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.uid}
          </span>
          <button onClick={handleCopyUID} style={{
            background: accent, color: "#fff", border: "none",
            borderRadius: "5px", padding: "3px 8px", fontSize: "11px",
            fontWeight: 600, cursor: "pointer", flexShrink: 0,
          }}>복사</button>
        </div>
        <ActionButton label="🚪 로그아웃" onClick={handleLogout} color="#f87171" />
      </Section>

      {/* 도움말 */}
      <Section title="❓ 도움말" textMut={textMut}>
        <ActionButton label="📖 사용 가이드 (깃허브)" onClick={handleHelp} color={accent} />
      </Section>

      {/* 앱 정보 */}
      <Section title="ℹ️ 앱 정보" textMut={textMut}>
        <Row label="버전"    value="v1.0.3" surface2={surface2} textMut={textMut} text={text} />
        <Row label="개발자"  value="김지훈 (jihun0423)" surface2={surface2} textMut={textMut} text={text} />
        <Row label="GitHub" value="github.com/jihun0423/spec_clipboard_exe" surface2={surface2} textMut={textMut} text={text} />
      </Section>

    </div>
  );
}

function Section({ title, children, textMut }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "11px", color: textMut, fontWeight: 700,
        marginBottom: "6px", paddingLeft: "2px" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, surface2, textMut, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px",
      background: surface2, borderRadius: "7px", padding: "7px 10px", marginBottom: "5px" }}>
      <span style={{ fontSize: "11px", color: textMut, width: "52px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "11px", color: text, flex: 1,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function ActionButton({ label, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", background: color, color: "#fff", border: "none",
      borderRadius: "7px", padding: "8px", fontSize: "12px",
      fontWeight: 600, cursor: "pointer", marginBottom: "5px",
    }}>{label}</button>
  );
}