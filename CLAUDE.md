# 고장 길잡이 (demo-fix-guide)

현장 AS 이슈 대응 가이드 PWA — **v0.2 멀티 도메인**(안마의자·정수기·에어컨·보일러·커피머신). 교육용 데모 시리즈의 B축 — 원형은 세라젬 과정 수강생의 "필드 불량 진단 & 조치 앱(6단계 표준 프레임워크)". "데이터만 갈아끼우면 어느 업종이든 된다"가 핵심 메시지(멀티 도메인 확장: 마스터 컨펌 2026-07-23).

## 배경과 목적

사용자 문제: AS 기사가 현장에서 증상별 원인·조치·에스컬레이션 기준을 빠르게 찾을 수단이 없다. 현장은 지하·기계실 등 통신 불량이 잦다.
해결 접근: **AI가 빌드타임에 사전 생성한 정적 이슈 맵** + 클라이언트 검색. 런타임 AI 질답을 넣지 않는 것이 의도된 설계다(API 키 0·비용 0·오프라인 동작 — circuit-workout의 음성 사전 생성과 같은 패턴). 개인 노하우는 이슈별 로컬 메모로 축적.
교육 맥락: "AI로 우리 회사 이슈 맵을 만든다"가 핵심 시연. 데이터는 **가상 안마의자 제품** 기준 — 실제 도입 시 issues.js 내용만 교체(구조 유지).

## 실행

```bash
npm install
npm run dev        # http://localhost:5173 — server.host=true라 같은 와이파이 폰에서도 접속 가능
npm run build      # dist/ + 서비스워커(precache) 생성
npm run preview    # 빌드 결과 확인 (SW 포함 동작은 preview에서 확인)
npm run icons      # 앱 아이콘 재생성 (Pillow 필요)
python3 scripts/generate-og.py      # OG 이미지 — 저장소 루트에서 실행
python3 scripts/generate-splash.py  # iOS 스플래시 17종 — 저장소 루트에서 실행
```

## 구조

```
src/
  main.jsx                 # 엔트리 — SW 등록(virtual:pwa-register)
  App.jsx                  # 상태 소유(즐겨찾기·메모·해결 기록) + 화면 전환(home/issue/history/contact)
  log.js                   # 해결 기록 유틸 — LOG_KEY, addLog/removeLog
  storage.js               # 스토리지 어댑터 — localStorage 구현 (시리즈 공용)
  styles.css               # 전체 스타일 — 디자인 토큰(CSS 변수) + 클래스. 동적 색만 인라인
  data/packs/              # ★ 이슈 맵 정본 — 도메인팩 5종(각 20~30건). index.js가 레지스트리(PACKS·전역 ISSUE/CAT_BY_ID·SEVERITY·searchIssues)
  data/issues.js           # 호환 파사드 — packs 재수출
  data/series.js           # 데모 시리즈 목록(SELF_ID·SERIES·REPO_URL) — 새 앱 나오면 여기 추가
  views/
    HomeView.jsx           # 증상 검색 + 계통 필터 + 즐겨찾기 + 계통 카드
    IssueView.jsx          # 이슈 상세 — 원인/조치 체크/에스컬레이션/메모/해결 기록
    HistoryView.jsx        # 해결 기록 목록 (기록 탭)
    ContactView.jsx        # 문의 폼 (시리즈 공용 패턴)
  components/
    Header.jsx             # 로고 + 가이드/기록/문의 탭 (issue 화면은 가이드 탭 하위)
    IssueRow.jsx           # 이슈 목록 한 줄 — 검색·계통·즐겨찾기 공용
    InstallHint.jsx        # 홈 화면 추가 안내 배너 (시리즈 공용)
    SeriesLinks.jsx        # 홈 하단 시리즈 링크 + "만드는 법 보기"(GitHub) 푸터
api/contact.js             # 문의 폼 → Telegram (Vercel 함수, 시리즈 공용 패턴)
scripts/                   # PIL 아이콘/OG/스플래시 생성 (돋보기+이슈 점 도안, Black Han Sans 캐시)
public/                    # PWA 아이콘·og.png·splash/
```

