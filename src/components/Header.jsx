import { navigate } from "../router";

export default function Header({ view, setView }) {
  const tabs = [
    { id: "home", label: "가이드" },
    { id: "history", label: "기록" },
    { id: "contact", label: "문의" },
  ];
  // 이슈 상세는 가이드 탭의 하위 화면으로 취급
  const active = view === "issue" ? "home" : view;
  return (
    <div className="header">
      <button className="btn header-logo-btn display header-logo" onClick={() => navigate("/")}>
        고장 <span className="accent">길잡이</span>
      </button>
      <nav className="header-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`btn tab ${active === t.id ? "tab--active" : ""}`}
            onClick={() => setView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
