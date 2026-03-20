/**
 * @file CoupleResult.tsx
 * @description 연인 궁합 결과 표시 컴포넌트
 *
 * 두 MBTI 유형 간의 연애 궁합 점수, 티어, 상세 설명을 시각적으로 보여준다.
 *
 * ### 렌더링 구조 (위 → 아래)
 * 1. **상대방 MBTI 선택** — 4x4 그리드 버튼으로 상대 MBTI 선택
 * 2. **한줄요약** — loveDesc.preview 기반 임팩트 문구
 * 3. **히어로(게이지)** — 내 MBTI + 상대 MBTI 뱃지, SVG 원형 게이지, 티어 라벨
 *    - FloatingHearts: 배경 하트 애니메이션
 *    - CircularGauge: requestAnimationFrame 기반 숫자 카운터 + 원형 프로그레스
 * 4. **싸움 패턴 / 해결 핵심** — loveDesc.fightStyle, loveDesc.solution
 * 5. **아코디언 (더 자세히 보기)** — loveDesc.detail을 이모지 헤딩 기준으로 파싱하여 표시
 * 6. **세부 궁합** — 감정 교류 / 대화 궁합 / 가치관 / 일상 호환 4개 항목별 바 게이지
 *
 * ### Props
 * @prop {MbtiType} myMbti — 사용자 본인의 MBTI
 * @prop {MbtiType | null} partnerMbti — 선택된 상대방 MBTI (미선택 시 null)
 * @prop {(mbti: MbtiType) => void} onPartnerSelect — 상대방 MBTI 선택 시 호출되는 콜백
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { COMPATIBILITY, MbtiType, MBTI_TYPES } from "@/data/compatibility";
import { getCoupleTier } from "@/data/labels";
import { LOVE_DESC } from "@/data/love-descriptions";
import MbtiSelectModal from "@/components/MbtiSelectModal";
import DetailScoreCard from "@/components/DetailScoreCard";

type Props = {
  myMbti: MbtiType;
  partnerMbti: MbtiType | null;
  onPartnerSelect: (mbti: MbtiType) => void;
};

/**
 * 세부 궁합 카테고리별 점수대 한 줄 코멘트 맵
 *
 * 각 카테고리(감정 교류, 대화 궁합, 가치관, 일상 호환)마다 4단계 코멘트를 정의한다.
 * 인덱스 0이 최고 점수대(75+), 인덱스 3이 최저 점수대(35 미만).
 */
const CATEGORY_COMMENTS: Record<string, string[]> = {
  "감정 교류": [
    "눈빛만 봐도 통하는 사이 ✨",
    "감정 교류 꽤 원활한 편 👍",
    "가끔 통역이 필요함 🤔",
    "감정은 각자 알아서 처리 중 🧊",
  ],
  "대화 궁합": [
    "대화하다 밤새는 조합 🌙",
    "말이 잘 통하는 편 💬",
    "가끔 다른 나라 사람 같음 🌐",
    "대화보다 침묵이 편한 사이 🤐",
  ],
  가치관: [
    "인생관이 거의 쌍둥이 🧬",
    "큰 틀에선 방향이 비슷함 🧭",
    "중요한 건 좀 다르게 봄 🔀",
    "평행우주에서 온 것 같은 가치관 🪐",
  ],
  "일상 호환": [
    "같이 살아도 스트레스 제로 🏠",
    "생활 리듬 꽤 맞는 편 ☕",
    "습관 차이로 가끔 충돌 ⚡",
    "동거하면 서바이벌 시작 🏕️",
  ],
};

/**
 * 점수 구간에 따라 해당 카테고리의 코멘트를 반환한다.
 * - 75 이상: 최상위 코멘트 (인덱스 0)
 * - 55~74: 양호 코멘트 (인덱스 1)
 * - 35~54: 보통 코멘트 (인덱스 2)
 * - 34 이하: 최하위 코멘트 (인덱스 3)
 */
function getCategoryComment(label: string, score: number): string {
  const comments = CATEGORY_COMMENTS[label];
  if (!comments) return "";
  if (score >= 75) return comments[0];
  if (score >= 55) return comments[1];
  if (score >= 35) return comments[2];
  return comments[3];
}

