# 칼로리 트래커 앱 SPEC (v2)

**버전**: 2.0  
**작성일**: 2026-04-20  
**기반 PRD**: v2.0  

---

## 개요

Cal AI는 음식 사진 한 장으로 칼로리와 영양소를 AI가 자동 분석하고, 사용자가 직접 수정·저장·추적할 수 있는 모바일 최적화 칼로리 관리 웹 앱이다. Gemini API(Flash/Pro)로 이미지를 분석하고, Supabase로 인증 및 데이터를 관리한다. 온보딩에서 Harris-Benedict 공식으로 TDEE를 자동 계산하여 개인화된 목표를 제공한다.

---

## 디자인 방향

### 색상 체계
- **주색상**: `#22c55e` (초록) — 브랜드 아이덴티티, CTA 버튼
- **보조색상**: `#10b981` (에메랄드) — 링차트 채움, 활성 탭
- **배경**: `#f9fafb` (밝은 회색) — 앱 전체 배경
- **카드 배경**: `#ffffff` (흰색)
- **텍스트 주**: `#111827`
- **텍스트 보조**: `#6b7280`
- **위험/삭제**: `#ef4444` (빨강)
- **경고**: `#f59e0b` (주황)

### 폰트
- **한국어**: `Noto Sans KR` (Google Fonts) — 모든 텍스트
- **숫자/수치**: `Inter` (Google Fonts) — 칼로리 수치, 퍼센트 등

### 레이아웃 원칙
- **max-width: 430px**, 중앙 정렬 (데스크톱에서도 모바일 앱 느낌)
- **고정 Bottom Navigation** (높이 60px, z-index 100)
- **고정 상단 헤더** (높이 56px) — 화면별 타이틀
- **스크롤 영역**: 헤더~Bottom Nav 사이 (overflow-y: auto)
- **터치 영역**: 최소 44px × 44px
- **카드 radius**: 12px, **버튼 radius**: 8px

---

## 화면 목록

---

### 화면 1: 온보딩 (Onboarding) — 4단계 스텝

#### 역할
앱 첫 실행 또는 프로필 미설정 사용자를 위한 개인화 설정 화면. 완료 후 인증 화면 또는 홈으로 이동.

#### 진입 조건
- `localStorage.getItem('onboarding_complete')` 값이 없거나 `false`
- 로그인 후 `profiles` 테이블에 `gender` 값이 null인 경우

#### 레이아웃
- **상단**: 진행 표시 바 (Step X / 4) + 단계 도트 인디케이터
- **중앙**: 단계별 입력 폼 (슬라이드 전환 애니메이션)
- **하단**: [이전] [다음/완료] 버튼 쌍

---

#### Step 1: 신체 정보 입력

**UI 컴포넌트**:
- 화면 제목: "기본 정보를 알려주세요"
- 성별 선택: 남성 / 여성 토글 카드 (아이콘 + 텍스트)
- 나이 입력: 숫자 스피너 (18~99, 기본값 25)
- 키 입력: 숫자 입력 + "cm" 라벨 (100~250)
- 몸무게 입력: 숫자 입력 + "kg" 라벨 (30~200)
- 유효성 검사 오류 메시지 (빨간 텍스트)

**데이터 흐름**:
- 입력값 → `onboardingData.gender`, `.age`, `.heightCm`, `.weightKg` (메모리 임시 저장)

**핵심 JS 함수**:
```js
validateStep1()          // 필드 유효성 검사
nextStep(2)              // Step 2로 전환
```

---

#### Step 2: 활동량 선택

**UI 컴포넌트**:
- 화면 제목: "평소 활동량은 어떠세요?"
- 5단계 선택 카드 (라디오 버튼 스타일, 선택 시 초록 테두리):
  1. 비활동 — "거의 운동을 안 해요 (좌식 생활)" — 계수 1.2
  2. 가벼운 활동 — "주 1~3회 가벼운 운동" — 계수 1.375
  3. 보통 활동 — "주 3~5회 운동" — 계수 1.55
  4. 활동적 — "주 6~7회 강도 높은 운동" — 계수 1.725
  5. 매우 활동적 — "운동선수 또는 육체노동" — 계수 1.9
