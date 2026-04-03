/**
 * 정적 커플 궁합 결과 표시 컴포넌트
 *
 * SEO 정적 페이지용. MbtiContext에 의존하지 않으며,
 * 모든 데이터를 props로 직접 전달받는다.
 * CoupleResult.tsx의 시각적 구조를 재사용하되 인터랙션은 최소화.
 */
"use client";

import { useState } from "react";
import type { MbtiType } from "@/data/compatibility";
import type { LoveDescription } from "@/features/mbti-love/consts/love-descriptions";
import NeonCard from "@/components/NeonCard";
import DetailScoreCard from "@/components/DetailScoreCard";
import { CircularGauge, FloatingHearts } from "@/features/mbti-love/components/CoupleResult";
import { TITLE1, TITLE2, TITLE3, titleProps } from "@/styles/titles";
import { FIGHT_THEME, SOLUTION_THEME, PINK_RGB } from "@/styles/card-themes";
import { COUPLE } from "@/data/ui-text";
import { SYMBOLS } from "@/data/symbols";
import { InfoCard, decorateBullets } from "@/features/mbti-love/components/couple-shared";
import type { CategoryItem } from "@/components/DetailScoreCard";

type Props = {
  typeA: MbtiType;
  typeB: MbtiType;
  score: number;
  tier: { emoji: string; label: string };
  loveDesc: LoveDescription | undefined;
  categories: CategoryItem[];
};

export default function StaticCoupleResult({ typeA, typeB, score, tier, loveDesc, categories }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  if (!loveDesc) return null;

  return (
    <div className="flex flex-col gap-6">
      <NeonCard rgb={PINK_RGB} bgAlpha={0.06} borderAlpha={0.34} className="flex flex-col gap-0">
        <div
          className="p-7 sm:p-8 flex flex-col items-center gap-4"
          style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.10) 0%, transparent 70%)" }}
        >
          {/* 히어로 카드 */}
          <div className="relative w-full py-6 flex flex-col items-center gap-4 overflow-hidden"
            style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(236,72,153,0.08) 0%, transparent 70%)" }}
          >
            <FloatingHearts />
            <span className="text-3xl z-10">{COUPLE.heroEmoji}</span>

            {/* 한줄 요약 */}
            {(() => {
              const parts = loveDesc.preview.split(" — ");
              if (parts.length >= 2) {
                return (
                  <div className="flex flex-col items-center gap-1 z-10 px-2">
                    <p {...titleProps(TITLE2, "rgba(255,255,255,0.7)", PINK_RGB, "text-center leading-snug")}>{parts[0]}</p>
                    <p {...titleProps(TITLE1, "#fff", PINK_RGB, "text-center leading-snug")}>&ldquo;{parts.slice(1).join(" — ")}&rdquo;</p>
                  </div>
                );
              }
              return (
                <p {...titleProps(TITLE1, "#fff", PINK_RGB, "leading-snug text-center px-2 z-10")}>&ldquo;{loveDesc.preview}&rdquo;</p>
              );
            })()}

            {/* MBTI 타입 — h2로 크롤러 인식 (시각적 스타일은 span 유지) */}
            <h2 className="flex items-center gap-3 z-10">
              <span className="text-xl sm:text-2xl font-black" style={{ color: "#c084fc", textShadow: "0 0 12px rgba(168,85,247,0.6), 0 0 30px rgba(168,85,247,0.25)" }}>{typeA}</span>
              <span className="text-2xl">{COUPLE.mbtiSeparator}</span>
              <span className="text-xl sm:text-2xl font-black" style={{ color: "#f472b6", textShadow: "0 0 12px rgba(236,72,153,0.6), 0 0 30px rgba(236,72,153,0.25)" }}>{typeB}</span>
            </h2>

            <CircularGauge score={score} gradient={["#ec4899", "#a855f7"]} textColor="#f472b6" />

            {/* 티어 라벨 */}
            <div className="flex flex-col items-center gap-2 z-10">
              <p className="text-lg sm:text-xl font-black text-center leading-snug px-2"
                style={{ color: "#fff", textShadow: "0 0 12px rgba(236,72,153,0.5), 0 0 30px rgba(236,72,153,0.2)" }}
              >
                {tier.emoji} {tier.label}
              </p>
            </div>
          </div>

          {/* 싸움 패턴 + 해결 핵심 */}
          <div className="w-full flex flex-col gap-4 mt-3">
            <InfoCard theme={FIGHT_THEME} title={COUPLE.fightTitle} body={loveDesc.fightStyle} myMbti={typeA} partnerMbti={typeB} />
            <InfoCard theme={SOLUTION_THEME} title={COUPLE.solutionTitle} body={loveDesc.solution} myMbti={typeA} partnerMbti={typeB} mbtiSuffix="에게" />
          </div>
        </div>

        {/* 아코디언 */}
        <button
          onClick={() => setDetailOpen((prev) => !prev)}
          className="flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors"
          style={{ color: "rgba(236,72,153,0.75)", borderTop: "1px solid rgba(236,72,153,0.12)" }}
        >
          <span>{detailOpen ? COUPLE.detailCloseLabel : COUPLE.detailOpenLabel}</span>
          <span className="transition-transform duration-200 text-xs" style={{ transform: detailOpen ? "rotate(180deg)" : "rotate(0)" }}>
            {SYMBOLS.dropdown}
          </span>
        </button>

        {detailOpen && (
          <div className="px-7 pb-7 flex flex-col gap-5 fade-in-up" style={{ borderTop: "1px solid rgba(236,72,153,0.10)" }}>
            {loveDesc.detail
              .split(/\n(?=[\u{2300}-\u{23FF}\u{1F300}-\u{1FAFF}])/u)
              .filter((s) => s.trim())
              .map((section, i) => {
                const lines = section.split("\n");
                const heading = lines[0];
                const body = lines.slice(1).join("\n").trim();
                return (
                  <div key={i} className="flex flex-col gap-2">
                    <p {...titleProps(TITLE3, "#f472b6", "244,114,182", "pt-1")}>{heading}</p>
                    {body && (
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {decorateBullets(body, heading)}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </NeonCard>

      {/* 세부 궁합 */}
      <DetailScoreCard categories={categories} />
    </div>
  );
}
