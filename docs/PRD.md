# Product Requirements Document (PRD)
# 칼로리 트래커 웹 앱 (Calo AI)

---

## 1. Project Overview

**Problem Statement**.  
사용자는 자신의 신체 정보를 바탕으로 일일 칼로리 필요량(TDEE)을 정확히 파악하고, 섭취한 음식을 기록하며, 목표 대비 진행 상황을 실시간으로 추적하고 싶으나, 기존 앱들은 복잡하고 수동 입력 부담이 큽니다.

**Solution**.  
AI 기반 음식 인식과 자동 TDEE 계산을 통해 사용자가 최소한의 입력으로 칼로리를 효율적으로 관리할 수 있는 직관적인 웹 앱을 제공합니다.

---

## 2. User Stories (P0 Only)

### P0-1: 신체 정보 입력 및 TDEE 계산
**User Story**.  
사용자는 나이, 성별, 키, 체중, 활동 수준을 입력하여 자신의 일일 칼로리 필요량(TDEE)을 자동 계산받고 싶습니다.

**Acceptance Criteria**.
- 신체 정보 입력 폼 표시 (나이, 성별, 키, 체중, 활동 수준 5개 필드)
- Harris-Benedict 공식으로 TDEE 자동 계산
- 계산 결과를 주요 대시보드에 표시
- 신체 정보 변경 시 TDEE 즉시 업데이트

---

### P0-2: 음식 추가 및 AI 기반 칼로리 인식
**User Story**.  
사용자는 음식명을 입력하거나 사진을 업로드하여 AI가 자동으로 칼로리를 인식하고 기록하고 싶습니다.

**Acceptance Criteria**.
- 텍스트 입력 또는 이미지 업로드 인터페이스 제공
- Google Gemini API를 통한 음식 인식 및 칼로리 추정
- 인식된 칼로리를 일일 기록에 추가
- 사용자 수정 가능 (AI 추정값 미조정)

---

### P0-3: 일일 칼로리 현황 대시보드
**User Story**.  
사용자는 목표 칼로리 대비 현재까지 섭취한 칼로리를 시각적으로 확인하고 싶습니다.

**Acceptance Criteria**.
- 진행 바(Progress Bar) 또는 원형 차트로 일일 목표 대비 섭취량 표시
- 남은 칼로리, 섭취 비율(%) 표시
- 실시간 업데이트 (음식 추가/삭제 시)
- 모바일 화면에서도 명확하게 표시

---

### P0-4: 회원 인증 (회원가입/로그인)
**User Story**.  
사용자는 이메일과 비밀번호로 회원가입/로그인하여 자신의 데이터를 안전하게 저장하고 싶습니다.

**Acceptance Criteria**.
- 이메일 기반 회원가입 폼 제공
- 로그인/로그아웃 기능
- Supabase Auth를 통한 안전한 인증
- 세션 유지 (새로고침 후에도 유지)

---

### P0-5: 데이터 클라우드 저장
**User Story**.  
사용자의 신체 정보, 음식 기록, 목표 설정이 클라우드에 저장되어 어느 기기에서든 접근할 수 있기를 원합니다.

**Acceptance Criteria**.
- Supabase PostgreSQL에 사용자 데이터 저장
- Row Level Security (RLS)로 사용자별 데이터 격리
- 자동 저장 (사용자 액션 직후)
- 데이터 동기화 확인 표시

---

### P0-6: 음식 기록 관리
**User Story**.  
사용자는 입력한 음식 기록을 수정하거나 삭제할 수 있고, 시간별로 조회하고 싶습니다.

**Acceptance Criteria**.
- 음식 기록 목록 표시 (시간, 음식명, 칼로리)
- 기록 수정/삭제 기능
- 일자별 필터링 (어제, 오늘, 미래 날짜 지정)
- 일일 합계 자동 계산

---