- 각 카드: 아이콘 + 제목 + 설명 텍스트

**데이터 흐름**:
- 선택값 → `onboardingData.activityLevel` ('sedentary'|'light'|'moderate'|'active'|'very_active')
- 선택값 → `onboardingData.activityMultiplier` (숫자값)

**핵심 JS 함수**:
```js
selectActivity(level)    // 활동량 선택 및 시각적 피드백
nextStep(3)
```

---

#### Step 3: 목표 선택

**UI 컴포넌트**:
- 화면 제목: "목표가 무엇인가요?"
- 3가지 선택 카드 (라디오 스타일):
  1. 체중 감량 — "TDEE - 500 kcal" — 아이콘: 내려가는 화살표
  2. 체중 유지 — "TDEE" — 아이콘: 수평 선
  3. 체중 증량 — "TDEE + 300 kcal" — 아이콘: 올라가는 화살표
- 개인정보 처리 동의 체크박스 (필수): "칼로리 계산을 위해 입력한 신체 정보를 사용합니다"

**데이터 흐름**:
- 선택값 → `onboardingData.goalType` ('lose'|'maintain'|'gain')
- 동의 여부 → `onboardingData.privacyConsent`

**핵심 JS 함수**:
```js
selectGoal(type)         // 목표 선택
nextStep(4)              // TDEE 계산 후 Step 4 전환
calculateTDEE()          // Harris-Benedict 공식 계산
```

**TDEE 계산 로직**:
```js
function calculateTDEE() {
  const { gender, age, heightCm, weightKg, activityMultiplier, goalType } = onboardingData;
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }
  let tdee = bmr * activityMultiplier;
  if (goalType === 'lose') tdee -= 500;
  else if (goalType === 'gain') tdee += 300;
  return Math.round(tdee);
}
```

---

#### Step 4: TDEE 결과 확인 및 수정

**UI 컴포넌트**:
- 화면 제목: "추천 일일 칼로리"
- 대형 숫자 표시 (계산된 TDEE, 초록색 강조)
- 계산 근거 요약 카드:
  - BMR: XXX kcal
  - 활동계수: X.XX
  - 목표 보정: ±XXX kcal
- 직접 수정 입력 필드 (계산값 pre-fill, 수정 가능)
- 매크로 자동 계산 표시:
  - 단백질 목표: `Math.round(tdee * 0.3 / 4)` g
  - 탄수화물 목표: `Math.round(tdee * 0.45 / 4)` g
  - 지방 목표: `Math.round(tdee * 0.25 / 9)` g
- [완료 — 시작하기] 버튼 (초록, 전체 너비)

**데이터 흐름**:
- [완료] 클릭 → `saveOnboardingData()` 호출
- 로그인 상태이면 `profiles` 테이블 UPSERT
- 비로그인이면 `localStorage.setItem('onboarding_temp', JSON.stringify(data))`
- `localStorage.setItem('onboarding_complete', 'true')`
- 인증 화면으로 이동 (미로그인 시) 또는 홈 화면으로 이동 (로그인 상태 시)

**핵심 JS 함수**:
```js
renderTDEEResult()       // 계산 결과 화면 렌더링
saveOnboardingData()     // Supabase profiles UPSERT + localStorage
goToAuth()               // 인증 화면으로 전환
```

---

### 화면 2: 인증 (Auth)

#### 역할
Supabase Auth를 통한 회원가입 및 로그인. 인증 성공 후 홈 화면으로 이동, 온보딩 임시 데이터가 있으면 profiles에 저장.

#### 레이아웃
- **상단**: 앱 로고 + 슬로건 ("사진 한 장으로 시작하는 건강 기록")
- **중앙**: 로그인/회원가입 탭 전환 + 입력 폼
- **하단**: 탭 전환 링크 텍스트

#### UI 컴포넌트
- 탭 2개: [로그인] / [회원가입] (언더라인 탭 스타일)
- **로그인 폼**:
  - 이메일 입력 (type="email")
  - 비밀번호 입력 (type="password", 표시/숨김 토글 아이콘)
  - [로그인] 버튼 (초록, 전체 너비)
  - [비밀번호를 잊으셨나요?] 링크 (P1 기능)
