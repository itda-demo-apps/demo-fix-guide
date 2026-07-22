import { CAT_BY_ID, SEVERITY } from "../data/issues";

// 이슈 목록 한 줄 — 검색 결과·카테고리 목록·즐겨찾기 공용
export default function IssueRow({ issue, onOpen, isFavorite, onToggleFavorite }) {
  const cat = CAT_BY_ID[issue.cat];
  const sev = SEVERITY[issue.severity];
  return (
    <div className="issue-row">
      <button className="btn issue-row-main" onClick={() => onOpen(issue.id)}>
        <span className="dot" style={{ background: cat.color }} />
        <span className="issue-row-symptom">{issue.symptom}</span>
        {issue.severity === "high" && (
          <span className="issue-row-sev" style={{ color: sev.color }}>
            {sev.name}
          </span>
        )}
      </button>
      <button
        className={`btn issue-row-star ${isFavorite ? "issue-row-star--on" : ""}`}
        onClick={() => onToggleFavorite(issue.id)}
        title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
      >
        {isFavorite ? "★" : "☆"}
      </button>
    </div>
  );
}
