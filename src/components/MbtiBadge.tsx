/**
 * MbtiBadge — MBTI 알약형 배지 버튼
 *
 * 클릭하면 상세 팝업을 여는 용도로 사용된다.
 * 호버 시 위로 떠오르는 애니메이션과 글로우 그림자가 적용된다.
 *
 * themeColor 지정 시 점수 기반 자동 색상 대신 고정 색상을 사용한다.
 */
"use client";

import type { MbtiType } from "@/data/compatibility";
import { scoreHue } from "@/components/ScoreBar";

/** scoreHue 기반 HSL 색상 생성 (ScoreBar와 동일한 팔레트) */
const SAT = 70;
const LIT = 58;

type Props = {
  type: MbtiType;
  score: number;
  onClick: () => void;
  /** 고정 색상 — 지정 시 점수 기반 색상 대신 이 색상 사용 */
  themeColor?: string;
};

export default function MbtiBadge({ type, score, onClick, themeColor }: Props) {
  const hue = scoreHue(score);
  const color = themeColor ?? `hsl(${hue},${SAT}%,${LIT}%)`;
  const bg = themeColor ? `${themeColor}15` : `hsla(${hue},${SAT}%,${LIT}%,0.1)`;

  return (
    <button
      onClick={onClick}
      className="badge-btn inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:-translate-y-1 hover:scale-105"
      style={{
        color,
        backgroundColor: bg,
        border: themeColor
          ? `0.5px solid ${color}50`
          : `0.5px solid hsla(${hue},${SAT}%,${LIT}%,0.3)`,
        "--badge-glow": themeColor
          ? `${color}40`
          : `hsla(${hue},${SAT}%,${LIT}%,0.25)`,
      } as React.CSSProperties}
    >
      {type} <span className="opacity-70">→</span>
    </button>
  );
}
