# Design.md — Cal AI Warm Visual

`output/index.html` 전체 화면에 적용되는 **Warm Visual 톤**의 디자인 사양입니다.

프로젝트의 기본 디자인 토큰은 `design.md`에 정의되어 있으며, 이 문서는 그 위에
**온보딩에서 출발해 앱 전체(인증·홈·히스토리·통계·설정·바텀 내비게이션·FAB·시트)로 확장된 Warm Visual 레이어**를 정의합니다.

---

## 0. Design System Workflow

레퍼런스(Stitch / Figma)에서 **design system 정보**를 가져옵니다.

```
Stitch / Figma 레퍼런스
        ↓
design.md (시스템 정보 import)
        ↓
세분화된 디자인 시스템 md (상황에 따라 세분화 가능)
    • colors.md
    • typography.md
    • spacing.md
    • components.md
```

**주의**: Claude.md 파일에서 `@design.md` 도구를 반드시 명시하여 다른 에이전트도 이 정의서를 참고할 수 있도록 합니다.

---

## 1. Atmosphere — Warm Visual

Cal AI는 건강 매니아용이 아닌 일상적이고 친구 같은 톤을 출발점으로 삼습니다.

- **분위기**: 민트 그라디언트 쉘 + 부드러운 큰 멈춤 라운드 + 그린 글로우 CTA. 철저하게 원형적이고 촉각적.
- **밀도**: 모바일 430px 폭, 낮은~중간 밀도. 카드 간 간격과 레이어시드는 넓게.
- **일관성**: 온보딩 하나만 봐도 인증/홈/히스토리/통계/설정/바텀 네비게이션/FAB 모두 속하는 시각적 가족이 되도록 색조·라운드·그림자 토큰을 전역으로 공유.
- **금지**: 딱딱한 직사각·하드 경계·의료적 파랑. 온도 차가운 그린은 CTA와 진행 수치에만 한정.

---

## 2. Foundations (global tokens)

```json
{
  "color": {
    "warm.shell":      { "$value": "#eef5ee", "$type": "color", "$description": "데스크탑 쪽 앱 바깥 쉘." },
    "warm.app-bg":     { "$value": "#f7faf6", "$type": "color", "$description": "앱 내부 기본 배경. 메인 그라디언트 종료점." },
    "warm.surface":    { "$value": "#FFFFFF", "$type": "color", "$description": "카드, 입력 배경. 메인 시스템의 surface를 재사용." },
    "warm.surface-translucent": { "$value": "rgba(255,255,255,.78)", "$type": "color", "$description": "상단바·바텀 내비게이션에 사용하는 글래스 표면." },
    "warm.selected":   { "$value": "linear-gradient(135deg,#dcfce7,#bbf7d0)", "$type": "gradient", "$description": "선택·강조 카드 배경." },
    "warm.hero-bubble":{ "$value": "radial-gradient(circle at 30% 30%, #d1fae5, #86efac 70%, #22c55e 110%)", "$type": "gradient", "$description": "온보딩 히어로 원형 + auth 로고 원형." },
    "warm.cta":        { "$value": "linear-gradient(135deg,#22c55e,#16a34a)", "$type": "gradient", "$description": "Primary CTA, FAB, 저장 토스트 공유 그라디언트." },
    "warm.danger":     { "$value": "linear-gradient(135deg,#f87171,#ef4444)", "$type": "gradient", "$description": ".btn-danger 그라디언트." }
  },
  "shadow": {
    "warm.card": {
      "$value": "0 1px 2px rgba(17,24,39,.04),0 8px 24px -12px rgba(17,24,39,.08)",
      "$type": "shadow",
      "$description": "메인 카드 그림자 — 말랑하고 멀리 퍼지는 둥글 그림자."
    },
    "warm.glow": {
      "$value": "0 12px 28px -10px rgba(34,197,94,.55)",
      "$type": "shadow",
      "$description": "Primary CTA, FAB, 선택 카드 그린 글로우."
    },
    "warm.glow-soft": {
      "$value": "0 10px 24px -10px rgba(34,197,94,.35)",
      "$type": "shadow",
      "$description": "마이너 CTA, 시각적 강조 카드."
    }
  },
  "radius": {
    "warm.btn":   { "$value": "999px", "$type": "dimension", "$description": "모든 버튼(.btn)." },
    "warm.input": { "$value": "12px",  "$type": "dimension", "$description": ".input-group input/select." },
    "warm.card":  { "$value": "18px",  "$type": "dimension", "$description": ".card, .macro-bars, .meal-card, .history-meal-card, .bar-chart, .settings-section." },
    "warm.tile":  { "$value": "16px",  "$type": "dimension", "$description": ".ring-stat, .stat-box, .meal-thumb-icon." },
    "warm.sheet": { "$value": "24px",  "$type": "dimension", "$description": "바텀 시트 상단 모서리." },
    "warm.pill":  { "$value": "999px", "$type": "dimension", "$description": ".auth-tabs, .stats-tabs, .date-nav, .nav-btn.active 필." }
  }
}
```