### P0-7: 반응형 웹 디자인 (모바일 우선)
**User Story**.  
사용자는 모바일, 태블릿, 데스크톱 어느 기기에서도 깔끔하게 앱을 사용할 수 있기를 원합니다.

**Acceptance Criteria**.
- 모바일 화면에서 터치 친화적 인터페이스
- 태블릿/데스크톱에서 레이아웃 최적화
- 모든 입력 필드가 모바일에서 명확하게 표시
- 화면 크기별 스타일 최적화 (Tailwind CSS 사용)

---

### P0-8: 직관적인 UI/UX
**User Story**.  
사용자는 복잡한 설명 없이도 앱의 주요 기능을 직관적으로 이해하고 사용할 수 있기를 원합니다.

**Acceptance Criteria**.
- 메인 대시보드에서 TDEE, 섭취량, 목표 한눈에 확인
- 음식 추가 기능이 주요 위치에 배치
- 색상 코드 사용 (녹색=목표 달성 추세, 주황색=주의, 빨강=초과)
- 아이콘과 텍스트 레이블 병행

---

## 3. Feature List by Priority

### P0 (MVP - 필수 기능)
| 기능 | 설명 | 구현 순서 |
|------|------|---------|
| TDEE 계산 | Harris-Benedict 공식 기반 일일 칼로리 필요량 자동 계산 | 1 |
| 신체 정보 입력 | 나이, 성별, 키, 체중, 활동 수준 입력 폼 | 1 |
| AI 음식 인식 | Google Gemini API로 텍스트/이미지 기반 칼로리 추정 | 2 |
| 음식 추가/삭제 | 일일 기록에 음식 추가, 수정, 삭제 기능 | 2 |
| 일일 대시보드 | 목표 대비 섭취량 시각화 (진행 바, 남은 칼로리) | 2 |
| 회원 인증 | Supabase Auth 기반 이메일 회원가입/로그인 | 3 |
| 클라우드 저장 | PostgreSQL (Supabase)에 사용자 데이터 저장 | 3 |
| 반응형 디자인 | 모바일/태블릿/PC 최적화 (Tailwind CSS) | 진행 중 |

### P1 (Post-MVP - 고급 기능)
| 기능 | 설명 |
|------|------|
| 어두운 모드 | Dark/Light 테마 전환 |
| 월별 통계 리포트 | 월간 칼로리 추이, 평균, 달성률 시각화 |
| 음식 즐겨찾기 | 자주 먹는 음식 저장/빠른 추가 |
| 영양소 분석 | 단백질, 탄수화물, 지방 구성 분석 |
| 목표 칼로리 커스터마이징 | 기본 TDEE 대신 사용자가 목표 수정 |

### P2 (Nice-to-have)
| 기능 | 설명 |
|------|------|
| 소셜 공유 | 월간 통계 SNS 공유 |
| 운동 칼로리 기록 | 운동으로 소모한 칼로리 추가 |
| 푸시 알림 | 목표 초과 시 알림 |
| 식사 기록 내보내기 | CSV/PDF 다운로드 |

---

## 4. Technical Constraints

### API Limits
- **Google Gemini API**: 일 1500회 제한 (무료), 초과 시 요금 청구
- **Supabase Auth**: 무료 플랜 100,000 사용자 지원
- **Supabase Database**: 500MB 스토리지 (무료)

### Performance Requirements
- 음식 추가 응답 시간: < 3초 (AI 인식)
- 대시보드 로드 시간: < 1초
- 모바일 화면 최적화: Lighthouse 90+ 점수

### Data & Security
- 패스워드는 bcrypt로 해시 처리 (Supabase Auth 기본)
- Row Level Security (RLS)로 사용자별 데이터 격리
- 민감정보(체중, 나이) 암호화 저장 고려

### Compatibility
- 지원 브라우저: Chrome, Safari, Firefox, Edge (최신 2개 버전)
- 모바일: iOS Safari, Android Chrome 지원

