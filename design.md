# design.md

`design.md`를 작성, 수정, 검증, 비교, 토큰 export할 때는 `C:\Users\hylee\Documents\GStack + Superpowers\skills\design-md\SKILL.md`의 DESIGN.md 스킬 규칙을 적용한다.

# Google Labs Stitch 포맷 / W3C DTCG 표준 기반

## Design System: Cal AI

**Project ID:** calorie-ai

이 파일은 `output/index.html`의 현재 구현을 기준으로 정리한 Cal AI 전용 디자인 시스템이다.  
Cal AI는 음식 사진 분석, 칼로리 기록, 목표 관리, 식단 히스토리 확인을 모바일에서 빠르게 처리하는 건강 관리 웹앱이다.

이 파일이 디자인의 source of truth다. 이후 화면 색상, 폰트, 간격, 모서리, 컴포넌트 스타일을 바꿀 때는 먼저 이 파일을 수정하고 코드에 반영한다.

## 1. Visual Theme & Atmosphere

Cal AI의 기본 톤은 밝고 신뢰감 있는 모바일 헬스 앱이다. 사용자는 음식을 빠르게 기록하고 하루 섭취량을 확인해야 하므로, 화면은 가볍고 선명하며 다음 행동이 즉시 보여야 한다.

- **분위기:** 건강함, 산뜻함, 명료함, 부담 없는 기록 경험.
- **밀도:** 모바일 430px 폭 안에서 정보가 충분히 보이되, 입력 흐름은 막히지 않는 중간 밀도.
- **미학:** 밝은 회색 앱 배경 위에 흰 카드, 초록 CTA, 낮은 그림자를 사용한다.
- **핵심 행동:** 사진 분석, 저장, 목표 수정, 음식 DB 기록처럼 사용자가 행동해야 하는 지점은 초록색으로 표시한다.
- **금지 톤:** 의료 앱처럼 딱딱한 파랑 톤, 과도한 그라데이션, 장식성 카드 남발, 랜딩 페이지 같은 과장된 히어로 구성.

## 2. Color Palette & Roles

현재 `output/index.html`의 `:root` CSS 변수와 inline style을 기준으로 정리한다. 코드에서는 하단 JSON 토큰의 정확한 hex 값을 사용한다.

| 이름 | Hex | 역할 |
|---|---:|---|
| Fresh Green | `#22C55E` | 주요 CTA, 활성 탭, 칼로리 강조, 성공적 진행 상태 |
| Deep Green | `#16A34A` | primary hover, 초록 그라디언트 끝점, 진한 성공 텍스트 |
| Mint Surface | `#F0FDF4` | 선택된 카드, 성공 메시지, 초록 강조 배경 |
| Mint Border | `#D1FAE5` | 성공 메시지 테두리, 연한 초록 구분 |
| App Background | `#F9FAFB` | 모바일 앱 내부 기본 배경 |
| App Shell | `#E5E7EB` | 데스크톱에서 모바일 앱 바깥 배경 |
| Card White | `#FFFFFF` | 카드, 상단바, 바텀 내비게이션, 바텀시트 |
| Ink Black | `#111827` | 주요 제목과 본문 텍스트 |
| Muted Gray | `#6B7280` | 보조 텍스트, 날짜, 캡션, 비활성 탭 |
| Quiet Border | `#E5E7EB` | 입력, 탭 구분선, 카드 선택 전 테두리 |
| Danger Red | `#EF4444` | 오류, 삭제, 위험 액션 |
| Warning Orange | `#F59E0B` | 경고, 목표 초과, 주의 상태 |
| Info Blue | `#3B82F6` | 단백질 등 영양소 보조 정보 |

## 3. Typography Rules

기본 UI 폰트는 한글 가독성을 위해 `Noto Sans KR`을 사용하고, 숫자와 칼로리 수치는 `Inter`를 함께 사용한다.

