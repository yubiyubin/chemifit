/**
 * ScoreBar — 네온 점수 바 게이지
 *
 * 두 가지 모드로 사용 가능:
 * 1. **풀 모드** (emoji·label·comment 전달) — DetailScoreCard 등에서 카테고리 항목 표시
 * 2. **바 전용 모드** (score만 전달) — CompatCard 등에서 순수 게이지 바만 표시
 *
 * overrideHue로 점수 기반 자동 색상을 덮어쓸 수 있다.
 */
"use client";

type Props = {
  /** 0–100 점수 */
  score: number;
  /** 카테고리 이모지 (생략 시 라벨 행 숨김) */
  emoji?: string;
  /** 카테고리 라벨 */
  label?: string;
  /** 한줄 코멘트 (생략 시 코멘트 숨김) */
  comment?: string;
  /** 라벨 행 내 emoji+label 옆에 삽입할 추가 요소 (예: MbtiBadge) */
  labelExtra?: React.ReactNode;
  /** gauge-bar 애니메이션 딜레이 (초 단위, 기본 0.3) */
  animationDelay?: number;
  /** 자동 hue 대신 사용할 HSL hue 값 (0–360) */
  overrideHue?: number;
  /** 바 높이 클래스 (기본 "h-2") */
  height?: string;
  className?: string;
};

import { scoreHue } from "@/data/colors";
import {
  TEXT_SAT, TEXT_LIT, TEXT_GLOW_SAT, TEXT_GLOW_LIT, TEXT_GLOW_OP, TEXT_GLOW_R,
  BAR_SAT_L, BAR_LIT_L, BAR_SAT_R, BAR_LIT_R,
  GLOW_1, GLOW_2, GLOW_3,
  TRACK_SAT, TRACK_LIT, TRACK_OP,
} from "@/styles/score-bar";
import { TITLE4 } from "@/styles/titles";

export default function ScoreBar({
  score,
  emoji,
  label,
  comment,
  labelExtra,
  animationDelay = 0.3,
  overrideHue,
  height = "h-2",
  className,
}: Props) {
  const hue = overrideHue ?? scoreHue(score);
  const showLabel = emoji !== undefined && label !== undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      {/* 카테고리명 + 점수 (풀 모드에서만 표시) */}
      {showLabel && (
        <div className={`flex items-center gap-2${labelExtra ? " mb-2" : ""}`}>
          <span
            className={`${TITLE4.size} ${TITLE4.weight} shrink-0`}
            style={{
              color: "rgba(255,255,255,0.6)",
              textShadow: [
                TITLE4.glowNear > 0 && `0 0 ${TITLE4.glowNear}px hsla(${hue},70%,50%,${TITLE4.glowNearOp})`,
                TITLE4.glowFar > 0 && `0 0 ${TITLE4.glowFar}px hsla(${hue},70%,50%,${TITLE4.glowFarOp})`,
              ].filter(Boolean).join(", ") || undefined,
            }}
          >
            {emoji} {label}
          </span>
          {labelExtra && (
            <div className="flex flex-wrap gap-1 min-w-0">{labelExtra}</div>
          )}
          <span
            className="text-sm font-bold ml-auto shrink-0"
            style={{
              color: `hsl(${hue},${TEXT_SAT}%,${TEXT_LIT}%)`,
              textShadow: `0 0 ${TEXT_GLOW_R}px hsla(${hue},${TEXT_GLOW_SAT}%,${TEXT_GLOW_LIT}%,${TEXT_GLOW_OP})`,
            }}
          >
            {score}%
          </span>
        </div>
      )}
      {/* 수평 바 게이지 — 네온 글로우 */}
      <div
        className={`${height} rounded-full overflow-hidden relative`}
        style={{
          background: "rgba(255,255,255,0.06)",
          boxShadow: `inset 0 0 6px hsla(${hue},${TRACK_SAT}%,${TRACK_LIT}%,${TRACK_OP})`,
        }}
      >
        <div
          className="h-full rounded-full gauge-bar"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, hsl(${hue},${BAR_SAT_L}%,${BAR_LIT_L}%), hsl(${hue},${BAR_SAT_R}%,${BAR_LIT_R}%))`,
            boxShadow: [
              `0 0 ${GLOW_1.r}px hsla(${hue},${GLOW_1.sat}%,${GLOW_1.lit}%,${GLOW_1.op})`,
              `0 0 ${GLOW_2.r}px hsla(${hue},${GLOW_2.sat}%,${GLOW_2.lit}%,${GLOW_2.op})`,
              `0 0 ${GLOW_3.r}px hsla(${hue},${GLOW_3.sat}%,${GLOW_3.lit}%,${GLOW_3.op})`,
            ].join(", "),
            animationDelay: `${animationDelay}s`,
            transform: "scaleX(0)",
          }}
        />
      </div>
      {/* 한줄 코멘트 (전달된 경우에만 표시) */}
      {comment && (
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {comment}
        </p>
      )}
    </div>
  );
}