---

## 5. Success Criteria

### 1. 기능 완성도 (Functional Completeness)
**Metric**: P0 기능 8개 모두 구현 완료 및 오류 없음.  
**Target**: 100% (8/8 기능).  
**측정**: Evaluator QA 보고서에서 "기능성" 점수 9/10 이상.

### 2. 사용자 경험 (User Experience)
**Metric**: 모바일/PC 모든 화면에서 터치/클릭 응답 시간 < 500ms.  
**Target**: 모든 상호작용에서 지연 없음.  
**측정**: 브라우저 DevTools Performance 프로파일링.

### 3. 데이터 정확성 (Data Accuracy)
**Metric**: TDEE 계산 오차율 < 5% (Harris-Benedict 공식 기준).  
**Target**: 테스트 케이스 10개 중 9개 이상 정확.  
**측정**: 수동 계산과 앱 계산 비교.

### 4. 설계 시스템 준수 (Design Consistency)
**Metric**: design.md의 모든 컴포넌트, 색상, 모션 적용 여부.  
**Target**: 100% 준수.  
**측정**: Evaluator에서 design.md 항목별 체크리스트 확인.

---

## 6. Out of Scope (향후 고려)

- 영양사 상담 기능
- 운동 추적 (칼로리 소모)
- 소셜 네트워크 기능
- 오프라인 모드
- AI 개인 맞춤형 식단 추천 (스코프 확대 시)

---

## Document Info

| 항목 | 내용 |
|------|------|
| **작성자** | Calo AI 하네스 (PRD Builder) |
| **작성일** | 2026-05-30 |
| **버전** | 1.0 (Restructured) |
| **상태** | PRD Builder 5-Step Format |

### Original Reference

이 문서는 USER_REQUEST.md 분석을 기반으로 PRD Builder Skill의 5단계 패턴(1. 핵심 문제 파악 → 2. 기능 추출 → 3. 사용자 스토리 → 4. 우선순위 분류 → 5. 성공 기준)을 적용하여 작성되었습니다.

---

## 3. 기술 스택 (참고용 — 기존 상세 정보)

### 3.1 아키텍처 개요

```
Web App (HTML/CSS/JS SPA, max-width 430px)
    │
    ├── Node.js 서버 (server.js)     ← API 프록시 + 환경변수 관리
    │     ├── /api/config            ← Supabase URL/Key 전달
    │     └── /api/analyze           ← Gemini API 호출 (키 서버 보관)
    │           ├── gemini-2.5-flash ← 기본 모델
    │           └── gemini-2.5-pro   ← 설정에서 전환 (폴백: flash)
    │
    ├── Supabase Auth                ← 사용자 인증
    ├── Supabase PostgreSQL          ← 식단 기록 영구 저장 (RLS 적용)
    └── Supabase Storage             ← 음식 이미지 저장 (Phase 2)
```

### 3.2 기술 스택 상세

| 레이어 | 기술 | 역할 |
|--------|------|------|
| Frontend | HTML5 + CSS3 + Vanilla JS | 모바일 퍼스트 SPA |
| 서버 | Node.js (server.js) | API 프록시, 환경변수 관리 |
| AI (기본) | Google Gemini 2.5 Flash | 빠른 이미지 분석 (서버 경유) |
| AI (선택) | Google Gemini 2.5 Pro | 정밀 이미지 분석 (서버 경유) |
| Backend | Supabase | Auth + DB + Storage |
| DB | PostgreSQL (Supabase) | 식단 기록 영구 저장 |
| 차트 | SVG 직접 구현 | 링차트 + 바차트 |
| 배포 | Vercel / Node.js 호스팅 | 서버 포함 배포 필요 |

### 3.3 Supabase 데이터 모델