---

## 3. Components — 적용 맵

각 컴포넌트별 Warm Visual 레이어가 어떻게 동작하는지 요약.

### 3.1 Shell & background
- `html, body` → `warm.shell` (바깥쉘 민트 그레이).
- `#app` → `linear-gradient(180deg,#f0fdf4 0%, warm.app-bg 22%)` — 상단이 민트에서 소프트하게 배경으로 녹아들어 상단바 글래스감이 자연스럽게 드러남.

### 3.2 Top bar (`.top-bar`)
- `rgba(255,255,255,.78)` + `backdrop-filter: blur(14px)` 글래스 표면.
- 하단 구분선 제거, 아주 약한 `0 1px 0 rgba(17,24,39,.04)` 그림자만.
- 높이 60px, 제목 20px / weight 800.

### 3.3 Buttons (`.btn`)
- 기본 하이트 52px, `border-radius: 999`, font 15.5px / 700.
- `.btn-primary`: `warm.cta` 그라디언트 + `warm.glow`. hover 시 글로우 폭 확대.
- `.btn-outline`: 흰 배경 + 연한 민트 보더(`--green-light`) + 그린 다크 텍스트.
- `.btn-danger`: 레드 그라디언트 + 레드 글로우.
- `.btn-sm`: 38px 소형 pill.
- 항상 `:active` 시 `scale(.98)` 마이크로 모션으로 닿그 안정적인 터치 피드백.

### 3.4 Cards (`.card`)
- `border-radius: 18px`, padding 18px, `warm.card-shadow`.
- 연한 1px 테두리(`rgba(17,24,39,.04)`)로 쉘 위에서도 구분 가능.

### 3.5 Inputs (`.input-group input`)
- `border-radius: 12px`, padding 13/14, focus 시 3px 그린 링.
- Label → 12.5px / weight 600.

### 3.6 Bottom nav (`#bottom-nav`)
- 상단바와 동일한 글래스 표면. 위쪽 부드러운 그림자.
- 활성 탭은 아이콘 뒤 36×24 민트 필 배경(`warm.green-bg`)이 그려져 세그멘티드 느낌.

### 3.7 FAB (`#fab`)
- `warm.cta` 그라디언트 + 이중 그림자 `0 14px 32px -6px rgba(34,197,94,.6), 0 0 0 6px rgba(34,197,94,.08)` 으로 바깥으로 퍼지는 후일로 회절 감입.

### 3.8 Auth screen (`#screen-auth`)
- 로고 영역 `.auth-logo::before`로 **92×92 히어로 버블**을 자동 렌더링 (HTML 수정 없이).
- 탭은 underline에서 필 형 세그멘티드 컨트롤로 교체: `.auth-tabs` 재미 + `.auth-tab.active`가 흰 카드 표면 + 그림자.

### 3.9 Home ring & stats
- `.ring-kcal`: 34px / weight 800 / letter-spacing -1px.
- `.ring-stat`: 흰 카드, 16px radius, `warm.card-shadow`.

### 3.10 Home macro bars (`.macro-bars`)
- 세 막대를 하나의 흰 카드(`warm.card`)로 묶음.
- 트랙 높이 8px, radius 999, fill은 `warm.cta` 그라디언트. 초과 시 Warning Orange 그라디언트.

### 3.11 Meal cards (`.meal-card`, `.history-meal-card`)
- 18px radius, `warm.card-shadow`.
- 썸네일 아이콘 슬롯은 48×48 민트 그라디언트(`linear-gradient(135deg,#f0fdf4,#dcfce7)`).
- 칼로리 수치는 Deep Green · Inter 타불러 숫자.

### 3.12 History date nav (`.date-nav`)
- 일자 셀렉터를 **떠있는 필**로 변경: 흰 배경 + radius 999 + `warm.card-shadow`. 날짜 버튼은 36px 원형, hover 시 `warm.green-bg`.