- **회원가입 폼**:
  - 이메일 입력
  - 비밀번호 입력 (8자 이상)
  - 비밀번호 확인 입력
  - [회원가입] 버튼 (초록, 전체 너비)
- 에러 메시지 영역 (빨간 배경 카드)
- 로딩 스피너 (버튼 내부)

#### 데이터 흐름
- 회원가입: `supabase.auth.signUp({ email, password })` → 성공 시 온보딩 임시 데이터 profiles에 저장
- 로그인: `supabase.auth.signInWithPassword({ email, password })` → 성공 시 홈으로 이동
- 세션 확인: `supabase.auth.getSession()` → 세션 있으면 자동으로 홈 이동

#### 핵심 JS 함수
```js
initSupabase()           // localStorage에서 URL/Key 읽어 클라이언트 초기화
signUp(email, password)  // 회원가입 + 에러 처리
signIn(email, password)  // 로그인 + 에러 처리
checkSession()           // 자동 로그인 세션 확인
syncOnboardingToProfile()// 온보딩 임시 데이터 → profiles 테이블 저장
showAuthError(message)   // 에러 메시지 표시
```

---

### 화면 3: 홈 (Home) — 오늘 대시보드

#### 역할
오늘 칼로리 섭취 현황을 시각화하고, 음식 분석을 시작하는 메인 화면.

#### 레이아웃
- **헤더**: "오늘 식단" + 날짜 표시 (MM월 DD일, 요일)
- **스크롤 컨텐츠**:
  1. 칼로리 링 차트 섹션
  2. 매크로 진행률 섹션
  3. 오늘 식단 리스트 섹션
- **FAB (Floating Action Button)**: 오른쪽 하단, [+] 아이콘 → 분석 모달 열기
- **Bottom Navigation**: 4탭

#### UI 컴포넌트

**칼로리 링 차트 (SVG)**:
- 외부 원: 목표 칼로리 (회색 stroke)
- 내부 채움 원: 섭취 칼로리 (초록 stroke, stroke-dasharray 애니메이션)
- 중앙 텍스트:
  - 대형: 섭취량 (Inter 폰트, 초록색)
  - 소형: "/ 목표 kcal"
  - 하단: "남은 칼로리: Nnn kcal" 또는 "Nnn kcal 초과"
- SVG 크기: 200×200px, viewBox="0 0 200 200"

**매크로 진행률 바** (3개):
- 단백질: 현재 Ng / 목표 Ng (파란색 바)
- 탄수화물: 현재 Ng / 목표 Ng (주황색 바)
- 지방: 현재 Ng / 목표 Ng (노란색 바)
- 각 바: 라벨 + 숫자 + 프로그레스 바 (height: 8px, radius: 4px)

**오늘 식단 리스트**:
- 끼니별 그룹 헤더: 아침 / 점심 / 저녁 / 간식
- 각 항목 카드:
  - 왼쪽: 음식 이미지 썸네일 (48×48px, radius: 8px, 없으면 음식 아이콘)
  - 중앙: 음식명 (굵게) + 수량 (회색 소형)
  - 오른쪽: 칼로리 (초록 굵게) + 삭제 버튼 (휴지통 아이콘)
- 빈 상태: "아직 기록된 식사가 없어요\n[+] 버튼을 눌러 첫 식사를 기록해보세요" (회색 일러스트)

#### 데이터 흐름
- 진입 시 `loadTodayMeals()` → `meal_logs` WHERE `user_id = uid AND date(logged_at) = today`
- 데이터 합산 → `updateDashboard()` (링차트 + 매크로 바 업데이트)
- `supabase.auth.onAuthStateChange()` 로 세션 변화 감지

#### 핵심 JS 함수
```js
loadTodayMeals()         // Supabase SELECT 오늘 식단
updateDashboard()        // 링차트 + 매크로 바 업데이트
drawCalorieRing(consumed, goal)  // SVG 링차트 렌더링
updateMacroBars(protein, carbs, fat)  // 매크로 진행률 바 업데이트
renderMealList(meals)    // 식단 리스트 렌더링 (끼니별 그룹화)
deleteMealLog(id)        // 식단 삭제 + 대시보드 갱신
openAnalysisModal()      // 분석 모달 열기
```

