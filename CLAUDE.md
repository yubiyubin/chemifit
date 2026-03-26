# ChemiFit — Project Context

## 프로젝트 개요

Next.js 16 (App Router) 기반 프론트엔드 전용 MBTI 궁합 웹앱.
백엔드 서버 없음 — 모든 데이터는 `src/data/`의 정적 TypeScript 파일로 관리.

**Tech Stack**: Next.js 16, React 19, TypeScript (strict), TailwindCSS 4, Vitest, Playwright

---

## 디렉토리 구조

```
src/
  app/(tabs)/          ← Next.js 페이지 (group-match, mbti-love, mbti-map)
  components/          ← 공용 UI 컴포넌트 (MbtiSelectModal, ScoreBar, NetworkGraph…)
  context/             ← React Context (MbtiContext — 전역 MBTI 상태)
  data/                ← 정적 데이터·로직 (compatibility, colors, labels, ui-text…)
  features/            ← 피처 모듈 (각각 components/, consts/, hooks/, utils/ 포함)
    group-match/       ← 그룹 궁합
    mbti-love/         ← 연애 궁합
    mbti-map/          ← MBTI 궁합 맵
  hooks/               ← 전역 커스텀 훅
  styles/              ← 테마 토큰 (card-themes, score-bar, titles, globals.css)
  types/               ← 전역 TypeScript 선언
  test/                ← 테스트 setup
e2e/                   ← Playwright E2E 스펙
```

---

## 팀원별 소유 영역

### data-logic-engineer
- `src/data/`, `src/types/`, `src/hooks/`, `src/context/`
- 각 feature의 `consts/`, `hooks/`, `utils/`

### ui-developer
- `src/app/`, `src/components/`, `src/styles/`
- 각 feature의 `components/`

### qa-engineer
- `src/**/*.test.{ts,tsx}`, `e2e/`
- `vitest.config.ts`, `playwright.config.ts`

---

## 공유 컨벤션

| 항목 | 규칙 |
|------|------|
| Import alias | `@/` → `src/` (예: `import { X } from "@/data/compatibility"`) |
| 컴포넌트 | PascalCase |
| 훅 | useCamelCase |
| 데이터·유틸 | camelCase |
| 한국어 문자열 | `src/data/ui-text.ts`에 named export — 컴포넌트에 하드코딩 금지 |
| 스타일 상수 | `src/styles/` 사용 — 인라인 금지 |
| 타입 | `src/types/` 또는 모듈 내 co-locate 후 re-export |
| TypeScript | strict mode + ESLint 통과 필수 |
| 테스트 위치 | 소스 파일 옆 `*.test.ts(x)` 또는 `e2e/` |

---

## 테스트 커버리지 기준

- lines ≥ 90%, functions ≥ 90%, branches ≥ 85%
- 테스트 명령: `npm run test`, `npm run test -- --coverage`, `npx playwright test`

---

## 트러블슈팅 및 React 가이드라인

### Cascading Renders 방지 (useEffect 내 동기적 setState 금지)
- **문제**: `useEffect` 안에서 동기적으로 `setState`를 호출하면 렌더링이 완료된 직후 연쇄적으로 추가 렌더링을 촉발하는 **Cascading Renders(폭포수 렌더링)**가 발생합니다. 이는 성능 저하와 불필요한 UI 깜빡임을 유발합니다.
- **해결 패턴 (Derived State)**: Props 변경에 따라 내부 State를 동기화해야 할 때는 `useEffect`를 사용하지 말고, **컴포넌트 렌더링 도중(Render phase)에 상태를 업데이트**해야 합니다.
  ```tsx
  // 올바른 패턴 (React 공식 문서 권장)
  const [prevProp, setPrevProp] = useState(propValue);
  const [localState, setLocalState] = useState(propValue);

  if (propValue !== prevProp) {
    setPrevProp(propValue);    // 이전 prop 값 갱신
    setLocalState(propValue);  // 이 위치에서의 상태 업데이트는 즉시 렌더링에 반영되어 불필요한 재렌더링을 막습니다.
  }
  ```
- **애니메이션/타이머**: 컴포넌트 마운트나 Prop 변경으로 인해 `requestAnimationFrame` 등의 비동기 동작을 시작할 때만 `useEffect`를 사용합니다. 또한 Effect의 반환(return) 함수에서 반드시 `cancelAnimationFrame` 등의 **Clean-up**을 수행하여 메모리 누수나 타이머 중첩을 방지해야 합니다.
