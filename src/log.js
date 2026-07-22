// 해결 기록 유틸 — 현장에서 처리한 이슈를 최신순으로 남긴다 (내 기기에만 저장)
import { storage } from "./storage";

export const LOG_KEY = "fix-log-v1";
const LIMIT = 500;

export async function loadLog() {
  try {
    const saved = await storage.get(LOG_KEY);
    if (!saved) return [];
    const arr = JSON.parse(saved.value);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function addLog(issue, note) {
  const list = await loadLog();
  const next = [
    { ts: Date.now(), issueId: issue.id, symptom: issue.symptom, cat: issue.cat, note: note || "" },
    ...list,
  ].slice(0, LIMIT);
  await storage.set(LOG_KEY, JSON.stringify(next));
  return next;
}

export async function removeLog(ts) {
  const list = await loadLog();
  const next = list.filter((r) => r.ts !== ts);
  await storage.set(LOG_KEY, JSON.stringify(next));
  return next;
}
