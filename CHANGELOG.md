# Changelog

AI 칼로리 트래커 프로젝트 변경 이력

---

## [2026-05-27] Warm Visual 디자인 시스템 적용 및 로고 브랜드 통일

### 구현 내용

- **앱 브랜드명 통일**
  - 앱 이름 및 로고: `Cal AI` → `CALO AI`로 변경 (전체 UI에서 일관 적용)
  - 로고 시스템 전환: 텍스트 기반 로고에서 이미지 기반 로고로 개선
  - 온보딩·인증·비회원 모달 등 3개 주요 진입점에서 통일된 `CALO AI` 레터마크 노출

- **온보딩 화면 디자인 강화**
  - 배경 그라디언트 개선: `linear-gradient(135deg, #f0fdf4 0%, #fff 100%)` → `linear-gradient(180deg, #f0fdf4 0%, #f9fafb 38%)`로 변경하여 Warm Visual 톤 통일
  - 히어로 헤더 구조 개선: `.onb-brand-mark` 클래스 도입하여 로고 일관성 강화
  - 로고 드롭섀도우 추가: `filter: drop-shadow(0 14px 28px rgba(34,197,94,.18))` 적용으로 깊이감 표현

- **온보딩 타이포그래피 및 레이아웃 정규화**
  - 헤더 패딩 조정: `24px 20px 16px` → `18px 22px 4px`로 가로세로 비율 최적화
  - 단계 진행바(step-bar) 패딩: `0 20px 20px` → `18px 22px 6px`로 정렬 통일
  - 제목(h2) 타이포그래피 강화: 폰트 사이즈 `20px` → `22px`, 폰트 가중치 추가(`font-weight: 800`), 레터스페이싱 도입(`letter-spacing: -.3px`)
  - 본문 줄 높이 명시: `line-height: 1.5` 추가로 가독성 향상
  - 단계 콘텐츠 폴더 개선: flex 레이아웃 명시화

- **성별 선택(Gender Cards) 레이아웃 개선**
  - 그리드 레이아웃에서 flex 레이아웃으로 변경: 가로 배치 효율성 증대
  - 갭(gap) 조정: `12px` → `10px`로 미세 조정

- **Design System 문서화**
  - `design.md` 신규 작성: 온보딩부터 앱 전체(인증·홈·히스토리·통계·설정·바텀 내비게이션·FAB·시트)로 확장된 Warm Visual 레이어 정의
  - Color tokens, Shadows, Radius, Brand Mark, Iconography 섹션 상세 기술
  - 모든 UI 컴포넌트에 토큰 적용 맵핑표 제공

### 핵심 로직

1. **Warm Visual 톤의 구현 원칙**
   - 민트 그라디언트 쉘 + 부드러운 큰 멈춤 라운드로 친근감 표현
   - 그린 글로우 CTA로 행동 유도 강조
   - 색조·라운드·그림자 토큰을 전역으로 공유하여 온보딩부터 전체 앱까지 일관성 유지

2. **로고 브랜드 시스템**
   - `.onb-brand-mark`를 통한 로고 일관 렌더링 (온보딩·인증·비회원 모달에 재사용)
   - 드롭섀도우로 배경에서 자연스럽게 떠 있는 효과 구현
   - 투명 PNG 알파 채널 전처리: `min(R,G,B) ≥ 252 → alpha 0`, smooth falloff 220→252

3. **아이콘 시스템 전환**
   - 이모지 아이콘에서 Lucide 계열 라인 SVG로 전면 교체
   - `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="2"` 규격화
   - 부모 `font-size` / `color` 상속으로 유연한 스타일링 지원

### 변경된 파일

- `output/index.html` — Warm Visual 디자인 토큰 적용, 로고 시스템 도입, 온보딩 계층 구조 재정의
- `design.md` — 신규 작성. 글로벌 토큰(색상·그림자·라운드), 컴포넌트별 적용 맵, 온보딩 전용 스펙, 브랜드 마크 시스템 문서화

### QA 결과

- 최종 점수: 대기 중 (Evaluator 검수 예정)
- 변경 범위: 온보딩 화면 UI·스타일 통일, 디자인 시스템 기초 정의
