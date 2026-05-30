# 칼로리 트래커(Calo AI) 생성 하네스

> 사용자 요청 → 자동 설계 → 자동 구현 → 자동 검수 → PASS/FAIL 판정

---

## 대상 런타임

**target runtime**: Claude Code

---

## ⚠️ 정체성

### 허용 (✅)

- 칼로리 트래커 웹 앱 자동 생성 및 개선
- PRD/SPEC 기반 3-Agent 하네스 실행 (Planner → Generator → Evaluator)
- QA 반복 및 피드백 반영 (최대 3회)
- design.md 기반 Warm Visual 디자인 시스템 적용

### 금지 (❌)

- 칼로리 트래커 외 다른 앱 생성
- docs/ 외 경로에 기획 문서 생성
- design.md 미참조 구현
- Generator와 Evaluator를 동일한 서브에이전트로 호출

---

## 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **Design.md 우선 준수** | 구현 전 design.md 필수 참고 (색, 그림자, 라운드, 모션, 컴포넌트 명세) |
| **에이전트 분리** | Generator ≠ Evaluator (다른 서브에이전트로 호출) — "만드는 AI와 평가하는 AI" 분리 |
| **파일 확인** | 각 단계 완료 후 산출물 존재 확인 후 다음 단계 진행 |
| **반복 제한** | FAIL/조건부 시 최대 3회 반복 (3회 후 현재 상태로 완료 + 이슈 보고) |
| **agents/ 참고** | 각 에이전트 상세 지시사항은 agents/ 폴더 파일 참고 |

---

## 폴더 구조

```
Calorie Calculator(Calo AI)/
├── CLAUDE.md              # 이 파일 — 하네스 마스터 가이드
├── CHANGELOG.md           # 기능 구현 이력 
├── design.md              # 디자인 시스템 
├── README.md              # 프로젝트 설명서
├── package.json           # npm 의존성 정의 
├── vercel.json            # Vercel 배포 설정 
│ 
├── agents/                # 에이전트 지시사항
│   ├── planner.md         # Planner 에이전트 (설계 전문)
│   ├── generator.md       # Generator 에이전트 (구현 전문)
│   ├── evaluator.md       # Evaluator 에이전트 (검증 전문)
│   └── evaluation_criteria.md  # QA 평가 기준
│
├── api/                   # API 백엔드 및 유틸리티
├── archive/               # 아카이브 및 참고 문서
├── server/                # 로컬 개발 서버
│
├── docs/                  # 기획·설계·QA 문서
│   ├── PRD.md             # 제품 요구사항 정의
│   ├── SPEC.md            # 기술 명세서
│   ├── USER_REQUEST.md    # 사용자 요청 원문
│   ├── SELF_CHECK.md      # Generator 자체 검점
│   └── QA_REPORT.md       # Evaluator QA 보고서
│
└── output/                # 최종 산출물
    └── index.html         # 완성된 웹 앱
```

### 배포 필수 파일

| 파일 | 위치 | 역할 | 배포 필수 |
|------|------|------|----------|
| `package.json` | 루트 | npm 의존성 정의 | ⭐ |
| `package-lock.json` | 루트 | npm 패키지 버전 고정 | ⭐ |
| `vercel.json` | `config/` | Vercel 배포 설정 | ⭐ |
| `output/index.html` | `output/` | 최종 웹 앱 파일 | ⭐ |

---

## 워크플로우 (12단계 실행 흐름)

### **① 사용자 요청**
- **입력**: 칼로리 계산 앱 구현 요청
- **산출**: 
- **설명**: 칼로리 계산 앱 구현

### **② docs/USER_REQUEST.md 작성**
- **역할**: 사용자 요청 원문을 파일로 저장
- **산출**: `docs/USER_REQUEST.md`
- **설명**: 사용자 요청 원문을 파일로 저장

### **③ PRD Builder Skill 실행** 
- **역할**: 요구사항 분석 및 정제
- **산출**: PRD 초안
- **설명**: 요구사항 분석 및 정제

### **④ docs/PRD.md 생성/확정**
- **역할**: 요구사항 기초 문서 확정
- **산출**: `docs/PRD.md`
- **설명**: 요구사항 기초 문서 확정

---

### **⑤ Planner Agent 실행** ⭐ (agents/planner.md 참고)
- **입력**: `docs/PRD.md` + `design.md` 
- **역할**: PRD와 디자인 시스템을 기반으로 상세 설계 및 명세 작성
- **산출**: 설계서, 명세서 작성 (디자인 시스템 반영)
- **설명**: PRD.md를 기반으로 설계 및 명세 작성

### **⑥ docs/SPEC.md 생성**
- **역할**: 기술 명세 문서 생성
- **산출**: `docs/SPEC.md`
- **설명**: 기술 명세 문서 생성

