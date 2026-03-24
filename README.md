# ChemiFit — MBTI 궁합 테스트

> 16가지 MBTI 유형 간 궁합을 점수·그래프·상세 분석으로 확인하는 웹앱

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://chemifit.vercel.app)

<br/>

## 주요 기능

### 💕 연인 궁합 (`/mbti-love`)
- 나와 상대의 MBTI 연애 궁합 점수 (0~100)
- 싸움 패턴, 해결법, 관계의 본질 등 256가지 조합별 상세 설명
- 원형 게이지 애니메이션 + 감정 교류·대화·가치관·일상 4개 카테고리 세부 점수
- 결과 이미지 캡처 및 공유

### 🌐 궁합 맵 (`/mbti-map`)
- 내 MBTI 기준 16타입 궁합 순위 리스트
- Canvas 기반 네트워크 그래프 시각화 (노드 크기·색상이 점수에 비례)
- 최고/최저 궁합 하이라이트 카드
- 노드/연결선 호버·클릭 시 상세 팝업

### 👥 그룹 궁합 (`/group-match`)
- 2~8명의 MBTI 멤버 입력
- 모든 쌍의 궁합을 네트워크 그래프로 시각화
- 평균·최고·최저 궁합 요약 카드
- 팀 역할 분석 (텐션 담당, 케어 담당 등)
- URL로 그룹 공유 가능

<br/>

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| 시각화 | Canvas 2D API (커스텀 네트워크 그래프) |
| 테스트 | Vitest |
| 배포 | Vercel |

<br/>

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (메타데이터, GA, JSON-LD)
│   ├── page.tsx                # / → /mbti-love 리다이렉트
│   ├── sitemap.ts              # sitemap.xml 자동 생성
│   ├── robots.ts               # robots.txt 자동 생성
│   ├── opengraph-image.tsx     # 루트 OG 이미지
│   └── (tabs)/
│       ├── layout.tsx          # 공통 탭 UI (헤더, 탭바, 푸터)
│       ├── mbti-love/          # 연인 궁합
│       ├── mbti-map/           # 궁합 맵
│       └── group-match/        # 그룹 궁합
├── components/
│   ├── CoupleResult.tsx        # 연인 궁합 결과 (게이지, 카드, 아코디언)
│   ├── NetworkGraph.tsx        # Canvas 네트워크 그래프 (공유 컴포넌트)
│   ├── MbtiGraph.tsx           # 궁합 맵 그래프 래퍼
│   ├── GroupGrid.tsx           # 그룹 궁합 시각화 + 분석
│   ├── MbtiSelectModal.tsx     # MBTI 선택 모달
│   ├── ModalOverlay.tsx        # 공통 모달 백드롭
│   ├── ScoreBar.tsx            # 네온 게이지 바
│   └── ...
├── data/
│   ├── compatibility.ts        # 16×16 궁합 점수 매트릭스
│   ├── love-desc/              # 256가지 연인 궁합 상세 설명
│   ├── labels.ts               # 점수 구간별 라벨·이모지
│   ├── colors.ts               # 색상 유틸리티 (scoreHue, scoreTierHue)
│   └── group-roles.ts          # 그룹 역할 분석 로직
├── lib/
│   ├── layout.ts               # 노드 배치 + 충돌 해소 알고리즘
│   ├── layout.test.ts          # 노드 겹침 검증 테스트 (25개)
│   ├── node-styles.ts          # 노드 호버 스타일 유틸리티
│   ├── og-template.tsx         # OG 이미지 공통 템플릿
│   └── json-ld.tsx             # JSON-LD 구조화 데이터 컴포넌트
├── hooks/
│   └── useAutoScroll.ts        # 조건부 smooth scroll 훅
├── context/
│   └── MbtiContext.tsx         # 선택된 MBTI 전역 상태
├── constants/
│   └── palette.ts              # 앱 전역 색상 팔레트
└── styles/
    ├── globals.css             # Tailwind + 커스텀 애니메이션
    ├── titles.ts               # 타이틀 텍스트 스타일
    ├── card-themes.ts          # 카드 테마 변수
    └── score-bar.ts            # ScoreBar 스타일 변수
```

<br/>

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 테스트 실행
npm test

# 프로덕션 빌드
npm run build
```

개발 서버: [http://localhost:3000](http://localhost:3000)

<br/>

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드된 앱 실행 |
| `npm run lint` | ESLint 검사 |
| `npm test` | Vitest 테스트 실행 |
| `npm run test:watch` | Vitest 감시 모드 |

<br/>

## SEO

- 페이지별 고유 `<title>` + `<meta description>` + canonical URL
- `sitemap.xml` / `robots.txt` 자동 생성 (네이버 Yeti봇 허용)
- JSON-LD 구조화 데이터 (WebApplication + BreadcrumbList)
- 4개 페이지별 동적 OG 이미지 생성
- 시맨틱 HTML (`<header>`, `<nav>`, `<section>`, `<footer>`)
- Google Analytics (`lazyOnload` + `preconnect`)

<br/>

## 라이선스

© 2026 CYB Labs. All rights reserved.
