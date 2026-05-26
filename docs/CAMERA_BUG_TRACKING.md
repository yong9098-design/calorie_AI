# 카메라 버그 추적 및 재발 방지 가이드

## 버그 개요

**증상**: "카메라로 사진 촬영" 버튼을 클릭했을 때 카메라 앱이 실행되지 않고 갤러리/파일 선택기가 열림

**최초 발생**: 2026-04-23 (Generator R5 이후)

**반복 횟수**: 3회 이상 발생

**마지막 수정일**: 2026-05-18

---

## 근본 원인

### 즉각적 원인 (Direct Cause)

`output/index.html` **line 570**에서 `<input type="file" id="img-input-camera">` 요소에 **`capture="environment"` 속성이 누락**되어 있음.

```html
<!-- 버그 코드 -->
<input type="file" id="img-input-camera" accept="image/*" style="display:none">

<!-- 올바른 코드 -->
<input type="file" id="img-input-camera" accept="image/*" capture="environment" style="display:none">
```

### 반복 발생의 구조적 원인 (Recurring Root Cause)

Generator 파이프라인이 SPEC.md를 기반으로 파일을 재생성할 때, 설계 문서에 명시되지 않은 속성은 자동으로 사라짐.

| 계층 | 문제 | 영향 |
|-----|------|------|
| **SPEC.md** | `capture="environment"`이 JS 함수 주석 안에만 있고 HTML 명세로 명시되지 않음 | Generator가 참조할 바인딩 규격 없음 |
| **agents/generator.md** | 카메라 input 구현 관련 지시 전무 | Generator가 일반 `<input type="file">`만 생성 |
| **agents/evaluation_criteria.md** | Evaluator의 체크리스트에 `capture` 속성 검사 항목 없음 | 회귀 감지 불가, PASS 오판 |
| **agents/evaluator.md** | Stage 2 코드 검사에 카메라 input 속성 확인 항목 없음 | Evaluator가 버그를 캐치하지 못함 |

**결론**: 수정 내용이 CHANGELOG에만 기록되고, Generator/Evaluator가 읽는 설계 문서에 반영되지 않아서 파이프라인 반복 실행 시 속성이 계속 사라짐.

---

## 즉각 수정 방법

### Step 1: output/index.html 수정

**파일**: `output/index.html`  
**행**: 570

```diff
- <input type="file" id="img-input-camera" accept="image/*" style="display:none">
+ <input type="file" id="img-input-camera" accept="image/*" capture="environment" style="display:none">
```

### Step 2: 설계 문서 업데이트 (재발 방지)

다음 파일들을 업데이트하여 Generator/Evaluator가 자동으로 이 속성을 보존하도록 함:

1. **SPEC.md**: "화면 3: 홈" 섹션에서 `openCamera()` 함수 설명 뒤에 [필수] HTML 명세 블록 추가
2. **agents/generator.md**: "구조 설계" 섹션 뒤에 "[필수] 카메라/갤러리 이미지 입력 구현" 섹션 추가
3. **agents/evaluation_criteria.md**: "기능성" 체크리스트에 "[필수] 카메라 기능" 항목 추가
4. **agents/evaluator.md**: Stage 2 코드 검증에 "카메라 input 속성 검사" 항목 추가

---

## 기술 배경: 왜 `capture="environment"`가 필수인가?

### 웹 표준: `<input type="file" capture>` 속성

MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture

```html
<input type="file" capture="environment">
<!-- 스마트폰의 뒷면(환경) 카메라를 직접 실행 -->

<input type="file" capture="user">
<!-- 스마트폰의 앞면(사용자) 카메라를 직접 실행 -->

<input type="file">
<!-- capture 속성 없음 = 기본 파일 선택기(갤러리) 실행 -->
```

### 브라우저 동작

| 환경 | 동작 |
|-----|------|
| **안드로이드 Chrome** | `capture="environment"` → 기본 카메라 앱 실행, capture 없음 → 갤러리 열기 |
| **iPhone Safari** | `capture="environment"` → 기본 카메라 앱 실행, capture 없음 → 갤러리 열기 |
| **데스크톱 브라우저** | `capture` 속성 무시 → 파일 선택 대화창 열기 (이것이 정상 동작) |