---

### 화면 4: 분석 결과 + 수정 화면 (Analysis & Edit)

#### 역할
Gemini AI 분석 결과를 보여주고, 사용자가 수정한 후 저장하는 화면. **저장 전 이 화면은 반드시 거쳐야 한다** (직접 저장 불가).

#### 진입 경로
1. 홈 FAB → 이미지 선택 → Gemini 분석 완료 후 → 이 화면
2. 히스토리 → 재분석 → 분석 완료 후 → 이 화면 (UPDATE 모드)

#### 레이아웃
- **전체 화면 모달** (또는 별도 섹션, Bottom Nav 숨김)
- **상단 헤더**: [← 취소] + 타이틀 "분석 결과 확인" + (선택) 모드 표시
- **이미지 미리보기**: 선택한 사진 (전체 너비, max-height: 200px, object-fit: cover)
- **분석 결과 편집 폼** (스크롤)
- **하단**: [저장하기] 버튼 (초록, 전체 너비, 고정)

#### UI 컴포넌트

**분석 중 로딩 상태**:
- 반투명 오버레이 + 스피너
- 텍스트: "AI가 음식을 분석하고 있어요... (5~8초 소요)"

**결과 편집 폼** (AI 분석값 pre-fill, 전부 수정 가능):
- 음식명 입력 (text input, 필수)
- 수량/단위 입력 (text input, 예: "1인분", "200g")
- 칼로리 입력 (number input, 필수, 단위: kcal)
- 단백질 입력 (number input, 소수점 1자리, 단위: g)
- 탄수화물 입력 (number input, 소수점 1자리, 단위: g)
- 지방 입력 (number input, 소수점 1자리, 단위: g)
- 끼니 선택 (4개 선택 칩):
  - [아침] [점심] [저녁] [간식] — 선택 시 초록 배경
- AI 분석 출처 표시: "Gemini Flash 분석" (회색 소형 텍스트)

**저장 버튼**:
- 기본 텍스트: "저장하기"
- UPDATE 모드: "수정 저장하기"

#### 데이터 흐름
- **INSERT 모드**: `saveMealLog(data)` → `meal_logs` INSERT → 홈 화면 갱신
- **UPDATE 모드**: `updateMealLog(id, data)` → `meal_logs` UPDATE WHERE id = 재분석 대상 id
- 저장 성공 시: 성공 토스트 메시지 → 홈(INSERT) 또는 히스토리(UPDATE)로 이동

#### 핵심 JS 함수
```js
analyzeImage(imageFile)          // 이미지 → base64 → Gemini API 호출
callGeminiAPI(base64, mimeType)  // Gemini REST API fetch 호출
parseGeminiResponse(text)        // JSON 파싱 + 영양소 추출
renderAnalysisForm(data)         // 결과값으로 폼 pre-fill
selectMealType(type)             // 끼니 선택 토글
saveMealLog(data)                // Supabase INSERT
updateMealLog(id, data)          // Supabase UPDATE
showToast(message, type)         // 성공/실패 토스트
```

**Gemini API 프롬프트**:
```
이 음식 사진을 분석해서 다음 JSON 형식으로만 답변해주세요:
{
  "food_name": "음식명",
  "quantity": "수량 (예: 1인분, 200g)",
  "calories": 숫자,
  "protein": 숫자,
  "carbs": 숫자,
  "fat": 숫자
}
한국 음식이면 한국어로 음식명을 작성해주세요.
JSON 외에 다른 텍스트는 포함하지 마세요.
```

---

### 화면 5: 수동 입력 화면 (Manual Input Fallback)

#### 역할
Gemini 분석 실패 시 또는 사용자가 직접 입력을 원할 때 나타나는 fallback 화면.

#### 진입 조건
- Gemini API 오류 (네트워크, 인증, 파싱 실패)
- `analyzeImage()` 내 catch 블록 실행 시
- 또는 "직접 입력" 버튼 클릭 시 (분석 모달 내 선택 가능)

#### 레이아웃
- 화면 4(분석 결과 수정)와 동일한 레이아웃
- 이미지 미리보기 영역 제거 또는 업로드한 사진 표시 (있는 경우)
- 상단 배너: "AI 분석에 실패했어요. 직접 입력해주세요." (주황 배경)