/**
 * 두 MBTI의 4글자(E/I, S/N, T/F, J/P) 일치 여부를 기반으로 카테고리별 점수를 산출한다.
 *
 * ### 계산 공식
 * 각 카테고리는 `baseScore * 0.6`을 기본값으로 하고, MBTI 지표 일치 여부에 따라 보너스를 가산:
 * - **감정 교류**: T/F 일치 +25, E/I 일치 +10 (불일치 시 +5)
 * - **대화 궁합**: E/I 일치 +20 (불일치 +5), S/N 일치 +15
 * - **가치관**: S/N 일치 +20 (불일치 +5), T/F 일치 +15
 * - **일상 호환**: J/P 일치 +25 (불일치 +5), E/I 일치 +10
 *
 * 최종 점수는 0~100 범위로 clamp 처리된다.
 *
 * @param myMbti - 내 MBTI
 * @param partnerMbti - 상대 MBTI
 * @param baseScore - COMPATIBILITY 테이블에서 가져온 기본 궁합 점수
 * @returns 각 카테고리의 label, emoji, score, comment 배열
 */
function getCategoryScores(
  myMbti: MbtiType,
  partnerMbti: MbtiType,
  baseScore: number,
) {
  // MBTI 4글자 각 위치 일치 여부 판별
  const match = [
    myMbti[0] === partnerMbti[0], // E/I 일치 여부
    myMbti[1] === partnerMbti[1], // S/N 일치 여부
    myMbti[2] === partnerMbti[2], // T/F 일치 여부
    myMbti[3] === partnerMbti[3], // J/P 일치 여부
  ];

  // 0~100 범위로 제한하는 유틸
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const items = [
    {
      label: "감정 교류",
      emoji: "💓",
      score: clamp(baseScore * 0.6 + (match[2] ? 25 : 0) + (match[0] ? 10 : 5)), // T/F + E/I 보너스
    },
    {
      label: "대화 궁합",
      emoji: "💬",
      score: clamp(baseScore * 0.6 + (match[0] ? 20 : 5) + (match[1] ? 15 : 0)), // E/I + S/N 보너스
    },
    {
      label: "가치관",
      emoji: "🌙",
      score: clamp(baseScore * 0.6 + (match[1] ? 20 : 5) + (match[2] ? 15 : 0)), // S/N + T/F 보너스
    },
    {
      label: "일상 호환",
      emoji: "☀️",
      score: clamp(baseScore * 0.6 + (match[3] ? 25 : 5) + (match[0] ? 10 : 0)), // J/P + E/I 보너스
    },
  ];

  // 각 항목에 점수대별 코멘트를 부착하여 반환
  return items.map((item) => ({
    ...item,
    comment: getCategoryComment(item.label, item.score),
  }));
}

/**
 * 히어로 카드 배경에 떠다니는 하트 애니메이션 컴포넌트
 *
 * 5개의 하트 이모지를 절대 위치로 배치하고, CSS `heart-float` 키프레임 애니메이션으로
 * 아래에서 위로 부유하는 효과를 준다. 각 하트는 서로 다른 지속시간과 딜레이를 가진다.
 */
export function FloatingHearts() {
  const hearts = ["💕", "💗", "💘", "♥", "💖"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hearts.map((h, i) => (
        <span
          key={i}
          className="absolute text-lg"
          style={{
            left: `${15 + i * 17}%`, // 각 하트를 수평으로 17%씩 간격 배치
            bottom: "10%",
            animation: `heart-float ${3 + i * 0.7}s ease-out infinite`, // 3~6.5초 주기
            animationDelay: `${i * 0.8}s`, // 순차적 딜레이
            opacity: 0,
          }}
        >
          {h}
        </span>
      ))}
    </div>
  );
}

/**
 * SVG 원형 게이지 컴포넌트
 *
 * ### 동작 방식
 * - SVG `<circle>`의 strokeDashoffset을 CSS transition으로 애니메이션하여 게이지를 채운다.
 * - 중앙 숫자는 `requestAnimationFrame` 루프로 0부터 목표 점수까지 카운트업한다.
 * - 카운터 애니메이션은 easeInOutQuad 이징(2초)을 적용하여 자연스럽게 가감속한다.
 * - 점수에 따라 HSL 색상이 동적으로 변한다 (고점수: 핑크 340, 중간: 주황 20, 저점수: 빨강 0).
 *
 * @prop {number} score - 0~100 사이의 궁합 점수
 */
