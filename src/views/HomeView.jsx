import { useMemo, useState } from "react";

import Header from "../components/Header";
import InstallHint from "../components/InstallHint";
import IssueRow from "../components/IssueRow";
import SeriesLinks from "../components/SeriesLinks";
import { PACKS, ISSUE_BY_ID, searchIssues } from "../data/packs";

export default function HomeView({ view, setView, openIssue, pack, setPackId, favorites, toggleFavorite }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(null); // null이면 전체

  const switchPack = (id) => {
    setPackId(id);
    setQuery("");
    setActiveCat(null);
  };

  const results = useMemo(() => {
    if (query.trim()) return searchIssues(pack, query);
    return activeCat ? pack.issues.filter((i) => i.cat === activeCat) : null;
  }, [pack, query, activeCat]);

  // 즐겨찾기는 현재 도메인 것만 노출
  const packIssueIds = useMemo(() => new Set(pack.issues.map((i) => i.id)), [pack]);
  const favIssues = favorites.filter((id) => packIssueIds.has(id)).map((id) => ISSUE_BY_ID[id]);

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

      {/* 제품 도메인 선택 — 데이터만 갈아끼우면 어느 업종이든 된다는 것이 이 앱의 메시지 */}
      <div className="pack-row">
        {PACKS.map((p) => (
          <button
            key={p.id}
            className={`btn pack-chip ${p.id === pack.id ? "pack-chip--on" : ""}`}
            onClick={() => switchPack(p.id)}
          >
            <span className="pack-chip-emoji">{p.emoji}</span> {p.name}
          </button>
        ))}
      </div>

      {/* 증상 검색 — 클라이언트 전용이라 오프라인에서도 동작 */}
      <input
        className="input search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`${pack.name} 증상 검색 — 예: 전원, 누수, 소음`}
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
        {pack.cats.map((c) => {
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
            <div className="list-label">
              {pack.name} 이슈 {pack.issues.length}건 — 계통을 누르거나 검색하세요
            </div>
            {pack.cats.map((c) => (
              <button key={c.id} className="btn cat-card" onClick={() => setActiveCat(c.id)}>
                <span className="dot dot--lg" style={{ background: c.color }} />
                <span className="cat-card-name">{c.name}</span>
                <span className="cat-card-count">
                  {pack.issues.filter((i) => i.cat === c.id).length}건
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="foot-note">
        모든 이슈 데이터는 가상 제품 기준으로 AI가 생성한 데모입니다 — 실제 도입 시 자사
        매뉴얼·AS 일지로 교체하고 베테랑 기사의 검수를 거치세요. 업종 추가는 데이터 파일 하나면
        됩니다.
      </div>

      <SeriesLinks />
    </div>
  );
}
