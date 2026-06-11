import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./pages/Login";
import CertTab from "./components/CertTab";
import BasicTab from "./components/BasicTab";
import EducationTab from "./components/EducationTab";
import CareerTab from "./components/CareerTab";
import ProjectTab from "./components/ProjectTab";
import CourseTab from "./components/CourseTab";
import { useFirestore } from "./hooks/useFirestore";

const TABS = [
  { key: "certs",      label: "자격증",    color: "#5b6cff" },
  { key: "basic",      label: "기본정보",  color: "#34d399" },
  { key: "education",  label: "학력",      color: "#f59e0b" },
  { key: "career",     label: "경력/봉사", color: "#f87171" },
  { key: "projects",   label: "프로젝트",  color: "#a78bfa" },
  { key: "coursework", label: "교육사항",  color: "#22d3ee" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const { data, loading, addItem, updateItem, deleteItem } = useFirestore(user?.uid);

  if (authLoading) return (
    <div style={{ background: "#0f1117", height: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", color: "#7a80a0" }}>
      로딩 중...
    </div>
  );

  if (!user) return <Login />;

  const tab = TABS[currentTab];

  const tabProps = {
    data: data[tab.key],
    loading,
    accent: tab.color,
    onAdd:    (item) => addItem(tab.key, item),
    onUpdate: (id, item) => updateItem(tab.key, id, item),
    onDelete: (id) => deleteItem(tab.key, id),
  };

  const tabComponents = [CertTab, BasicTab, EducationTab, CareerTab, ProjectTab, CourseTab];
  const TabComponent = tabComponents[currentTab];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh",
      background: "#0f1117", fontFamily: "'맑은 고딕', sans-serif", overflow: "hidden" }}>

      {/* 헤더 */}
      <div style={{ background: "#1a1d27", borderBottom: "1px solid #2e3350",
        padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0 }}>
        <span style={{ color: "#e8eaf0", fontWeight: 700, fontSize: "14px" }}>📋 스펙 복사기</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => {
            const next = !pinned;
            setPinned(next);
            if (window.electronAPI) window.electronAPI.setAlwaysOnTop(next);
          }} style={{
            background: pinned ? "#5b6cff" : "#22263a",
            color: "#fff", border: "none", borderRadius: "7px",
            padding: "5px 10px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
          }}>📌 {pinned ? "ON" : "OFF"}</button>
          <button onClick={() => signOut(auth)} style={{
            background: "#22263a", color: "#7a80a0", border: "none",
            borderRadius: "7px", padding: "5px 10px", fontSize: "11px",
            fontWeight: 600, cursor: "pointer",
          }}>로그아웃</button>
        </div>
      </div>

      {/* 탭바 */}
      <div style={{ display: "flex", background: "#22263a", flexShrink: 0, overflowX: "auto" }}>
        {TABS.map((t, i) => (
          <button key={t.key} onClick={() => setCurrentTab(i)} style={{
            background: currentTab === i ? t.color : "transparent",
            color: currentTab === i ? "#fff" : "#7a80a0",
            border: "none", padding: "8px 12px", fontSize: "12px",
            fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>{t.label}</button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        <TabComponent {...tabProps} />
      </div>
    </div>
  );
}