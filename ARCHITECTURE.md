# Persona Lab — 프로젝트 구조 문서

> MBTI 궁합 분석 웹앱. Next.js App Router 기반, 연인 궁합 / 궁합 맵 / 그룹 궁합 3개 탭으로 구성.

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript (strict mode) |
| UI | React 19, Tailwind CSS v4 |
| 상태 관리 | React Context API |
| 시각화 | Canvas API (직접 구현) |
| 빌드 | SWC (Next.js 내장) |

---

## 디렉토리 구조

```
persona-lab/
├── public/
│   └── persona-lab.svg          # 파비콘 (플라스크 아이콘)
│
├── src/
│   ├── app/                     # Next.js App Router (라우팅만 담당)
│   │   ├── layout.tsx           # 루트 레이아웃 (메타데이터, 글로벌 스타일)
│   │   ├── page.tsx             # "/" → "/mbti-love" 리다이렉트
│   │   └── (tabs)/              # Route Group — URL에 영향 없이 공통 레이아웃 공유
│   │       ├── layout.tsx       # 탭 공통 레이아웃 (MbtiProvider, 헤더, 탭, 푸터)
│   │       ├── mbti-love/
│   │       │   └── page.tsx     # 연인 궁합 탭
│   │       ├── mbti-map/
│   │       │   └── page.tsx     # 궁합 맵 탭
│   │       └── group-match/
│   │           └── page.tsx     # 그룹 궁합 탭
│   │
│   ├── components/              # UI 컴포넌트
│   │   ├── TabSwitcher.tsx      # 탭 네비게이션 바
│   │   ├── MbtiSelectModal.tsx  # 최초 MBTI 선택 모달
│   │   ├── CoupleResult.tsx     # 연인 궁합 결과 (메인 카드, 게이지, 아코디언)
│   │   ├── MbtiGrid.tsx         # 궁합 순위 리스트 + 상세 패널
│   │   ├── MbtiGraph.tsx        # Canvas 네트워크 그래프
│   │   ├── GroupGrid.tsx        # 그룹 궁합 네트워크 + 분석
│   │   ├── CompatCard.tsx       # 최고/최악 궁합 카드
│   │   └── MemberInput.tsx      # 그룹 멤버 입력/관리
│   │
│   ├── context/
│   │   └── MbtiContext.tsx      # 전역 MBTI 상태 (selectedMbti, showModal)
│   │
│   ├── data/                    # 정적 데이터
│   │   ├── compatibility.ts     # 16×16 궁합 점수 매트릭스 + 설명
│   │   ├── labels.ts            # 점수별 이모지/라벨/커플 티어/연애vs친구 문구
│   │   ├── love-descriptions.ts # 연인 궁합 상세 설명 타입 + 합산 export
│   │   ├── love-desc/           # 256개 연인 궁합 설명 (그룹별 분할)
│   │   │   ├── nt.ts            # INTJ, INTP, ENTJ, ENTP × 16 = 64개
│   │   │   ├── nf.ts            # INFJ, INFP, ENFJ, ENFP × 16 = 64개
│   │   │   ├── sj.ts            # ISTJ, ISFJ, ESTJ, ESFJ × 16 = 64개
│   │   │   └── sp.ts            # ISTP, ISFP, ESTP, ESFP × 16 = 64개
│   │   ├── groups.ts            # MBTI 4그룹 (분석/외교/관리/탐험)
│   │   └── avatars.ts           # 이모지 아바타 + 랜덤 이름
│   │
│   └── styles/
│       └── globals.css          # Tailwind + 커스텀 애니메이션
│
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── package.json
```

---

## 라우팅 구조

```
/                    → redirect("/mbti-love")
/mbti-love           → 연인 궁합 (CoupleResult)
/mbti-map            → 궁합 맵 (MbtiGrid + MbtiGraph)
/group-match         → 그룹 궁합 (MemberInput + GroupGrid)
```

`(tabs)` Route Group이 3개 탭의 공통 레이아웃을 제공하며, URL 경로에는 포함되지 않음.

---

## 상태 관리 흐름

### 전역 상태 (MbtiContext)

```
MbtiProvider
├── selectedMbti: MbtiType | null   # 사용자가 선택한 MBTI
├── showModal: boolean              # 선택 모달 표시 여부
├── selectMbti(mbti)                # MBTI 선택 → showModal=false
└── openModal()                     # 모달 다시 열기
```

### 페이지별 로컬 상태

| 페이지 | 상태 | 용도 |
|--------|------|------|
| mbti-love | `partnerMbti` | 상대방 MBTI 선택 |
| mbti-love | `detailOpen` | 아코디언 열기/닫기 |
| group-match | `members[]` | 그룹 멤버 목록 |

