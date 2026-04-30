# PRD: Cal AI — AI 칼로리 트래커

**버전**: 2.1  
**작성일**: 2026-04-20  
**최종 수정**: 2026-04-22  
**상태**: Implemented (Phase 1 완료)  
**기준 저장소**: https://github.com/amirdora/ai_calorie_tracker

---

## 1. 제품 개요

### 1.1 제품 한줄 설명

> 음식 사진 한 장으로 칼로리와 영양소를 추정하고, 사용자가 쉽게 수정·저장·추적할 수 있는 모바일 칼로리 관리 앱

### 1.2 해결하려는 문제

- 기존 칼로리 기록 앱은 음식명을 일일이 검색하고 양을 입력해야 해서 번거롭다.
- AI 기반 앱은 빠르지만 결과 신뢰도와 수정 흐름이 부족하면 실제 사용성이 떨어진다.
- 사용자는 "정확한 분석"보다 "빠르게 기록하고 나중에 다시 볼 수 있는 흐름"을 원한다.

### 1.3 목표

1. 음식 기록 시간을 10초 내외로 줄인다.
2. AI 분석 후 수정까지 한 화면에서 끝나게 한다.
3. 하루 목표 대비 섭취량을 직관적으로 보여준다.
4. 매일 다시 열게 만드는 진행 현황 경험을 만든다.

### 1.4 비목표 (MVP 제외)

- 커뮤니티, 챌린지, 친구 초대
- 웨어러블 연동, 바코드 스캔, 레시피 추천
- 의료 진단 수준의 영양 분석 정확도

### 1.5 타깃 사용자

- 다이어트를 시작했지만 기록 습관이 없는 20~40대
- 운동과 식단 관리를 병행하는 헬스/피트니스 사용자
- 번거로운 입력보다 사진 기반 기록을 선호하는 사용자
- 한국어 UX를 선호하는 국내 사용자

### 1.6 핵심 가치 제안

| 단계 | 가치 |
|------|------|
| 사진으로 빠르게 시작 | 촬영 또는 업로드만으로 분석 시작 |
| 수정으로 신뢰 확보 | AI 초안을 사용자가 직접 보정 |
| 대시보드로 습관 유지 | 하루/주간 흐름이 한눈에 보임 |
| 기록이 쌓일수록 개인화 | 목표 대비 추세로 패턴 파악 |

---

## 2. 기능 요구사항

### 2.1 온보딩 및 목표 설정

| FR | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-1 | 신체정보 입력 | 성별/나이/키/몸무게/활동량/목표(감량·유지·증량) 입력 | P0 |
| FR-2 | TDEE 자동계산 | Harris-Benedict 공식으로 일일 칼로리 목표 자동 제안, 사용자 수동 덮어쓰기 가능 | P0 |

**Harris-Benedict 공식**:
```
BMR(남) = 88.362 + (13.397 × 체중kg) + (4.799 × 키cm) - (5.677 × 나이)
BMR(여) = 447.593 + (9.247 × 체중kg) + (3.098 × 키cm) - (4.330 × 나이)

TDEE = BMR × 활동계수
  - 비활동 (좌식 생활): 1.2
  - 가벼운 활동 (주 1~3회 운동): 1.375
  - 보통 활동 (주 3~5회 운동): 1.55
  - 활동적 (주 6~7회 운동): 1.725
  - 매우 활동적 (운동선수/육체노동): 1.9

목표 보정:
  - 감량: TDEE - 500 kcal
  - 유지: TDEE
  - 증량: TDEE + 300 kcal
```

### 2.2 인증 (Auth)

| FR | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| — | 이메일/비밀번호 회원가입 | Supabase Auth 연동 | P0 |
| — | 로그인 / 자동 세션 유지 | Supabase 세션 토큰 | P0 |
| — | 비밀번호 재설정 | 이메일 링크 방식 | P1 |
| — | 소셜 로그인 (Google) | OAuth 2.0 | P2 |

### 2.3 음식 분석 (AI Core)

| FR | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-3 | 이미지 입력 | 카메라 촬영 또는 갤러리 업로드 | P0 |
| FR-4 | Gemini 영양 분석 | 음식명/칼로리/단백질/탄수화물/지방/수량 추정값 반환 | P0 |
| FR-5 | 저장 전 수정 화면 | 분석 결과 음식명·양·영양소 직접 편집 (저장 전 반드시 거침) | P0 |
| FR-6 | 끼니 구분 선택 | 아침/점심/저녁/간식 | P0 |
| FR-10 | 수동 입력 fallback | AI 분석 실패 시 음식명·영양소를 직접 입력하여 저장 | P0 |