### 3.13 Stats tabs (`.stats-tabs`) & chart
- Auth 탭과 동일한 필 세그멘티드 스타일.
- 차트 메인 영역을 흰 카드로 감싸고 `bar-body`는 수직 그라디언트(`#86efac → #22c55e`).
- `.stat-box`: 16px radius, sb-val을 Deep Green / weight 800.

### 3.14 Settings (`.settings-section`)
- 18px radius 카드, `warm.card-shadow`.
- 섹션 타이틀은 Deep Green 소문자로 차별화.
- 아이템 사이 구분선은 초시한 `rgba(17,24,39,.05)`.

### 3.15 Bottom sheet (`.sheet`)
- 24px 상단 모서리, 굵은 22px padding, 위로 넘치는 소프트 그림자.
- 제목 19px / weight 800.

---

## 4. Onboarding (per-screen) Spec

Warm Visual 톤의 출발점인 온보딩 4단계는 위의 전역 토큰에 더해 다음 컴포넌트를 사용합니다.

### 4.1 Hero header (`.onb-header`)
- 108×108 원형 그라디언트 버블(`warm.hero-bubble`) + 우상단 흰색 말풍선 태그(`안녕하세요!`).
- 22px / weight 800 로고 텍스트, 13px 보조 카피.

### 4.2 Step progress (`.step-bar`)
- 4개 점, `flex:1`, height 4px, gap 6px. 활성 상태만 Fresh Green.

### 4.3 Step1 — Gender pill (`.sel-card`)
- 48px height pill, 선택 시 단색 그린 + 그린 글로우 + 흰 글자.

### 4.4 Step1 — Input group card
- 한 개의 흰 카드 안에 라벨–숫자 행 3개를 구분선으로 묶음. 숫자는 Inter 20px 700, 오른쪽 정렬.

### 4.5 Step2 — Activity list (`.activity-item`)
- 16px radius 흰 카드, 좌측 48×48 둥근 사각 아이콘 슬롯, 우측 24×24 라디오 — 선택 시 그린 채움 + 흰 체크 SVG.
- 선택 시 배경이 `warm.selected` 그라디언트, 보더 제거, 그린 글로우 추가.

### 4.6 Step3 — Goal cards (`.goal-card`)
- 18px radius 흰 카드. 56×56 흰 아이콘 슬롯 + 텍스트 + 우측 delta 칩.
- `data-delta` 속성을 CSS `::after content:attr(data-delta)` 로 출력 (감량 `−500` · 유지 `±0` · 증량 `+300`).

### 4.7 Privacy check (`.privacy-check`)
- 14px radius, 반투명 흰 배경, 1px 보더 동의 박스.

### 4.8 Step4 — TDEE result hero (`.tdee-result`)
- 24px radius, 민트 그라디언트 배경, 우상단 흰 빛 글로우(`::before`).
- 58px Inter 800 숫자, kcal 단위 보조 라벨.
- 아래로 흰 카드 breakdown + 3분할 매크로 박스 + 흰 카드 직접 수정 입력.

### 4.9 Nav buttons (`.onb-nav .btn`)
- 56px height pill, primary는 `warm.cta` + `warm.glow`.

---

## 5. Motion

| 대상 | 속성 | 시간 / easing |
|---|---|---|
| 카드 선택 상태 변화 | `background, border-color, box-shadow` | 200ms ease |
| 진행 dot 색 변화 | `background` | 300ms ease |
| 모든 버튼 hover | `background, box-shadow` | 150ms ease |
| 모든 버튼 active (`scale(.98)`) | `transform` | 120ms ease |

---

## 6. Accessibility

- 모든 터치 타깃 최소 44–52px.
- 활성 상태는 색 변화만이 아니라 그림자·체크 마크로도 표현해 색맹 대응.
- Focus 시 입력 필드 3px 그린 링으로 키보드 사용자 강조.
- 숫자 위주 데이터는 `font-variant-numeric: tabular-nums`로 시각 비교 보장.

---

## 7. 코드 적용 위치

