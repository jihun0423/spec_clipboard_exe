import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./pages/Login";
import CertTab from "./components/CertTab";
import BasicTab from "./components/BasicTab";
import EducationTab from "./components/EducationTab";
import CareerTab from "./components/CareerTab";
import ProjectTab from "./components/ProjectTab";
import CourseTab from "./components/CourseTab";
import FreeTab from "./components/FreeTab";
import SettingTab from "./components/SettingTab";
import { useFirestore } from "./hooks/useFirestore";
import { darkTheme, lightTheme } from "./theme";

const TABS = [
  { key: "certs",      label: "자격증",    color: "#5b6cff" },
  { key: "basic",      label: "기본정보",  color: "#34d399" },
  { key: "education",  label: "학력",      color: "#f59e0b" },
  { key: "career",     label: "경력/봉사", color: "#f87171" },
  { key: "projects",   label: "프로젝트",  color: "#a78bfa" },
  { key: "coursework", label: "교육사항",  color: "#22d3ee" },
  { key: "free",       label: "자유",      color: "#fb923c" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [pinned, setPinned] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [opacity, setOpacity] = useState(1);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const { data, loading, addItem, updateItem, deleteItem } = useFirestore(user?.uid);

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    if (window.electronAPI) window.electronAPI.setAlwaysOnTop(next);
  };

  const handleResize = (direction) => {
    if (window.electronAPI) window.electronAPI.resizeWindow(direction);
  };

  const handleOpacity = (val) => {
    setOpacity(val);
    if (window.electronAPI) window.electronAPI.setOpacity(val);
  };

  if (authLoading) return (
    <div style={{ background: theme.bg, height: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", color: theme.textMut }}>
      로딩 중...
    </div>
  );

  if (!user) return <Login />;

  const tab = TABS[currentTab];

  const tabProps = {
    data: data[tab.key],
    loading,
    accent: tab.color,
    uid: user.uid,
    theme,
    onAdd:    (item) => addItem(tab.key, item),
    onUpdate: (id, item) => updateItem(tab.key, id, item),
    onDelete: (id) => deleteItem(tab.key, id),
  };

  const tabComponents = [CertTab, BasicTab, EducationTab, CareerTab, ProjectTab, CourseTab, FreeTab];
  const TabComponent = tabComponents[currentTab];

  const btnStyle = (bg, color = "#fff") => ({
    background: bg, color, border: "none", borderRadius: "7px",
    padding: "4px 9px", fontSize: "11px", fontWeight: 600,
    cursor: "pointer", flexShrink: 0,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh",
      background: theme.bg, fontFamily: "'맑은 고딕', sans-serif", overflow: "hidden" }}>

      {/* 헤더 */}
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}`,
        padding: "8px 12px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0, position: "relative" }}>

        <button onClick={() => setShowSettings(!showSettings)} style={{
          background: showSettings ? "#5b6cff" : theme.surface2,
          color: theme.text, border: "none", borderRadius: "7px",
          padding: "4px 9px", fontSize: "14px",
          cursor: "pointer", flexShrink: 0,
        }}>⚙️</button>

        <span style={{ color: theme.text, fontWeight: 700, fontSize: "13px",
          position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          📋 스펙 복사기
        </span>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <button onClick={() => handleResize("down")} style={btnStyle(theme.surface2, theme.text)}>－</button>
          <button onClick={() => handleResize("up")}   style={btnStyle(theme.surface2, theme.text)}>＋</button>
          <button onClick={handlePin} style={btnStyle(pinned ? "#5b6cff" : theme.surface2, pinned ? "#fff" : theme.text)}>
            📌 {pinned ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* 설정 패널 */}
      {showSettings && (
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          <SettingTab user={user} accent="#6b7280" theme={theme} />
        </div>
      )}

      {/* 탭바 + 콘텐츠 */}
      {!showSettings && (
        <>
          <div
            id="tabbar"
            style={{
              display: "flex", background: theme.surface2, flexShrink: 0,
              overflowX: "auto", cursor: "grab",
            }}
            onMouseDown={(e) => {
              const el = e.currentTarget;
              el.style.cursor = "grabbing";
              const startX = e.pageX - el.offsetLeft;
              const scrollLeft = el.scrollLeft;
              const onMove = (ev) => {
                const x = ev.pageX - el.offsetLeft;
                el.scrollLeft = scrollLeft - (x - startX);
              };
              const onUp = () => {
                el.style.cursor = "grab";
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          >
            {TABS.map((t, i) => (
              <button key={t.key} onClick={() => setCurrentTab(i)} style={{
                background: currentTab === i ? t.color : "transparent",
                color: currentTab === i ? "#fff" : theme.textMut,
                border: "none", padding: "8px 12px", fontSize: "12px",
                fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <TabComponent {...tabProps} />
          </div>
        </>
      )}

      {/* 하단 푸터 */}
      <div style={{
        background: theme.surface, borderTop: `1px solid ${theme.border}`,
        padding: "6px 12px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
      }}>
        {/* 왼쪽: 라이트/다크 모드 */}
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => setIsDark(false)} style={{
            background: !isDark ? "#f59e0b" : theme.surface2,
            color: !isDark ? "#fff" : theme.textMut,
            border: "none", borderRadius: "6px",
            padding: "3px 8px", fontSize: "13px",
            cursor: "pointer",
          }}>☀️</button>
          <button onClick={() => setIsDark(true)} style={{
            background: isDark ? "#5b6cff" : theme.surface2,
            color: isDark ? "#fff" : theme.textMut,
            border: "none", borderRadius: "6px",
            padding: "3px 8px", fontSize: "13px",
            cursor: "pointer",
          }}>🌙</button>
        </div>

        {/* 오른쪽: 투명도 슬라이더 */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: theme.textMut }}>투명도</span>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacity(parseFloat(e.target.value))}
            style={{ width: "80px", cursor: "pointer", accentColor: "#5b6cff" }}
          />
        </div>
      </div>
    </div>
  );
}