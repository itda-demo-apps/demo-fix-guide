import { useEffect, useState } from "react";

import { storage } from "./storage";
import { loadLog, addLog, removeLog } from "./log";
import { PACKS, PACK_BY_ID, ISSUE_BY_ID, PACK_ID_BY_ISSUE } from "./data/packs";
import { useRoute, navigate } from "./router";
import HomeView from "./views/HomeView";
import IssueView from "./views/IssueView";
import HistoryView from "./views/HistoryView";
import ContactView from "./views/ContactView";

const APP_KEY = "fix-app-v1"; // {favorites, notes, packId} 통합 저장 — 키를 쪼개지 말 것

// 화면 이름 → 경로. Header 탭·뒤로가기 등 setView 호출을 navigate로 이어 준다.
const PATHS = { home: "/", history: "/history", contact: "/contact" };

export default function App() {
  const [ready, setReady] = useState(false);
  const route = useRoute(); // URL이 화면 상태의 진실 소스
  const view = route.view; // home | issue | history | contact
  const issueId = view === "issue" ? route.issueId : null;
  const setView = (v) => navigate(PATHS[v] ?? "/");
  const [packId, setPackId] = useState(PACKS[0].id); // 선택한 제품 도메인 — 저장·복원
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [log, setLog] = useState([]);

  // 최초 로드
  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.get(APP_KEY);
        if (saved) {
          const data = JSON.parse(saved.value);
          if (Array.isArray(data.favorites)) setFavorites(data.favorites);
          if (data.notes && typeof data.notes === "object") setNotes(data.notes);
          if (data.packId && PACK_BY_ID[data.packId]) setPackId(data.packId);
        }
      } catch {
        /* 손상 데이터는 초기값 유지 */
      }
      setLog(await loadLog());
      setReady(true);
    })();
  }, []);

  // 변경 시 저장
  useEffect(() => {
    if (!ready) return;
    storage.set(APP_KEY, JSON.stringify({ favorites, notes, packId }));
  }, [ready, favorites, notes, packId]);

  const openIssue = (id) => navigate(`/i/${encodeURIComponent(id)}`);

  // 이슈 딥링크(/i/:issueId) 진입 처리 — 없는 이슈는 홈으로, 있으면 그 이슈의 팩으로 동기화
  useEffect(() => {
    if (view !== "issue") return;
    if (!issueId || !ISSUE_BY_ID[issueId]) {
      navigate("/", { replace: true });
      return;
    }
    const pid = PACK_ID_BY_ISSUE[issueId];
    if (pid && pid !== packId) setPackId(pid);
  }, [view, issueId, packId]);

  const toggleFavorite = (id) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const saveNote = (id, text) =>
    setNotes((n) => {
      const next = { ...n };
      if (text.trim()) next[id] = text;
      else delete next[id];
      return next;
    });

  const resolveIssue = async (issue, note) => setLog(await addLog(issue, note));
  const deleteLog = async (ts) => setLog(await removeLog(ts));

  if (!ready) return <div className="app app--center loading">불러오는 중...</div>;

  const pack = PACK_BY_ID[packId];
  const shared = { view, setView, openIssue };
  // 유효한 이슈일 때만 상세를 그린다. 없는 이슈는 위 effect가 홈으로 URL을 교체한다.
  if (view === "issue" && issueId && ISSUE_BY_ID[issueId])
    return (
      <IssueView
        {...shared}
        issueId={issueId}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        note={notes[issueId] || ""}
        saveNote={saveNote}
        resolveIssue={resolveIssue}
      />
    );
  if (view === "history") return <HistoryView {...shared} log={log} deleteLog={deleteLog} />;
  if (view === "contact") return <ContactView {...shared} />;
  return (
    <HomeView
      {...shared}
      pack={pack}
      setPackId={setPackId}
      favorites={favorites}
      toggleFavorite={toggleFavorite}
    />
  );
}
