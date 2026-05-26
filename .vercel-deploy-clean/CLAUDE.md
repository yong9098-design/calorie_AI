# 칼로리 트래커 하네스 오케스트레이터

이 프로젝트는 3-Agent 하네스 구조로 칼로리 트래커 웹 앱을 자동 생성합니다.
Planner → Generator → Evaluator 파이프라인으로 동작합니다.

---

## 실행 흐름

사용자가 개발 요청을 주면, 아래 순서대로 서브에이전트를 호출합니다.

```
[사용자 요청]
       ↓
  ① Planner 서브에이전트
     → PRD.md 읽기 → SPEC.md 생성
       ↓
  ② Generator 서브에이전트
     → SPEC.md 기반으로 output/index.html 생성
     → SELF_CHECK.md 작성
       ↓
  ③ Evaluator 서브에이전트
     → output/index.html 검수 → QA_REPORT.md 작성
       ↓
  ④ 판정 확인
     → 합격: 완료 보고
     → 불합격/조건부: ②로 돌아가 피드백 반영 (최대 3회)
```

---

## 서브에이전트 호출 방법

각 단계에서 Task 도구를 사용하여 서브에이전트를 호출합니다.
**중요**: Generator와 Evaluator는 반드시 다른 서브에이전트로 호출하세요.
이것이 "만드는 AI와 평가하는 AI를 분리"하는 핵심입니다.

---

## 단계별 실행 지시

### 단계 1: Planner 호출

서브에이전트에게 아래 내용을 전달합니다:

```
agents/planner.md 파일을 읽고, 그 지시를 따라라.
agents/evaluation_criteria.md 파일도 읽고 참고하라.
docs/PRD.md 파일을 읽어라. 이것이 제품 요구사항이다.

PRD의 MVP 기능을 기반으로 상세 화면 설계서를 작성하라.
결과를 SPEC.md 파일로 저장하라.
```

### 단계 2: Generator 호출

**최초 실행 시**:
```
agents/generator.md 파일을 읽고, 그 지시를 따라라.
agents/evaluation_criteria.md 파일도 읽고 참고하라.
SPEC.md 파일을 읽고, 칼로리 트래커 앱 전체를 한 번에 구현하라.

반드시:
- Supabase JS CDN을 포함하라
- Gemini API를 fetch로 호출하라 (base64 이미지 방식)
- API 키는 localStorage에서 읽어라 (하드코딩 금지)
- 모바일 퍼스트, Bottom Navigation 포함

결과를 output/index.html 파일로 저장하라.
완료 후 SELF_CHECK.md를 작성하라.
```

**피드백 반영 시 (2회차 이상)**:
```
agents/generator.md 파일을 읽고, 그 지시를 따라라.
agents/evaluation_criteria.md 파일도 읽고 참고하라.
SPEC.md 파일을 읽어라.
output/index.html 파일을 읽어라. 이것이 현재 코드다.
QA_REPORT.md 파일을 읽어라. 이것이 QA 피드백이다.

QA 피드백의 "구체적 개선 지시"를 모두 반영하여 output/index.html을 수정하라.
"방향 판단"이 "완전히 다른 접근 시도"이면 앱 구조 자체를 바꿔라.
완료 후 SELF_CHECK.md를 업데이트하라.
```

### 단계 3: Evaluator 호출

```
agents/evaluator.md 파일을 읽고, 그 지시를 따라라.
agents/evaluation_criteria.md 파일을 읽어라. 이것이 채점 기준이다.
SPEC.md 파일을 읽어라. 이것이 설계서다.
output/index.html 파일을 읽어라. 이것이 검수 대상이다.

검수 절차:
1. output/index.html의 코드를 분석하라
2. SPEC.md의 각 기능이 코드로 구현되었는지 확인하라
3. evaluation_criteria.md에 따라 4개 항목을 채점하라
4. 최종 판정(합격/조건부/불합격)을 내려라
5. 불합격 또는 조건부 시, 구체적 개선 지시를 작성하라

결과를 QA_REPORT.md 파일로 저장하라.
```

### 단계 4: 판정 확인

QA_REPORT.md를 읽고 판정을 확인합니다.

- **합격** → 사용자에게 완료 보고. output/index.html 사용 방법 안내.
- **조건부 합격** 또는 **불합격** → 단계 2로 돌아가 피드백 반영.
- 최대 반복 횟수: **3회**. 3회 후에도 미합격이면 현재 상태로 전달하고 이슈 보고.

---

## 완료 보고 형식

```
## 하네스 실행 완료

**결과물**: output/index.html
**Planner 설계 기능 수**: X개
**QA 반복 횟수**: X회
**최종 점수**: 기능성 X/10, UX X/10, 기술품질 X/10, 완성도 X/10 (가중 X.X/10)

**실행 흐름**:
1. Planner: [무슨 화면을 설계했는지 한 줄]
2. Generator R1: [구현 결과 한 줄]
3. Evaluator R1: [판정 결과 + 핵심 피드백 한 줄]
4. Generator R2: [수정 내용 한 줄] (있는 경우)
5. Evaluator R2: [판정 결과] (있는 경우)

**사용 방법**:
1. output/index.html을 브라우저에서 열기
2. [설정] 탭에서 Supabase URL, Supabase Key, Gemini API Key 입력
3. [홈] 탭에서 회원가입 후 음식 사진으로 칼로리 분석 시작

**Supabase 테이블 생성 SQL**:
[meal_logs 테이블 CREATE 문 포함]
```

---

## 주의사항

- 각 서브에이전트 호출 후, 생성된 파일이 존재하는지 확인하세요
- Generator와 Evaluator는 반드시 분리된 서브에이전트로 호출하세요
- output/ 디렉토리가 없으면 Generator가 생성하도록 지시하세요

---

## [필수] CHANGELOG 자동 업데이트 규칙

**모든 기능 구현이 완료될 때마다 반드시 `docs/CHANGELOG.md`를 업데이트하라.**

해당 시점: Evaluator가 "합격" 판정을 내린 직후, 또는 사용자가 구현 완료를 확인한 시점.

### 작성 형식

```markdown
## [YYYY-MM-DD] <기능명 또는 작업 요약>

### 구현 내용
- 구체적으로 추가/변경된 사항 (기능 단위로 기술)

### 핵심 로직
- 주요 알고리즘, API 연동 방식, 아키텍처 결정 사항

### 변경된 파일
- `파일경로` — 변경 이유 한 줄 요약

### QA 결과
- 최종 점수: X.X/10 (반복 횟수: N회)
```

### 작성 원칙
- 전문적이고 기술적인 한국어 톤 사용
- 미래에 코드를 처음 보는 개발자가 흐름을 파악할 수 있는 수준으로 작성
- `docs/` 디렉토리가 없으면 생성 후 작성
- 파일이 없으면 아래 헤더로 신규 생성:
  ```markdown
  # Changelog

  AI 칼로리 트래커 프로젝트 변경 이력
  ```
