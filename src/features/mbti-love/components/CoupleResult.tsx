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
import { LOVE_DESC } from "@/features/mbti-love/consts/love-descriptions";
import MbtiSelectModal from "@/components/MbtiSelectModal";
import DetailScoreCard from "@/components/DetailScoreCard";
import NeonCard from "@/components/NeonCard";

type Props = {
  myMbti: MbtiType;
  partnerMbti: MbtiType | null;
  onPartnerSelect: (mbti: MbtiType) => void;
};

import { TITLE1, TITLE2, TITLE3, titleProps } from "@/styles/titles";
import { FIGHT_THEME, SOLUTION_THEME, PINK_RGB, PURPLE_RGB, CYAN_RGB } from "@/styles/card-themes";
import { getCategoryScores } from "@/features/mbti-love/consts/categories";
import { COUPLE, MBTI_SELECT, EMOJIS, CTA_TEXTS } from "@/data/ui-text";
import { InfoCard, decorateBullets } from "./couple-shared";
import CtaButton from "@/components/CtaButton";
import { SYMBOLS } from "@/data/symbols";
import ReceiptShareImage from "@/components/shareImage";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import SharePanel from "@/components/SharePanel";
import { trackEvent } from "@/lib/analytics";


/**
 * 히어로 카드 배경에 떠다니는 하트 애니메이션 컴포넌트
 *
 * 5개의 하트 이모지를 절대 위치로 배치하고, CSS `heart-float` 키프레임 애니메이션으로
 * 아래에서 위로 부유하는 효과를 준다. 각 하트는 서로 다른 지속시간과 딜레이를 가진다.
 */