- 전체 본문은 `Noto Sans KR`, `Inter`, sans-serif 순서로 렌더링한다.
- 칼로리, 목표량, 통계 수치처럼 숫자 리듬이 중요한 요소는 `Inter`를 사용한다.
- 모바일 화면 내부 제목은 보통 18px, 주요 단계 제목은 20px, 로고성 문구는 28~32px를 사용한다.
- 거대한 숫자는 TDEE 결과처럼 한 화면에서 가장 중요한 결과에만 사용한다.
- 본문과 라벨은 13~16px 범위에서 유지한다.

## 4. Component Stylings

- **Buttons:** 기본 버튼은 Fresh Green 배경, 흰 텍스트, `radius.md`를 사용한다. 높이는 최소 44px 이상이다. hover/pressed 상태는 Deep Green 또는 scale 피드백을 사용한다.
- **Cards:** 일반 카드는 Card White 배경, `radius.lg`, `spacing.4` padding, 낮은 그림자 `shadow.sm`을 사용한다.
- **Selectable Cards:** 성별, 활동량, 목표, 모델 선택처럼 선택 가능한 카드는 Quiet Border 2px를 기본으로 하고, 선택 시 Fresh Green border와 Mint Surface 배경을 사용한다.
- **Inputs:** 입력과 select는 Card White 배경, Quiet Border 1.5~2px, `radius.md`, 12~14px 수직 padding을 사용한다. focus는 Fresh Green border로 표시한다.
- **Bottom Navigation:** 화면 하단 고정, 높이 60px + safe area, 활성 탭은 Fresh Green, 비활성 탭은 Muted Gray를 사용한다.
- **FAB:** 음식 사진 분석 시작 버튼은 60px 원형, 초록 그라디언트, 강한 초록 그림자를 사용한다. 앱의 가장 중요한 즉시 행동이므로 화면 오른쪽 하단에 고정한다.
- **Bottom Sheets:** 카메라/갤러리, 재분석, 음식 DB 같은 선택 흐름은 하단 바텀시트로 표시한다. 상단 모서리는 20px, dim overlay는 rgba black 0.5를 사용한다.
- **Modals:** 재설정, 로그아웃, 게스트 시작 모달은 중앙 모달로 표시하고, 24px radius와 강한 shadow를 사용한다. 중요한 확인 액션은 색상으로 의미를 구분한다.
- **Toasts:** 저장 완료 토스트는 하단 90px 위치, pill 형태, 초록 그라디언트와 흰 텍스트를 사용한다.

## 5. Layout Principles

Cal AI는 모바일 앱 쉘을 기준으로 한다.

- 앱 컨테이너는 `width: 100%`, `max-width: 430px`, `min-height: 100dvh`를 사용한다.
- 데스크톱에서는 화면 중앙에 430px 앱이 놓이고, 바깥은 App Shell 배경으로 둔다.
- 상단바는 sticky, 높이 56px, 흰 배경, 하단 border를 사용한다.
- 하단 내비게이션은 fixed, max-width 430px, z-index 100을 사용한다.
- 본문 화면은 하단 내비게이션과 safe area를 고려해 padding-bottom을 둔다.
- 주요 화면 padding은 16px, 바텀시트 padding은 20px를 기준으로 한다.
- 터치 가능한 요소는 최소 44px 높이를 유지한다.

---

## 이 파일이 맞는 프로젝트

| 우선순위 | 프로젝트 유형 | 이유 |
|---|---|---|
| 1순위 | Cal AI 칼로리 트래커 | 현재 `output/index.html`에서 추출한 실제 디자인 기준 |
| 2순위 | 모바일 헬스/식단/운동 기록 앱 | 초록 CTA, 기록 카드, 대시보드 구조 재사용 가능 |
| 3순위 | 사진 분석 + 저장 + 통계 앱 | FAB, 분석 결과 수정, 히스토리, 바텀시트 패턴 재사용 가능 |

**맞지 않는 경우**

- B2B SaaS 대시보드처럼 고밀도 테이블 중심 UI.
- 브랜드 랜딩 페이지.
- 어두운 테마가 핵심인 앱.

---

## 작성 3단계

### Step 1 - 현재 구현 기준 확인

이 디자인 시스템은 `output/index.html`의 현재 구현에서 시작했다. 디자인을 바꾸기 전에는 다음 위치를 먼저 확인한다.