---

## 데이터 흐름

```
[사용자 진입]
     │
     ▼
[MbtiSelectModal]  ← showModal=true (초기 상태)
     │ MBTI 선택
     ▼
[MbtiContext]  → selectedMbti 저장, showModal=false
     │
     ├─── /mbti-love ──────────────────────────────────
     │    │
     │    ▼
     │    [CoupleResult]
     │    ├── 상대 MBTI 선택 (로컬 state)
     │    ├── COMPATIBILITY[my][partner] → 점수
     │    ├── LOVE_DESC[my][partner] → preview, fightStyle, solution, detail
     │    ├── getCoupleTier(score) → 랜덤 한 줄 문구
     │    └── getCategoryScores() → 4개 세부 궁합 + 코멘트
     │
     ├─── /mbti-map ───────────────────────────────────
     │    │
     │    ▼
     │    [MbtiGrid]  → 16개 MBTI와의 점수 정렬, 순위 표시
     │    [MbtiGraph] → Canvas 네트워크 그래프
     │    └── getLoveFriendLine(score) → "연애 vs 친구" 한 줄 문구
     │
     └─── /group-match ────────────────────────────────
          │
          ▼
          [MemberInput] → 멤버 추가/삭제 (2~8명)
          [GroupGrid]   → 모든 멤버 쌍의 궁합 분석
          └── getLoveFriendLine(score) → 팝업 설명
```

---

## 핵심 데이터 구조

### 궁합 점수 매트릭스 (compatibility.ts)

```ts
// 16개 MBTI 타입
export type MbtiType = "INTJ" | "INTP" | ... | "ESFP";

// 16×16 점수표 (0~100)
export const COMPATIBILITY: Record<MbtiType, Record<MbtiType, number>>;

// 16×16 한 줄 설명
export const COMPATIBILITY_DESC: Record<MbtiType, Partial<Record<MbtiType, string>>>;

// 멤버 타입 (그룹 궁합용)
export type Member = { name: string; mbti: MbtiType; emoji: string };
```

### 연인 궁합 설명 (love-descriptions.ts)

```ts
export type LoveDescription = {
  preview: string;      // 💥 밈 느낌 한 줄 (메인 카드 상단)
  fightStyle: string;   // 🔥 싸움 패턴 — 대화체 형식
                        //    "TYPE1: \"대사\"\nTYPE2: \"대사\"\n→ 핵심 충돌"
  solution: string;     // 🔧 해결 핵심 — 👉 TYPE1: 팁\n👉 TYPE2: 팁
  detail: string;       // 📖 아코디언 상세 (이모지 헤딩 기반 마크다운)
                        //    🧠 관계의 본질 / 🎭 실제 상황 / 💣 싸움 트리거 /
                        //    🔧 잘 맞는 방법 / 🧠 속마음 해석 / ⏳ 관계 흐름 / 📊 궁합 요약
};
```

### 라벨 시스템 (labels.ts)

```ts
// 궁합 맵용 (11단계)
SCORE_EMOJI: [{ min, emoji, label }]  // "🏆 천생연분" ~ "💀 극과 극이에요"

// 연인 궁합 게이지 아래 (6단계, 각 구간별 랜덤)
COUPLE_TIERS: [{ min, emoji, labels[] }]  // "전생에 뭐였길래 💘" ~ "이건 사랑이 아니라 실험 🧪"

// 연애 vs 친구 한 줄 (6단계, 각 구간별 랜덤)
LOVE_FRIEND_LINES: [{ min, lines[] }]  // "연애도 천국 💘 친구도 천국 🤝" ~ "연애하면 멸망 💀"
```

---

## 컴포넌트 상세

### CoupleResult.tsx (연인 궁합 결과)

가장 복잡한 컴포넌트. 렌더링 구조:

