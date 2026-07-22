import { useState } from "react";

import Header from "../components/Header";
import { CAT_BY_ID, ISSUE_BY_ID, SEVERITY } from "../data/issues";

export default function IssueView({
  view,
  setView,
  issueId,
  favorites,
  toggleFavorite,
  note,
  saveNote,
  resolveIssue,
}) {
  const issue = ISSUE_BY_ID[issueId];
  const [noteText, setNoteText] = useState(note);
  const [checked, setChecked] = useState(() => new Set()); // 조치 단계 체크 — 세션 한정
  const [resolved, setResolved] = useState(false);

  if (!issue) {
    setView("home");
    return null;
  }

  const cat = CAT_BY_ID[issue.cat];
  const sev = SEVERITY[issue.severity];
  const isFav = favorites.includes(issue.id);

  const toggleStep = (idx) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  const noteBlur = () => saveNote(issue.id, noteText);

  const resolve = async () => {
    saveNote(issue.id, noteText);
    await resolveIssue(issue, noteText.trim());
    setResolved(true);
  };

  return (
    <div className="app">
      <Header view={view} setView={setView} />

      <button className="btn back-btn" onClick={() => setView("home")}>
        ← 목록으로
      </button>

      <div className="issue-head">
        <div className="issue-head-meta">
          <span className="issue-cat" style={{ color: cat.color }}>
            <span className="dot" style={{ background: cat.color }} /> {cat.name}
          </span>
          <span className="issue-sev" style={{ color: sev.color }}>
            {sev.name}
          </span>
          <button
            className={`btn issue-row-star ${isFav ? "issue-row-star--on" : ""}`}
            onClick={() => toggleFavorite(issue.id)}
          >
            {isFav ? "★" : "☆"}
          </button>
        </div>
        <h1 className="display issue-title">{issue.symptom}</h1>
      </div>

      <div className="issue-section">
        <div className="issue-section-title">원인 후보</div>
        <ul className="cause-list">
          {issue.causes.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="issue-section">
        <div className="issue-section-title">조치 단계 — 순서대로 확인하며 체크</div>
        <div className="step-list">
          {issue.steps.map((s, i) => (
            <button
              key={i}
              className={`btn step-item ${checked.has(i) ? "step-item--done" : ""}`}
              onClick={() => toggleStep(i)}
            >
              <span className="step-num">{checked.has(i) ? "✓" : i + 1}</span>
              <span className="step-text">{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="issue-section issue-section--escalate">
        <div className="issue-section-title">에스컬레이션 기준</div>
        <p className="escalate-text">{issue.escalate}</p>
      </div>

      <div className="issue-section">
        <div className="issue-section-title">내 해결 메모 — 내 기기에만 저장</div>
        <textarea
          className="input input--textarea"
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={noteBlur}
          placeholder="현장에서 알아낸 노하우, 부품 정보, 고객 특이사항 등"
          maxLength={1000}
        />
      </div>

      {resolved ? (
        <div className="resolve-done">기록했어요 — 수고하셨습니다! 🔧</div>
      ) : (
        <button className="btn resolve-btn" onClick={resolve}>
          해결 완료로 기록
        </button>
      )}
    </div>
  );
}