export function FloatingHearts() {
  const hearts = [...EMOJIS.hearts];
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
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full -rotate-90"
        >
          {useGradient && (
            <defs>
              <linearGradient
                id="gauge-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
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
            data-testid="gauge-counter"
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
  const partnerScrollRef = useRef<HTMLDivElement>(null); // 상대 MBTI 가로 스크롤
  const cardRef = useRef<HTMLDivElement>(null); // ReceiptShareImage .rc-card 직접 참조
  const [detailOpen, setDetailOpen] = useState(false); // 아코디언 펼침 상태
  const [isModalOpen, setIsModalOpen] = useState(!partnerMbti);
  const [previewOpen, setPreviewOpen] = useState(false); // 이미지 미리보기 모달 열림 여부
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 이미지 미리보기 URL

  // 선택된 상대 MBTI 버튼이 보이도록 자동 스크롤
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = partnerScrollRef.current;
      if (!container) return;
      const btn = container.querySelector<HTMLElement>(
        "[data-selected='true']",
      );
      if (!btn) return;
      const left =
        btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    });
  }, [partnerMbti]);

  /**
   * 상대방 MBTI 선택 핸들러
   * 선택 후 아코디언을 닫고, 결과 영역으로 부드럽게 스크롤한다.
   * 이중 rAF를 사용하여 DOM 업데이트(fade-in-up) 완료 후 스크롤이 실행되도록 보장한다.
   */
  const handlePartnerSelect = useCallback(
    (mbti: MbtiType) => {
      onPartnerSelect(mbti);
      setDetailOpen(false);
      trackEvent("couple_result_view", { my: myMbti, partner: mbti, score: COMPATIBILITY[myMbti][mbti] });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
    },
    [onPartnerSelect, myMbti],
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

  /** ReceiptShareImage에 전달할 데이터 — 결과가 준비됐을 때만 빌드 */
  const shareData =
    partnerMbti && score !== null && tier && loveDesc && categories
      ? {
          typeA: myMbti,
          typeB: partnerMbti,
          score,
          category: `${tier.emoji} ${tier.label}`,
          copy: { before: "", highlight: loveDesc.preview, after: "" },
          tagline: "",
          matchType: "연인 궁합",
          stats: categories.map((c) => ({
            icon: c.emoji,
            name: c.label,
            value: c.score,
            desc: c.comment,
          })),
        }
      : null;

  /** 모달을 즉시 열고(로딩 상태) 백그라운드에서 캡처 후 이미지 교체 */
  async function handleSaveImage() {
    if (!cardRef.current || !shareData || !partnerMbti) return;
    trackEvent("share_image_save", { my: myMbti, partner: partnerMbti });
    setPreviewUrl(null);
    setPreviewOpen(true); // 로딩 상태로 모달 즉시 표시
    const { toPng } = await import("html-to-image");
    await document.fonts.ready;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, width: 1080, height: 1350, skipFonts: true });
    setPreviewUrl(dataUrl);
  }

  function handlePreviewClose() {
    setPreviewOpen(false);
    setPreviewUrl(null);
  }

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
                title={MBTI_SELECT.partnerTitle}
                subtitle={MBTI_SELECT.partnerSubtitle}
                emoji={MBTI_SELECT.partnerEmoji}
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
                <span className="text-lg">{MBTI_SELECT.partnerEmoji}</span>
                <span className="text-sm font-bold text-white/80">
                  {MBTI_SELECT.otherMbtiLabel}
                </span>
              </div>
              <div
                ref={partnerScrollRef}
                className="w-full flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide snap-x"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {MBTI_TYPES.map((type) => {
                  const selected = partnerMbti === type;
                  return (
                    <button
                      key={type}
                      data-testid={`partner-btn-${type}`}
                      data-selected={selected}
                      onClick={() => handlePartnerSelect(type)}
                      className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold snap-center ${
                        selected ? "neon-btn-active" : "neon-btn"
                      }`}
                      style={{ "--neon": PINK_RGB } as React.CSSProperties}
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
            <NeonCard
              rgb={PINK_RGB}
              bgAlpha={0.06}
              borderAlpha={0.34}
              className="flex flex-col gap-0"
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
                  <span className="text-3xl z-10">{COUPLE.heroEmoji}</span>
                  {(() => {
                    const parts = loveDesc.preview.split(" — ");
                    if (parts.length >= 2) {
                      return (
                        <div className="flex flex-col items-center gap-1 z-10 px-2">
                          <p {...titleProps(TITLE2, "rgba(255,255,255,0.7)", PINK_RGB, "text-center leading-snug")}>
                            {parts[0]}
                          </p>
                          <p {...titleProps(TITLE1, "#fff", PINK_RGB, "text-center leading-snug")}>
                            &ldquo;{parts.slice(1).join(" — ")}&rdquo;
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p {...titleProps(TITLE1, "#fff", PINK_RGB, "leading-snug text-center px-2 z-10")}>
                        &ldquo;{loveDesc.preview}&rdquo;
                      </p>
                    );
                  })()}

                  {/* 내 MBTI + 상대 MBTI */}
                  <div className="flex items-center gap-3 z-10">
                    <span className="text-xl sm:text-2xl font-black" style={{ color: "#c084fc", textShadow: "0 0 12px rgba(168,85,247,0.6), 0 0 30px rgba(168,85,247,0.25)" }}>{myMbti}</span>
                    <span className="text-2xl">{COUPLE.mbtiSeparator}</span>
                    <span className="text-xl sm:text-2xl font-black" style={{ color: "#f472b6", textShadow: "0 0 12px rgba(236,72,153,0.6), 0 0 30px rgba(236,72,153,0.25)" }}>{partnerMbti}</span>
                  </div>

                  {/* 원형 게이지 (점수 시각화 — 핑크→퍼플 그라디언트) */}
                  <CircularGauge
                    score={score}
                    gradient={["#ec4899", "#a855f7"]}
                    textColor="#f472b6"
                  />

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
                  <InfoCard
                    theme={FIGHT_THEME}
                    title={COUPLE.fightTitle}
                    body={loveDesc.fightStyle}
                    myMbti={myMbti}
                    partnerMbti={partnerMbti}
                  />
                  <InfoCard
                    theme={SOLUTION_THEME}
                    title={COUPLE.solutionTitle}
                    body={loveDesc.solution}
                    myMbti={myMbti}
                    partnerMbti={partnerMbti}
                    mbtiSuffix="에게"
                  />
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
                <span>{detailOpen ? COUPLE.detailCloseLabel : COUPLE.detailOpenLabel}</span>
                <span
                  className="transition-transform duration-200 text-xs"
                  style={{
                    transform: detailOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  {SYMBOLS.dropdown}
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
                    .split(/\n(?=[\u{2300}-\u{23FF}\u{1F300}-\u{1FAFF}])/u)
                    .filter((s) => s.trim())
                    .map((section, i) => {
                      const lines = section.split("\n");
                      const heading = lines[0];
                      const body = lines.slice(1).join("\n").trim();
                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <p {...titleProps(TITLE3, "#f472b6", "244,114,182", "pt-1")}>
                            {heading}
                          </p>
                          {body && (
                            <p
                              className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
                              style={{ color: "rgba(255,255,255,0.6)" }}
                            >
                              {decorateBullets(body, heading)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* CTA 버튼 영역 */}
              <div className="mx-6 mb-6 flex flex-col gap-3">
                {/* 궁합맵 순위 확인 바로가기 */}
                <CtaButton
                  data-testid="rank-cta"
                  title={CTA_TEXTS.love.toMap.title}
                  subtitle={CTA_TEXTS.love.toMap.subtitle}
                  rgb={PURPLE_RGB}
                  onClick={() => router.push(`/mbti-map?mbti=${myMbti}`)}
                />

                {/* 그룹 케미 확인 바로가기 */}
                <CtaButton
                  data-testid="group-cta"
                  title={CTA_TEXTS.love.toGroup.title}
                  subtitle={CTA_TEXTS.love.toGroup.subtitle}
                  rgb={CYAN_RGB}
                  onClick={() => router.push("/group-match")}
                />
              </div>
            </NeonCard>
          )}

          {/* ── 섹션 6: 세부 궁합 (4개 카테고리 바 게이지) ── */}
          {categories && <DetailScoreCard categories={categories} />}

          {/* ── 섹션 7: 공유 + 이미지 저장 ── */}
          {partnerMbti && score !== null && loveDesc && (
            <div className="flex flex-col gap-3">
              <SharePanel
                title={`${myMbti}와 ${partnerMbti} 연애 궁합 - ${score}점`}
                description={loveDesc.preview}
                path={`/mbti-love/${myMbti.toLowerCase()}/${partnerMbti.toLowerCase()}`}
                rgb={PINK_RGB}
                contentType="couple"
              />
              {shareData && (
                <button
                  data-testid="save-image-btn"
                  onClick={handleSaveImage}
                  className="neon-ghost w-full py-2.5 rounded-xl text-sm font-bold"
                  style={{ "--neon": PINK_RGB } as React.CSSProperties}
                >
                  📸 {COUPLE.saveImageBtn}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── off-screen 캡처 영역: fixed+opacity:0으로 숨겨 scale 트랜스폼 없이 캡처 ── */}
      {shareData && (
        <div
          aria-hidden="true"
          style={{ position: "fixed", top: 0, left: 0, zIndex: -9999, pointerEvents: "none", opacity: 0 }}
        >
          <ReceiptShareImage data={shareData} cardRef={cardRef} />
        </div>
      )}

      {/* ── 이미지 미리보기 모달 ── */}
      <ImagePreviewModal
        open={previewOpen}
        imageDataUrl={previewUrl}
        fileName={`chemifit-love-${myMbti}-${partnerMbti ?? "unknown"}.png`}
        onClose={handlePreviewClose}
      />
    </div>
  );
}
