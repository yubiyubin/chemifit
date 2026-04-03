# ChemiFit — Project Context

## Overview

Frontend-only MBTI compatibility web app built on Next.js 16 (App Router).
No backend — all data managed as static TypeScript files in `src/data/`.

**Tech Stack**: Next.js 16, React 19, TypeScript (strict), TailwindCSS 4, Vitest, Playwright

---

## Directory Structure

```
src/
  app/(tabs)/          ← Next.js pages (group-match, mbti-love, mbti-map)
  components/          ← Shared UI components (MbtiSelectModal, ScoreBar, NetworkGraph…)
  context/             ← React Context (MbtiContext — global MBTI state)
  data/                ← Static data & logic (compatibility, colors, labels, ui-text…)
  features/            ← Feature modules (each has components/, consts/, hooks/, utils/)
    group-match/
    mbti-love/
    mbti-map/
  hooks/               ← Global custom hooks
  styles/              ← Theme tokens (card-themes, score-bar, titles, globals.css)
  types/               ← Global TypeScript declarations
  test/                ← Test setup
e2e/                   ← Playwright E2E specs
```

---

## Team Ownership

| Member | Owned Areas |
|--------|-------------|
| **data-logic-engineer** | `src/data/`, `src/types/`, `src/hooks/`, `src/context/`, each feature's `consts/hooks/utils/` |
| **ui-developer** | `src/app/`, `src/components/`, `src/styles/`, each feature's `components/` |
| **qa-engineer** | `src/**/*.test.{ts,tsx}`, `e2e/`, `vitest.config.ts`, `playwright.config.ts` |

---

## Shared Conventions

| Rule | Detail |
|------|--------|
| Import alias | `@/` → `src/` (e.g., `import { X } from "@/data/compatibility"`) |
| Components | PascalCase |
| Hooks | useCamelCase |
| Data & utils | camelCase |
| Korean strings | Named exports in `src/data/ui-text.ts` only — no hardcoding in components |
| Style constants | `src/styles/` — no inline values |
| Types | `src/types/` or co-locate in module then re-export |
| TypeScript | strict mode + ESLint must pass |
| Test location | `*.test.ts(x)` next to source file, or `e2e/` |

---

## Test Coverage

- lines ≥ 90%, functions ≥ 90%, branches ≥ 85%
- Commands: `npm run test`, `npm run test -- --coverage`, `npx playwright test`

---

## React Guidelines

### No Sync setState in useEffect (Cascading Renders)

**Problem**: Calling `setState` synchronously inside `useEffect` triggers a completed-render → extra re-render cascade, causing performance degradation and UI flicker.

**Fix (Derived State pattern)**:
```tsx
// React docs recommended pattern
const [prevProp, setPrevProp] = useState(propValue);
const [localState, setLocalState] = useState(propValue);

if (propValue !== prevProp) {
  setPrevProp(propValue);   // update tracked prop
  setLocalState(propValue); // update state during render phase — no extra re-render
}
```

**Animations/timers**: Use `useEffect` only to start async work (e.g., `requestAnimationFrame`). Always clean up in the return function (`cancelAnimationFrame`) to prevent memory leaks and timer stacking.
