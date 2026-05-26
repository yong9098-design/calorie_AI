# PRD: AI 칼로리 트래커 (Flutter + Supabase + Gemini)

**버전**: 1.0  
**작성일**: 2026-04-20  
**상태**: Superseded → 최신 PRD는 `docs/PRD.md` (v2.1) 참조

---

## 1. 제품 개요

### 1.1 배경 및 목적

기존 오픈소스 AI 칼로리 트래커(amirdora/ai_calorie_tracker)는 Google Gemini AI를 활용한 음식 이미지 분석 기능을 제공하지만, **로컬 저장소 기반**으로 식단 기록이 기기에만 저장되어 히스토리 분석과 멀티 디바이스 동기화가 불가능하다.

본 제품은 **Supabase 백엔드**를 연동하여 사용자의 식단 기록을 영구 보존하고, 장기적인 영양 패턴 분석과 개인화된 인사이트를 제공하는 앱으로 진화시킨다.

### 1.2 핵심 가치 제안

| 문제 | 솔루션 | 효과 |
|------|--------|------|
| 기기 교체 시 식단 기록 소실 | Supabase 클라우드 동기화 | 어떤 기기에서도 히스토리 접근 |
| 단순 일일 칼로리만 표시 | 주간/월간 영양 트렌드 분석 | 식습관 패턴 파악 |
| AI 분석 결과 수정 불가 | 사용자 수동 편집 지원 | 정확도 향상 |
| 단일 사용자 경험 | 회원 인증 + 개인화 목표 | 맞춤형 건강 관리 |

### 1.3 목표 사용자 (ICP)

- **주요**: 다이어트/체중 관리 중인 20~40대
- **부차**: 운동 루틴과 식단을 함께 관리하는 피트니스 유저
- **공통 특징**: 스마트폰으로 음식 사진을 자주 찍고, 편리함을 최우선시하는 사람

---

## 2. 기능 요구사항

### 2.1 인증 (Auth)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 이메일/비밀번호 회원가입 | Supabase Auth 연동 | P0 |
| 구글 소셜 로그인 | OAuth 2.0 | P1 |
| 자동 로그인 (세션 유지) | Supabase 세션 토큰 | P0 |
| 비밀번호 재설정 | 이메일 링크 방식 | P1 |

### 2.2 음식 분석 (AI Core)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 카메라 촬영으로 음식 인식 | Gemini 2.5 Flash/Pro (서버 경유) | P0 |
| 갤러리 이미지 업로드 분석 | 이미지 선택 후 즉시 분석 | P0 |
| 영양 정보 추출 | 칼로리, 단백질, 탄수화물, 지방 | P0 |
| 음식명 자동 인식 | 한국어 음식명 포함 | P0 |
| 분석 결과 수동 편집 | 영양소 수치 직접 수정 가능 | P1 |
| 식사 타입 선택 | 아침/점심/저녁/간식 | P0 |

### 2.3 식단 기록 (Logging) — **핵심 차별화**

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 식단 저장 (Supabase) | 분석 결과 + 이미지 URL 저장 | P0 |
| 날짜별 식단 리스트 | 달력 뷰 + 리스트 뷰 | P0 |
| 식단 기록 수정/삭제 | 저장된 기록 편집 | P1 |
| 음식 사진 저장 | Supabase Storage에 이미지 보관 | P1 |
| 메모 추가 | 식사 기록에 텍스트 메모 | P2 |

### 2.4 진행 현황 대시보드 (Progress)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 일일 칼로리 현황 | 목표 대비 섭취량 링/바 차트 | P0 |
| 주간 칼로리 트렌드 | 7일 바 차트 | P0 |
| 월간 영양소 분석 | 단백질/탄수화물/지방 비율 | P1 |
| 연속 기록 스트릭 | 며칠 연속 기록했는지 표시 | P2 |
| 영양소 상세 통계 | 기간별 평균 영양소 섭취량 | P1 |

### 2.5 개인 설정 (Settings)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 일일 칼로리 목표 설정 | 사용자 맞춤 목표 | P0 |
| 영양소 목표 설정 | 단백질/탄수화물/지방 목표 | P1 |
| 프로필 정보 | 이름, 나이, 성별, 체중 | P1 |
| 알림 설정 | 식사 시간 리마인더 | P2 |
| 다크 모드 | 시스템 테마 연동 | P2 |

---

## 3. 기술 스택

> **변경**: Flutter → Web App (harness_agent 파이프라인 활용)

### 3.1 아키텍처 개요

```
Web App (HTML/CSS/JS SPA)
    │
    ├── Node.js 서버 (server.js)       ← API 프록시
    │     ├── /api/config              ← Supabase 설정 전달
    │     └── /api/analyze             ← Gemini API 호출
    │           ├── gemini-2.5-flash   ← 기본 모델
    │           └── gemini-2.5-pro     ← 선택 모델
    ├── Supabase Auth                  ← 사용자 인증
    ├── Supabase Database (PostgreSQL) ← 식단 기록 저장 (RLS)
    └── Supabase Storage               ← 음식 이미지 저장 (P1)
```

