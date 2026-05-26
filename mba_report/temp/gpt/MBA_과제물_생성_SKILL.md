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
   > "MBA_과제물_생성_SKILL.md를 읽고, [폴더명]의 모든 문서를 읽어서 중간점검 과제물 Word 문서를 만들어줘"
3. 이미지 + Word 파일이 자동 생성됩니다

---

## 과제물 서식 (생성 기준)

### ① 소개
- 어떤 업무에 AI agent를 적용하려 했고, 왜 이걸 골랐나요?
- 기존 문제/불편함, 에이전트 적용 후 기대효과

### ② 진행 방법 — 어떻게 만들었나 (200~400자 + 이미지)
- 어떤 스킬을 만들었고, 어떤 프롬프트로 시켰나요?
- 스킬 설명
- 사용한 프롬프트와 내용 (민감정보 제외)
- 중간에 수정하는 과정이 여러 번 있었다면 해당 과정 공유

### ③ 결과 및 배운점 — Before / After
- 이 케이스를 진행하며 배운점과 꿀팁
- 아직 막힌 것 — 도움 필요한 부분
- 실패 서술 (제일 값진 내용)
- 앞으로의 적용 계획

---

## 이미지 생성 지침

### 🏗️ 전체 아키텍처 개요 이미지
- Python matplotlib 또는 SVG로 생성
- 포함 요소: 사용자 입력 → 에이전트 코어 → 스킬/툴 레이어 → 출력
- 화살표로 데이터 흐름 표시
- 색상: 파란 계열 (전문적 느낌)
- 저장: `architecture_diagram.png`

### 🛠️ 기술 스택 이미지
- 레이어드 다이어그램 (상위: UI/인터페이스, 중간: 에이전트/LLM, 하위: 데이터/툴)
- 각 기술을 박스로 표현, 아이콘 또는 텍스트
- 저장: `tech_stack_diagram.png`

### 📱 화면 목록 이미지
- 카드 그리드 형태 (2열 또는 3열)
- 각 화면/기능을 카드로 표현 (번호 + 화면명 + 간단 설명)
- 저장: `screen_list_diagram.png`

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
- [ ] ② 진행 방법 — 수정 과정이 기록되었는가?
- [ ] ③ 결과 — Before/After가 구체적 수치 또는 사례로 작성되었는가?
- [ ] ③ 결과 — 실패 경험이 포함되었는가? (실패 서술이 제일 값짐)
- [ ] 아키텍처 개요 이미지가 포함되었는가?
- [ ] 기술 스택 이미지가 포함되었는가?
- [ ] 화면 목록 이미지가 포함되었는가?
- [ ] 민감정보(API 키, 개인정보 등)가 제거되었는가?

---

*생성일: 2026-04-26 | 인천대 MBA "빅데이터와 인공지능" 중간점검 과제물 자동 생성 스킬*
