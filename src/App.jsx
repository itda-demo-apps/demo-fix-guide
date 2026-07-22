import { useEffect, useState } from "react";

import { storage } from "./storage";
import { loadLog, addLog, removeLog } from "./log";
import { PACKS, PACK_BY_ID } from "./data/packs";
import HomeView from "./views/HomeView";
import IssueView from "./views/IssueView";
import HistoryView from "./views/HistoryView";
import ContactView from "./views/ContactView";

const APP_KEY = "fix-app-v1"; // {favorites, notes, packId} 통합 저장 — 키를 쪼개지 말 것

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home"); // home | issue | history | contact
  const [issueId, setIssueId] = useState(null);
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

  const openIssue = (id) => {
    setIssueId(id);
    setView("issue");
  };

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
  if (view === "issue" && issueId)
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
