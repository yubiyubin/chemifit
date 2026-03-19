"use client";

import { ReactNode } from "react";
import { getScoreInfo } from "@/data/labels";

type Props = {
  title: string;
  score: number;
  variant: "best" | "worst";
  children?: ReactNode;
  onClick?: () => void;
};

export default function CompatCard({ title, score, variant, children, onClick }: Props) {
  const color = variant === "best" ? "#eab308" : "#f43f5e"; // bright yellow vs rose
  const rgb = variant === "best" ? "234,179,8" : "244,63,94";
  const info = getScoreInfo(score);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 text-center flex flex-col items-center gap-1 transition-transform hover:scale-[1.02] ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(${rgb},0.15) 0%, rgba(15,15,26,0.95) 75%)`,
        border: `1px solid rgba(${rgb},0.3)`,
        boxShadow: `0 0 30px rgba(${rgb},0.08)`,
      }}
      onClick={onClick}
    >
      <p
        className="text-sm font-black mb-1 z-10"
        style={{
          color,
          textShadow: `0 0 10px rgba(${rgb},0.5)`,
        }}
      >
        {title}
      </p>
      <div className="text-4xl mb-1 z-10 filter drop-shadow-md">{info.emoji}</div>
      <div
        className="text-2xl font-black mb-1 z-10"
        style={{
          color,
          textShadow: `0 0 14px rgba(${rgb},0.8)`,
        }}
      >
        {score}%
      </div>
      <div className="text-xs font-bold text-white/70 mb-3 z-10">{info.label}</div>
      
      <div className="z-10 w-full">{children}</div>

      <div className="mt-4 h-1.5 w-full rounded-full overflow-hidden bg-white/10 z-10 shadow-inner">
        <div
          className="h-full rounded-full gauge-bar"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px rgba(${rgb},0.8)`,
          }}
        />
      </div>
    </div>
  );
}
