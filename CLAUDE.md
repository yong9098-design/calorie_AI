# 칼로리 트래커(Calo AI) 생성 하네스

> 사용자 요청 → 자동 설계 → 자동 구현 → 자동 검수 → PASS/FAIL 판정

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
| **에이전트 분리** | Generator ≠ Evaluator (다른 서브에이전트로 호출) |
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

---

## 워크플로우 (12단계)

| 단계 | 역할 | 입력 | 산출 |
|------|------|------|------|
| ① 사용자 요청 | 구현 요청 접수 | 사용자 발화 | — |
| ② USER_REQUEST.md | 요청 원문 저장 | 사용자 발화 | `docs/USER_REQUEST.md` |
| ③ PRD Builder Skill | 요구사항 분석 | USER_REQUEST.md | PRD 초안 |
| ④ PRD.md 확정 | 요구사항 문서 확정 | PRD 초안 | `docs/PRD.md` |
| ⑤ **Planner** ⭐ | 설계 및 명세 작성 | PRD.md + design.md | 설계서 |
| ⑥ SPEC.md 생성 | 기술 명세 문서화 | Planner 결과 | `docs/SPEC.md` |
| ⑦ **Generator** ⭐ | 코드 구현 | SPEC.md + design.md | 웹 앱 코드 |
| ⑧ index.html 생성 | 웹 앱 파일 저장 | Generator 결과 | `output/index.html` |
| ⑨ SELF_CHECK.md | Generator 자체 검점 | index.html | `docs/SELF_CHECK.md` |
| ⑩ **Evaluator** ⭐ | PRD·SPEC·HTML 검증 | PRD + SPEC + design.md + HTML | 평가 결과 |
| ⑪ QA_REPORT.md | 평가 보고서 작성 | Evaluator 결과 | `docs/QA_REPORT.md` |
| ⑫ PASS/FAIL 판정 | 최종 승인 결정 | QA_REPORT.md | ✅ 완료 or ❌ ⑦로 반복 |

> ❌ FAIL 시: ⑦ → ⑧ → ⑨ → ⑩ → ⑪ → ⑫ 반복 (최대 3회)

---

## 자연어 트리거

| 발화 | 트리거 대상 | Scale Mode |
|------|-----------|-----------|
| "만들어줘", "구현해줘", "생성해줘" | 전체 하네스 (①~⑫) | Full |
| "수정해줘", "개선해줘" | Generator 반복 (⑦~⑫) | Standard |
| "다시 만들어줘", "리셋" | 전체 하네스 재실행 | Full |

## Scale Modes

| 모드 | 설명 | 사용 시점 |
|------|------|----------|
| **Lite** | 단순 수정 (HTML 일부 수정, 텍스트 변경) | 버그 수정, 스타일 미조정 |
| **Standard** | Evaluator 1회 포함 단일 반복 | 기능 추가, 소규모 개선 |
| **Full** | Planner→Generator→Evaluator 전체 하네스 | 앱 신규 생성, 대규모 재설계 |

---

## 구현 화면 (6개)

| 화면 | 설명 |
|------|------|
| **온보딩** | 4단계 (성별 → 신체정보 → 활동레벨 → TDEE 결과), TDEE 수동 편집 가능 |
| **인증** | 이메일/비밀번호 로그인·회원가입 탭, 비회원 게스트 모드 |
| **홈** | 오늘 칼로리 링차트, 식사 목록, FAB(카메라/갤러리 업로드) |
| **기록** | 날짜 네비게이션, 과거 날짜 식사 추가·편집·삭제 |
| **통계** | 기간별 칼로리 차트, 식관리 AI 분석 (영양소 평균 + Gemini 평가) |
| **설정** | Supabase·Gemini API 키 입력, 목표 칼로리·영양소, 모델 선택, 프로필 재설정 |

---

## 도메인 프레임워크

| 요소 | 설명 |
|------|------|
| **TDEE 계산** | Harris-Benedict 공식 (BMR × 활동계수), 수동 편집 지원 |
| **인증** | Supabase Auth (이메일/비밀번호, 비회원 게스트) |
| **데이터 저장** | PostgreSQL (Supabase) + RLS 적용 |
| **AI 분석** | Google Gemini 2.5 Flash/Pro — 음식 이미지 분석 + 식관리 평가 |
| **식품DB 검색** | 식품의약품안전처 오픈API (`/api/food-search`) + 내장 목록 폴백 |
| **InBody 연동** | InBody API — 체성분 실측값(근육량·체지방률) 기반 TDEE 정밀화, 체성분 추이 차트 |
| **API 서버** | Vercel Edge Runtime 서버리스 함수 (`api/` 폴더) |
| **PWA** | manifest.webmanifest + service worker + 아이콘 (홈화면 설치 지원) |
| **디자인 시스템** | Warm Visual (design.md 참고) |

---

## 완료 보고 형식

```
## 하네스 실행 완료

**결과물**: output/index.html
**최종 점수**: 기능성 X/10, UX X/10, 기술품질 X/10, 완성도 X/10 (가중 평균)
**QA 반복 횟수**: X회

**실행 흐름**:
- Planner: [설계 내용 한 줄]
- Generator R1: [구현 결과 한 줄]
- Evaluator R1: [판정 및 주요 피드백 한 줄]

**사용 방법**:
1. output/index.html을 브라우저에서 열기
2. [설정] 탭에서 API 키 입력 (Supabase, Gemini)
3. 회원가입 후 사용 시작
```

## 품질 체크리스트

- [ ] design.md 존재 확인
- [ ] agents/ 폴더의 4개 파일 존재 확인
- [ ] Generator와 Evaluator를 다른 서브에이전트로 호출할 준비
- [ ] QA 반복 제한 3회 인지
- [ ] CHANGELOG.md 업데이트 준비
