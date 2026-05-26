# MBA AI Agent 중간점검 과제물 자동 생성 스킬

## 스킬 개요

이 스킬은 인천대 MBA "빅데이터와 인공지능" 수업의 **중간점검 과제물**을 자동으로 생성합니다.  
지정 폴더 내의 모든 문서(기획서, 스크린샷 설명, 프롬프트 기록, 코드, 노트 등)를 읽고  
아래 서식에 맞는 **Word 문서(.docx)** 를 생성합니다.  
아키텍처 개요, 기술 스택, 화면 목록은 **이미지(SVG/PNG)**로 자동 생성됩니다.

---

## 사용 방법

1. 과제 관련 파일을 작업 폴더에 저장 (아래 폴더 구조 참고)
2. Claude Cowork에서 이 스킬 파일을 참조하며 요청:
   > "MBA_과제물_생성_SKILL.md를 읽고, 루트의 md 및 모든 문서의 md 파일을 읽어서 중간점검 과제물 Word 문서를 만들어줘"
3. 이미지 + Word 파일이 자동 생성됩니다

---

## 과제물 서식 (생성 기준)

### ① 소개
- 어떤 업무에 AI agent를 적용하려 했고, 왜 이걸 골랐나요?
- 기존 문제/불편함, 에이전트 적용 후 기대효과

### ② 진행 방법 — 어떻게 만들었나 (200~400자 + 이미지)
- 어떤 스킬을 만들었고, 어떤 프롬프트로 시켰나요?
- 스킬 설명
- 사용한 실제 프롬프트 — `PRD.md` 파일 내용 기반으로 작성 (제품 한줄 설명, 문제, 목표, FR 테이블)
- 수정 과정 — 문서 전체의 `CHANGELOG.md` 파일 내용 기반으로 간단히 작성
  - 형식: `날짜/버전 | 변경 내용 | 의미`
  - 3~5개 핵심 변경만 요약

### ③ 결과 및 배운점
- 이 케이스를 진행하며 배운점과 꿀팁
- 아직 막힌 것 — 도움 필요한 부분
- 실패 서술 (제일 값진 내용)
- 앞으로의 적용 계획
- **Before/After 섹션 없음** (삭제됨)

### ④ 첨부 — 화면 이미지
- 보고서 본문 마지막에 **첨부** 형식으로 화면 이미지를 삽입
- 각 장(page)당 이미지 **2개씩** 배치
- 이미지는 `mba_report/Input_image/` 폴더를 참고하여 선택
- 화면 구성에 맞게 관련 이미지끼리 묶어 배치
  - 예: 메인/로비, 문제/정답, 최종결과/대시보드, 관리자/자동화 화면
- 각 이미지 아래에는 짧은 캡션을 작성
- 화면 이미지가 많을 경우, 본문 설명보다 첨부 이미지의 가독성을 우선

---

## 이미지 생성 지침

### ⚠️ 공통 품질 주의사항 (한글 깨짐·텍스트 겹침·고화질)

#### 한글 깨짐 방지 (필수)
```python
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import platform

# OS별 한글 폰트 자동 설정
if platform.system() == 'Windows':
    plt.rcParams['font.family'] = 'Malgun Gothic'
elif platform.system() == 'Darwin':  # macOS
    plt.rcParams['font.family'] = 'AppleGothic'
else:  # Linux
    # NanumGothic 설치 필요: apt-get install fonts-nanum
    plt.rcParams['font.family'] = 'NanumGothic'

plt.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지
```
- SVG 생성 시: `font-family` 속성에 `'Malgun Gothic', 'AppleGothic', sans-serif` 명시
- 폰트 설정 후 반드시 `plt.close('all')` → 새 figure 생성 순서 지킬 것

#### 텍스트 겹침 방지
- `figsize` 최소 **(14, 9)** 이상으로 설정 (내용이 많을수록 더 크게)
- 박스 내 텍스트는 `textwrap.fill(text, width=20)` 등으로 **자동 줄바꿈** 처리
- 폰트 크기: 제목 14pt, 항목명 11pt, 설명 9pt 이하로 계층 구분
- 박스 배치 후 겹침 여부는 좌표 계산으로 사전 검증 (최소 0.05 단위 여백 확보)
- `plt.tight_layout(pad=2.0)` 또는 `bbox_inches='tight'` 반드시 적용
- 항목 수가 많을 경우 행 수를 동적으로 늘려 행간 간격(≥ 0.12) 유지

#### 고화질 저장
```python
plt.savefig('output.png', dpi=200, bbox_inches='tight',
            facecolor='white', edgecolor='none')
```
- 최소 해상도 목표: **1600 × 1000 px** 이상
- `facecolor='white'` 명시로 배경 투명 방지
- Word 삽입 시 흐릿하지 않도록 dpi **200 이상** 유지

---

### 🏗️ 전체 아키텍처 개요 이미지
- Python matplotlib 또는 SVG로 생성
- 포함 요소: 사용자 입력 → 에이전트 코어 → 스킬/툴 레이어 → 출력
- 화살표로 데이터 흐름 표시
- 색상: 파란 계열 (전문적 느낌)
- **figsize=(14, 8)** 이상, 노드 박스 간격 0.15 이상 확보
- 노드 라벨이 긴 경우 `\n`으로 줄바꿈하여 박스 밖으로 넘치지 않도록 처리
- 저장: `architecture_diagram.png` (dpi=200)

