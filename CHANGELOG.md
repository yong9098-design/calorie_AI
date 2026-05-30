# Changelog

AI 칼로리 트래커 프로젝트 변경 이력

## 작성 규칙

- **날짜 순서**: 최신 항목이 항상 하단에 위치 (오래된순 정렬, 맨 위는 가장 먼저 작성된 항목)
- **형식**: `## [YYYY-MM-DD] <기능명 또는 작업 요약>`
- **섹션**: 구현 내용, 핵심 로직, 변경된 파일, QA 결과 (필요한 것만)
- **한국어 톤**: 전문적이고 기술적인 한국어 사용
- **마침표**: 모든 한국어 문장은 마침표(`.`)로 종료

---

## [2026-04-13] PRD V0 작성 및 프론트엔드 목업 초기 구현 (수동)

### 구현 내용
- PRD V0 초안: 음식 사진 → Gemini 분석 → 칼로리 기록 아이디어 정리 (amirdora/ai_calorie_tracker 레포 참고)
- 단일 파일 목업 구조 구성: `output/index.html` + 로컬 서버 `server.js`
- 화면 구성: 인증(로그인/회원가입), 홈(칼로리 현황), 설정(API Key 입력)
- Gemini 이중 모델 전략 수립: Flash(기본) + Pro(상세 분석 요청 시)

### 변경된 파일
- `output/index.html` — 초기 목업 (인증 + 홈 + 설정)
- `server.js` — 로컬 개발용 Gemini API 프록시 (`http://127.0.0.1:3000/`)

---

## [2026-04-17] Supabase 연동 시도 및 이슈 확인 (수동)

### 구현 내용
- 이미지 업로드 → Gemini 분석 → 칼로리/영양소 표시 동작 확인
- Supabase Auth 이메일 로그인·회원가입 연동
- 식단 저장(`meal_logs`) 및 프로필(`profiles`) Supabase 저장 시도

### 이슈
- Supabase 테이블 미생성으로 저장 실패 (`PGRST205` 404 오류)
- 다음 단계: `supabase_setup.sql` 작성 → PRD v1.0 정리 → harness 파이프라인 R1 실행

### 변경된 파일
- `output/index.html` — Supabase Auth + 저장 로직 추가

---

## [2026-04-20] MVP 웹 앱 초기 구현 (harness 파이프라인 R1)

### 구현 내용
- Planner → Generator → Evaluator 3-Agent 하네스 파이프라인 1회 실행으로 완전한 SPA 생성
- 회원가입/로그인 (Supabase Auth, 이메일/비밀번호)
- 음식 이미지 업로드 → Gemini 1.5 Flash API 분석 → 영양소(칼로리/단백질/탄수화물/지방) 자동 추출
- 일일 칼로리 현황 SVG 링 차트 (목표 대비 섭취량 시각화)
- 날짜별 식단 히스토리 리스트 (Supabase meal_logs 조회)
- 식사 타입 선택 (아침/점심/저녁/간식)
- 일일 목표 칼로리 설정 (Supabase profiles UPSERT)
- 설정 화면에서 Supabase URL/Key, Gemini API Key 입력 (localStorage 저장)

### 핵심 로직
- **Gemini API 연동**: FileReader API로 이미지를 base64 변환 후 `inline_data` 방식으로 POST. 응답 텍스트에서 JSON 정규식 파싱으로 영양소 추출
- **SPA 라우팅**: `showScreen(id)` 함수로 섹션 show/hide 전환. Bottom Navigation 4탭
- **SVG 링 차트**: `stroke-dashoffset` 애니메이션으로 칼로리 진행률 표시 (r=54, circumference=339.3)
- **XSS 방어**: 모든 동적 DOM 삽입에 `escHtml()` 함수 적용
- **에러 처리**: 모든 async 함수 try/catch, 한국어 에러 메시지 매핑, 로딩 중 버튼 disabled 처리

### 변경된 파일
- `output/index.html` — 칼로리 트래커 SPA 전체 구현 (HTML+CSS+JS 단일 파일)
- `SPEC.md` — Planner가 생성한 상세 화면 설계서
- `SELF_CHECK.md` — Generator 자체 점검 문서
- `QA_REPORT.md` — Evaluator 검수 결과

### QA 결과
- 최종 점수: 8.7/10 (반복 횟수: 1회)
- 기능성 8/10, UX/디자인 9/10, 기술품질 9/10, 기능완성도 10/10
- **판정: 합격**
- 잔여 개선 권장: 회원가입 성공 메시지 UI 색상 수정, 식사 카드 썸네일 추가

---

## [2026-04-20] UX 개선 적용 (harness 파이프라인 R2)

### 구현 내용
- 회원가입 성공 메시지 UI 개선: 빨간 에러 박스 → 초록 성공 박스(`showAuthSuccess()`) 분리
- 홈 화면 식사 카드 썸네일 추가: `image_url` 있으면 40×40px 이미지, 없으면 식사 타입별 이모지(🍳/🍱/🍽️/🍪) 박스 표시

