import { useState } from "react";
import TeacherSearch from "./pages/TeacherSearch";
import AdminPage from "./pages/AdminPage";
import { clearAdminToken } from "./services/api";

const COPY = {
  brand: "KSA Office",
  admin: "관리자 페이지",
  title: "선생님, 지금 어디 계세요?",
  subtitle: "KSA 선생님들의 Office Hour 시간과 위치를 간편하게 확인하세요.",
  notice: "문의는 26-048 박현택으로 부탁드립니다."
};

export default function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [adminEntryKey, setAdminEntryKey] = useState(0);

  function handleGoSearch() {
    setActiveTab("search");
  }

  function handleGoAdmin() {
    clearAdminToken();
    setAdminEntryKey((value) => value + 1);
    setActiveTab("admin");
  }

  return (
    <div className="app-root-shell">
      <header className="topbar">
        <button type="button" className="brand-button" onClick={handleGoSearch}>
          <span className="brand-icon">K</span>
          <span>{COPY.brand}</span>
        </button>

        <div className="topbar-actions">
          <button type="button" className="topbar-link admin-only" onClick={handleGoAdmin}>
            {COPY.admin}
          </button>
        </div>
      </header>

      <main className="app-root-content">
        <div className="top-notice">{COPY.notice}</div>

        {activeTab === "search" ? (
          <>
            <section className="landing-hero">
              <h1>{COPY.title}</h1>
              <p>{COPY.subtitle}</p>
            </section>
            <TeacherSearch />
          </>
        ) : (
          <AdminPage key={adminEntryKey} onBack={handleGoSearch} />
        )}
      </main>
    </div>
  );
}
