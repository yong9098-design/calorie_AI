# Cal AI — 아키텍처 다이어그램 가이드

## 📌 개요

이 문서는 `ARCHITECTURE.html` 파일에 포함된 4개의 Mermaid 다이어그램을 설명합니다.  
브라우저에서 `ARCHITECTURE.html`을 열어 인터랙티브한 다이어그램을 확인할 수 있습니다.

---

## 🎯 다이어그램 목록

### 1️⃣ **시스템 아키텍처 (System Architecture)**

**목적**: 프로젝트 전체 구조와 각 계층 간의 통신 관계

**구성**:
- **Frontend Layer**: 단일 HTML 파일(134KB)로 구성된 SPA
  - `index.html`: 모든 CSS, JavaScript, 마크업을 포함
  - `Service Worker`: PWA 지원 (offline caching)
  
- **Backend APIs**: Vercel Edge Functions (3개 엔드포인트)
  - `GET /api/config`: 환경 변수 프록시 (Supabase 설정)
  - `POST /api/analyze`: Gemini 음식 분석 래퍼
  - `GET /api/food-search`: 공공 식품 DB 프록시
  
- **External Services**: 클라우드 및 공공 API
  - **Supabase**: 인증, PostgreSQL 데이터베이스
  - **Google Gemini**: Vision API (이미지 분석)
  - **공공 식품 DB**: 식약처 식품영양성분DB API
  - **Cloud Storage**: PWA 아셋 캐싱
  
- **Client Storage**: 로컬 저장소
  - `localStorage`: Auth Token, 환경설정, 임시 캐시
  - `IndexedDB`: 오프라인 데이터 (선택사항)

**핵심 흐름**:
```
사용자 입력 → JavaScript → API 호출 → 외부 서비스 → 응답 → Supabase DB → 로컬 캐시
```

---

### 2️⃣ **화면 흐름도 (Screen Navigation)**

**목적**: 5개 주요 화면과 사용자 여정을 시각화

**화면 목록**:

1. **🎯 Onboarding** (4단계)
   - Step 1: 신체정보 (성별, 나이, 키, 몸무게)
   - Step 2: 활동량 (5가지 선택)
   - Step 3: 목표 (감량/유지/증량)
   - Step 4: TDEE 확인 및 수정
   
2. **🔐 Auth** (인증)
   - 로그인 폼
   - 회원가입
   - 게스트 모드 (localStorage 기반)

3. **🏠 Home** (홈 화면)
   - 일일 영양 요약 (Ring Chart)
   - 추가된 음식 목록
   - 카메라/검색/프로필/설정 탭

4. **📷 Camera & 🔍 Analysis** (사진 분석)
   - 사진 촬영 또는 갤러리 선택
   - Gemini로 자동 분석
   - 결과 화면에서 사용자 수정 가능

5. **🔎 Food Search & ✏️ Food Edit** (음식 검색)
   - 공공 DB에서 음식 검색
   - 수량/영양소 조정
   - 저장 또는 삭제

6. **👤 Profile** (프로필)
   - 개인정보 조회/수정
   - TDEE 재계산
   - 로그아웃

7. **⚙️ Settings** (설정)
   - API Key 입력 (Supabase, Gemini, 공공 DB)
   - 앱 정보

**사용자 여정**:
```
앱 시작 → 온보딩 → 인증 → 홈 → (카메라|검색) → 분석/수정 → 저장 → 홈으로 복귀
```

---

### 3️⃣ **모듈 의존성 그래프 (Module Dependencies)**

**목적**: `index.html` 내부의 JavaScript 모듈 구조와 의존 관계

**모듈 분류**:

#### ⚙️ Core Modules
- `app.js`: 메인 루프, 화면 라우팅
- `state.js`: 전역 상태 관리
- `auth.js`: Supabase 인증 로직

#### 🖼️ Screen Controllers (각 화면의 비즈니스 로직)
- `onboarding.js`: 4단계 온보딩 흐름
- `home.js`: 홈 화면, 일일 요약
- `camera.js`: 사진 업로드
- `search.js`: 공공 DB 검색
- `profile.js`: 사용자 정보
- `settings.js`: API Key 관리

#### 🌐 API Services (HTTP 클라이언트)
- `configAPI.js`: GET /api/config 호출
- `analysisAPI.js`: POST /api/analyze 호출
- `searchAPI.js`: GET /api/food-search 호출

#### 📦 Data Layer (저장소)
- `supabaseClient.js`: Supabase 인스턴스
- `localStorage`: 로컬 저장
- `indexedDB`: 오프라인 DB (선택)

#### 🛠️ Utilities
- `calculations.js`: TDEE, 영양소 계산
- `format.js`: 날짜, 숫자 포맷팅
- `validate.js`: 폼 검증
- `imageUtils.js`: Base64 변환

#### 🎨 UI Components
- `navigation.js`: Bottom Navigation 제어
- `modal.js`: 다이얼로그/모달
- `notify.js`: Toast 알림
- `chart.js`: Ring Chart 렌더링

**의존성 원칙**:
```
화면 컨트롤러 → API 서비스 → 데이터 계층
화면 컨트롤러 → Utilities → 공용 함수
화면 컨트롤러 → UI Components → 화면 렌더링
```

---

### 4️⃣ **데이터 흐름 상세: 음식 분석 (Food Analysis Flow)**

**목적**: 사진 촬영부터 DB 저장까지 전체 과정을 시퀀스 다이어그램으로 표현