### 3.2 기술 스택 상세

| 레이어 | 기술 | 역할 |
|--------|------|------|
| Frontend | HTML5 + CSS3 + Vanilla JS | 모바일 퍼스트 SPA |
| AI (기본) | Google Gemini 2.5 Flash | 이미지 기반 음식 인식 (서버 경유) |
| AI (선택) | Google Gemini 2.5 Pro | 정밀 분석, 설정에서 전환 (서버 경유) |
| Backend | Supabase | Auth + DB + Storage |
| 데이터베이스 | PostgreSQL (Supabase) | 식단 기록 영구 저장 |
| 파일 저장 | Supabase Storage | 음식 이미지 저장 (P1) |
| 배포 | Vercel / GitHub Pages | 정적 사이트 배포 |
| 차트 | fl_chart | 영양소 시각화 |

### 3.3 Supabase 데이터 모델

#### users (Supabase Auth 자동 생성)

#### profiles
```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT,
  daily_calorie_goal INTEGER DEFAULT 2000,
  protein_goal INTEGER DEFAULT 150,
  carb_goal INTEGER DEFAULT 250,
  fat_goal INTEGER DEFAULT 65,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### meal_logs (핵심 테이블)
```sql
meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(5,1),
  carbs DECIMAL(5,1),
  fat DECIMAL(5,1),
  image_url TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 4. 화면 구성 (UX Flow)

### 4.1 화면 목록

```
앱 실행
  └── 온보딩 (첫 실행만)
        └── 로그인 / 회원가입
              └── 홈 탭 (Bottom Navigation)
                    ├── [홈] 오늘 식단 + 분석 기능
                    ├── [기록] 식단 히스토리 (달력/리스트)
                    ├── [통계] 주간/월간 영양 대시보드
                    └── [설정] 목표 및 프로필
```

### 4.2 핵심 UX 플로우

**음식 촬영 → 저장 플로우**
1. 홈 화면 → 카메라/갤러리 버튼 탭
2. 이미지 선택 → Gemini API 분석 중 로딩
3. 분석 결과 확인 (음식명, 영양소)
4. 식사 타입 선택 (아침/점심/저녁/간식)
5. 편집 후 저장 → Supabase 저장
6. 오늘 칼로리 현황 업데이트

**식단 히스토리 플로우**
1. [기록] 탭 → 달력 뷰
2. 날짜 선택 → 해당일 식단 리스트
3. 각 식사 카드 탭 → 상세 (이미지 + 영양소)
4. 수정/삭제 가능

---

## 5. 비기능 요구사항

| 항목 | 요구사항 |
|------|----------|
| 성능 | Gemini API 응답 5초 이내 |
| 보안 | Supabase RLS (Row Level Security) 적용 |
| 오프라인 | 분석 기능은 온라인 필요, 기록 조회는 캐시 허용 |
| 플랫폼 | iOS 14+, Android 8+ |
| 다국어 | 한국어 기본, 영어 지원 |

---

## 6. 개발 우선순위 (MVP vs Full)

### MVP (Phase 1)
- [ ] 회원가입/로그인 (Supabase Auth)
- [ ] 음식 이미지 촬영 + Gemini 분석
- [ ] 식단 저장 (Supabase DB)
- [ ] 일일 칼로리 현황 홈 화면
- [ ] 날짜별 식단 히스토리 리스트
- [ ] 일일 칼로리 목표 설정

### Full (Phase 2)
- [ ] 소셜 로그인 (Google)
- [ ] 이미지 Supabase Storage 업로드
- [ ] 주간/월간 통계 차트
- [ ] 영양소 목표 개별 설정
- [ ] 식사 메모 기능
- [ ] 연속 기록 스트릭
- [ ] 알림/리마인더

---

## 7. 성공 지표 (KPI)

| 지표 | 목표 |
|------|------|
| D7 리텐션 | 40% 이상 |
| 일일 평균 기록 수 | 사용자당 2건 이상 |
| Gemini 분석 성공률 | 90% 이상 |
| 앱 크래시율 | 0.5% 미만 |

---

## 8. 리스크 및 고려사항

| 리스크 | 대응 방안 |
|--------|----------|
| Gemini API 비용 | 분석 요청 캐싱, 사용량 모니터링 |
| 한국 음식 인식 정확도 | 프롬프트 최적화, 수동 편집 지원 |
| Supabase 무료 플랜 한계 | 이미지 압축, 데이터 보존 정책 수립 |
| 이미지 저장 비용 | 썸네일만 저장 or 외부 링크 참조 |

---

*Reference: https://github.com/amirdora/ai_calorie_tracker*
