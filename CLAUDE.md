# 칼로리 트래커 하네스 오케스트레이터

> 사용자 요청 → 자동 설계 → 자동 구현 → 자동 검수 → PASS/FAIL 판정

---

## 📊 12단계 실행 흐름

### **① 사용자 요청**
- **입력**: 칼로리 계산 앱 구현 요청
- **산출**: 
- **우측 설명**: 칼로리 계산 앱 구현

### **② docs/USER_REQUEST.md 작성**
- **역할**: 사용자 요청 원문을 파일로 저장
- **산출**: `docs/USER_REQUEST.md`
- **우측 설명**: 사용자 요청 원문을 파일로 저장

### **③ PRD Builder Skill 실행** 
- **역할**: 요구사항 분석 및 정제
- **산출**: PRD 초안
- **우측 설명**: 요구사항 분석 및 정제

### **④ docs/PRD.md 생성/확정**
- **역할**: 요구사항 기초 문서 확정
- **산출**: `docs/PRD.md`
- **우측 설명**: 요구사항 기초 문서 확정

---

### **⑤ Planner Agent 실행** ⭐ (agents/planner.md 참고)
- **입력**: `docs/PRD.md` + `design.md` (Warm Visual 디자인 시스템)
- **역할**: PRD와 디자인 시스템을 기반으로 상세 설계 및 명세 작성
- **산출**: 설계서, 명세서 작성 (디자인 시스템 반영)
- **우측 설명**: PRD.md를 기반으로 설계 및 명세 작성

### **⑥ docs/SPEC.md 생성**
- **역할**: 기술 명세 문서 생성
- **산출**: `docs/SPEC.md`
- **우측 설명**: 기술 명세 문서 생성

---

### **⑦ Generator Agent 실행** ⭐ (agents/generator.md 참고)
- **입력**: `docs/SPEC.md` + `design.md` (Warm Visual 디자인 시스템 반드시 적용)
- **역할**: 설계서와 디자인 시스템을 철저히 따르며 코드 구현
- **산출**: 웹 앱 코드 (design.md의 모든 스타일, 컴포넌트, 모션 적용)
- **우측 설명**: SPEC.md를 기반으로 구현 진행

### **⑧ output/index.html 생성**
- **역할**: 완성된 웹 앱 코드 생성
- **산출**: `output/index.html`
- **우측 설명**: 신규물 생성

### **⑨ docs/SELF_CHECK.md 생성**
- **역할**: Generator 자체 검점 결과 기록
- **산출**: `docs/SELF_CHECK.md`
- **우측 설명**: Generator 자체 검점 결과 기록

---

### **⑩ Evaluator Agent 실행** ⭐ (agents/evaluator.md 참고)
- **입력**: `docs/PRD.md`, `docs/SPEC.md`, `design.md`, `output/index.html`
- **역할**: PRD vs SPEC vs HTML 일관성 검증 + design.md 디자인 시스템 준수 확인
- **산출**: 평가 결과 (기능성, 디자인 일관성, 기술품질, 완성도)
- **우측 설명**: PRD, SPEC, design.md, 신규물 종합 검증

### **⑪ docs/QA_REPORT.md 생성**
- **역할**: 평가 결과 및 개선사항 보고서 작성
- **산출**: `docs/QA_REPORT.md`
- **우측 설명**: 평가 결과 및 개선사항 보고서 작성

---

### **⑫ PASS 또는 FAIL 판정**
- **역할**: 최종 승인 여부 결정
- **결과**:
  - ✅ **PASS**: 프로젝트 완료
  - ❌ **FAIL/조건부**: ⑦ Generator로 돌아가 피드백 반영 (최대 3회)
- **우측 설명**: 최종 승인 여부 결정

---

## 🔄 반복 루프

```
Evaluator 판정
  ├─ ✅ PASS → 프로젝트 완료
  └─ ❌ FAIL/조건부 → Generator로 피드백 반영
                      (⑦ → ⑧ → ⑨ → ⑩ → ⑪ → ⑫ 반복)
                      최대 3회까지 반복 가능
```

---

## 📁 핵심 파일 및 에이전트

| 단계 | 파일/도구 | 입력 | 출력 | 역할 |
|------|----------|------|------|------|
| ③ | PRD Builder Skill | USER_REQUEST.md | PRD.md | 요구사항 정의 |
| **⑤** | **Planner Agent** | **PRD.md + design.md** | **SPEC.md** | **화면 설계 (디자인 시스템 반영)** |
| **⑦** | **Generator Agent** | **SPEC.md + design.md** | **index.html** | **코드 구현 (디자인 시스템 철저히 적용)** |
| **⑩** | **Evaluator Agent** | **PRD, SPEC, design.md, HTML** | **QA_REPORT.md** | **품질 검증 (디자인 준수 확인)** |

### design.md의 역할
- **디자인 시스템**: Warm Visual 톤의 색상, 그림자, 라운드, 타이포그래피, 모션
- **컴포넌트 명세**: 모든 UI 요소의 스타일 토큰 및 적용 위치
- **필수 준수**: Planner와 Generator는 design.md를 반드시 참고해야 함

---

## ⚠️ 중요 원칙

1. **Design.md 우선 준수**: 구현 전에 design.md의 모든 내용 반영
   - Planner: PRD + design.md를 함께 읽고 SPEC 작성
   - Generator: SPEC + design.md를 함께 읽고 HTML 구현 (색, 그림자, 라운드, 모션 등 모두 적용)
   - Evaluator: design.md 준수 여부를 명시적으로 검증

2. **Generator와 Evaluator 분리**: 반드시 다른 서브에이전트로 호출
   - = "만드는 AI와 평가하는 AI를 분리"하는 핵심

3. **각 단계 파일 확인**: 다음 단계 실행 전 산출물 존재 확인

4. **반복 횟수 제한**: FAIL/조건부 시 최대 3회까지만 반복
   - 3회 후에도 미합격 → 현재 상태로 완료 + 이슈 보고

5. **에이전트 지시사항**: `agents/` 폴더 파일 + design.md 참고
   - `agents/planner.md` — Planner 에이전트
   - `agents/generator.md` — Generator 에이전트  
   - `agents/evaluator.md` — Evaluator 에이전트
   - `agents/evaluation_criteria.md` — 평가 기준
   - **`design.md` — 디자인 시스템 (필수)**

---

## 💬 완료 보고 형식

```
## 하네스 실행 완료

**결과물**: output/index.html
**최종 점수**: 기능성 X/10, UX X/10, 기술품질 X/10, 완성도 X/10 (가중 평균)
**QA 반복 횟수**: X회

**실행 흐름**:
- Planner: [설계 내용 한 줄]
- Generator R1: [구현 결과 한 줄]
- Evaluator R1: [판정 및 주요 피드백 한 줄]
- [추가 반복 기록]

**사용 방법**:
1. output/index.html을 브라우저에서 열기
2. [설정] 탭에서 API 키 입력 (Supabase, Gemini)
3. 회원가입 후 사용 시작
```

---

## [필수] CHANGELOG 자동 업데이트 규칙

**모든 기능 구현이 완료될 때마다 반드시 `CHANGELOG.md`를 업데이트하라.**

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
- 파일이 루트에 없으면 아래 헤더로 신규 생성
- 파일이 없으면 아래 헤더로 신규 생성:
  ```markdown
  # Changelog

  AI 칼로리 트래커 프로젝트 변경 이력
  ```