| 파일 | 영역 | 내용 |
|---|---|---|
| `output/index.html` | `<style>` 내 `/* ── 온보딩 (Warm Visual) ── */` | 온보딩 4단계 전용 CSS |
| `output/index.html` | `<style>` 내 `/* ── Warm Visual Global Theme (appended overrides) ── */` (`</style>` 직전) | 인증·홈·히스토리·통계·설정·시트·바텀 내비게이션·FAB·버튼·카드·입력 전역 override |
| `output/index.html` | `#screen-onboarding > .onb-header` | 온보딩 헤더 — 로고 이미지 (`.onb-brand-mark`) + 보조 카피 |
| `output/index.html` | `#screen-auth > .auth-logo` | 인증 헤더 — 로고 이미지 (`.auth-brand-mark`) + 보조 카피 |
| `output/index.html` | `#guest-modal` 헤더 원형 컨테이너 | 흰 원 안에 `img/logo-v2.png` 렌더 |
| `output/index.html` | `#splash-screen` (body 직하) | 스플래시 / 론치 화면 |
| `output/index.html` | `.goal-card[data-delta]` | delta 칩 표시용 속성 |
| `output/img/logo-v2.png` | 온보딩 / 인증 / 비회원 모달 | Calo AI 레터마크 (흔 배경 투명 처리됨) |
| `output/img/app-icon.png` | 스플래시 화면 | Calo AI 앱 아이콘 |

JS 로직은 **그대로 유지**됩니다. 아이콘 교체 시 이모지 문자열이 있던 `MEAL_ICON` / `DIET_MEAL_EMOJI` 상수는 SVG 문자열로 교체되었고, `renderHomeMeals`, `renderHistory`, `renderDietList`, `goStep`, `loadHomeData`, `loadHistoryData`, `loadStatsData`, `loadSettingsUI`, `showToast`, `renderChart` 등 기존 함수는 한 줄도 수정하지 않았습니다.

---

## 8. Brand Mark

Calo AI 레터마크는 세 곳에서 일관되게 등장합니다. 모두 동일한 투명 PNG (`output/img/logo-v2.png`)를 사용하며 존재 권역의 배경에 자연스럽게 올라갑니다.

| 위치 | 클래스 | 폭 | 추가 입키스탈 |
|---|---|---:|---|
| 온보딩 헤더 | `.onb-brand-mark` | 220px (max 60%) | `filter: drop-shadow(0 14px 28px rgba(34,197,94,.18))` |
| 인증 헤더 | `.auth-brand-mark` | 180px (max 55%) | 동일 드롭 섬돀 |
| 비회원 시작 모달 | inline `<img>` in 80px 흰 원 | 58px | 원 컨테이너 `box-shadow: 0 10px 24px -6px rgba(0,0,0,.25)` |

흔 배경 제거는 알파 채널 전처리로 자동화되어 있으며(`min(R,G,B) ≥ 252 → alpha 0`, smooth falloff 220→252), 그래디언트/흰 배경 위에서 외곽 계단 없이 깨끗게 떠 있습니다.

---

## 9. Iconography

기존 이모지 아이콘을 전용 **Lucide 계열 라인 SVG**로 전면 교체했습니다. 모든 아이콘은 `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="2"`, `width:1em; height:1em` 이므로 부모의 `font-size` / `color`를 그대로 상속합니다.

### 9.1 원칙
- **수단·타입·의미 전달 아이콘**만 유지 (메식 종류, 액션, 이동 타붙 등).
- **장식적 이모지** (타이틀 앞의 🔥📊🎯⚡🤖🚀 등)은 **완전 제거**. 텍스트가 의미를 다 전달.
- 아이콘 색은 `currentColor` 상속 — 새로운 색을 주고 싶으면 괄는 상자에 `color` 설정만 하면 됨.
- 영양소 세부(단백·탄수화물·지방 등)처럼 너무 작은 아이콘 어울리는 곳은 **컬러 도트(●)** 로 대체.

### 9.2 컴포넌트별 적용
| 영역 | 이전 이모지 | 교체 아이콘 |
|---|---|---|
| 온보딩 성별 | 👨 👩 | (완전 제거 — pill과 텍스트만으로 명확) |
| 온보딩 활동량 | 🛋️ 🚶 🏋️ 🏃 🏅 | sofa / walk / dumbbell / run / medal |
| 온보딩 목표 | 📉 ⚖️ 📈 | trending-down / balance / trending-up |
| 온보딩 시작 버튼 | 🚀 시작하기 | "시작하기" 술주 |
| 식사 타입 (mt-btn / option / MEAL_ICON / DIET_MEAL_EMOJI) | 🍳 🍱 🍽️ 🍪 | sun / bowl / plate / cookie |
| 식사 카드 메뉴 | ✏️ 🔄 🗑️ | edit / refresh / trash |
| 카메라 시트 / 미리보기 | 🖼️ 📷 | image / camera |
| 빈 상태 | 🍽️ 📋 | plate / list |
| 악의 / 알림 | ⚠️ | alert (트라이액글) |
| 로딩 / 검색 없음 | ⏳ 🔍 | spinner / search |
| 최근 음식 | ⏱ | clock |
| 설정 저장 / 성공 / 일정 | ✓ ✅ 🎯 | check (이모지 장식 수식어 제거) |
| 로그아웃 모달 | 👋 🔐 | wave / lock |
| 재분석 모달 | 🔄 | refresh |
| 비회원 혜택 chip | ✅ 📊 🔒 | check / bar-chart / lock |
| 분석 hint | 📊 칼로리 분석 보기 | bar-chart 아이콘 + 텍스트 |
| 음식 DB 영양소 | 🔥 💪 🌾 🫒 | 컬러 도트 (빨·파·주·녹) |
| 레이블 앞 장식 | 🤖 ⚡ 🎯 | 제거 (텍스트만) |