### 🛠️ 기술 스택 이미지
- 레이어드 다이어그램 (상위: UI/인터페이스, 중간: 에이전트/LLM, 하위: 데이터/툴)
- 각 기술을 박스로 표현, 아이콘 또는 텍스트
- **figsize=(14, 9)** 이상, 각 레이어 높이를 항목 수에 비례해 동적 조정
- 같은 레이어 내 박스가 가로로 겹치지 않도록 균등 분할 배치
- 기술명이 긴 경우 폰트 크기를 9pt로 줄이거나 줄바꿈 처리
- 저장: `tech_stack_diagram.png` (dpi=200)

### 📱 화면 목록 이미지
- 카드 그리드 형태 (2열 또는 3열)
- 각 화면/기능을 카드로 표현 (번호 + 화면명 + 간단 설명)
- **figsize=(14, 항목수×1.8)** 으로 카드 수에 따라 높이 동적 결정
- 카드 내 설명 텍스트는 `textwrap.fill(desc, width=22)` 으로 줄바꿈
- 카드 간 수직·수평 여백 최소 0.05 unit 확보
- 저장: `screen_list_diagram.png` (dpi=200)

### 🖼️ 보고서 첨부 이미지
- 보고서 마지막에 `첨부. 화면 구성 이미지` 섹션을 추가
- `mba_report/Input_image/` 폴더의 실제 화면 이미지를 사용
- 한 페이지에 이미지 2개를 넣는 것을 기본 규칙으로 함
- 이미지 크기는 Word 기준 가로 약 5.8~6.2 inch 이내로 조정
- 이미지 순서는 화면 흐름에 맞게 정렬
  1. 메인 화면 / 로비 화면
  2. 문제 화면 / 정답 화면
  3. 최종 결과 / 결과 대시보드
  4. 관리자 또는 문제 생성 자동화 화면 / 상세 순위 화면
- 이미지 파일명에서 화면명을 추정하되, 실제 내용과 맞지 않으면 화면 내용 기준으로 캡션 작성

---

## 실행 지침 (Claude에게)

아래 단계를 순서대로 수행하세요:

### STEP 1: 파일 읽기
```
지정 폴더 내 모든 .md, .txt, .pdf, .docx, .pptx 파일을 읽고
각 파일의 내용을 과제 서식의 어느 섹션에 해당하는지 분류합니다.
파일이 없는 섹션은 "추후 보완 필요"로 표시합니다.
```

### STEP 2: 이미지 생성
```
읽은 내용을 바탕으로 Python으로 3개의 다이어그램을 생성합니다:
1. architecture_diagram.png - 전체 아키텍처
2. tech_stack_diagram.png - 기술 스택
3. screen_list_diagram.png - 화면/기능 목록
작업 폴더에 저장합니다.
```

### STEP 3: Word 문서 생성
```
docx 스킬 (SKILL.md)을 참고하여 python-docx로 Word 문서를 생성합니다.
파일명: MBA_중간점검_과제물_[이름].docx
문서 마지막에는 mba_report/Input_image/의 화면 이미지를 첨부 섹션으로 추가합니다.
첨부 이미지는 각 장당 2개씩 들어가도록 페이지 나눔을 조정합니다.
```

### STEP 4: 품질 검토
```
생성된 Word 문서를 열어 서식 누락 여부를 확인합니다.
각 섹션이 서식 기준을 충족하는지 체크합니다.
```

---

## Word 문서 생성 코드 템플릿