---

## 재발 방지 체크리스트

파이프라인 실행 전후로 다음을 확인:

### 개발 중

- [ ] `output/index.html` line 570: `capture="environment"` 있는가?
- [ ] `openCamera()` 함수가 `#img-input-camera` input을 trigger하는가?
- [ ] 모바일 기기(Android 또는 iOS)에서 카메라 앱이 직접 실행되는가?

### Generator 파이프라인 실행 후

- [ ] **SPEC.md** 업데이트됨 (HTML 명세 블록이 있는가?)
- [ ] **agents/generator.md** 업데이트됨 (카메라 구현 필수 지시가 있는가?)
- [ ] **agents/evaluation_criteria.md** 업데이트됨 (카메라 체크리스트가 있는가?)
- [ ] **agents/evaluator.md** 업데이트됨 (카메라 검사 항목이 있는가?)

### Evaluator QA 리포트 확인

QA_REPORT.md의 "기능성" 섹션에서:

```markdown
✓ [PASS] 카메라 input: <input id="img-input-camera" capture="environment"> 존재 확인
✓ [PASS] 갤러리 input: <input id="img-input-gallery"> capture 속성 없음 확인
```

이 두 항목이 **PASS**로 명시되어야 함.

---

## 재발 예방 전략

### 전략 1: 설계 문서 → 코드 흐름 강화

Generator가 따를 수 있도록 구체적인 HTML 코드 스니펫을 SPEC.md와 generator.md에 명시.  
"주석" 형태가 아닌 **마크다운 코드 블록**으로 제공.

### 전략 2: Evaluator 체크리스트 강화

Evaluator가 놓칠 수 없도록, 코드 검증 단계에서:
- 단순 UI 존재 여부가 아닌 **속성값 검증** 포함
- `capture="environment"` 같은 중요한 속성은 명시적 체크리스트 항목으로 등재

### 전략 3: CHANGELOG vs 설계 문서 연동

버그 수정 후:
1. `docs/CHANGELOG.md`에 기술적 상세 내용 기록
2. 그 내용을 SPEC.md/generator.md에도 반영
3. Evaluator의 체크리스트에 해당 항목 추가

이 3단계를 모두 거쳐야만 수정 완료로 간주.

---

## 예시: 다른 유사 버그 방지

같은 패턴의 버그가 발생할 수 있는 다른 케이스들:

### 이미지 업로드 시 accept 속성

```html
<!-- 오디오만 받는 input이 필요한데 accept 속성이 없으면? -->
<input type="file" id="audio-input" accept="audio/*">
<!-- ✓ 올바름 -->
```

### 모바일 레이아웃 viewport

```html
<!-- 메타 태그가 빠지면 모바일에서 줌이 제대로 안 됨 -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- ✓ 설계 문서에 명시되어야 함 -->
```

### API 키 보안

```javascript
// localStorage 읽기는 설계 문서에 명시되어야 함
const apiKey = localStorage.getItem('gemini_api_key');
```

**모든 이런 "중요한 속성/설정"은 SPEC.md에 명시적으로 기술되어야 Generator/Evaluator가 자동으로 보존할 수 있음.**

---

## 문서 작성자

- **작성일**: 2026-05-18
- **작성자**: Claude Code (Systematic Debugging)
- **버그 분류**: Recurring Regression — Design Document Gap
- **우선순위**: 높음 (사용 불가능한 기능)

---

## 관련 링크

- SPEC.md: 화면 3 - 홈 화면 - openCamera() 함수
- agents/generator.md: [필수] 카메라/갤러리 이미지 입력 구현
- agents/evaluation_criteria.md: 기능성 → [필수] 카메라 기능
- agents/evaluator.md: Stage 2 → [필수] 카메라 input 속성 검사
- CHANGELOG.md: [2026-05-01] 카메라 버튼 → 카메라 앱 직접 실행 수정