**Gemini 모델 전략**:
- 기본: `gemini-2.5-flash` — 빠른 응답, 저비용
- 선택: `gemini-2.5-pro` — 더 높은 정확도, 설정 화면에서 전환 가능
- **API 호출 방식**: 브라우저 직접 호출 → Node.js 서버(`/api/analyze`) 경유로 변경 (2026-04-22)
- API 키: 서버 `.env` (`GEMINI_API_KEY_FLASH`, `GEMINI_API_KEY_PRO`)로 관리, 클라이언트 미노출
- Pro 모델 장애(429/403) 시 Flash로 자동 폴백

### 2.4 식단 기록 (Logging)

| FR | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| — | 식단 저장 | 분석·수정 결과를 Supabase meal_logs에 INSERT | P0 |
| — | 날짜별 식단 리스트 | 날짜 네비게이션 + 끼니별 그룹화 | P0 |
| — | 식단 기록 삭제 | 저장된 기록 삭제 | P0 |
| FR-7 | 식단 기록 재분석 | 저장된 기록을 Gemini로 재분석 (사용자가 방식 선택) | P1 |
| — | 식단 기록 수정 | 저장된 기록 편집 | P1 |
| — | 메모 추가 | 식사 기록에 텍스트 메모 | P2 |

**FR-7 재분석 UX 흐름**:
1. 히스토리 카드 → 더보기 메뉴 → "재분석"
2. 모달: "어떤 방식으로 재분석할까요?"
   - **[저장된 이미지로 재분석]** → image_url을 fetch → base64 변환 → Gemini 전송
   - **[새 사진으로 재분석]** → 카메라/갤러리 선택 → 새 이미지로 분석
3. 분석 결과 → 수정 화면 → 기존 meal_logs 레코드 UPDATE

### 2.5 진행 현황 대시보드 (Progress)

| FR | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-8 | 일일 대시보드 | 오늘 총 섭취 칼로리, 남은 칼로리, 단백질/탄수화물/지방 진행률 (SVG 링차트) | P0 |
| FR-9 | 진행 차트 | 일/주/월 단위 섭취 추세 + 기간별 평균값 | P1 |
| — | 연속 기록 스트릭 | 며칠 연속 기록했는지 표시 | P2 |

### 2.6 설정 (Settings)

| FR | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-11 | 목표 수정 | 칼로리/단백질/탄수화물/지방 목표 직접 수정 | P0 |
| FR-11 | Gemini 모델 선택 | Flash (기본) / Pro 전환 | P0 |
| FR-11 | API 키 관리 | Supabase URL·Key, Gemini API Key는 서버 `.env`로 관리 (2026-04-22 변경) | P0 |
| FR-11 | 프로필 재설정 | 신체정보 수정 → TDEE 재계산 | P1 |
| FR-11 | 데이터 초기화 | 로컬 설정 및 캐시 초기화 | P1 |
| — | 알림 설정 | 식사 시간 리마인더 | P2 |

---

## 3. 기술 스택

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

## 6. MVP 범위

### Phase 1 — MVP (9개 기능) ✅ 구현 완료 (2026-04-22)

- [x] 온보딩: 신체정보 입력 + Harris-Benedict TDEE 자동계산 (FR-1, FR-2)
- [x] 회원가입/로그인 + 게스트 모드 (Supabase Auth)
- [x] 음식 사진 분석: Gemini 2.5 Flash/Pro, 수동입력 fallback 포함 (FR-3, FR-4, FR-10)
- [x] 저장 전 수정 필수 화면 (FR-5, FR-6)
- [x] 식단 저장 (Supabase DB — profiles + meal_logs 테이블 생성 완료)
- [x] 일일 칼로리 현황 홈: SVG 링차트 + 매크로 진행률 (FR-8)
- [x] 날짜별 식단 히스토리 + 삭제
- [x] 저장 기록 재분석: 저장 이미지(base64) vs 새 사진 선택 (FR-7)
- [x] 설정: 목표 수정 + Gemini 모델 선택 (Flash/Pro 키 분리) (FR-11)

### Phase 2 — Full

- [ ] 주간/월간 통계 차트 (FR-9)
- [ ] Supabase Storage 이미지 영구 저장
- [ ] 소셜 로그인 (Google OAuth)
- [ ] Gemini Pro 전환 UI 개선
- [ ] 연속 기록 스트릭
- [ ] 알림/리마인더

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
