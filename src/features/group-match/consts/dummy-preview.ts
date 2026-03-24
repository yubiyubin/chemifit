/**
 * 그룹 궁합 프리뷰용 더미 데이터
 *
 * GroupGrid.tsx에서 멤버 0명일 때 표시하는 미리보기 데이터.
 */

export type DummyNode = {
  x: number;
  y: number;
  label: string;
  emoji: string;
  color: string;
  r: number;
  score: number;
};

export const DUMMY_CENTER: DummyNode = {
  x: 50,
  y: 48,
  label: "나",
  emoji: "⭐",
  color: "#a855f7",
  r: 10,
  score: 100,
};

export const DUMMY_NODES: DummyNode[] = [
  { x: 48, y: 14, label: "ENFP", emoji: "🦊", color: "#818cf8", r: 8, score: 92 },
  { x: 13, y: 38, label: "INTJ", emoji: "🦉", color: "#34d399", r: 5.5, score: 65 },
  { x: 88, y: 42, label: "ISFJ", emoji: "🐻", color: "#fb923c", r: 7, score: 78 },
  { x: 22, y: 80, label: "ENTP", emoji: "🐬", color: "#f87171", r: 4.5, score: 45 },
  { x: 78, y: 78, label: "INFP", emoji: "🦋", color: "#f472b6", r: 7.5, score: 85 },
];

/** 더미 프리뷰 궁합 카드용 */
export const DUMMY_BEST = { score: 92, emoji1: "🦊", emoji2: "🦋", label: "최고의 궁합" };
export const DUMMY_WORST = { score: 45, emoji1: "🦉", emoji2: "🐬", label: "노력이 필요해요" };
export const DUMMY_AVG = { score: 73, label: "💫 아주 잘 맞아요" };