```python
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import datetime

def create_mba_assignment(data: dict, output_path: str):
    """
    data = {
        'student_name': '이름',
        'agent_name': '에이전트명',
        'business_problem': '해결하려는 업무 문제',
        'reason_for_choice': '선택 이유',
        'skills_created': ['스킬1', '스킬2', ...],
        'prompts_used': [{'purpose': '목적', 'prompt': '프롬프트 내용'}, ...],
        'revision_history': '수정 과정 설명',
        'before': '도입 전 상황',
        'after': '도입 후 결과',
        'lessons_learned': '배운점 및 꿀팁',
        'blockers': '막힌 부분',
        'failure_stories': '실패 경험',
        'future_plans': '앞으로의 계획',
    }
    """
    doc = Document()
    
    # 제목
    title = doc.add_heading('AI Agent 중간점검 과제물', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 제출 정보
    doc.add_paragraph(f"학생: {data.get('student_name', '')}")
    doc.add_paragraph(f"날짜: {datetime.date.today().strftime('%Y년 %m월 %d일')}")
    doc.add_paragraph(f"과목: 빅데이터와 인공지능 (인천대 MBA)")
    doc.add_page_break()
    
    # ① 소개
    doc.add_heading('① 소개', level=1)
    doc.add_heading('적용 업무 및 선택 이유', level=2)
    doc.add_paragraph(data.get('business_problem', ''))
    doc.add_paragraph(data.get('reason_for_choice', ''))
    
    # 아키텍처 이미지 삽입
    doc.add_heading('전체 아키텍처 개요', level=2)
    try:
        doc.add_picture('architecture_diagram.png', width=Inches(6))
    except:
        doc.add_paragraph('[아키텍처 다이어그램 이미지]')
    
    # ② 진행 방법
    doc.add_heading('② 진행 방법', level=1)
    
    doc.add_heading('만든 스킬 목록', level=2)
    for skill in data.get('skills_created', []):
        doc.add_paragraph(f'• {skill}', style='List Bullet')
    
    # 기술 스택 이미지
    doc.add_heading('기술 스택', level=2)
    try:
        doc.add_picture('tech_stack_diagram.png', width=Inches(6))
    except:
        doc.add_paragraph('[기술 스택 다이어그램 이미지]')
    
    doc.add_heading('사용한 프롬프트', level=2)
    for item in data.get('prompts_used', []):
        doc.add_paragraph(f"▶ {item.get('purpose', '')}", style='Heading 3')
        doc.add_paragraph(item.get('prompt', ''))
    
    doc.add_heading('수정 과정', level=2)
    doc.add_paragraph(data.get('revision_history', ''))
    
    # 화면 목록 이미지
    doc.add_heading('화면 목록', level=2)
    try:
        doc.add_picture('screen_list_diagram.png', width=Inches(6))
    except:
        doc.add_paragraph('[화면 목록 이미지]')
    
    # ③ 결과 및 배운점
    doc.add_heading('③ 결과 및 배운점', level=1)
    
    doc.add_heading('Before / After', level=2)
    table = doc.add_table(rows=2, cols=2)
    table.style = 'Table Grid'
    table.cell(0, 0).text = 'Before (도입 전)'
    table.cell(0, 1).text = 'After (도입 후)'
    table.cell(1, 0).text = data.get('before', '')
    table.cell(1, 1).text = data.get('after', '')
    
    doc.add_heading('배운점 및 꿀팁', level=2)
    doc.add_paragraph(data.get('lessons_learned', ''))
    
    doc.add_heading('아직 막힌 것 (도움 필요)', level=2)
    doc.add_paragraph(data.get('blockers', ''))
    
    doc.add_heading('실패 경험 (제일 값진 내용)', level=2)
    doc.add_paragraph(data.get('failure_stories', ''))
    
    doc.add_heading('앞으로의 적용 계획', level=2)
    doc.add_paragraph(data.get('future_plans', ''))

    # ④ 첨부 — 화면 이미지
    doc.add_page_break()
    doc.add_heading('첨부. 화면 구성 이미지', level=1)
    attachment_images = data.get('attachment_images', [])
    for idx, image in enumerate(attachment_images):
        if idx > 0 and idx % 2 == 0:
            doc.add_page_break()

        caption = image.get('caption', '')
        path = image.get('path', '')

        if caption:
            doc.add_paragraph(caption, style='Heading 2')

        try:
            doc.add_picture(path, width=Inches(5.9))
        except:
            doc.add_paragraph(f'[첨부 이미지: {path}]')
    
    doc.save(output_path)
    print(f"✅ 과제물 생성 완료: {output_path}")

# 실행 예시:
# create_mba_assignment(data, 'MBA_중간점검_과제물_홍길동.docx')
```

---

## 체크리스트

과제물 제출 전 확인사항:
- [ ] ① 소개 — 업무 선택 이유가 구체적으로 작성되었는가?
- [ ] ② 진행 방법 — 스킬 설명과 프롬프트 원문이 포함되었는가?
- [ ] ② 진행 방법 — 200~400자 분량을 충족하는가?
- [ ] ② 진행 방법 — 2-3 사용한 프롬프트가 PRD.md 기반으로 작성되었는가?
- [ ] ② 진행 방법 — 2-4 수정 과정이 CHANGELOG.md 기반의 간단한 변경 이력으로 작성되었는가?
- [ ] ③ 결과 — 실패 경험이 포함되었는가? (실패 서술이 제일 값짐)
- [ ] 아키텍처 개요 이미지가 포함되었는가?
- [ ] 기술 스택 이미지가 포함되었는가?
- [ ] 화면 목록 이미지가 포함되었는가?
- [ ] 이미지 내 한글이 깨지지 않고 정상 출력되었는가?
- [ ] 이미지 내 텍스트 겹침 문제가 없는가? (박스·라벨·설명이 서로 겹치지 않는가?)
- [ ] 보고서 마지막에 `첨부. 화면 구성 이미지` 섹션이 있는가?
- [ ] `mba_report/Input_image/`의 실제 화면 이미지를 참고했는가?
- [ ] 첨부 이미지는 각 장당 2개씩 배치되었는가?
- [ ] 이미지 순서와 캡션이 화면 구성 흐름에 맞는가?
- [ ] 민감정보(API 키, 개인정보 등)가 제거되었는가?

---

*생성일: 2026-04-26 | 인천대 MBA "빅데이터와 인공지능" 중간점검 과제물 자동 생성 스킬*