- `:root` CSS 변수.
- `.btn`, `.card`, `.input-group`, `.top-bar`, `#bottom-nav`, `#fab`, `.sheet`.
- inline style로 남아 있는 모달, 토스트, 음식 DB 카드.

### Step 2 - 이 파일 먼저 수정

색상, 폰트, 간격, radius, shadow를 바꿀 때는 코드보다 이 파일을 먼저 수정한다.

### Step 3 - 코드 동기화

이 파일의 토큰을 기준으로 `output/index.html`의 `:root` 변수와 컴포넌트 CSS를 업데이트한다. inline style은 가능하면 공통 클래스 또는 CSS 변수로 이동한다.

---

## 1. Colors

```json
{
  "color": {
    "primary": {
      "$value": "#22C55E",
      "$type": "color",
      "$description": "Fresh Green. 주요 CTA, 활성 탭, 칼로리 강조, 선택 상태에 사용."
    },
    "primary-hover": {
      "$value": "#16A34A",
      "$type": "color",
      "$description": "Deep Green. primary hover, pressed, 초록 그라디언트 끝점."
    },
    "primary-subtle": {
      "$value": "#F0FDF4",
      "$type": "color",
      "$description": "Mint Surface. 선택된 카드, 성공 메시지, 연한 초록 배경."
    },
    "primary-border": {
      "$value": "#D1FAE5",
      "$type": "color",
      "$description": "Mint Border. 성공 메시지 테두리와 연한 초록 경계."
    },
    "background": {
      "$value": "#F9FAFB",
      "$type": "color",
      "$description": "모바일 앱 내부 기본 배경."
    },
    "background-shell": {
      "$value": "#E5E7EB",
      "$type": "color",
      "$description": "데스크톱에서 모바일 앱 바깥 영역 배경."
    },
    "surface": {
      "$value": "#FFFFFF",
      "$type": "color",
      "$description": "카드, 상단바, 바텀 내비게이션, 모달, 바텀시트."
    },
    "surface-muted": {
      "$value": "#F3F4F6",
      "$type": "color",
      "$description": "썸네일 placeholder, 비활성 pill, 보조 표면."
    },
    "surface-cool": {
      "$value": "#F8FAFC",
      "$type": "color",
      "$description": "TDEE breakdown 등 차분한 정보 박스."
    },
    "text": {
      "$value": "#111827",
      "$type": "color",
      "$description": "주요 제목과 본문 텍스트."
    },
    "text-secondary": {
      "$value": "#374151",
      "$type": "color",
      "$description": "모달 버튼, 보조 제목, 강조도가 낮은 본문."
    },
    "text-muted": {
      "$value": "#6B7280",
      "$type": "color",
      "$description": "캡션, 날짜, 비활성 탭, 보조 설명."
    },
    "text-disabled": {
      "$value": "#9CA3AF",
      "$type": "color",
      "$description": "disabled 버튼, 약한 안내 문구."
    },
    "border": {
      "$value": "#E5E7EB",
      "$type": "color",
      "$description": "입력, 구분선, 카드 선택 전 테두리."
    },
    "error": {
      "$value": "#EF4444",
      "$type": "color",
      "$description": "오류, 삭제, 위험 액션."
    },
    "error-subtle": {
      "$value": "#FEF2F2",
      "$type": "color",
      "$description": "오류 메시지 배경."
    },
    "warning": {
      "$value": "#F59E0B",
      "$type": "color",
      "$description": "주의, 목표 초과, 통계 기준선."
    },
    "warning-subtle": {
      "$value": "#FFFBEB",
      "$type": "color",
      "$description": "경고 메시지 배경."
    },
    "info": {
      "$value": "#3B82F6",
      "$type": "color",
      "$description": "단백질 등 보조 영양소 정보."
    }
  }
}
```

---

## 2. Typography