#### UI 컴포넌트
- 화면 4의 편집 폼과 동일 (단, pre-fill 없이 빈 폼)
- 음식명 (필수)
- 칼로리 (필수)
- 단백질, 탄수화물, 지방 (선택)
- 수량/단위 (선택)
- 끼니 선택 칩 (아침/점심/저녁/간식)
- [저장하기] 버튼

#### 데이터 흐름
- 화면 4의 `saveMealLog()` 와 동일한 저장 로직
- `image_url`: null (이미지 없음) 또는 업로드된 이미지가 있으면 base64 저장 (선택)

#### 핵심 JS 함수
```js
showManualInput(error)   // 에러 메시지와 함께 수동 입력 화면 표시
validateManualForm()     // 필수 필드 유효성 검사
saveMealLog(data)        // 화면 4와 동일 저장 함수 재사용
```

---

### 화면 6: 히스토리 (History) — 날짜별 식단 리스트

#### 역할
날짜를 탐색하며 과거 식단 기록을 조회하고, 재분석/삭제 등의 액션을 실행한다.

#### 레이아웃
- **헤더**: 날짜 네비게이터 (← 날짜 텍스트 →)
- **날짜 선택기**: 좌우 화살표로 날짜 이동 + 날짜 텍스트 클릭 시 캘린더 피커 (선택)
- **컨텐츠**: 끼니별 그룹화된 식단 카드 리스트
- **하단 요약**: 해당 날짜 총 칼로리 / 단백질 / 탄수화물 / 지방

#### UI 컴포넌트

**날짜 네비게이터**:
- [←] 이전 날 / 날짜 표시 (YYYY년 MM월 DD일) / [→] 다음 날
- 오늘 이후는 [→] 버튼 비활성화

**식단 카드** (각 meal_log 항목):
- 음식 썸네일 이미지 (60×60px, radius: 8px)
- 음식명 (굵게, 14px)
- 끼니 타입 배지 (작은 태그: 아침/점심/저녁/간식)
- 수량 텍스트 (회색)
- 칼로리 수치 (오른쪽, 초록 굵게)
- [⋮ 더보기] 버튼 → 드롭다운 메뉴:
  - 재분석
  - 수정 (P1)
  - 삭제

**끼니 그룹 헤더**:
- 끼니명 + 해당 끼니 총 칼로리

**일일 요약 카드** (리스트 하단):
- 총 칼로리: Nnn kcal
- 단백질: Ng / 탄수화물: Ng / 지방: Ng

**빈 상태**:
- "이 날 기록된 식사가 없어요" + 일러스트

#### 데이터 흐름
- 날짜 변경 시 `loadMealsByDate(date)` → `meal_logs` SELECT WHERE date(logged_at) = date
- 삭제: `deleteMealLog(id)` → 리스트 갱신
- 재분석: `openReanalysisModal(mealLog)` → 화면 7 모달 열기

#### 핵심 JS 함수
```js
loadMealsByDate(date)         // 날짜별 식단 Supabase SELECT
renderHistoryList(meals)      // 끼니별 그룹화 렌더링
prevDay() / nextDay()         // 날짜 이동
openMoreMenu(mealId)          // 더보기 드롭다운 표시
deleteMealLog(id)             // 삭제 + 갱신
openReanalysisModal(mealLog)  // 재분석 모달 열기
```

---

### 화면 7: 재분석 선택 모달 (Reanalysis Modal)

#### 역할
히스토리 카드의 "재분석" 선택 시 나타나는 바텀시트 모달. 재분석 방식을 사용자가 선택한다.

#### 레이아웃
- **바텀시트 스타일** (화면 하단에서 슬라이드업, 배경 dimmer)
- 상단 핸들 바 (드래그 힌트)
- 타이틀: "어떤 방식으로 재분석할까요?"
- 선택 버튼 2개 + 취소 버튼

#### UI 컴포넌트

**저장된 이미지로 재분석 버튼**:
- 아이콘: 이미지/사진 아이콘
- 텍스트: "저장된 이미지로 재분석"
- 설명: "기존에 저장된 사진을 다시 분석합니다"
- `image_url`이 null이면 비활성화 (회색 + "저장된 이미지 없음" 표시)

