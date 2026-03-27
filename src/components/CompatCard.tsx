/**
 * 호환성 카드 — 최고/최악 궁합 표시용
 *
 * 궁합 맵(MbtiGrid)과 그룹 궁합(GroupGrid) 양쪽에서 공유한다.
 *
 * variant에 따라 타이틀·색상이 자동 결정됨:
 * - "best":  / 골드 톤
 * - "worst": 💀 최악의 궁합 / 로즈 톤
 *
 * 구성: 타이틀 → 이모지 → 점수 → 라벨 → 게이지 바 → children(뱃지 등)
 */
"use client";

import { ReactNode } from "react";
import { getScoreInfo } from "@/data/labels";
import ScoreBar from "./ScoreBar";
import { VARIANT_CONFIG } from "@/styles/card-themes";
import { EMOJIS } from "@/data/ui-text";

type Props = {
  score: number;
  variant: "best" | "worst";
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  /** 좁은 공간용 컴팩트 모드 — 내부 요소 크기 축소 */
  compact?: boolean;
  /** 색상 강도를 낮춰 주변 테마와 조화시킴 (그룹 궁합 등) */
  muted?: boolean;
};

export default function CompatCard({
  score,
  variant,
  children,
  onClick,
  className,
  compact,
  muted,
}: Props) {
  const { title, color, rgb, hue } = VARIANT_CONFIG[variant];
  const info = getScoreInfo(score);

  /** muted 모드: 배경·보더·글로우 투명도를 절반으로 낮춰 주변 테마와 조화 */
  const bgAlpha = muted ? 0.07 : 0.15;
  const borderAlpha = muted ? 0.15 : 0.3;
  const shadowAlpha = muted ? 0.04 : 0.08;
  const titleGlowAlpha = muted ? 0.25 : 0.5;
  const scoreGlowAlpha = muted ? 0.4 : 0.8;

  return (
    <div
      {...(onClick ? { "data-testid": "compat-card" } : {})}
      className={`relative overflow-hidden rounded-2xl text-center flex flex-col items-center transition-transform hover:scale-[1.02] ${
        compact ? "p-3 gap-0.5" : "p-5 sm:p-6 gap-1"
      } ${onClick ? "cursor-pointer" : ""} ${className ?? ""}`}
      style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(${rgb},${bgAlpha}) 0%, rgba(15,15,26,0.95) 75%)`,
        border: `1px solid rgba(${rgb},${borderAlpha})`,
        boxShadow: `0 0 30px rgba(${rgb},${shadowAlpha})`,
      }}
      onClick={onClick}
    >
      <p
        className={`${compact ? "text-[10px]" : "text-xs sm:text-sm"} font-black mb-0.5 z-10`}
        style={{
          color,
          textShadow: `0 0 10px rgba(${rgb},${titleGlowAlpha})`,
        }}
      >
        {title}
      </p>
      <div
        className={`${compact ? "text-xl" : "text-4xl"} mb-0.5 z-10 filter drop-shadow-md`}
      >
        {variant === "best" ? EMOJIS.best : EMOJIS.worst}
      </div>
      <div
        className={`${compact ? "text-base" : "text-2xl"} font-black mb-0.5 z-10`}
        style={{
          color,
          textShadow: `0 0 14px rgba(${rgb},${scoreGlowAlpha})`,
        }}
      >
        {score}%
      </div>
      <div
        className={`${compact ? "text-[10px] mb-1 h-[14px]" : "text-xs mb-3 h-[2.5rem]"} font-bold text-white/70 z-10 flex items-center justify-center`}
      >
        {info.label}
      </div>

      <ScoreBar
        score={score}
        overrideHue={hue}
        height={compact ? "h-1" : "h-1.5"}
        className="mt-2 w-full z-10"
      />

      {children && (
        <div className={`z-10 w-full ${compact ? "mt-1" : "mt-2"}`}>
          {children}
        </div>
      )}
    </div>
  );
}