### 9.3 아이콘 삽입 관용구
```html
<!-- 인라인 텍스트 압으로 넘어갈 때 -->
<span style="display:inline-flex;vertical-align:-2px;margin-right:4px">
  <!-- SVG의 width=1em / height=1em 동작 이용 -->
  <svg ...>...</svg>
</span>레이블
```

아이콘 주입이 많은 파일 하단에 SVG 일러레이가 존재했던 구조는 제거되고, 인라인 테플릿에 직접 삽입하는 방식이 채택되었습니다(최소 파일·의존성 기준).

---

## 10. Splash / Launch Screen

앱 진입 시 맨 위에 떠서 **로고를 중앙에 페이드 인시키고 최소 2초 가시 후 페이드 아웃**하는 전용 론치 화면입니다.

### 10.1 구조
```html
<div id="splash-screen">
  <div class="splash-mark"><img src="img/app-icon.png" alt="Calo AI"></div>
  <div class="splash-caption">CALO AI</div>
</div>
```

### 10.2 스타일 토큰
- 배경: `linear-gradient(180deg,#f7faf6 0%, #eef5ee 100%)` — Warm Visual shell과 동일한 톤의 세로 그라디언트.
- 로고 컨테이너: 148×148, `border-radius:36px` (iOS 앱 아이콘 비율), 그림자 `0 24px 50px -14px rgba(34,197,94,.45), 0 4px 12px rgba(17,24,39,.06)`.
- 캐프션 글자: 12px Inter / 600 / `letter-spacing:.18em` / 대문자 / `rgba(22,163,74,.55)`.
- z-index: 9999 (모든 UI 위).

### 10.3 모션
| 단계 | 속성 | 시간 |
|---|---|---|
| 로고 등장 | `opacity 0→1`, `transform scale(.92→1.02→1)` | 0.8s `cubic-bezier(.2,.7,.3,1)` |
| 캐프션 등장 | `opacity 0→1` | 0.3s 도달 지연 + 0.8s ease |
| 최소 노출 | 가시 유지 | **2000 ms** (`MIN_VISIBLE_MS`) |
| 페이드 아웃 | `opacity → 0` | 0.5s ease, 이후 `display:none` 제거 |

### 10.4 JS 제어
- `window.load` 또는 `readyState === 'complete'` 시점부터 경과 시간 계산.
- `MIN_VISIBLE_MS` 임계에 도달한 수간 페이드 아웃 시작.
- 페이드 아웃 520ms 후 `display:none`으로 완전 제거 (클릭 감이 도달 가능하게).
- 기존 `#loading-overlay` 스피너는 그대로 유지 — 앱 초기화가 2초 이상 걸리면 스플래시 사라진 뒤 자연스럽게 노출.

### 10.5 자산
- `output/img/app-icon.png` — Calo AI 앱 아이콘 (부드러운 모서리 사각형 파워 그린 바탕).

---

## 11. 향후 확장 포인트

- **다크 테마**: `warm.shell`, `warm.app-bg`, `warm.surface` 토큰을 다크 카운터파트로 매핑. `warm.cta`와 글로우는 유지하되 strength 조정.
- **모션 강화**: 카드 선택 시 짧은 scale(1.02) bounce, 진행 dot 채움 시 좌→우 흐르는 fill 애니메이션.
- **타이포 정제**: Inter 대신 Inter Variable 또는 Geist Variable로 교체 시 숫자 가독성 추가 향상.
- **스플래시 애니메이션**: 로고 등장 이후 잠깐한 링 / 파티클 이펙트를 워터마크로 추가 가능.
- **아이콘 패키지화**: 현재 인라인된 SVG를 `<defs><symbol>` 기반 단일 스프라이트로 묶으면 재사용·유지보수 향상.
