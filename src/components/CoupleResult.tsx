"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { COMPATIBILITY, MbtiType } from "@/data/compatibility";
import { getCoupleTier } from "@/data/labels";
import { MBTI_GROUPS } from "@/data/groups";
import { LOVE_DESC } from "@/data/love-descriptions";

type Props = {
  myMbti: MbtiType;
  partnerMbti: MbtiType | null;
  onPartnerSelect: (mbti: MbtiType) => void;
};

// TODO(human): 카테고리별 궁합 점수 도출 함수
function getCategoryScores(
  myMbti: MbtiType,
  partnerMbti: MbtiType,
  baseScore: number,
) {
  const match = [
    myMbti[0] === partnerMbti[0], // E/I
    myMbti[1] === partnerMbti[1], // S/N
    myMbti[2] === partnerMbti[2], // T/F
    myMbti[3] === partnerMbti[3], // J/P
  ];

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  return [
    {
      label: "감정 교류",
      emoji: "💓",
      score: clamp(baseScore * 0.6 + (match[2] ? 25 : 0) + (match[0] ? 10 : 5)),
    },
    {
      label: "대화 궁합",
      emoji: "💬",
      score: clamp(baseScore * 0.6 + (match[0] ? 20 : 5) + (match[1] ? 15 : 0)),
    },
    {
      label: "가치관",
      emoji: "🌙",
      score: clamp(baseScore * 0.6 + (match[1] ? 20 : 5) + (match[2] ? 15 : 0)),
    },
    {
      label: "일상 호환",
      emoji: "☀️",
      score: clamp(baseScore * 0.6 + (match[3] ? 25 : 5) + (match[0] ? 10 : 0)),
    },
  ];
}

function FloatingHearts() {
  const hearts = ["💕", "💗", "💘", "♥", "💖"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hearts.map((h, i) => (
        <span
          key={i}
          className="absolute text-lg"
          style={{
            left: `${15 + i * 17}%`,
            bottom: "10%",
            animation: `heart-float ${3 + i * 0.7}s ease-out infinite`,
            animationDelay: `${i * 0.8}s`,
            opacity: 0,
          }}
        >
          {h}
        </span>
      ))}
    </div>
  );
}