```json
{
  "font": {
    "family": {
      "sans": {
        "$value": "'Noto Sans KR', 'Inter', sans-serif",
        "$type": "fontFamily",
        "$description": "기본 UI 폰트. 한글 가독성을 우선한다."
      },
      "number": {
        "$value": "'Inter', sans-serif",
        "$type": "fontFamily",
        "$description": "칼로리, 목표량, 통계 수치."
      }
    },
    "size": {
      "2xs": { "$value": "9px", "$type": "dimension", "$description": "차트 날짜와 작은 수치." },
      "xs": { "$value": "10px", "$type": "dimension", "$description": "하단 내비게이션 라벨." },
      "sm": { "$value": "12px", "$type": "dimension", "$description": "작은 배지, 보조 캡션." },
      "md": { "$value": "13px", "$type": "dimension", "$description": "폼 라벨, 메시지." },
      "base": { "$value": "14px", "$type": "dimension", "$description": "카드 내부 기본 텍스트." },
      "input": { "$value": "15px", "$type": "dimension", "$description": "입력 필드와 탭 텍스트." },
      "button": { "$value": "16px", "$type": "dimension", "$description": "주요 버튼." },
      "heading": { "$value": "18px", "$type": "dimension", "$description": "상단바 제목과 시트 제목." },
      "section-title": { "$value": "20px", "$type": "dimension", "$description": "온보딩 단계 제목, 통계 숫자." },
      "logo": { "$value": "32px", "$type": "dimension", "$description": "인증 화면 로고성 타이틀." },
      "result": { "$value": "52px", "$type": "dimension", "$description": "TDEE 결과 대형 숫자." }
    },
    "weight": {
      "regular": { "$value": "400", "$type": "fontWeight" },
      "medium": { "$value": "500", "$type": "fontWeight" },
      "semibold": { "$value": "600", "$type": "fontWeight" },
      "bold": { "$value": "700", "$type": "fontWeight" }
    },
    "lineHeight": {
      "tight": { "$value": "1", "$type": "number", "$description": "대형 숫자." },
      "normal": { "$value": "1.5", "$type": "number", "$description": "일반 본문." },
      "comfortable": { "$value": "1.6", "$type": "number", "$description": "모달 설명 텍스트." }
    }
  }
}
```

---

## 3. Spacing

```json
{
  "spacing": {
    "0": { "$value": "0px", "$type": "dimension" },
    "1": { "$value": "4px", "$type": "dimension" },
    "1.5": { "$value": "6px", "$type": "dimension" },
    "2": { "$value": "8px", "$type": "dimension" },
    "2.5": { "$value": "10px", "$type": "dimension" },
    "3": { "$value": "12px", "$type": "dimension" },
    "3.5": { "$value": "14px", "$type": "dimension" },
    "4": { "$value": "16px", "$type": "dimension", "$description": "기본 화면 padding과 카드 padding." },
    "5": { "$value": "20px", "$type": "dimension", "$description": "바텀시트 padding." },
    "6": { "$value": "24px", "$type": "dimension" },
    "8": { "$value": "32px", "$type": "dimension" },
    "10": { "$value": "40px", "$type": "dimension", "$description": "빈 상태 상하 padding." }
  }
}
```

---

## 4. Border Radius

```json
{
  "radius": {
    "none": { "$value": "0px", "$type": "dimension" },
    "xs": { "$value": "2px", "$type": "dimension", "$description": "step dot, sheet handle." },
    "sm": { "$value": "4px", "$type": "dimension", "$description": "차트 막대, 작은 수량 버튼." },
    "md": { "$value": "8px", "$type": "dimension", "$description": "버튼, 입력, 작은 카드, 썸네일." },
    "lg": { "$value": "10px", "$type": "dimension", "$description": "선택 카드, 식단 카드, 정보 박스." },
    "xl": { "$value": "12px", "$type": "dimension", "$description": "일반 카드, 모달 입력." },
    "sheet": { "$value": "20px", "$type": "dimension", "$description": "바텀시트 상단 모서리." },
    "modal": { "$value": "24px", "$type": "dimension", "$description": "중앙 확인 모달." },
    "pill": { "$value": "50px", "$type": "dimension", "$description": "토스트 pill." },
    "full": { "$value": "9999px", "$type": "dimension", "$description": "FAB, 원형 아이콘." }
  }
}
```