#### profiles (확장)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  -- 신체정보 (FR-1)
  gender TEXT CHECK (gender IN ('male', 'female')),
  age INTEGER,
  height_cm DECIMAL(5,1),
  weight_kg DECIMAL(5,1),
  activity_level TEXT CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  goal_type TEXT CHECK (goal_type IN ('lose','maintain','gain')),
  -- 목표값 (FR-2 TDEE 계산 결과 or 수동 입력)
  daily_calorie_goal INTEGER DEFAULT 2000,
  protein_goal INTEGER DEFAULT 150,
  carb_goal INTEGER DEFAULT 250,
  fat_goal INTEGER DEFAULT 65,
  -- 설정 (FR-11)
  gemini_model TEXT DEFAULT 'flash' CHECK (gemini_model IN ('flash', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);
```

#### meal_logs (기존 유지)
```sql
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(5,1),
  carbs DECIMAL(5,1),
  fat DECIMAL(5,1),
  quantity TEXT,
  image_url TEXT,  -- FR-7 재분석 시 재사용
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meal logs"
  ON meal_logs FOR ALL USING (auth.uid() = user_id);
```

---

## 4. UX 흐름

### 4.1 화면 구조

```
앱 실행
  └── 온보딩 (첫 실행 / 프로필 미설정 시)
        ├── Step 1: 신체정보 (성별/나이/키/몸무게)
        ├── Step 2: 활동량 선택 (5단계 슬라이더)
        ├── Step 3: 목표 선택 (감량/유지/증량)
        └── Step 4: TDEE 계산 결과 확인 + 수동 수정 가능
              └── 로그인 / 회원가입 (Supabase Auth)
                    └── Bottom Navigation 4탭
                          ├── [홈] 오늘 대시보드 + 분석 버튼
                          ├── [기록] 식단 히스토리
                          │     ├── 기존: [+ 식사 추가] 버튼 → AI 분석 흐름 (카메라/갤러리)
                          │     └── 신규: [🗃 음식 DB] 버튼 → 음식 기록 화면 (FR-12)
                          │           ├── 검색바 (음식 검색...)
                          │           ├── 최근 음식 섹션 (최근 항목 지우기)
                          │           │     └── 음식 카드 [체크박스 | 음식명✏️ | 수량↕ | 칼/단/탄/지]
                          │           ├── 인기 음식 섹션
                          │           │     └── 음식 카드 (동일 구조)
                          │           └── [✓ 음식 기록] 하단 고정 버튼 → meal_logs INSERT
                          ├── [통계] 주간/월간 차트
                          └── [설정] 목표·모델·API키
```

### 4.2 핵심 UX 플로우: 음식 분석 → 저장

```
홈 화면 → [카메라] 또는 [갤러리] 버튼
  → 이미지 선택 → Gemini 분석 중 (로딩)
  → 분석 결과 화면 (음식명·영양소·수량 표시)
  → 사용자 수정 (필수) + 끼니 선택
  → [저장] → Supabase meal_logs INSERT
  → 홈 대시보드 업데이트
```

**AI 실패 시 (FR-10)**:
```
Gemini 분석 실패 또는 파싱 오류
  → "분석에 실패했어요. 직접 입력할게요" 메시지
  → 수동 입력 화면 (음식명/칼로리/단백질/탄수화물/지방)
  → 동일 저장 흐름
```

### 4.3 재분석 UX 플로우 (FR-7)

```
[기록] 탭 → 식사 카드 → 더보기(⋮) → "재분석"
  → 모달: "어떤 방식으로 재분석할까요?"
    ├── [저장된 이미지로 재분석]
    │     → image_url fetch → base64 → Gemini 전송
    │     → 분석 결과 → 수정 화면
    │     → 기존 레코드 UPDATE
    └── [새 사진으로 재분석]
          → 카메라/갤러리 선택
          → 새 이미지 분석 → 수정 화면
          → 기존 레코드 UPDATE
```

---

## 5. 비기능 요구사항

| 항목 | 요구사항 |
|------|----------|
| 언어 | 한국어 우선, 모든 메시지 한국어 |
| 기록 흐름 | 사진 촬영 → 저장까지 3탭 이내 완료 |
| AI 응답 시간 | Gemini Flash 기준 5~8초 이내 체감 목표 |
| 데이터 지속성 | Supabase 영구 저장, 앱 종료 후에도 유지 |
| API 키 보안 | 서버 `.env` 환경변수 관리 (클라이언트 미노출), Flash/Pro 키 분리 운영 |
| 접근성 | 터치 영역 44px 이상, 글자 크기 확대 대응 |
| 개인정보 동의 | 온보딩 마지막 단계에 데이터 처리 동의 문구 포함 |
| 보안 | Supabase RLS (Row Level Security) 적용 |
| 플랫폼 | 모바일 퍼스트 (max-width 430px), iOS Safari / Android Chrome |

---

## 6. MVP 범위 및 구현 현황

### Phase 1 — MVP (13개 기능) ✅ 구현 완료 (2026-04-22 ~ 2026-05-29)

**온보딩 및 인증**
- [x] 온보딩: 4단계 신체정보 입력 + Harris-Benedict TDEE 자동계산 (FR-1, FR-2)
  - Step 1: 성별·나이·키·몸무게 입력 (숫자 인풋)
  - Step 2: 활동량 선택 (5가지 카드형)
  - Step 3: 목표 선택 (감량·유지·증량, 칼로리 조정값 표시)
  - Step 4: TDEE 결과 확인 + 직접 수정 가능
- [x] 회원가입/로그인 + 비회원 모드 (Supabase Auth)
  - 이메일/비밀번호 기반 인증
  - 비회원 로그인 (세션 기반)
  - 탭 전환으로 로그인/회원가입 선택

**AI 음식 분석**
- [x] 음식 사진 분석: Gemini 2.5 Flash/Pro 모델 (FR-3, FR-4, FR-10)
  - FAB 버튼 → 카메라/갤러리 선택
  - 이미지 인풋 방식: `capture="environment"` (모바일 카메라 직접 접근)
  - Gemini 분석 중 로딩 표시
  - 수동입력 Fallback (분석 실패 시)
- [x] 저장 전 수정 필수 화면 (FR-5, FR-6)
  - 음식명, 칼로리, 영양소 (단백질/탄수화물/지방) 직접 편집
  - 끼니 선택 (아침/점심/저녁/간식) 버튼
  - 수량 표시 및 수정

**식단 기록 및 조회**
- [x] 식단 저장 (Supabase DB — profiles + meal_logs 테이블)
  - 분석 결과 또는 수동입력 → meal_logs INSERT
  - user_id 기반 RLS 적용
- [x] 날짜별 식단 히스토리 + 삭제 (기록 탭)
  - 좌우 화살표로 날짜 네비게이션
  - 끼니별로 그룹화된 식사 리스트
  - 카드 우측 더보기 버튼 (드롭다운 메뉴)
- [x] 저장 기록 재분석 (FR-7)
  - 모달: "저장된 이미지로 재분석" vs "새 사진으로 재분석" 선택
  - image_url fetch → base64 변환 → Gemini 전송 (저장 이미지 방식)
  - 기존 meal_logs 레코드 UPDATE

**대시보드 및 통계**
- [x] 일일 칼로리 현황 홈 (FR-8)
  - SVG 링차트: 섭취 칼로리 대비 목표 칼로리 진행률
  - 우측에 [목표 kcal], [남은 칼로리] 표시
  - 링차트 중앙에 섭취 칼로리 숫자 표시
- [x] 매크로 진행 바: 단백질·탄수화물·지방 (FR-8)
  - 목표값 대비 진행률 (%)
  - 목표 초과 시 주황색(over) 표시
- [x] 통계 화면 (FR-9)
  - 주간(7일) / 월간(30일) 탭 전환
  - 바차트: 일별 섭취량 + 목표라인 (주황색 점선)
  - 통계 요약: 평균·최대·최소 (3개 박스)
- [x] 식관리 분석 패널 (통계 탭 내)
  - 토글 버튼: "식관리 분석 보기 ▼"
  - 영양소 평균 (일 기준): 단백질/탄수화물/지방
  - AI 식단 평가: Gemini 분석 요청 버튼

**설정 및 개인화**
- [x] 목표 수정: 칼로리·단백질·탄수화물·지방 (FR-11)
  - 입력값 검증 및 Supabase profiles UPDATE
  - [목표 저장] 버튼
- [x] Gemini 모델 선택: Flash vs Pro (FR-11)
  - 라디오 버튼 UI (세로 배열)
  - Flash: "하루 20장 무료"
  - Pro: "장당 3원 · Gemini 2.5"
- [x] 프로필 재설정: 온보딩 다시 실행
  - [재설정] 버튼 → 온보딩 화면으로 이동
- [x] 로그아웃
  - Supabase 세션 종료

**음식 데이터베이스 (FR-12)**
- [x] 음식 DB 검색 및 추가
  - 기록 탭: [+ 음식DB 추가] 버튼
  - 한국 정부 식품영양DB API 연동
  - 검색바: 음식명 검색
  - 최근 음식 섹션: 자주 쓰는 음식 목록
  - 인기 음식 섹션: 사용자 순위 기반
  - 수량 조정 슬라이더 또는 입력
  - [✓ 음식 기록] 버튼 → meal_logs INSERT

**UI/UX 특징**
- [x] 모바일 퍼스트: max-width 430px, 안전영역(notch) 대응
- [x] 바텀 네비게이션: 4개 탭 (홈/기록/통계/설정)
- [x] Warm Visual Theme: 그린톤 그래디언트, 글래스모피즘 바 (blur 배경)
- [x] 온보딩 Splash Screen: 앱 실행 시 로고 애니메이션
- [x] 로딩 상태: SVG 스피너 + 로딩 오버레이
- [x] 반응형 바텀 시트: 분석 결과·이미지 미리보기 표시

### Phase 2 — Full (향후 개선)

- [ ] Supabase Storage 이미지 영구 저장 (현재: base64 메모리 기반)
- [ ] 소셜 로그인 (Google OAuth)
- [ ] 연속 기록 스트릭 (Daily Streak)
- [ ] 알림/리마인더: 식사 시간 푸시 알림
- [ ] 영수증 인식: 식당 영수증 스캔 → 음식 자동 인식
- [ ] 커뮤니티 기능: 식단 공유·댓글
- [ ] 식단 엑스포트: CSV/PDF 다운로드

---

## 7. 성공 지표 (KPI)

| 지표 | 목표 |
|------|------|
| 첫 기록 완료율 | 온보딩 진입 사용자 중 70% 이상 |
| D7 리텐션 | 40% 이상 |
| 일일 식사 저장 수 | 사용자당 평균 2건 이상 |
| Gemini 분석 성공률 | 90% 이상 |
| AI 분석 후 수동 수정 비율 | 추적 (기준 없음, 데이터 수집) |

---

## 8. 리스크 및 고려사항

| 리스크 | 대응 방안 |
|--------|----------|
| Gemini API 비용 | Flash 기본 사용, Pro는 선택 사항으로 분리 |
| 한국 음식 인식 정확도 | 프롬프트 최적화 + 수동 편집 필수 흐름 |
| 재분석 시 image_url 만료 | Phase 2에서 Supabase Storage 영구 저장으로 해결 |
| API 키 노출 위험 | 서버 `.env` 관리로 해결 — 클라이언트에 키 미전달 |
| Supabase 무료 플랜 한계 | 이미지 저장 Phase 2로 지연, 데이터 보존 정책 수립 |