```
┌─ 상대방 MBTI 선택 그리드 ─────────────────────┐
│  MBTI_GROUPS별 4×4 버튼                        │
└────────────────────────────────────────────────┘

┌─ 결과 카드 (partnerMbti 선택 시) ─────────────┐
│                                                │
│  💥 "한 줄 요약 (preview)"                      │
│                                                │
│  ┌─ 히어로 영역 ──────────────────────┐        │
│  │  [INTJ] 💕 [ENFP]                 │        │
│  │  ┌───────────────┐                │        │
│  │  │  CircularGauge │  ← SVG 원형    │        │
│  │  │     85%        │     게이지     │        │
│  │  └───────────────┘                │        │
│  │  "찐이야 이건 💕" ← 랜덤 문구      │        │
│  │  FloatingHearts ← 떠다니는 하트    │        │
│  └────────────────────────────────────┘        │
│                                                │
│  ┌─ 🔥 싸움 패턴 ─────────────────────┐        │
│  │  대화체 형식 (whitespace-pre-line)  │        │
│  └─────────────────────────────────────┘        │
│  ┌─ 🔧 해결 핵심 ─────────────────────┐        │
│  │  👉 TYPE1: 팁  /  👉 TYPE2: 팁     │        │
│  └─────────────────────────────────────┘        │
│                                                │
│  [📖 더 자세히 보기 ▼]  ← 아코디언 토글         │
│  (열리면: 이모지 섹션별 상세 설명)              │
│                                                │
│  ┌─ 💞 세부 궁합 ─────────────────────┐        │
│  │  💓 감정 교류  ████████░░  78%     │        │
│  │  "눈빛만 봐도 통하는 사이 ✨"       │        │
│  │  💬 대화 궁합  ██████░░░░  62%     │        │
│  │  "말이 잘 통하는 편 💬"             │        │
│  │  🌙 가치관    █████░░░░░  55%     │        │
│  │  "큰 틀에선 방향이 비슷함 🧭"       │        │
│  │  ☀️ 일상 호환  ███████░░░  70%     │        │
│  │  "생활 리듬 꽤 맞는 편 ☕"          │        │
│  └─────────────────────────────────────┘        │
└────────────────────────────────────────────────┘
```

**세부 궁합 점수 계산 로직:**
```
baseScore = COMPATIBILITY[myMbti][partnerMbti]

감정 교류 = base×0.6 + (T/F 일치? +25 : 0) + (E/I 일치? +10 : +5)
대화 궁합 = base×0.6 + (E/I 일치? +20 : +5) + (S/N 일치? +15 : 0)
가치관   = base×0.6 + (S/N 일치? +20 : +5) + (T/F 일치? +15 : 0)
일상 호환 = base×0.6 + (J/P 일치? +25 : +5) + (E/I 일치? +10 : 0)
```

### MbtiGraph.tsx (네트워크 그래프)

Canvas 기반 물리 시뮬레이션:
- 중앙에 선택된 MBTI (큰 원)
- 15개 다른 MBTI가 궤도에 배치 (점수 높을수록 가까이)
- 충돌 방지 알고리즘 (200회 반복)
- 마우스 호버 시 연결선 강조 + 팝업
- 점수별 HSL 색상 동적 계산

### GroupGrid.tsx (그룹 궁합)

가장 큰 컴포넌트 (1345줄):
- 2~8명 멤버 간 모든 쌍 궁합 분석
- Canvas 네트워크 시각화
- 평균 궁합, 최고/최저 쌍 하이라이트
- 멤버별 상세 팝업

---

## 스타일링

### 색상 체계

```
배경:     #07070f ~ #0f0f1a (다크)
보라 계열: rgba(168,85,247,*) — 선택 UI, 해결 핵심
핑크 계열: rgba(236,72,153,*) — 연인 궁합, 결과 카드
빨강 계열: rgba(239,68,68,*) — 싸움 패턴

점수별 동적 색상:
  높음 (60+): hsl(340, 80%, 55~65%) — 핑크
  중간 (30~60): hsl(20, 80%, 55~65%) — 오렌지
  낮음 (~30): hsl(0, 80%, 55~65%) — 레드
```

### 애니메이션

| 이름 | 용도 | 속성 |
|------|------|------|
| `gauge-fill` | 막대 게이지 채우기 | scaleX 0→1, 3s |
| `neon-pulse` | 게이지 바 맥동 | brightness 1→1.25, 3s |
| `fade-in-up` | 결과 등장 | opacity+translateY, 0.5s |
| `heart-float` | 하트 떠오르기 | translateY+opacity, 3~5s |
| `score-pulse` | 점수 텍스트 빛남 | text-shadow, 2.5s |

---

## 모달 동작 방식

인터셉트 라우트가 아닌 **클라이언트 state 기반**:

```
1. MbtiProvider 초기화 → showModal=true
2. (tabs)/layout.tsx에서 {showModal && <MbtiSelectModal />} 조건 렌더링
3. 사용자가 MBTI 선택 → selectMbti() → showModal=false
4. 모달 사라지고 탭 콘텐츠 표시
```

모바일 터치 이슈 해결:
- 백드롭: `pointer-events-none` (터치 이벤트 통과)
- 모달 카드: `pointer-events-auto` (터치 이벤트 수신)

---

## 빌드 & 실행

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

모든 페이지는 정적 생성(SSG)으로 빌드됨 (`○ Static`).
