# Changelog

AI 칼로리 트래커 프로젝트 변경 이력

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

## [2026-04-20] PRD v2 재작성 (Cal AI 방향 전환)

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
- `docs/PRD.md` — v1.0 → v2.0 전면 재작성

---

## [2026-04-21] Cal AI v2 전면 재구현 (harness 파이프라인 R3)

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
- `output/index.html` — Cal AI v2 전면 재구현 (9화면, 2오버레이, 11개 FR 구현)
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
