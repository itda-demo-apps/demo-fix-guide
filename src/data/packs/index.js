// 도메인팩 레지스트리 — 새 업종을 추가하려면 팩 파일 하나 만들어 여기 등록하면 끝.
// 구조(계통→이슈→원인/조치/에스컬레이션)는 모든 팩 공통 — "데이터만 갈아끼우면 어느 업종이든"이 이 앱의 메시지다.
// 주의: 이슈 id·계통 id는 전 팩에서 유일해야 한다(즐겨찾기·메모·기록이 id 기준 전역 저장).
import massageChair from "./massage-chair";
import waterPurifier from "./water-purifier";
import aircon from "./aircon";
import boiler from "./boiler";
import coffeeMachine from "./coffee-machine";

export const PACKS = [massageChair, waterPurifier, aircon, boiler, coffeeMachine];

export const PACK_BY_ID = Object.fromEntries(PACKS.map((p) => [p.id, p]));

// 전역 조회용 — 기록·즐겨찾기 화면은 팩 경계를 넘는다
export const ISSUE_BY_ID = Object.fromEntries(PACKS.flatMap((p) => p.issues.map((i) => [i.id, i])));
export const CAT_BY_ID = Object.fromEntries(PACKS.flatMap((p) => p.cats.map((c) => [c.id, c])));

export const SEVERITY = {
  high: { name: "안전·긴급", color: "#E4574B" },
  mid: { name: "기능", color: "#E8B93E" },
  low: { name: "사용성", color: "#6B6E75" },
};

// 증상·키워드·계통명 부분 일치 검색(현재 팩 안에서) — 클라이언트 전용, 오프라인 동작
export function searchIssues(pack, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return pack.issues.filter((i) => {
    const hay = [i.symptom, ...i.keywords, CAT_BY_ID[i.cat].name].join(" ").toLowerCase();
    return q.split(/\s+/).every((word) => hay.includes(word));
  });
}