---

## 5. Shadows

```json
{
  "shadow": {
    "xs": {
      "$value": "0 1px 2px rgba(0, 0, 0, 0.05)",
      "$type": "shadow",
      "$description": "작은 통계 카드와 식단 카드."
    },
    "sm": {
      "$value": "0 1px 3px rgba(0, 0, 0, 0.06)",
      "$type": "shadow",
      "$description": "일반 카드 기본 그림자."
    },
    "dropdown": {
      "$value": "0 4px 12px rgba(0, 0, 0, 0.12)",
      "$type": "shadow",
      "$description": "히스토리 더보기 메뉴."
    },
    "fab": {
      "$value": "0 6px 20px rgba(34, 197, 94, 0.45)",
      "$type": "shadow",
      "$description": "사진 분석 FAB."
    },
    "fab-hover": {
      "$value": "0 8px 24px rgba(34, 197, 94, 0.55)",
      "$type": "shadow",
      "$description": "FAB hover."
    },
    "modal": {
      "$value": "0 24px 60px rgba(0, 0, 0, 0.2)",
      "$type": "shadow",
      "$description": "중앙 확인 모달."
    },
    "toast": {
      "$value": "0 8px 24px rgba(34, 197, 94, 0.4)",
      "$type": "shadow",
      "$description": "저장 완료 토스트."
    },
    "none": {
      "$value": "none",
      "$type": "shadow"
    }
  }
}
```

---

## 6. Z-index

```json
{
  "zIndex": {
    "base": { "$value": "0", "$type": "number" },
    "top-bar": { "$value": "50", "$type": "number", "$description": "sticky 상단바와 드롭다운 기준." },
    "fab": { "$value": "90", "$type": "number", "$description": "음식 분석 FAB." },
    "bottom-nav": { "$value": "100", "$type": "number", "$description": "하단 내비게이션." },
    "overlay": { "$value": "200", "$type": "number", "$description": "바텀시트 overlay." },
    "modal-overlay": { "$value": "500", "$type": "number", "$description": "중앙 모달 dim layer." },
    "modal": { "$value": "501", "$type": "number", "$description": "중앙 모달." },
    "toast": { "$value": "600", "$type": "number", "$description": "저장 완료 토스트." }
  }
}
```

---

## 7. Breakpoints

```json
{
  "breakpoint": {
    "app-max": {
      "$value": "430px",
      "$type": "dimension",
      "$description": "Cal AI 모바일 앱 쉘 최대 폭."
    },
    "sm": {
      "$value": "640px",
      "$type": "dimension",
      "$description": "모바일 가로 또는 작은 태블릿."
    },
    "md": {
      "$value": "768px",
      "$type": "dimension",
      "$description": "태블릿 이상. 앱은 여전히 430px 중앙 배치."
    }
  }
}
```

---

## 8. Animation

```json
{
  "animation": {
    "duration": {
      "instant": { "$value": "150ms", "$type": "duration", "$description": "모달 버튼 pressed 피드백." },
      "fast": { "$value": "200ms", "$type": "duration", "$description": "버튼, 탭, 입력 focus, 선택 카드." },
      "normal": { "$value": "300ms", "$type": "duration", "$description": "바텀시트 slideUp, step dot." },
      "chart": { "$value": "500ms", "$type": "duration", "$description": "매크로 바와 차트 폭 변화." },
      "spinner": { "$value": "700ms", "$type": "duration", "$description": "로딩 spinner 회전 주기." }
    },
    "easing": {
      "default": { "$value": "ease", "$type": "cubicBezier", "$description": "기본 transition." },
      "linear": { "$value": "linear", "$type": "cubicBezier", "$description": "spinner 회전." }
    }
  }
}
```

---

## Component Tokens

