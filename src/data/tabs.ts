/**
 * 탭 네비게이션 정의
 *
 * (tabs)/layout.tsx의 TabSwitcher에서 사용.
 * id는 URL 경로와 동일해야 함.
 *
 * 각 탭 테마색의 single source of truth:
 * - mbti-love: PINK_RGB (card-themes.ts)
 * - mbti-map: PURPLE_RGB (card-themes.ts)
 * - group-match: CYAN_RGB (card-themes.ts)
 * - mbti-profiles: LIME_RGB (card-themes.ts)
 */

import { LIME_RGB } from "@/styles/card-themes";

export type Tab = {
  id: string;
  label: string;
  emoji: string;
  /** 탭 테마 네온 RGB (CSS --neon 변수용) */
  neonRgb: string;
};

export const TABS: Tab[] = [
  { id: "mbti-love", label: "연인 궁합", emoji: "💕", neonRgb: "236,72,153" },
  { id: "mbti-map", label: "궁합 맵", emoji: "🌐", neonRgb: "168,85,247" },
  { id: "group-match", label: "그룹 궁합", emoji: "👥", neonRgb: "0,203,255" },
  { id: "mbti-profiles", label: "유형 설명", emoji: "📖", neonRgb: LIME_RGB },
];

/** 기본 네온 RGB (탭 매칭 실패 시 fallback) */
export const DEFAULT_TAB_NEON = "168,85,247";
