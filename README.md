# Calorie Calculator — AI 기반 식단 기록 앱

> 음식 사진 기반 칼로리 기록 앱 (AI Agent 하네스 자동 생성)

## 개요

MBA 과제물 #1: 칼로리 계산기

이번 과제에서 AI Agent를 적용한 업무는 **음식 사진 기반 칼로리 기록 앱 개발**이다. 

다이어트나 건강 관리를 시작한 사용자는 식단 기록이 중요하다는 것을 알지만, 실제로는 음식명을 검색하고 양을 추정해 매번 입력하는 과정이 번거로워 쉽게 중단한다. 그래서 사용자가 사진을 찍으면 **Gemini가 음식명과 칼로리, 단백질, 탄수화물, 지방을 추정**하고, 사용자는 결과를 한 화면에서 수정한 뒤 저장하는 흐름을 구현했다.

개인적으로 진행 중인 다이어트와 건강 관리 습관을 개선하기 위해 선택한 과제이며, 업무 자동화에서 배운 AI Agent 접근법을 개인 생활의 문제 해결에 적용했다.

---

## 🚀 배포 가이드

### 필수 파일 구조

배포(GitHub Push & Vercel Deploy) 시 다음 파일 구조가 **반드시 유지**되어야 합니다.

```
root/
├── package.json              ⭐ npm 의존성 정의 (필수)
├── package-lock.json        ⭐ npm 버전 고정 (필수)
├── config/
│   └── vercel.json          ⭐ Vercel 배포 설정 (필수)
└── output/
    └── index.html           ⭐ 최종 웹 앱 (필수)
```

### GitHub 푸시

```bash
git add .
git commit -m "기능 설명"
git push origin main
```

**주의:** `package.json`, `package-lock.json`, `config/vercel.json`, `output/index.html`이 모두 포함되어야 합니다.

### Vercel 배포

Vercel은 저장소의 `config/vercel.json` 설정을 자동으로 읽고 배포합니다.

```bash
# Vercel CLI로 배포 (선택)
vercel --prod
```

또는 GitHub 연동으로 자동 배포 설정

---

## 📁 폴더별 역할

| 폴더 | 역할 | 배포 포함 |
|------|------|----------|
| `agents/` | AI 에이전트 지시사항 | ✓ |
| `api/` | 백엔드 API 유틸리티 | ✓ |
| `config/` | **배포 설정 (vercel.json)** | ✓ |
| `docs/` | 기획·설계·QA 문서 | ✗ |
| `server/` | 로컬 개발 서버 | ✗ |
| `archive/` | 참고 자료 | ✗ |
| `output/` | **최종 웹 앱 (index.html)** | ✓ |

---

## 🛠️ 로컬 개발

### 개발 서버 실행

```bash
# Windows
node server/dev-server.js

# 또는 배치 파일 사용
start-local-server.bat
```

### 로컬 테스트

```bash
node server/local-server.js
```

---

## 📋 AI 하네스 실행

전체 하네스 실행 및 QA 프로세스는 **CLAUDE.md** 참고