### 핵심 로직
- **성공 메시지 분리**: `.success-msg` CSS 클래스(#f0fdf4 배경, #bbf7d0 테두리) + `showAuthSuccess()` / `hideAuthSuccess()` 함수 추가. 탭 전환 시 자동 초기화
- **썸네일 렌더링**: `MEAL_TYPE_EMOJI` 상수로 타입별 이모지 매핑, `escHtml(m.image_url)` XSS 방어 적용

### 변경된 파일
- `output/index.html` — UX 개선 2건 반영 (CSS/HTML/JS 수정)
- `SELF_CHECK.md` — R2 수정 내용 업데이트
- `QA_REPORT.md` — Evaluator R2 검수 결과 추가

### QA 결과
- 최종 점수: 9.2/10 (반복 횟수: 2회)
- 기능성 8/10, UX/디자인 10/10, 기술품질 10/10, 기능완성도 10/10
- **판정: 합격**

---

## [2026-04-20] PRD v2.0으로 변경 되었음 (CALO AI 방향 전환)

### 구현 내용
- amirdora/ai_calorie_tracker 저장소 기반으로 PRD 전면 재작성
- 온보딩(신체정보 + Harris-Benedict TDEE 자동계산) 신규 추가
- 기능 요구사항 FR-1~FR-11 체계화 (기존 비정형 → 번호 체계)
- Gemini 이중 모델 전략: Flash(기본) + Pro(설정 선택)
- 재분석 UX 흐름 추가: 저장 이미지 재전송 vs 새 사진 선택
- MVP 6기능 → 9기능으로 확장

### 핵심 결정 사항
- 플랫폼: Web App 유지 (HTML/CSS/JS + Supabase)
- 저장: Supabase MVP부터 (로컬 전용 아님)
- 칼로리 목표: Harris-Benedict 공식 자동계산 (목표 보정 ±500/300 kcal)
- 재분석 UX: 사용자가 "저장 이미지 재전송 / 새 사진 업로드" 직접 선택

### 변경된 파일
- `PRD.md` — v1.0 → v2.0 전면 재작성

---

## [2026-04-21] CALO AI v2 전면 재구현 (harness 파이프라인 R3)

### 구현 내용
- PRD v2.0 기반 9개 화면 SPA 전면 재구현 (기존 6기능 → 9기능)
- 온보딩 4단계: 성별/나이/키/몸무게 → 활동량 → 목표 → TDEE 결과 확인
- Harris-Benedict 공식 TDEE 자동계산 (감량 -500kcal, 증량 +300kcal 목표 보정)
- Gemini 이중 모델 전략: 1.5 Flash(기본) / 1.5 Pro(설정 선택)
- 재분석 모달 UX: 저장된 이미지 재전송 vs 새 사진 업로드 사용자 선택
- AI 분석 실패 시 수동 입력 fallback 화면 (FR-10)
- 통계 화면: 일/주/월 탭 + SVG 바 차트 (목표 dashed line, 초과 시 orange)
- 저장 전 수정 화면: 음식명/양/영양소 직접 편집 (FR-5)

### 핵심 로직
- **Harris-Benedict TDEE**: `calcTDEE()` — 남/여 BMR 분기, 활동계수(1.2~1.9) 곱, 목표별 보정
- **Gemini 이중 모델**: `getGeminiEP()` — localStorage `gemini_model` 값으로 flash/pro 엔드포인트 동적 선택
- **재분석 저장 이미지**: `reanalyzeSaved()` — image_url → fetch → blob → FileReader base64 → Gemini 전송
- **온보딩 동기화**: `syncOnboarding()` — 로그인 성공 시 onboarding_temp → profiles UPSERT
- **image_url 저장**: `saveMeal()` — `currentBase64` 존재 시 `data:{mime};base64,...` 형식으로 meal_logs 저장 (R3 수정)
- **SPA 라우팅**: `showScreen(id)` + `showMain(tab)` — Bottom Nav 홈/기록/통계/설정 4탭

### 변경된 파일
- `output/index.html` — CALO AI v2 전면 재구현 (9화면, 2오버레이, 11개 FR 구현)
- `SPEC.md` — Planner R3 생성 화면 설계서 (9화면 상세)
- `SELF_CHECK.md` — R3 Generator 자체 점검 업데이트
- `QA_REPORT.md` — Evaluator R3 검수 결과 추가

### QA 결과
- 최종 점수: 8.1/10 (반복 횟수: 3회)
- 기능성 7/10, UX/디자인 9/10, 기술품질 8/10, 기능완성도 10/10
- **판정: 합격**
- 즉시 수정 적용: image_url null 하드코딩 → base64 data URL 저장으로 수정 (재분석 기능 복원)

---

## [2026-04-22] Supabase 테이블 생성 및 Gemini 모델별 API 키 분리

### 구현 내용
- Supabase MCP를 통해 `#1 Project` (ap-northeast-2, stboklbbfbipmqukrahc)에 테이블 직접 생성
  - `profiles` 테이블: 사용자 신체정보·목표·gemini_model 저장, RLS 활성화
  - `meal_logs` 테이블: 식단 기록 저장, user_id 인덱스, RLS 활성화
- Gemini API 키를 모델별로 분리: 단일 `GEMINI_API_KEY` → `GEMINI_API_KEY_FLASH` / `GEMINI_API_KEY_PRO`
- `api/analyze.js` 수정: 요청 모델(flash/pro)에 따라 각각 다른 API 키 선택, Pro 키 미설정 시 Flash 키로 자동 폴백

### 핵심 로직
- **테이블 RLS**: `auth.uid() = id (profiles)` / `auth.uid() = user_id (meal_logs)` 정책으로 본인 데이터만 접근
- **모델별 키 라우팅**: `GEMINI_API_KEY_PRO || GEMINI_API_KEY_FLASH` 폴백 체인으로 하위 호환 유지
- **Pro 폴백**: Pro 키로 403/404/429 오류 발생 시 Flash 키로 자동 재시도 (기존 로직 유지)
- **하위 호환**: 기존 단일 `GEMINI_API_KEY` 환경변수도 `GEMINI_API_KEY_FLASH` 폴백으로 인식

### 변경된 파일
- `api/analyze.js` — 모델별 API 키 분기 로직 추가
- `.env` — `GEMINI_API_KEY` → `GEMINI_API_KEY_FLASH` + `GEMINI_API_KEY_PRO` 분리
- `.env.example` — 새 키 양식 및 설명 주석 추가

### QA 결과
- Supabase MCP로 테이블 생성 확인 (profiles, meal_logs 각 RLS 활성화)
- Flash(`gemini-2.5-flash`) 및 Pro(`gemini-2.5-pro`) API 직접 호출 검증 완료
- 반복 횟수: 해당 없음 (설정·인프라 작업)

---

## [2026-04-23] UX 상업화, 배포 완료, AI 한국어 고정 (R5)

### 구현 내용
- **바텀 시트 카메라/갤러리 분리 UX**: FAB 클릭 시 바텀시트 슬라이드업 → 카메라(초록 카드) / 갤러리(보라 카드) 두 버튼으로 분기. 스마트폰에서 카메라 직접 실행(`capture="environment"`), PC에서는 파일 피커 동작
- **FAB 카메라 아이콘 교체**: 기존 [+] 텍스트 FAB → 카메라 SVG 아이콘 + 초록 그라디언트 스타일(60px), 빈 상태 문구 "📸 카메라 버튼을 눌러 음식을 찍어보세요"로 변경
- **비회원 닉네임 커스텀 모달**: 기존 브라우저 `prompt()` 제거 → 상업적 디자인의 커스텀 모달(`#guest-modal`)로 교체
- **로그아웃 커스텀 모달**: 기존 `confirm()` 제거 → 회원/게스트 분기(`currentUser` 판별) 동적 콘텐츠, [취소]/[로그아웃] 버튼 포함 모달
- **목표 저장 토스트 알림**: 기존 `alert()` 제거 → 2.2초 자동 소멸 토스트(`#save-toast`, `showToast()`) 하단 표시
- **재설정 확인 커스텀 모달**: 기존 `confirm()` 제거 → [취소]/[재설정] 버튼 포함 위험 확인 모달(`#reset-modal`)
- **AI 모델 카드 가격 뱃지**: Flash 카드에 "하루 20장 무료", Pro 카드에 "장당 3원 · Gemini 2.5" `.model-badge` 태그 추가 (화면 잘림 없음)
- **재설정 후 재로그인 불필요**: `saveOnboarding()` 내 `currentUser` 분기 추가 — 로그인 상태에서 온보딩 완료 시 `syncOnboarding()` / `applyGuestProfile()` 즉시 호출 후 홈 화면(`showMain('home')`) 바로 이동. 미인증 사용자만 기존 로그인 화면으로 이동
- **GitHub 저장소 push 및 Vercel 배포**: `https://github.com/yong9098-design/calorie_AI` 저장소에 전체 코드 push, Vercel 프로젝트(`calorie-ai-gamma.vercel.app`) 자동 배포 연동 완료
- **`vercel.json` explicit builds 설정**: 루트 `server.js`가 Vercel 엔트리포인트로 오인되는 문제 수정 → `builds` 배열로 `api/config.js`, `api/analyze.js`는 `@vercel/node`, `output/**`은 `@vercel/static` 명시
- **`server.js` → `local-server.js` 리네임**: 로컬 개발 전용 서버 파일 구분. `start-local-server.bat` 참조 경로 동기화
- **`src/` 폴더 및 `build.js` 삭제**: 더 이상 사용되지 않는 빌드 시스템 소스 파일 제거. `output/index.html` 직접 편집 방식으로 완전 전환
- **AI 분석 프롬프트 한국어 강제**: `api/analyze.js` `ANALYSIS_PROMPT`에 "모든 텍스트(food_name, 음식명, 설명, note 등)는 반드시 한국어로 작성하세요" 지시 추가 — 영어 응답 방지

### 핵심 로직
- **바텀 시트**: `openBottomSheet()` / `closeBottomSheet()` + 백드롭 블러 오버레이. `<input type="file" capture="environment">` (카메라)와 `<input type="file">` (갤러리) 두 개 분리
- **커스텀 모달 패턴**: HTML 고정 모달 요소 + JS `open/close` 토글 함수. `confirm()`/`prompt()` 완전 제거
- **`saveOnboarding()` 로그인 분기**:
  ```js
  if (currentUser) {
    isGuestMode() ? applyGuestProfile({...data}) : await syncOnboarding(currentUser.id);
    localStorage.removeItem('onboarding_temp');
    await loadProfile();
    showMain('home');
  } else {
    showScreen('auth');
  }
  ```
- **Vercel 라우팅 수정**: `vercel.json`에 `builds` 배열 추가로 루트 `server.js` 없이도 `api/*.js` 서버리스 함수 정상 인식
- **AI 프롬프트**: `ANALYSIS_PROMPT` 마지막에 한국어 강제 문장 + `responseJsonSchema` 구조화 응답으로 일관된 JSON 출력 보장

### 변경된 파일
- `output/index.html` — 바텀시트, FAB 아이콘, 커스텀 모달 4종, 모델 뱃지, 재설정 분기 로직 추가
- `api/analyze.js` — `ANALYSIS_PROMPT` 한국어 강제 문장 추가
- `vercel.json` — `builds` 배열 명시 추가 (서버리스 함수 + 정적 파일 명확 분리)
- `local-server.js` — 기존 `server.js` 리네임 (로컬 개발 전용 명시)
- `start-local-server.bat` — `node server.js` → `node local-server.js` 경로 수정
- `package.json` — 신규 생성 (Node 18+ 엔진 명시, npm 의존성 없음)
- `src/` — 전체 삭제 (24개 파일 + `build.js`)

### QA 결과
- Vercel 배포 URL `https://calorie-ai-gamma.vercel.app` 에서 `/api/config` 정상 응답 확인
- 스마트폰 실기기에서 카메라/갤러리 분기 동작 확인
- 커스텀 모달 4종 (비회원, 로그아웃, 재설정, 저장 토스트) 동작 확인
- 로그인 상태 재설정 후 홈 화면 즉시 이동 확인
- 반복 횟수: 해당 없음 (UX 개선 + 배포 작업)

---

## [2026-04-25] Vercel Edge Runtime 호환성 수정 및 배포 파이프라인 정비

### 구현 내용
- Vercel 프로젝트 설정 `framework: "node"` → `framework: null` 변경 (REST API 직접 수정)
- `vercel.json`에서 `builds` 배열 제거, `outputDirectory: "output"` 방식으로 전환
- `api/config.js`, `api/analyze.js`에 `export const config = { runtime: 'edge' }` 적용 (Edge Runtime)
- `vercel build --prod` + `vercel deploy --prebuilt --prod` 수동 배포 파이프라인 확립

### 핵심 로직
- **Edge Runtime 전환**: `@vercel/node` 빌더 제거 후 `runtime: 'edge'` export로 전환 → Cold Start 없이 빠른 응답
- **outputDirectory 방식**: `builds` 배열 없이 `outputDirectory: "output"`으로 정적 파일 서빙 + API 라우트 자동 인식

### 변경된 파일
- `vercel.json` — `builds` 배열 제거, `outputDirectory`, `headers`, `routes` 단순화
- `api/config.js` — Edge Runtime 설정 추가
- `api/analyze.js` — Edge Runtime 설정 추가

### QA 결과
- Vercel 프로덕션 배포 정상 완료 확인
- 반복 횟수: 해당 없음 (인프라 수정)

---

## [2026-04-25] 기록 탭 사진 복원 및 3단 캐시 아키텍처 도입

### 구현 내용
- `renderHistory()` 함수에서 `image_url` 있으면 `<img>` 태그 렌더링 (기존: 항상 이모지 아이콘)
- 3단 캐시 분리: `mealCache`(프리로드·이미지 없음) / `homeMealCache`(홈 상세·이미지 있음) / `historyMealCache`(기록 탭·이미지+노트)
- SELECT 상수 3종 정의: `MEAL_SUMMARY_SELECT` / `MEAL_HISTORY_SELECT` / `MEAL_DETAIL_SELECT`
- `invalidateMealCache()` → 3개 캐시 동시 초기화 + 프리로드 재실행

### 핵심 로직
- **3단 캐시**: 경량 프리로드(30일 요약)와 이미지 포함 상세 데이터를 캐시 분리 → 홈 즉시 렌더 유지하면서 기록 탭 사진 표시
- **SELECT 상수**: `MEAL_HISTORY_SELECT = 'id,meal_type,food_name,calories,protein,carbs,fat,image_url,notes,logged_at'`

### 변경된 파일
- `output/index.html` — `renderHistory()` 이미지 렌더 복원, 3단 캐시 구조, SELECT 상수 추가

### QA 결과
- 기록 탭 사진 정상 표시 확인
- 반복 횟수: 해당 없음 (버그 수정)

---

## [2026-04-25] 기록 탭 2단계 렌더링 (딜레이 제거)

### 구현 내용
- `fetchAndUpdateThumbs(key, start, end)` 함수 신규 추가: 백그라운드에서 이미지 포함 데이터 fetch 후 `renderHistory()` 재호출
- `loadHistoryData()` 캐시 체크 순서 개선:
  1. `historyMealCache` 히트 → 즉시 렌더 (이미지 있음)
  2. `homeMealCache` 히트 → 즉시 렌더
  3. `mealCache` 히트 → **즉시 렌더 (이미지 없음)** + 백그라운드 `fetchAndUpdateThumbs` 실행
  4. 캐시 없음 → 스피너 → `MEAL_HISTORY_SELECT` fetch

### 핵심 로직
- **Phase 1**: 로그인 시 프리로드된 `mealCache` 데이터로 0ms 즉시 렌더 (이모지 아이콘)
- **Phase 2**: 백그라운드 fetch 완료 후 이미지 포함 데이터로 재렌더 (~500ms)
- 재방문 시 `historyMealCache` 캐시 히트로 사진까지 즉시 표시

### 변경된 파일
- `output/index.html` — `fetchAndUpdateThumbs()`, `loadHistoryData()` 수정

### QA 결과
- 기록 탭 첫 방문: 즉시 렌더 후 ~0.5초 내 사진 교체 확인
- 날짜 이동: 스피너 없이 즉시 렌더 확인
- 반복 횟수: 해당 없음 (성능 개선)

---

## [2026-04-25] 설정 화면 UI 수정 — 모델 뱃지 줄바꿈, 기본 모델 PRO, 기록 탭 분석 보기

### 구현 내용
- `.model-badge` CSS: `white-space:nowrap` → `white-space:normal; word-break:keep-all` (좁은 화면 줄바꿈 허용)
- `.model-radio-group` 하단 패딩 `14px` → `16px` 조정
- `profile` 기본값 `gemini_model: 'flash'` → `'pro'` 변경
- 기록 탭 `renderHistory()`에 "칼로리 분석 보기" 기능 추가 (홈 탭 `renderMeal()`과 동일한 드롭다운 상세 뷰)

### 핵심 로직
- **기록 탭 상세 뷰**: `hasDetail`, `notesAttr`, `clickAttr`, `hint` 변수로 클릭 가능 카드 조건부 렌더 — `MEAL_HISTORY_SELECT`에 `notes` 포함 쿼리

### 변경된 파일
- `output/index.html` — 뱃지 CSS, 기본 모델, 기록 탭 상세 뷰 로직

### QA 결과
- Android 좁은 화면에서 뱃지 텍스트 줄바꿈 확인
- 기록 탭 카드 클릭 시 영양소 상세 드롭다운 확인
- 반복 횟수: 해당 없음 (UX 개선)

---

## [2026-04-25] PWA 설치 지원 (Android Chrome 홈 화면 추가)

### 구현 내용
- `output/manifest.webmanifest` 신규 생성: `display: standalone`, 아이콘 192/512px 정의
- `output/icons/icon-192.png` / `output/icons/icon-512.png`: 녹색(#22c55e) 원형 아이콘 (Node.js PNG 인코더로 생성)
- `output/sw.js` 신규 생성: 네트워크 우선 서비스 워커 (API 요청은 항상 네트워크, 나머지는 캐시 폴백)
- `output/index.html` head: manifest 링크, theme-color, apple-touch-icon, mobile-web-app-capable 메타태그 추가
- `output/index.html` body 말미: 서비스 워커 등록 스크립트 추가
- `vercel.json`: manifest Content-Type 헤더, sw.js Service-Worker-Allowed 헤더 추가

### 핵심 로직
- **서비스 워커 전략**: `PRECACHE` 배열(/, manifest, 아이콘)은 설치 시 즉시 캐싱. API 요청(`/api/`)은 항상 네트워크. 나머지는 네트워크 우선 → 실패 시 캐시 폴백
- **PWA 설치 조건 충족**: HTTPS + manifest + 서비스 워커 등록 → Chrome Android "앱 설치" 배너 자동 트리거

### 변경된 파일
- `output/manifest.webmanifest` — 신규 생성
- `output/sw.js` — 신규 생성
- `output/icons/icon-192.png`, `output/icons/icon-512.png` — 신규 생성
- `output/index.html` — PWA 메타태그 + SW 등록 스크립트 추가
- `vercel.json` — PWA 관련 응답 헤더 추가

### QA 결과
- Android Chrome에서 "홈 화면에 추가" / "앱 설치" 옵션 노출 확인
- 반복 횟수: 해당 없음 (PWA 설정)

---

## [2026-04-25] Android Chrome 레이아웃 짤림 수정 (safe-area + flex-shrink)

### 구현 내용
- `viewport` 메타태그에 `viewport-fit=cover` 추가 → `env(safe-area-inset-bottom)` 값 활성화
- `<meta name="color-scheme" content="light">` 추가 → 브라우저 강제 다크모드 적용 방지
- `:root { color-scheme: light }` CSS 추가 → 라이트 테마 고정
- `#bottom-nav` 높이: `60px` → `calc(60px + env(safe-area-inset-bottom,0px))`, 하단 패딩 추가
- `.screen` 하단 패딩: `70px` → `calc(70px + env(safe-area-inset-bottom,0px))`
- `#fab` 위치: `bottom: 76px` → `calc(76px + env(safe-area-inset-bottom,0px))`
- `.settings-section` 에 `flex-shrink: 0` 추가 → 뷰포트 축소 시 섹션 압축 방지
- `.top-bar` 에 `min-height: 56px` 추가 → flex 압축 방지

### 핵심 로직
- **Safe Area 대응**: `viewport-fit=cover` + `env(safe-area-inset-bottom)` 조합으로 Android 제스처 내비게이션 바 / OS 내비게이션 바 영역에 콘텐츠가 가려지지 않도록 처리
- **flex-shrink 차단**: `.screen`이 flex column 컨테이너이고 뷰포트가 짧을 때(Chrome URL바 + 하단 툴바 표시 상태) 섹션 항목이 압축 → `overflow:hidden`이 버튼 하단 클리핑. `flex-shrink:0`으로 섹션은 압축 없이 스크롤로 대응
- **다크모드 차단**: `color-scheme: light` 선언으로 Chrome Auto Dark Mode가 앱 색상을 임의 반전하는 현상 차단

### 변경된 파일
- `output/index.html` — viewport 메타, color-scheme, safe-area 패딩, flex-shrink 수정

### QA 결과
- Vercel 프로덕션 배포 완료 (`calorie-ai-gamma.vercel.app`)
- 반복 횟수: 해당 없음 (레이아웃 버그 수정)

---

## [2026-05-01] 카메라 버튼 → 카메라 앱 직접 실행 수정

### 구현 내용
- 스마트폰에서 "카메라로 촬영" 버튼 클릭 시 카메라 앱이 직접 열리지 않고 갤러리(파일 선택기)가 열리는 버그 수정
- `<input type="file" id="img-input-camera">` 에 `capture="environment"` 속성 추가

### 핵심 로직
- **`capture` 속성**: HTML 파일 입력에 `capture` 속성이 없으면 브라우저는 기본 파일 선택기(갤러리)를 열고, `capture="environment"`가 있어야 후면 카메라 앱을 직접 실행
- 갤러리 버튼용 `img-input-gallery` 입력은 `capture` 없는 상태 유지 (의도된 동작)

### 변경된 파일
- `output/index.html` — `img-input-camera` 입력에 `capture="environment"` 추가

### QA 결과
- Vercel 프로덕션 배포 완료 (`calorie-ai-gamma.vercel.app`)
- 반복 횟수: 해당 없음 (버그 수정)

---

## [2026-05-01] 기록 탭 과거 날짜 식사 추가 기능

### 구현 내용
- 기록 탭 상단에 "+ 식사 추가" 버튼 신규 추가
- 기록 탭에서 날짜 이동 후 식사 추가 시 해당 날짜(`historyDate`)로 `logged_at` 저장
- 홈 탭 FAB으로 추가 시 현재 시각으로 저장하는 기존 동작 유지

### 핵심 로직
- `pendingLogDate` 변수: FAB 클릭 시 `null`(현재 시각), 기록 탭 버튼 클릭 시 `new Date(historyDate)` 설정
- `saveMeal()` 내 `logged_at: (pendingLogDate || new Date()).toISOString()` — 저장 후 `pendingLogDate = null` 초기화
- `addMealForHistoryDate()` 함수: `pendingLogDate`를 `historyDate`로 설정 후 바텀 시트 열기

### 변경된 파일
- `output/index.html` — 기록 탭 헤더 버튼, `pendingLogDate` 변수, `addMealForHistoryDate()` 함수, `saveMeal()` logged_at 수정

### QA 결과
- Vercel 프로덕션 배포 완료 (`calorie-ai-gamma.vercel.app`)
- 반복 횟수: 해당 없음 (신규 기능)

---

## [2026-05-01] 통계 탭 식관리 분석 — 영양소 평균 + AI 식단 평가

### 구현 내용
- 통계 탭 하단 "식관리 분석 보기" 토글 버튼 신규 추가
- 패널 펼치면 ① 영양소 평균 막대 ② AI 식단 분석 요청 버튼 ③ 날짜별 식단 목록 표시
- 주간/월간 탭 전환 시 패널 열려 있으면 자동 갱신
- `api/analyze.js`에 텍스트 전용 분석 모드 추가 (`body.prompt` 존재 시 이미지 없이 텍스트만으로 Gemini 호출)

### 핵심 로직
- **영양소 평균**: 기록된 날 수로 나눠 일 평균 계산 → `profile.*_goal` 대비 달성률 progress bar 표시, 초과 시 red
- **AI 분석 프롬프트**: 4개 항목(칼로리 분석 / 영양소 균형 / 식사 패턴 / 주의사항) 상세 분석 요청, 추천 식단 제외
- **서버 통과**: `/api/analyze` 엔드포인트 재사용 — `{ prompt }` 전송 시 `requestGeminiText()` 분기 처리, Gemini API 키 서버 보관 유지
- **날짜별 목록**: `logged_at` 기준 그룹핑, 최신순 정렬, 이모지 식사 타입 표시

### 변경된 파일
- `output/index.html` — 통계 탭 HTML 패널, 상태 변수, `toggleDietMgmt` / `loadDietMgmtData` / `renderDietMacro` / `requestDietAI` / `renderDietList` 함수
- `api/analyze.js` — `requestGeminiText()` 함수 추가, handler에 텍스트 모드 분기 추가

### QA 결과
- Vercel 프로덕션 배포 완료 (`calorie-ai-gamma.vercel.app`)
- 반복 횟수: 해당 없음 (신규 기능)

---

## [2026-05-18] 카메라 버그 근본 원인 분석 및 영구 해결

### 구현 내용
- **즉각 수정**: `output/index.html` line 570에 `capture="environment"` 속성 추가 (카메라 촬영 기능 복구)
- **설계 문서 강화**: SPEC.md에 "[필수] 카메라/갤러리 input HTML 명세" 섹션 추가
- **생성 로직 명확화**: agents/generator.md에 "[필수] 카메라/갤러리 이미지 입력 구현" 섹션 추가 (HTML 코드 스니펫 + 주의사항)
- **검수 기준 강화**: agents/evaluation_criteria.md에 "[필수] 카메라 기능" 4개 체크리스트 추가
- **검사 항목 추가**: agents/evaluator.md Stage 2에 "[필수] 카메라 input 속성 검사" 2개 항목 추가
- **영구 문서화**: docs/CAMERA_BUG_TRACKING.md 신규 생성 (버그 이력 + 재발 방지 가이드)

### 핵심 로직
- **근본 원인**: Generator 파이프라인이 SPEC.md 기반으로 재생성할 때, 설계 문서에 명시되지 않은 `capture` 속성이 매번 사라짐
- **3가지 갭**:
  1. SPEC.md에 `capture="environment"`이 JS 주석 안에만 있고 HTML 명세로 명시 안 됨
  2. agents/generator.md에 카메라 input 구현 지시 전무
  3. agents/evaluation_criteria.md + agents/evaluator.md에 `capture` 속성 검사 항목 없음
- **재발 방지 메커니즘**: 3중 안전장치 구축 (설계 규격 → 생성 지시 → 검수 체크리스트)

### 변경된 파일
- `output/index.html` (line 570) — `capture="environment"` 속성 추가
- `SPEC.md` (화면 3 뒤) — 카메라/갤러리 input HTML 명세 블록 추가
- `agents/generator.md` (구조 설계 섹션 뒤) — 카메라/갤러리 구현 필수 지시 추가
- `agents/evaluation_criteria.md` (기능성 합격 기준 뒤) — 카메라 기능 체크리스트 추가
- `agents/evaluator.md` (Stage 2 체크리스트 뒤) — 카메라 input 속성 검사 항목 추가
- `docs/CAMERA_BUG_TRACKING.md` (신규) — 버그 추적 및 재발 방지 가이드

### QA 결과
- **버그 분류**: Recurring Regression (설계 문서 갭으로 인한 반복 발생)
- **반복 횟수**: 3회 이상 (2026-04-23, 2026-05-01, 2026-05-18)
- **수정 방식**: 즉각 수정 (line 570) + 근본 원인 제거 (설계 문서 5개 파일 업데이트)
- **재발 위험도**: 매우 낮음 (Generator/Evaluator가 자동으로 보존)

---

## [2026-05-20] 식품 검색 목업 분리 및 로컬 개발 서버 재정비

### 구현 내용
- **식품 검색 목업 모듈 분리**: `output/food-db-mockup.html` → `docs/mockups/food-db-mockup.html` 이동 및 경로 정리.
- **로컬 개발 서버 통합 지원**: `dev-server.js` 수정으로 기존 경로(`/`) + 신규 경로(`/food-db-mockup.html`) 동시 서빙 가능.
  - `/` 또는 `/food-db-mockup.html` 요청 → `docs/mockups/food-db-mockup.html` 제공
  - `/api/food-search` → 한국 정부 식품영양DB API 프록시 (Vercel Edge Function과 동일)
  - `output/` 정적 파일은 기존대로 서빙
- **슬래시 커맨드 구현**: `.claude/commands/update-changelog.md` 신규 생성.
  - `/update-changelog` 커맨드로 마지막 CHANGELOG 항목 이후의 git 커밋 자동 감지.
  - 변경 파일 분석 및 한국어 기술 요약 자동 작성.

### 개발 방법론 결정: 기능 분리 개발 (사후 통합)
- **선택 이유**: 초보자 입장에서 단순성 우선 (YAGNI 원칙).
- **식품 검색의 독립성**: 메인 칼로리 추적 로직과 완전히 별도 (Gemini API 분석 vs 정부 DB 조회).
- **병렬 개발 전략**: `output/index.html` (메인 앱 집중 개발) + `docs/mockups/food-db-mockup.html` (식품 DB 기능 독립 완성).
- **나중에 통합**: 두 기능이 완성되면 최종 단계에서 하나의 `output/index.html`로 머지.
  - 공통 코드(API 호출, UI 컴포넌트) 추출 후 재사용.
  - 탭/모드 방식으로 구조화 (칼로리 추적 탭 ↔ 식품 검색 탭).
- **장점**:
  1. 각 기능을 깔끔하게 독립 개발 가능.
  2. 파일 크기 관리 (output/index.html 현재 2138줄 → 기능별 분산).
  3. 버그 격리: 한 기능 수정이 다른 기능에 영향 없음.
  4. HTML/JS는 나중에도 쉽게 분리 가능.

### 핵심 로직
- **dev-server.js 라우팅**:
  ```javascript
  if (rawPath === '/' || rawPath === '/food-db-mockup.html') {
    const filePath = path.join(__dirname, 'docs', 'mockups', 'food-db-mockup.html');
    // → 파일 제공
  }
  ```
- **음식 검색 API 흐름** (food-db-mockup.html):
  1. 사용자 음식명 입력 → `/api/food-search?q=청국장`
  2. 로컬 서버는 한국 정부 식품영양DB API에 프록시 요청
  3. 영양소(칼로리/단백질/탄수화물/지방) 추출 후 크기별(소/중/대) 스케일링
  4. JSON 응답으로 클라이언트에 반환
- **마지막 CHANGELOG 감지 (`/update-changelog`)** :
  - git log에서 마지막 기록 날짜 추출.
  - 그 이후의 커밋과 수정 파일 목록 조회.
  - 각 파일 변경 내용 분석 후 한국어 요약 작성.

### 변경된 파일
- `docs/mockups/food-db-mockup.html` — 신규 이동 (기존: `output/food-db-mockup.html`)
- `dev-server.js` — `serveStatic()` 함수 수정 (mockup 경로 추가 지원)
- `.claude/commands/update-changelog.md` — 신규 생성 (git 기반 CHANGELOG 자동 업데이트 커맨드)

### QA 결과
- 로컬 서버에서 `http://localhost:3003/food-db-mockup.html` 200 응답 확인.
- 식품 검색 API 프록시 동작 확인 (GET `/api/food-search?q=청국장` → 결과 반환).
- 반복 횟수: 해당 없음 (재구성 작업).

---

## [2026-05-20] API 음식 검색 결과 크기 선택 기능 수정

### 구현 내용
- API 검색 결과 음식에 1000부터 시작하는 고유 ID 할당 (기존 충돌 해결).
- 음식 DB 모달에서 API 검색 결과 선택 및 크기 변경 기능 정상화.
- 검색 결과 음식 저장 기능 재확인 (localStorage에 정상 저장).

### 핵심 로직
- **ID 중복 문제**:
  - 기존: API 결과 ID = 1, 2, 3... (사전정의 음식 ID = 1-13과 충돌)
  - 수정: API 결과 ID = 1000, 1001, 1002... (고유 ID 할당)
  - 효과: `changeQtyDB(id, qty)` 호출 시 정확한 음식 객체 찾기 성공
- **변경 플로우**:
  ```javascript
  fooddbApiResults = results.map((item, idx) => ({
    ...item,
    id: 1000 + idx
  }));
  ```
- **저장 메커니즘**:
  - 비회원 모드: `localStorage['guest_meals']` 배열에 음식 데이터 추가
  - 구조: `{ meal_type, food_name, calories, protein, carbs, fat, quantity, logged_at }`

### 변경된 파일
- `output/index.html` — `searchFoodsFromApi()` 함수 수정 (API 결과 ID 리맵핑 추가)

### QA 결과
- ✅ 음식 검색: `http://127.0.0.1:8001/api/food-search?q=피자` 20개 결과 반환 확인
- ✅ 크기 선택: API 검색 결과에서 작음/중간/큼 버튼 클릭 시 상태 변경 (예: medium → large)
- ✅ 음식 저장: 선택 음식 저장 시 `guest_meals` localStorage에 정상 저장 (calories, protein, carbs, fat 정확함)
- ✅ 식사 기록 표시: 저장 직후 "기록" 탭에서 음식 표시 (영양소 정보 포함)
- 반복 횟수: 1회 (브라우저 테스트로 확인 완료)

