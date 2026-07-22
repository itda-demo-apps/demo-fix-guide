import Header from "../components/Header";
import { CAT_BY_ID } from "../data/issues";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} (${DAY_NAMES[d.getDay()]})`;
}

export default function HistoryView({ view, setView, openIssue, log, deleteLog }) {
  return (
    <div className="app">
      <Header view={view} setView={setView} />

      <div className="list-label">해결 기록 {log.length}건 — 내 기기에만 저장</div>

      {log.length === 0 ? (
        <div className="empty-hint">
          아직 기록이 없어요.
          <br />
          이슈를 처리하고 <b>해결 완료로 기록</b>을 누르면 여기에 쌓여요.
        </div>
      ) : (
        <div className="issue-list">
          {log.map((r) => {
            const cat = CAT_BY_ID[r.cat];
            return (
              <div key={r.ts} className="log-item">
                <button className="btn log-item-main" onClick={() => openIssue(r.issueId)}>
                  <span className="dot" style={{ background: cat?.color || "var(--muted)" }} />
                  <span className="log-item-symptom">{r.symptom}</span>
                  <span className="log-item-date">{fmtDate(r.ts)}</span>
                </button>
                {r.note && <div className="log-item-note">{r.note}</div>}
                <button className="btn log-item-del" onClick={() => deleteLog(r.ts)} title="기록 삭제">
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
