/**
 * 배터리 게이지 점수 구간별 색상·이모지 정의
 *
 * BatteryGauge.tsx에서 사용.
 */

export type BatteryTier = {
  min: number;
  bar: string;
  glow: string;
  emoji: string;
};

export const BATTERY_TIERS: BatteryTier[] = [
  { min: 80, bar: "#22c55e", glow: "34,197,94", emoji: "🔋" },
  { min: 50, bar: "#a855f7", glow: "168,85,247", emoji: "🔋" },
  { min: 20, bar: "#f59e0b", glow: "245,158,11", emoji: "🪫" },
  { min: 0, bar: "#ef4444", glow: "239,68,68", emoji: "🪫" },
];

/** 점수에 해당하는 배터리 티어를 반환 */
export function getBatteryTier(score: number): BatteryTier {
  return BATTERY_TIERS.find((t) => score >= t.min) ?? BATTERY_TIERS[BATTERY_TIERS.length - 1];
}
