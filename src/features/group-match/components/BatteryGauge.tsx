/**
 * BatteryGauge — 배터리 형태의 점수 게이지
 *
 * 그룹 궁합 평균 점수를 배터리 충전량으로 시각화.
 * 점수 구간별 색상 자동 변환 + 충전 애니메이션.
 */
"use client";

import { getBatteryTier } from "@/features/group-match/consts/battery-tiers";
import { GROUP } from "@/data/ui-text";

type Props = {
  /** 0~100 점수 */
  score: number;
  /** 티어 라벨 (예: "💀 같이 있으면 계속 소모됨") */
  label: string;
};

export default function BatteryGauge({ score, label }: Props) {
  const { bar, glow, emoji } = getBatteryTier(score);

  return (
    <div
      className="w-full max-w-xs rounded-2xl px-5 py-4 flex flex-col items-center gap-2.5"
      style={{
        background: `rgba(${glow},0.06)`,
        border: `1px solid rgba(${glow},0.2)`,
        boxShadow: `0 0 20px rgba(${glow},0.08)`,
      }}
    >
      {/* 타이틀 */}
      <p
        className="text-[11px] font-bold tracking-wider"
        style={{ color: `rgba(${glow},0.6)` }}
      >
        {GROUP.batteryLabel}
      </p>
      {/* 배터리 본체 */}
      <div className="w-full flex items-center gap-2">
        <span className="text-lg shrink-0">{emoji}</span>
        <div className="flex-1 relative">
          {/* 배터리 외곽 */}
          <div
            className="w-full h-7 rounded-lg overflow-hidden relative"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid rgba(${glow},0.25)`,
              boxShadow: `inset 0 1px 3px rgba(0,0,0,0.4)`,
            }}
          >
            {/* 충전 바 */}
            <div
              className="h-full rounded-md gauge-bar"
              style={{
                width: `${score}%`,
                background: `linear-gradient(90deg, ${bar}cc, ${bar})`,
                boxShadow: `0 0 12px rgba(${glow},0.6), inset 0 1px 2px rgba(255,255,255,0.2)`,
                transform: "scaleX(0)",
                animationDelay: "0.5s",
              }}
            />
          </div>
          {/* 배터리 양극 돌기 */}
          <div
            className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-[4px] h-3 rounded-r-sm"
            style={{
              background: `rgba(${glow},0.3)`,
              border: `1px solid rgba(${glow},0.2)`,
              borderLeft: "none",
            }}
          />
        </div>
        {/* 퍼센트 */}
        <span
          className="text-lg font-black shrink-0 ml-1"
          style={{
            color: bar,
            textShadow: `0 0 10px rgba(${glow},0.6)`,
          }}
        >
          {score}%
        </span>
      </div>

      {/* 라벨 */}
      <p
        className="text-sm font-bold text-center"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {label}
      </p>
    </div>
  );
}
