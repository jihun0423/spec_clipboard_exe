import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SettingTab({ user, accent, theme }) {
  const surface = theme?.surface || "#1a1d27";
  const surface2 = theme?.surface2 || "#22263a";
  const border = theme?.border || "#2e3350";
  const text = theme?.text || "#e8eaf0";
  const textMut = theme?.textMut || "#7a80a0";

  const [updateStatus, setUpdateStatus] = useState(null);
  const [updateVersion, setUpdateVersion] = useState(null);
  const [updateProgress, setUpdateProgress] = useState(null);

    useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onUpdateStatus((status, info) => {
        setUpdateStatus(status);
        if (info) setUpdateVersion(info);
        setUpdateProgress(null);
    });
    window.electronAPI.onUpdateProgress((percent) => {
        setUpdateProgress(percent);
        setUpdateStatus("downloading");
    });
    }, []);

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

    const handleCheckUpdate = () => {
    if (!window.electronAPI) {
        setUpdateStatus("dev");
        return;
    }
    setUpdateStatus("checking");
    window.electronAPI.checkForUpdate();
    };

  const handleInstallUpdate = () => {
    if (window.electronAPI) window.electronAPI.installUpdate();
  };

  const handleLogout = () => signOut(auth);

    const getUpdateLabel = () => {
    switch (updateStatus) {
        case "checking":      return "확인 중...";
        case "available":     return `v${updateVersion} 업데이트 있음! 다운로드 중...`;
        case "downloading":   return `다운로드 중... ${updateProgress}%`;
        case "downloaded":    return "✓ 다운로드 완료! 지금 설치할까요?";
        case "not-available": return "✓ 최신 버전이에요!";
        case "error":         return "업데이트 확인 실패";
        case "dev":           return "개발 모드에서는 사용 불가";
        default:              return "업데이트 확인";
    }
    };

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

      {/* 업데이트 */}
      <Section title="🔄 업데이트" textMut={textMut}>
        <Row label="현재버전" value="v1.0.7" surface2={surface2} textMut={textMut} text={text} />
        {updateStatus === "downloaded" ? (
          <ActionButton label="🔄 지금 설치하기" onClick={handleInstallUpdate} color="#34d399" />
        ) : (
          <ActionButton
            label={getUpdateLabel()}
            onClick={handleCheckUpdate}
            color={updateStatus === "not-available" ? "#34d399" :
                   updateStatus === "error" ? "#f87171" : accent}
            disabled={["checking", "downloading", "available"].includes(updateStatus)}
          />
        )}
        {updateStatus === "downloading" && (
          <div style={{ background: surface2, borderRadius: "7px", padding: "6px 10px",
            marginBottom: "5px" }}>
            <div style={{ background: border, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
              <div style={{ background: accent, height: "100%", borderRadius: "4px",
                width: `${updateProgress || 0}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        )}
      </Section>

      {/* 도움말 */}
      <Section title="❓ 도움말" textMut={textMut}>
        <ActionButton label="📖 사용 가이드 (깃허브)" onClick={handleHelp} color={accent} />
      </Section>

      {/* 앱 정보 */}
      <Section title="ℹ️ 앱 정보" textMut={textMut}>
        <Row label="버전"    value="v1.0.7" surface2={surface2} textMut={textMut} text={text} />
        <Row label="개발자" value="김지훈 (jihun0423) feat. Claude" surface2={surface2} textMut={textMut} text={text} />
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

function ActionButton({ label, onClick, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", background: disabled ? "#22263a" : color,
      color: disabled ? "#7a80a0" : "#fff", border: "none",
      borderRadius: "7px", padding: "8px", fontSize: "12px",
      fontWeight: 600, cursor: disabled ? "default" : "pointer",
      marginBottom: "5px",
    }}>{label}</button>
  );
}