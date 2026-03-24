/**
 * 탭 네비게이션 정의
 *
 * (tabs)/layout.tsx의 TabSwitcher에서 사용.
 * id는 URL 경로와 동일해야 함.
 */

export type Tab = {
  id: string;
  label: string;
  emoji: string;
};

export const TABS: Tab[] = [
  { id: "mbti-love", label: "연인 궁합", emoji: "💕" },
  { id: "mbti-map", label: "궁합 맵", emoji: "🌐" },
  { id: "group-match", label: "그룹 궁합", emoji: "👥" },
];