**새 사진으로 재분석 버튼**:
- 아이콘: 카메라 아이콘
- 텍스트: "새 사진으로 재분석"
- 설명: "새로운 사진을 찍거나 선택합니다"
- 항상 활성화

**취소 버튼**:
- 텍스트: "취소" (회색, 하단)

#### 데이터 흐름

**저장된 이미지로 재분석 선택 시**:
1. `fetchImageAsBase64(meal.image_url)` → `fetch(url)` → blob → base64
2. `callGeminiAPI(base64, mimeType)` → 분석
3. 결과 → 화면 4 (UPDATE 모드, `meal.id` 전달)

**새 사진으로 재분석 선택 시**:
1. `<input type="file" accept="image/*">` 트리거
2. 사용자 이미지 선택 → `analyzeImage(file)` 호출
3. 결과 → 화면 4 (UPDATE 모드, `meal.id` 전달)

#### 핵심 JS 함수
```js
openReanalysisModal(mealLog)      // 모달 열기 + meal 데이터 바인딩
closeReanalysisModal()            // 모달 닫기
reanalyzeWithSavedImage(mealLog)  // 저장 URL → base64 → Gemini
reanalyzeWithNewPhoto(mealLog)    // 파일 선택 → Gemini
fetchImageAsBase64(url)           // URL → fetch → base64 변환
```

---

### 화면 8: 통계 (Stats) — 일/주/월 차트

#### 역할
일별·주별·월별 칼로리 섭취 추세와 평균값을 시각화하여 패턴 파악을 돕는다.

#### 레이아웃
- **헤더**: "통계"
- **기간 탭**: [일간] [주간] [월간] (언더라인 탭)
- **차트 영역**: SVG 바 차트
- **요약 카드**: 기간 평균값

#### UI 컴포넌트

**기간 탭**:
- 일간: 오늘 기준 24시간 (끼니별 분포 바)
- 주간: 최근 7일 막대 차트 (날짜별 총 칼로리)
- 월간: 최근 30일 막대 차트

