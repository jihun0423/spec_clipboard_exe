import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0f1117",
      gap: "24px",
    }}>
      <div style={{ fontSize: "32px" }}>📋</div>
      <h1 style={{ color: "#e8eaf0", fontSize: "20px", fontWeight: 700, margin: 0 }}>
        스펙 복사기
      </h1>
      <p style={{ color: "#7a80a0", fontSize: "13px", margin: 0 }}>
        Google 계정으로 로그인하세요
      </p>
      <button onClick={handleLogin} style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#fff",
        color: "#333",
        border: "none",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
      }}>
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" />
        Google로 로그인
      </button>
    </div>
  );
}