```json
{
  "component": {
    "app": {
      "maxWidth": { "$value": "{breakpoint.app-max}", "$type": "dimension" },
      "minHeight": { "$value": "100dvh", "$type": "dimension" }
    },
    "topBar": {
      "height": { "$value": "56px", "$type": "dimension" },
      "paddingX": { "$value": "{spacing.4}", "$type": "dimension" },
      "background": { "$value": "{color.surface}", "$type": "color" },
      "border": { "$value": "1px solid {color.border}", "$type": "border" }
    },
    "bottomNav": {
      "height": { "$value": "60px", "$type": "dimension" },
      "activeColor": { "$value": "{color.primary}", "$type": "color" },
      "inactiveColor": { "$value": "{color.text-muted}", "$type": "color" }
    },
    "button": {
      "minHeight": { "$value": "44px", "$type": "dimension" },
      "padding": { "$value": "14px", "$type": "dimension" },
      "radius": { "$value": "{radius.md}", "$type": "dimension" },
      "fontSize": { "$value": "{font.size.button}", "$type": "dimension" },
      "fontWeight": { "$value": "{font.weight.semibold}", "$type": "fontWeight" }
    },
    "card": {
      "padding": { "$value": "{spacing.4}", "$type": "dimension" },
      "radius": { "$value": "{radius.xl}", "$type": "dimension" },
      "shadow": { "$value": "{shadow.sm}", "$type": "shadow" }
    },
    "input": {
      "padding": { "$value": "12px", "$type": "dimension" },
      "border": { "$value": "1.5px solid {color.border}", "$type": "border" },
      "focusBorderColor": { "$value": "{color.primary}", "$type": "color" },
      "radius": { "$value": "{radius.md}", "$type": "dimension" },
      "fontSize": { "$value": "{font.size.input}", "$type": "dimension" }
    },
    "fab": {
      "size": { "$value": "60px", "$type": "dimension" },
      "radius": { "$value": "{radius.full}", "$type": "dimension" },
      "background": { "$value": "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)", "$type": "gradient" },
      "shadow": { "$value": "{shadow.fab}", "$type": "shadow" }
    },
    "sheet": {
      "maxWidth": { "$value": "{breakpoint.app-max}", "$type": "dimension" },
      "padding": { "$value": "{spacing.5}", "$type": "dimension" },
      "radius": { "$value": "{radius.sheet} {radius.sheet} 0 0", "$type": "dimension" },
      "maxHeight": { "$value": "92dvh", "$type": "dimension" }
    },
    "modal": {
      "maxWidth": { "$value": "340px", "$type": "dimension" },
      "radius": { "$value": "{radius.modal}", "$type": "dimension" },
      "shadow": { "$value": "{shadow.modal}", "$type": "shadow" }
    }
  }
}
```

---

## 적용 현황

| 카테고리 | 상태 | 기준 |
|---|---|---|
| Colors | 확정 | `output/index.html` `:root` 및 inline style |
| Typography | 확정 | `body`, 숫자 컴포넌트, 버튼, 라벨 |
| Spacing | 초안 | 현재 CSS의 4~40px 사용값 정리 |
| Border Radius | 확정 | 버튼, 카드, 바텀시트, 모달 구현값 |
| Shadows | 확정 | 카드, FAB, 드롭다운, 모달, 토스트 구현값 |
| Z-index | 확정 | 상단바, FAB, nav, overlay, modal, toast |
| Breakpoints | 확정 | `max-width: 430px` 모바일 앱 쉘 |
| Animation | 초안 | 현재 transition과 keyframes 기준 |
| Component Tokens | 초안 | 코드 동기화 시 우선 적용 대상 |

---

## 코드 동기화 TODO

- `output/index.html`의 `:root` 변수명을 이 파일의 semantic token과 연결한다.
- inline style로 남아 있는 모달, 토스트, 음식 DB 카드 스타일을 공통 CSS 클래스로 이동한다.
- 초록 그라디언트는 FAB, 게스트 시작 CTA, 저장 토스트처럼 핵심 행동에만 제한한다.
- emoji는 식사 맥락과 빈 상태를 보조하는 정도로 사용하고, 핵심 UI 식별자는 가능하면 아이콘 또는 텍스트 라벨을 사용한다.
- 색상, radius, shadow를 코드에서 직접 바꾼 경우 이 파일도 반드시 업데이트한다.