**SVG 바 차트**:
- X축: 날짜 레이블
- Y축: 칼로리 (kcal)
- 목표 칼로리 기준선 (점선, 초록)
- 각 막대: 초록 (#22c55e), 초과 시 주황 (#f59e0b)
- 툴팁: 막대 탭 시 날짜 + 칼로리 팝업

**요약 통계 카드** (차트 하단):
- 기간 평균 칼로리
- 목표 달성일 수 / 전체 일수
- 평균 단백질 / 탄수화물 / 지방

**빈 상태** (데이터 없음):
- "아직 기록이 없어요. 식사를 기록하면 통계가 쌓여요!"

#### 데이터 흐름
- `loadStatsData(period)` → `meal_logs` SELECT WHERE 날짜 범위
- 집계: `groupByDate(meals)` → 날짜별 합산
- 렌더링: `renderBarChart(data)` → SVG 생성

#### 핵심 JS 함수
```js
loadStatsData(period)      // 기간별 Supabase SELECT
groupByDate(meals)         // 날짜별 칼로리 합산
renderBarChart(data, goal) // SVG 바 차트 렌더링
switchPeriod(period)       // 탭 전환 + 데이터 갱신
calcPeriodAvg(data)        // 기간 평균 계산
```

---

### 화면 9: 설정 (Settings)

#### 역할
API 키, 목표 칼로리, Gemini 모델 선택, 프로필 재설정 등 앱 전반의 설정을 관리한다.

#### 레이아웃
- **헤더**: "설정"
- **스크롤 컨텐츠**: 설정 섹션별 그룹 카드
- **하단**: 로그아웃 버튼 (빨간 텍스트)

#### UI 컴포넌트

**섹션 1: API 연동 설정** (Supabase + Gemini)
> **변경 (2026-04-22)**: API 키는 서버 `.env` 파일로 관리. 설정 화면에서 직접 입력 불필요. 서버 기동 시 자동 로드.
- (레거시 UI는 유지되나 실제 키는 서버 환경변수에서 적용)
- 보안 안내 문구: "API 키는 서버 환경변수(.env)로 관리됩니다"

**섹션 2: AI 모델 선택**
- 라디오 그룹:
  - Gemini Flash (기본) — 빠른 응답, 일반 정확도
  - Gemini Pro — 높은 정확도, 느린 응답
- 선택 변경 시 `profiles` 테이블 `gemini_model` 컬럼 UPDATE + localStorage 갱신

**섹션 3: 일일 목표 설정**
- 칼로리 목표 입력 (number, kcal)
- 단백질 목표 입력 (number, g)
- 탄수화물 목표 입력 (number, g)
- 지방 목표 입력 (number, g)
- [목표 저장] 버튼 → `profiles` 테이블 UPDATE

**섹션 4: 프로필 재설정**
- [신체정보 다시 입력] 버튼 → 온보딩 Step 1로 이동 (TDEE 재계산)
- 현재 프로필 요약 표시: 성별, 나이, 키, 몸무게, 활동량, 목표

**섹션 5: 계정 관리**
- [로그아웃] 버튼 (빨간 텍스트 + 아이콘)
- (선택) [로컬 데이터 초기화] 버튼 → localStorage 클리어

#### 데이터 흐름
- 진입 시: `loadSettings()` → localStorage 값 폼에 pre-fill + profiles 테이블에서 목표값 로드
- API 키 저장: `saveApiKeys()` → `localStorage.setItem` 3개 → `initSupabase()` 재호출
- 목표 저장: `saveGoals()` → `profiles` UPDATE
- 모델 변경: `updateGeminiModel(model)` → `profiles` UPDATE + localStorage 갱신
- 로그아웃: `supabase.auth.signOut()` → 인증 화면으로 이동

#### 핵심 JS 함수
```js
loadSettings()             // 설정값 로드 + 폼 pre-fill
saveApiKeys()              // localStorage에 API 키 저장 + Supabase 재초기화
saveGoals()                // profiles 테이블 UPDATE (목표 칼로리/매크로)
updateGeminiModel(model)   // 모델 선택 저장
logout()                   // 로그아웃 + 인증 화면 이동
resetOnboarding()          // 온보딩 재진행
```

---

## 데이터 구조

### localStorage 키 목록

> **변경 (2026-04-22)**: `supabase_url`, `supabase_key`, `gemini_api_key`는 서버 `.env`로 이동. 클라이언트 localStorage에서 제거됨. Gemini 모델 선택은 Supabase `profiles.gemini_model`로 관리.

| 키 | 값 형식 | 용도 |
|----|--------|------|
| `gemini_model` | 'flash' \| 'pro' | 선택된 Gemini 모델 (UI 상태용) |
| `onboarding_complete` | 'true' \| 'false' | 온보딩 완료 여부 |
| `onboarding_temp` | JSON string | 온보딩 임시 데이터 (미로그인 시) |
| `cal_ai_guest_session` | JSON string | 게스트 모드 세션 정보 |
| `cal_ai_guest_profile` | JSON string | 게스트 모드 프로필/목표 |

> **서버 환경변수** (`.env`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY_FLASH`, `GEMINI_API_KEY_PRO`

### Supabase 테이블: profiles

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

### Supabase 테이블: meal_logs

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
  image_url TEXT,        -- FR-7 재분석 시 재사용
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meal logs"
  ON meal_logs FOR ALL USING (auth.uid() = user_id);
```

---

## API 연동

### Supabase 초기화

> **아키텍처 변경 (2026-04-22)**: Supabase URL/Key가 서버 사이드 `/api/config` 엔드포인트에서 제공됩니다. 클라이언트는 앱 시작 시 이 엔드포인트를 호출하여 설정을 받아 Supabase 클라이언트를 초기화합니다.

```js
// 서버에서 런타임 설정 로드
async function loadRuntimeConfig() {
  const res = await fetch(apiUrl('/api/config'), { cache: 'no-store' });
  const { supabaseUrl, supabaseAnonKey } = await res.json();
  sbClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
}
```

**서버 설정** (`.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY_FLASH=your_flash_key
GEMINI_API_KEY_PRO=your_pro_key
```

**Supabase CDN**:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Gemini API 호출 (서버 사이드 프록시 방식)

> **아키텍처 변경 (2026-04-22)**: Gemini API 호출이 브라우저 직접 호출에서 Node.js 백엔드(`server.js`) 경유 방식으로 전환되었습니다. API 키는 서버 `.env` 파일에서 관리하며, 클라이언트는 `/api/analyze` 엔드포인트를 호출합니다.

**클라이언트 → 서버 엔드포인트**:
```
POST /api/analyze
Authorization: Bearer {supabase_access_token}
Content-Type: application/json

{
  "image": {
    "mimeType": "image/jpeg",
    "data": "{BASE64_STRING}"
  }
}
```

**서버 → Gemini 엔드포인트**:
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
```
- `{model}`: `gemini-2.5-flash` (기본) 또는 `gemini-2.5-pro` (설정에서 선택)
- `{API_KEY}`: 서버 `.env`의 `GEMINI_API_KEY_FLASH` 또는 `GEMINI_API_KEY_PRO`
- 모델 선택: 서버가 Supabase `profiles.gemini_model` 컬럼 조회 후 결정
- Pro → 403/404/429 오류 시 Flash로 자동 폴백

**클라이언트 호출 코드**:
```js
const res = await fetch(apiUrl('/api/analyze'), {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
  },
  body: JSON.stringify({ image: { mimeType: mime, data: base64 } })
});
```

**이미지 → base64 변환**:
```js
async function toB64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

**응답 파싱**:
```js
function parseGemini(text) {
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch(e) {}
  // 정규식 폴백 파싱
}
```

**서버 설정 파일** (`api/analyze.js`):
```js
const MODEL_IDS = {
  flash: 'gemini-2.5-flash',
  pro:   'gemini-2.5-pro',
};
```

---

## 화면 전환 흐름 (SPA 라우팅)

```
앱 로드
  ├── Supabase 세션 없음 → 온보딩 미완료? → 온보딩 화면
  │                      → 온보딩 완료? → 인증 화면
  └── Supabase 세션 있음 → 프로필 미설정? → 온보딩 화면
                         → 프로필 설정됨? → 홈 화면

홈 화면 (Bottom Nav: 홈 탭 활성)
  ├── [+] FAB 클릭 → 이미지 선택 → 분석 로딩 → 분석+수정 화면 (INSERT 모드)
  │                              → 분석 실패 → 수동 입력 화면
  └── 탭 전환 → 히스토리 / 통계 / 설정

히스토리 화면 (Bottom Nav: 기록 탭 활성)
  └── 카드 [⋮] → 재분석 → 재분석 선택 모달
                          → 저장 이미지 선택 → 분석+수정 화면 (UPDATE 모드)
                          → 새 사진 선택 → 분석+수정 화면 (UPDATE 모드)
```

---

## Bottom Navigation 구성

| 순서 | 탭명 | 아이콘 (SVG 인라인) | 화면 |
|------|------|---------------------|------|
| 1 | 홈 | house | 홈 대시보드 |
| 2 | 기록 | calendar-days | 히스토리 |
| 3 | 통계 | chart-bar | 통계 차트 |
| 4 | 설정 | cog-6-tooth | 설정 |

- 활성 탭: 초록 (#22c55e) 아이콘 + 텍스트
- 비활성 탭: 회색 (#9ca3af) 아이콘 + 텍스트

---

## 기능 우선순위 요약 (Phase 1 MVP)

| 기능 | 화면 | 우선순위 | FR |
|------|------|----------|-----|
| 온보딩 + TDEE 자동계산 | 화면 1 | P0 | FR-1, FR-2 |
| 회원가입/로그인 | 화면 2 | P0 | — |
| 홈 대시보드 + SVG 링차트 | 화면 3 | P0 | FR-8 |
| 이미지 분석 + 수정 저장 | 화면 4 | P0 | FR-3, FR-4, FR-5, FR-6 |
| 수동 입력 fallback | 화면 5 | P0 | FR-10 |
| 날짜별 히스토리 + 삭제 | 화면 6 | P0 | — |
| 재분석 선택 모달 | 화면 7 | P1 | FR-7 |
| 통계 차트 | 화면 8 | P1 | FR-9 |
| 설정 (API키 + 목표 + 모델) | 화면 9 | P0 | FR-11 |
