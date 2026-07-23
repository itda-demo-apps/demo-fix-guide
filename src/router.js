// 경량 라우터 — 의존성 없이 history API. URL로 화면을 복원한다.
// 경로 체계:
//   /            가이드(홈) — 도메인팩 전환은 홈 내 상태라 URL에 싣지 않는다
//   /i/:issueId  이슈 상세(전 팩 전역 유일 id)
//   /history     해결 기록
//   /contact     문의
import { useEffect, useState } from "react";

// 현재 위치 → { view, issueId? }
export function parseLocation(loc = window.location) {
  const path = (loc.pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/history") return { view: "history" };
  if (path === "/contact") return { view: "contact" };
  const m = path.match(/^\/i\/([^/]+)$/);
  if (m) return { view: "issue", issueId: decodeURIComponent(m[1]) };
  return { view: "home" }; // "/" 및 알 수 없는 경로 → 홈
}

const listeners = new Set();
function emit() {
  const r = parseLocation();
  listeners.forEach((fn) => fn(r));
}

// 경로 이동 — 기본 pushState, replace 옵션 시 replaceState. 이후 구독자에 통지.
export function navigate(path, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, "", path);
  else window.history.pushState(null, "", path);
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", emit); // 뒤로/앞으로
}

// 현재 라우트 구독 훅
export function useRoute() {
  const [route, setRoute] = useState(() => parseLocation());
  useEffect(() => {
    listeners.add(setRoute);
    return () => listeners.delete(setRoute);
  }, []);
  return route;
}