function CircularGauge({ score }: { score: number }) {
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const target = circumference - (circumference * score) / 100;
  const [counter, setCounter] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const dur = 2000;
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setCounter(Math.round(score * ease));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [score]);

  const hue = score > 60 ? 340 : score > 30 ? 20 : 0;
  const sat = 80 + score * 0.15;
  const color = `hsl(${hue},${sat}%,${55 + score * 0.1}%)`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[180px] h-[180px]">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={target}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-black"
            style={{
              color,
              animation: "score-pulse 2.5s ease-in-out infinite",
              animationDelay: "2s",
            }}
          >
            {counter}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CoupleResult({
  myMbti,
  partnerMbti,
  onPartnerSelect,
}: Props) {
  const resultRef = useRef<HTMLDivElement>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handlePartnerSelect = useCallback(
    (mbti: MbtiType) => {
      onPartnerSelect(mbti);
      setDetailOpen(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
    },
    [onPartnerSelect],
  );

  const score = partnerMbti ? COMPATIBILITY[myMbti][partnerMbti] : null;
  const tier = score !== null ? getCoupleTier(score) : null;
  const loveDesc = partnerMbti
    ? (LOVE_DESC[myMbti]?.[partnerMbti] ?? null)
    : null;
  const categories =
    partnerMbti && score !== null
      ? getCategoryScores(myMbti, partnerMbti, score)
      : null;

  return (
    <div className="flex flex-col gap-8">
      {/* 상대방 MBTI 선택 */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: "rgba(236,72,153,0.08)",
          border: "1px solid rgba(236,72,153,0.22)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">💘</span>
          <h2
            className="text-lg font-bold"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            상대방의 MBTI는?
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {MBTI_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <p className="text-[11px] text-white/40 font-medium pl-1">
                {group.label}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {group.types.map((type) => {
                  const selected = partnerMbti === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handlePartnerSelect(type)}
                      className="py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                      style={{
                        background: selected
                          ? "rgba(236,72,153,0.28)"
                          : "rgba(236,72,153,0.10)",
                        border: selected
                          ? "1.5px solid rgba(236,72,153,0.6)"
                          : "0.5px solid rgba(236,72,153,0.22)",
                        color: selected ? "#fff" : "rgba(255,255,255,0.8)",
                        boxShadow: selected
                          ? "0 0 16px rgba(236,72,153,0.35)"
                          : "none",
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {partnerMbti && score !== null && tier && (
        <div ref={resultRef} className="fade-in-up flex flex-col gap-6">
          {/* 공유용 메인 카드 */}
          {loveDesc && (
            <div
              className="rounded-2xl flex flex-col gap-0"
              style={{
                background: "rgba(236,72,153,0.06)",
                border: "1px solid rgba(236,72,153,0.18)",
              }}
            >
              {/* 메인 영역 — 강조 */}
              <div
                className="p-7 sm:p-8 flex flex-col items-center gap-4"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.10) 0%, transparent 70%)",
                }}
              >
                {/* 💥 한 줄 요약 */}
                <span className="text-3xl">💥</span>
                <p
                  className="text-xl sm:text-2xl font-black leading-snug text-center px-2"
                  style={{
                    color: "#fff",
                    textShadow:
                      "0 0 14px rgba(236,72,153,0.55), 0 0 40px rgba(236,72,153,0.2)",
                  }}
                >
                  &ldquo;{loveDesc.preview}&rdquo;
                </p>
                {/* 히어로 카드 */}
                <div
                  className="relative w-full py-6 flex flex-col items-center gap-4 overflow-hidden"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 30%, rgba(236,72,153,0.08) 0%, transparent 70%)",
                  }}
                >
                  <FloatingHearts />

                  <div className="flex items-center gap-4 z-10">
                    <div
                      className="px-4 py-2 rounded-xl text-lg font-black"
                      style={{
                        background: "rgba(168,85,247,0.15)",
                        border: "1px solid rgba(168,85,247,0.3)",
                        color: "#c084fc",
                      }}
                    >
                      {myMbti}
                    </div>
                    <span className="text-3xl">💕</span>
                    <div
                      className="px-4 py-2 rounded-xl text-lg font-black"
                      style={{
                        background: "rgba(236,72,153,0.15)",
                        border: "1px solid rgba(236,72,153,0.3)",
                        color: "#f472b6",
                      }}
                    >
                      {partnerMbti}
                    </div>
                  </div>

                  <CircularGauge score={score} />

                  <div className="flex flex-col items-center gap-2 z-10">
                    <p
                      className="text-lg sm:text-xl font-black text-center leading-snug px-2"
                      style={{
                        color: "#fff",
                        textShadow:
                          "0 0 12px rgba(236,72,153,0.5), 0 0 30px rgba(236,72,153,0.2)",
                      }}
                    >
                      {tier.label}
                    </p>
                  </div>
                </div>
                {/* 🔥 싸움 패턴 + 🔧 해결 핵심 */}
                <div className="w-full flex flex-col gap-4 mt-3">
                  <div
                    className="rounded-xl p-5 flex flex-col gap-2.5"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      boxShadow: "0 0 20px rgba(239,68,68,0.06)",
                    }}
                  >
                    <p
                      className="text-base font-black"
                      style={{
                        color: "#fb7185",
                        textShadow:
                          "0 0 10px rgba(251,113,133,0.4), 0 0 25px rgba(251,113,133,0.15)",
                      }}
                    >
                      🔥 싸움 패턴
                    </p>
                    <p
                      className="text-base sm:text-lg leading-relaxed font-medium"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      {loveDesc.fightStyle}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-5 flex flex-col gap-2.5"
                    style={{
                      background: "rgba(168,85,247,0.08)",
                      border: "1px solid rgba(168,85,247,0.2)",
                      boxShadow: "0 0 20px rgba(168,85,247,0.06)",
                    }}
                  >
                    <p
                      className="text-base font-black"
                      style={{
                        color: "#c084fc",
                        textShadow:
                          "0 0 10px rgba(192,132,252,0.4), 0 0 25px rgba(192,132,252,0.15)",
                      }}
                    >
                      🔧 해결 핵심
                    </p>
                    <p
                      className="text-base sm:text-lg leading-relaxed font-medium"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      {loveDesc.solution}
                    </p>
                  </div>
                </div>
              </div>

              {/* 아코디언 더보기 */}
              <button
                onClick={() => setDetailOpen((prev) => !prev)}
                className="flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors"
                style={{
                  color: "rgba(236,72,153,0.75)",
                  borderTop: "1px solid rgba(236,72,153,0.12)",
                }}
              >
                <span>{detailOpen ? "접기" : "📖 더 자세히 보기"}</span>
                <span
                  className="transition-transform duration-200 text-xs"
                  style={{
                    transform: detailOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  ▼
                </span>
              </button>

              {detailOpen && (
                <div
                  className="px-7 pb-7 flex flex-col gap-5 fade-in-up"
                  style={{
                    borderTop: "1px solid rgba(236,72,153,0.10)",
                  }}
                >
                  {loveDesc.detail
                    .split(/\n(?=[\u{1F300}-\u{1FAFF}])/u)
                    .filter((s) => s.trim())
                    .map((section, i) => {
                      const lines = section.split("\n");
                      const heading = lines[0];
                      const body = lines.slice(1).join("\n").trim();
                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <p
                            className="text-base font-bold pt-1"
                            style={{ color: "#f472b6" }}
                          >
                            {heading}
                          </p>
                          {body && (
                            <p
                              className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
                              style={{ color: "rgba(255,255,255,0.6)" }}
                            >
                              {body}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* 카테고리별 점수 */}
          {categories && (
            <div
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "rgba(236,72,153,0.04)",
                border: "1px solid rgba(236,72,153,0.12)",
              }}
            >
              <p className="text-sm font-bold" style={{ color: "#f472b6" }}>
                💞 세부 궁합
              </p>
              {categories.map((cat, i) => (
                <div key={cat.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">
                      {cat.emoji} {cat.label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: `hsl(${cat.score > 60 ? 340 : cat.score > 30 ? 20 : 0},80%,60%)`,
                      }}
                    >
                      {cat.score}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full gauge-bar"
                      style={{
                        width: `${cat.score}%`,
                        background: `hsl(${cat.score > 60 ? 340 : cat.score > 30 ? 20 : 0},80%,55%)`,
                        boxShadow: `0 0 6px hsla(${cat.score > 60 ? 340 : cat.score > 30 ? 20 : 0},80%,55%,0.6)`,
                        animationDelay: `${0.3 + i * 0.2}s`,
                        transform: "scaleX(0)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