---

### **⑦ Generator Agent 실행** ⭐ (agents/generator.md 참고)
- **입력**: `docs/SPEC.md` + `design.md` (Warm Visual 디자인 시스템 반드시 적용)
- **역할**: 설계서와 디자인 시스템을 철저히 따르며 코드 구현
- **산출**: 웹 앱 코드 (design.md의 모든 스타일, 컴포넌트, 모션 적용)
- **설명**: SPEC.md를 기반으로 구현 진행

### **⑧ output/index.html 생성**
- **역할**: 완성된 웹 앱 코드 생성
- **산출**: `output/index.html`
- **설명**: 신규물 생성

### **⑨ docs/SELF_CHECK.md 생성**
- **역할**: Generator 자체 검점 결과 기록
- **산출**: `docs/SELF_CHECK.md`
- **설명**: Generator 자체 검점 결과 기록

---

### **⑩ Evaluator Agent 실행** ⭐ (agents/evaluator.md 참고)
- **입력**: `docs/PRD.md`, `docs/SPEC.md`, `design.md`, `output/index.html`
- **역할**: PRD vs SPEC vs HTML 일관성 검증 + design.md 디자인 시스템 준수 확인
- **산출**: 평가 결과 (기능성, 디자인 일관성, 기술품질, 완성도)
- **설명**: PRD, SPEC, design.md, 신규물 종합 검증

### **⑪ docs/QA_REPORT.md 생성**
- **역할**: 평가 결과 및 개선사항 보고서 작성
- **산출**: `docs/QA_REPORT.md`
- **설명**: 평가 결과 및 개선사항 보고서 작성

---

### **⑫ PASS 또는 FAIL 판정**
- **역할**: 최종 승인 여부 결정
- **결과**:
  - ✅ **PASS**: 프로젝트 완료
  - ❌ **FAIL/조건부**: ⑦ Generator로 돌아가 피드백 반영 (최대 3회)
- **설명**: 최종 승인 여부 결정

---

## 반복 루프

```
Evaluator 판정
  ├─ ✅ PASS → 프로젝트 완료
  └─ ❌ FAIL/조건부 → Generator로 피드백 반영
                      (⑦ → ⑧ → ⑨ → ⑩ → ⑪ → ⑫ 반복)
                      최대 3회까지 반복 가능
```

---

## 자연어 트리거

| 발화 | 트리거 대상 | Scale Mode |
|------|-----------|-----------|
| "만들어줘", "구현해줘", "생성해줘" | 전체 하네스 (①~⑫) | Full |
| "수정해줘", "개선해줘" | Generator 반복 (⑦~⑫) | Standard |
| "다시 만들어줘", "리셋" | 전체 하네스 재실행 | Full |

---

## Scale Modes

| 모드 | 설명 | 사용 시점 |
|------|------|----------|
| **Lite** | 단순 수정 (HTML 일부 수정, 텍스트 변경) | 특정 버그 수정, 스타일 미조정 |
| **Standard** | Evaluator 1회 포함 단일 반복 | 기능 추가, 소규모 개선 |
| **Full** | Planner→Generator→Evaluator 전체 하네스 | 앱 신규 생성, 대규모 재설계 |

---

## 트리거 경계

### Should-Trigger (하네스 실행)

- "칼로리 계산 앱 만들어줘"
- "기능 추가해줘"
- "UI 개선해줘"
- "버그 수정해줘"
- "처음부터 다시 만들어줘"

### NOT-Trigger (다른 도구 사용)

- "CLAUDE.md 읽어줘" → 파일 읽기만 수행
- "현재 상태 보고해줘" → 상태 확인만
- "문서 검토해줘" → 단순 검토 (하네스 미실행)

---

## 도메인 프레임워크

| 요소 | 설명 |
|------|------|
| **TDEE 계산** | Harris-Benedict 공식 (BMR × 활동계수) |
| **인증** | Supabase Auth (이메일/비밀번호, 비회원) |
| **데이터 저장** | PostgreSQL (Supabase) + RLS 적용 |
| **AI 분석** | Google Gemini 2.5 Flash/Pro (음식 칼로리) |
| **디자인 시스템** | Warm Visual (design.md 참고) |

---

## 산출물 형식

### 완료 보고

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

---

## 품질 체크리스트 (하네스 실행 전 확인)

- [ ] design.md 존재 확인
- [ ] agents/ 폴더의 4개 파일 존재 확인
- [ ] Generator와 Evaluator를 다른 서브에이전트로 호출할 준비
- [ ] QA 반복 제한 3회 인지
- [ ] CHANGELOG.md 업데이트 준비

---


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
- 파일이 루트에 없으면 아래 헤더로 신규 생성:
  ```markdown

  ```