**단계별 흐름**:

1. **사진 촬영 준비**
   - 사용자가 "카메라" 버튼 클릭
   - Camera API 호출 → 사진 촬영
   - Blob으로 받은 이미지 → Base64 변환

2. **API 요청**
   - `POST /api/analyze` 호출
   - Body: `{image_base64, model: 'flash'|'pro'}`
   - 수정된 사용자 프로필과 함께 전송

3. **Gemini 분석**
   - Edge Function에서 Gemini API 호출
   - Vision Input: Base64 이미지
   - Prompt: 한국어 음식 분석 지시문
   - Output: JSON (JSON Schema로 검증)

4. **응답 구조**
   ```json
   {
     "food_name": "불고기",
     "calories": 320,
     "protein": 25,
     "carbs": 15,
     "fat": 18,
     "quantity": "150g",
     "components": [
       {
         "name": "소고기",
         "quantity": "100g",
         "calories_min": 200,
         "calories_max": 240,
         "note": "구운 소고기"
       }
     ]
   }
   ```

5. **DB 저장**
   - Edge Function이 Supabase에 INSERT
   - `meal_logs` 테이블에 저장
   - ID와 타임스탬프 반환

6. **캐시 & UI 업데이트**
   - 결과를 localStorage에 캐싱
   - 분석 결과 화면 표시
   - 사용자가 값 수정 가능
   - "저장" 버튼으로 최종 저장

**핵심 기술**:
- **Base64 인코딩**: CORS 우회를 위해 이미지를 Base64로 변환
- **JSON Schema 검증**: Gemini 응답이 형식에 맞는지 자동 검증
- **Model Selection**: 사용자 권한에 따라 Flash/Pro 자동 선택
- **Error Handling**: 분석 실패 시 재시도 또는 수동 입력

---

## 🛠️ 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **Frontend** | Vanilla JS + HTML5 | 단일 SPA 파일 |
| **UI** | Inline CSS Grid/Flex | 모바일 최우선 디자인 |
| **Storage** | localStorage + IndexedDB | 오프라인 지원 |
| **Auth** | Supabase Auth + JWT | 사용자 인증 |
| **Database** | PostgreSQL (Supabase) | 데이터 저장소 |
| **AI** | Google Gemini Vision | 이미지 분석 |
| **Backend** | Vercel Edge Functions | 서버리스 API |
| **External API** | 식약처 식품 DB | 공공 데이터 |
| **PWA** | Service Worker | 오프라인 캐싱 |
| **CDN** | jsDelivr + Google Fonts | 리소스 배포 |

---

## ✨ 주요 특징

### 🎯 단일 파일 SPA
- 모든 코드가 `output/index.html`에 포함
- 배포 간단 (파일 하나만 업로드)
- 로드 시간 최소화

### 📱 모바일 최우선
- 430px max-width로 모바일 앱처럼 느낌
- Bottom Navigation (고정)
- Touch-friendly 컴포넌트 (44px+)

### 🔐 게스트 모드
- localStorage 기반 (DB 없이 사용)
- 회원가입 필수 아님
- 로그인 사용자와 동일한 기능

### 🤖 AI 분석
- Google Gemini 2.5 Flash/Pro
- Base64 이미지 변환
- JSON Schema로 응답 검증
- 사용자가 수정 가능

### 📊 개인화
- Harris-Benedict 공식으로 TDEE 계산
- 목표별 추천 칼로리 (감량: -500, 증량: +300)
- 활동량 5단계 선택

### ⚡ 오프라인 지원
- Service Worker 기반 캐싱
- 일부 기능 오프라인 작동
- PWA 설치 가능

---

## 🚀 사용 방법

### 1. 브라우저에서 열기
```bash
# Windows
start ARCHITECTURE.html

# macOS
open ARCHITECTURE.html

# Linux
xdg-open ARCHITECTURE.html
```

### 2. 다이어그램 상호작용
- 각 다이어그램은 Mermaid.js로 렌더링됨
- 마우스로 드래그하여 확대/축소 가능
- 크롬, 파이어폭스, 엣지 등 모든 모던 브라우저 지원

### 3. 디자인 이해
- 색상 범례 참고
- 의존성 방향 확인 (화살표)
- 시퀀스 다이어그램에서 시간 흐름 따라가기

---

## 📚 참고 파일

| 파일 | 설명 |
|------|------|
| `output/index.html` | 실제 애플리케이션 (134KB SPA) |
| `api/analyze.js` | POST /api/analyze 구현 |
| `api/config.js` | GET /api/config 구현 |
| `api/food-search.js` | GET /api/food-search 구현 |
| `docs/SPEC.md` | 화면 설계서 |
| `docs/CHANGELOG.md` | 변경 이력 |
| `ARCHITECTURE.html` | 이 다이어그램 (인터랙티브) |

---

## 💡 팁

1. **대규모 프로젝트 리뷰**: 새로운 팀원이 입사할 때 이 문서와 다이어그램부터 읽게 하세요.
2. **병목 분석**: 다이어그램 3에서 모듈 간 의존성을 보고 리팩토링 포인트 찾기.
3. **에러 추적**: 다이어그램 4의 흐름을 따라 문제 발생 지점 빠르게 파악.
4. **기능 추가**: 새 화면 추가 시 다이어그램 2를 먼저 그리기.

---

**Generated on 2026-05-26**  
**Framework-agnostic Architecture Design**