## 핵심 로직

- **도메인팩** (`data/packs/*.js`): 팩 = `{id, name, emoji, cats[≤5], issues[]}`, 이슈 = `{id, cat, severity, symptom, keywords, causes[], steps[], escalate}`. 5팩(안마의자 30 + 정수기·에어컨·보일러·커피머신 각 20 = 110건). **이슈 id·계통 id는 전 팩 유일 필수**(즐겨찾기·메모·기록이 id 기준 전역 저장 — 신규 팩은 고유 접두사 사용). 계통 색은 시리즈 5색 순환. 전부 **AI 빌드타임 생성 데이터** — 실도입 시 검수 필수. severity high(안전: 가스·CO·화재·감전·화상)는 목록 라벨 노출. 선택 팩은 fix-app-v1.packId로 저장·복원.
- **검색** (`searchIssues`): 증상+키워드+계통명을 소문자 결합해 공백 구분 다중 단어 AND 부분 일치. 클라이언트 전용이라 오프라인 동작.
- **이슈 상세** (`IssueView.jsx`): 원인 후보 → 조치 단계(탭하면 체크·취소선, **세션 한정** — 저장 안 함) → 에스컬레이션(빨간 테두리 강조) → 내 메모(blur 시 저장) → "해결 완료로 기록".
- **저장**: `fix-app-v1`에 `{favorites, notes}` 통합, 해결 기록은 `fix-log-v1`(최신순, 상한 500). 키를 쪼개지 말 것. 서버 동기화가 필요해지면 storage.js만 교체.
- **PWA** (`vite.config.js`): 이슈 맵이 JS 번들에 포함되므로 프리캐시만으로 전체 가이드가 오프라인 동작 — 이 앱의 핵심 소구점.

## 규약 (데모 시리즈 공통)

- UI 언어는 한국어. 코드 주석도 한국어.
- 디자인: 배경 `#1E2126`(주철), 텍스트 `#F2EFE9`(초크), 계통 5색은 시리즈 공통 팔레트(빨 `#E4574B`/파 `#4E8FD9`/노 `#E8B93E`/초 `#57A867`/분 `#D96BA0`). 폰트: Black Han Sans + Noto Sans KR.
- 앱 아이콘: 돋보기 + 이슈 점(빨강) — "이슈를 찾아 짚어주는 길잡이". 재생성은 `npm run icons`.
- 모바일 퍼스트(maxWidth 480). 현장 장갑 낀 손 고려해 터치 타깃 크게.
- **시리즈 상호 링크**: 홈 하단 SeriesLinks가 `data/series.js`에서 자기(SELF_ID)를 뺀 형제 앱을 노출. **새 데모 앱이 추가되면 모든 형제 앱의 series.js를 함께 갱신·재배포한다**(마스터 지시 2026-07-22).

## 배포

- Vercel 프로젝트 `itda-demo-fix-guide`, 프로덕션 https://itda-demo-fix-guide.vercel.app — 배포 네이밍 규약: 저장소명 `demo-*`, 배포는 `itda-demo-*`.
- 문의 폼: Vercel 환경변수 `TELEGRAM_BOT_TOKEN`·`TELEGRAM_CHAT_ID`(Production) — 원본은 `~/Apps/demo-apps/.env`(ItdaContractBot).
- 강의 배포 관례: 프로덕션 URL → QR 코드로 수강생 폰에 즉시 배포.

## 미착수 / 로드맵 후보

- [ ] 이슈 데이터 검수 플로우 문서화 (AI 초안 → 베테랑 기사 검수 → 반영)
- [ ] AI 질답(2단계) — 서버리스 프록시 경유, 이슈 맵을 컨텍스트로. 런타임 키 노출 없이
- [ ] 사진 첨부 메모 (접수 근거용)
- [ ] 팀 공유(이슈 맵·기록 동기화) — 서버 필요, storage.js 교체 지점