/**
 * @prop overrideColor - 단색 오버라이드 (게이지 선 + 숫자 색상)
 * @prop gradient - [시작색, 끝색] 배열. 지정 시 게이지 선에 SVG linearGradient 적용
 * @prop textColor - 숫자 색상만 별도 지정 (gradient 사용 시 숫자에 gradient를 줄 수 없으므로)
 */
export function CircularGauge({
  score,
  size = 180,
  overrideColor,
  gradient,
  textColor,
}: {
  score: number;
  size?: number;
  overrideColor?: string;
  gradient?: [string, string];
  textColor?: string;
}) {
  const r = (size / 180) * 70;
  const half = size / 2;
  const sw = (size / 180) * 10;
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
  const fallbackColor = `hsl(${hue},${sat}%,${55 + score * 0.1}%)`;
  const solidColor = overrideColor ?? fallbackColor;
  const useGradient = !!gradient;
  const strokeRef = useGradient ? "url(#gauge-grad)" : solidColor;
  const glowColor = gradient ? gradient[0] : solidColor;
  const numColor = textColor ?? solidColor;
  const fontSize = size <= 120 ? "text-2xl" : "text-4xl";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          {useGradient && (
            <defs>
              <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradient[0]} />
                <stop offset="100%" stopColor={gradient[1]} />
              </linearGradient>
            </defs>
          )}
          <circle
            cx={half}
            cy={half}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={sw}
          />
          <circle
            cx={half}
            cy={half}
            r={r}
            fill="none"
            stroke={strokeRef}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={target}
            style={{
              filter: `drop-shadow(0 0 ${sw * 0.8}px ${glowColor})`,
              transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`${fontSize} font-black`}
            style={{
              color: numColor,
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

/** 연인 궁합 결과 메인 컴포넌트 */
export default function CoupleResult({
  myMbti,
  partnerMbti,
  onPartnerSelect,
}: Props) {
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null); // 결과 영역 스크롤 타겟
  const [detailOpen, setDetailOpen] = useState(false); // 아코디언 펼침 상태
  const [isModalOpen, setIsModalOpen] = useState(!partnerMbti); // 파트너 MBTI 미선택 시 모달 초기 표시

  /**
   * 상대방 MBTI 선택 핸들러
   * 선택 후 아코디언을 닫고, 결과 영역으로 부드럽게 스크롤한다.
   * 이중 rAF를 사용하여 DOM 업데이트(fade-in-up) 완료 후 스크롤이 실행되도록 보장한다.
   */
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

  // 파생 데이터 계산
  const score = partnerMbti ? COMPATIBILITY[myMbti][partnerMbti] : null; // 기본 궁합 점수
  const tier = score !== null ? getCoupleTier(score) : null; // 점수 기반 티어 (라벨)
  const loveDesc = partnerMbti
    ? (LOVE_DESC[myMbti]?.[partnerMbti] ?? null)
    : null; // 연애 상세 설명 데이터
  const categories =
    partnerMbti && score !== null
      ? getCategoryScores(myMbti, partnerMbti, score)
      : null; // 세부 궁합 4개 카테고리

  return (
    <div className="flex flex-col gap-8">
      {/* ───── 섹션 1: 상대방 MBTI 선택 공간 ───── */}
      <div
        className={`rounded-2xl transition-all duration-300 ${isModalOpen ? "p-6" : "p-4 sm:p-5"}`}
        style={{
          background: "rgba(236,72,153,0.08)",
          border: "1px solid rgba(236,72,153,0.22)",
        }}
      >
        <div className="flex flex-col gap-3">
          {isModalOpen ? (
            <div className="fade-in-up w-full">
              <MbtiSelectModal
                inline
                title="상대방의 MBTI는?"
                subtitle="궁금한 그 사람의 유형을 선택해주세요 💕"
                emoji="💘"
                theme="pink"
                onSelect={(mbti) => {
                  handlePartnerSelect(mbti);
                  setIsModalOpen(false);
                }}
                onClose={partnerMbti ? () => setIsModalOpen(false) : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 fade-in-up">
              <div className="flex items-center gap-2 pl-1">
                <span className="text-lg">💘</span>
                <span className="text-sm font-bold text-white/80">
                  다른 MBTI와 궁합 보기
                </span>
              </div>
              <div 
                className="w-full flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide snap-x"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {MBTI_TYPES.map((type) => {
                  const selected = partnerMbti === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handlePartnerSelect(type)}
                      className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold snap-center ${
                        selected ? "neon-btn-active" : "neon-btn"
                      }`}
                      style={{ "--neon": "236,72,153" } as React.CSSProperties}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───── 섹션 2~6: 궁합 결과 (상대방 선택 시에만 렌더링) ───── */}
      {partnerMbti && score !== null && tier && (
        <div ref={resultRef} className="fade-in-up flex flex-col gap-6">
          {/* 메인 카드 (한줄요약 + 히어로 + 싸움패턴 + 아코디언) */}
          {loveDesc && (
            <div
              className="rounded-2xl flex flex-col gap-0"
              style={{
                background: "rgba(236,72,153,0.06)",
                border: "1px solid rgba(236,72,153,0.18)",
              }}
            >
              {/* 메인 영역 — 한줄요약 + 히어로 게이지 + 싸움/해결 */}
              <div
                className="p-7 sm:p-8 flex flex-col items-center gap-4"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.10) 0%, transparent 70%)",
                }}
              >
                {/* ── 히어로 카드 (한줄요약 + MBTI 뱃지 + 원형 게이지 + 티어) ── */}
                <div
                  className="relative w-full py-6 flex flex-col items-center gap-4 overflow-hidden"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 30%, rgba(236,72,153,0.08) 0%, transparent 70%)",
                  }}
                >
                  {/* 배경 하트 부유 애니메이션 */}
                  <FloatingHearts />

                  {/* 한줄요약 (히어로 카드 최상단) */}
                  <span className="text-3xl z-10">💥</span>
                  <p
                    className="text-xl sm:text-2xl font-black leading-snug text-center px-2 z-10"
                    style={{
                      color: "#fff",
                      textShadow:
                        "0 0 14px rgba(236,72,153,0.55), 0 0 40px rgba(236,72,153,0.2)",
                    }}
                  >
                    &ldquo;{loveDesc.preview}&rdquo;
                  </p>

                  {/* 내 MBTI + 상대 MBTI 뱃지 */}
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

                  {/* 원형 게이지 (점수 시각화) */}
                  <CircularGauge score={score} />

                  {/* 티어 라벨 */}
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
                {/* ── 섹션 4: 싸움 패턴 + 해결 핵심 ── */}
                <div className="w-full flex flex-col gap-4 mt-3">
                  {/* 싸움 패턴 카드 */}
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
                      className="text-base sm:text-lg leading-relaxed font-medium whitespace-pre-line"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      {loveDesc.fightStyle}
                    </p>
                  </div>

                  {/* 해결 핵심 카드 */}
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
                      className="text-base sm:text-lg leading-relaxed font-medium whitespace-pre-line"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      {loveDesc.solution}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 섹션 5: 아코디언 (더 자세히 보기 / 접기) ── */}
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

              {/* 아코디언 펼침 내용: loveDesc.detail을 이모지 줄바꿈 기준으로 섹션 분리 */}
              {detailOpen && (
                <div
                  className="px-7 pb-7 flex flex-col gap-5 fade-in-up"
                  style={{
                    borderTop: "1px solid rgba(236,72,153,0.10)",
                  }}
                >
                  {loveDesc.detail
                    .split(/\n(?=[\u{1F300}-\u{1FAFF}])/u) // 이모지로 시작하는 줄 앞에서 분리
                    .filter((s) => s.trim())
                    .map((section, i) => {
                      const lines = section.split("\n");
                      const heading = lines[0]; // 이모지 포함 헤딩
                      const body = lines.slice(1).join("\n").trim(); // 본문
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

              {/* 궁합맵 순위 확인 바로가기 */}
              <button
                onClick={() => router.push(`/mbti-map?mbti=${myMbti}`)}
                className="neon-action mx-6 mb-6 py-4 rounded-xl text-center"
                style={{ "--neon": "168,85,247" } as React.CSSProperties}
              >
                <p className="text-sm font-bold" style={{ color: "rgba(168,85,247,0.85)" }}>
                  이 궁합, 전체 중에서 몇 위일까? 👀
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(168,85,247,0.55)" }}>
                  👉 상위 몇 %인지 확인해보기
                </p>
              </button>
            </div>
          )}

          {/* ── 섹션 6: 세부 궁합 (4개 카테고리 바 게이지) ── */}
          {categories && <DetailScoreCard categories={categories} />}
        </div>
      )}
    </div>
  );
}
