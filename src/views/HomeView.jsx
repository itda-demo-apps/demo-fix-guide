import { useMemo, useState } from "react";

import Header from "../components/Header";
import InstallHint from "../components/InstallHint";
import IssueRow from "../components/IssueRow";
import SeriesLinks from "../components/SeriesLinks";
import { CATS, ISSUES, ISSUE_BY_ID, searchIssues } from "../data/issues";

export default function HomeView({ view, setView, openIssue, favorites, toggleFavorite }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(null); // null이면 전체

  const results = useMemo(() => {
    if (query.trim()) return searchIssues(query);
    return activeCat ? ISSUES.filter((i) => i.cat === activeCat) : null;
  }, [query, activeCat]);

  const favIssues = favorites.map((id) => ISSUE_BY_ID[id]).filter(Boolean);
  const rowProps = (issue) => ({
    issue,
    onOpen: openIssue,
    isFavorite: favorites.includes(issue.id),
    onToggleFavorite: toggleFavorite,
  });

  return (
    <div className="app">
      <Header view={view} setView={setView} />
      <InstallHint />

      {/* 증상 검색 — 클라이언트 전용이라 오프라인에서도 동작 */}
      <input
        className="input search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="증상 검색 — 예: 전원 안켜짐, 소음, 온열"
        maxLength={50}
      />

      {/* 계통 필터 */}
      <div className="cat-chips">
        <button
          className={`btn cat-chip ${activeCat === null ? "cat-chip--on" : ""}`}
          onClick={() => setActiveCat(null)}
        >
          전체
        </button>
        {CATS.map((c) => {
          const on = activeCat === c.id;
          return (
            <button
              key={c.id}
              className={`btn cat-chip ${on ? "cat-chip--on" : ""}`}
              style={on ? { borderColor: c.color, color: c.color } : undefined}
              onClick={() => setActiveCat(on ? null : c.id)}
            >
              <span className="dot" style={{ background: on ? c.color : "var(--muted)" }} />
              {c.name}
            </button>
          );
        })}
      </div>

      {results ? (
        // 검색 결과 또는 계통 목록
        <div className="issue-list">
          <div className="list-label">
            {query.trim() ? `검색 결과 ${results.length}건` : `${results.length}건`}
          </div>
          {results.length === 0 && (
            <div className="empty-hint">
              결과가 없어요 — 다른 키워드로 검색하거나
              <br />
              계통에서 찾아보세요. 없는 이슈는 <b>문의</b>로 알려주세요.
            </div>
          )}
          {results.map((i) => (
            <IssueRow key={i.id} {...rowProps(i)} />
          ))}
        </div>
      ) : (
        // 기본 화면: 즐겨찾기 + 계통 안내
        <>
          {favIssues.length > 0 && (
            <div className="issue-list">
              <div className="list-label">★ 즐겨찾기</div>
              {favIssues.map((i) => (
                <IssueRow key={i.id} {...rowProps(i)} />
              ))}
            </div>
          )}
          <div className="issue-list">
            <div className="list-label">전체 이슈 {ISSUES.length}건 — 계통을 누르거나 검색하세요</div>
            {CATS.map((c) => (
              <button key={c.id} className="btn cat-card" onClick={() => setActiveCat(c.id)}>
                <span className="dot dot--lg" style={{ background: c.color }} />
                <span className="cat-card-name">{c.name}</span>
                <span className="cat-card-count">{ISSUES.filter((i) => i.cat === c.id).length}건</span>
              </button>
            ))}
          </div>
        </>
      )}

      <SeriesLinks />
    </div>
  );
}
