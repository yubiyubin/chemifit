/**
 * @file MbtiGrid.tsx
 * @description 궁합 맵 탭의 순위 리스트 + 상세 패널 컴포넌트
 *
 * 선택된 MBTI를 기준으로 나머지 16개 MBTI와의 궁합 점수를 내림차순 정렬하여
 * 순위 리스트로 렌더링한다. 동일 점수는 같은 순위 그룹으로 묶인다.
 *
 * 주요 기능:
 * - 최고/최악 궁합 카드(CompatCard)를 상단에 2열 그리드로 표시
 * - 순위 항목을 DetailScoreCard(categories 모드)로 ScoreBar 렌더링
 * - MBTI 배지 클릭 시 상세 팝업(DetailPanel)으로 점수·게이지·연애vs친구 문구 확인
 * - children prop으로 MbtiGraph 등 외부 컴포넌트를 삽입받을 수 있음
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useCopyLink } from "@/hooks/useCopyLink";
import { MBTI_TYPES, COMPATIBILITY, MbtiType } from "@/data/compatibility";
import { MBTI_MAP } from "@/data/ui-text";
import { getScoreInfo } from "@/data/labels";
import MbtiBadge from "@/features/mbti-map/components/MbtiBadge";
import CompatCard from "@/components/CompatCard";
import DetailScoreCard from "@/components/DetailScoreCard";
import ScoreBar from "@/components/ScoreBar";
import CompatDetailModal, { type CompatDetailData } from "@/features/mbti-map/components/CompatDetailModal";
import NeonCard from "@/components/NeonCard";
import { TYPE_PROFILES } from "@/data/type-profiles";
import { TITLE2, titleProps } from "@/styles/titles";
// import ReceiptShareImage from "@/components/shareImage";
// import ImagePreviewModal from "@/components/ImagePreviewModal";

/** 동일 점수를 가진 MBTI들을 하나의 그룹으로 묶기 위한 타입 */
type GroupedPair = {
  score: number;
  types: MbtiType[];
};


/** MbtiGrid 컴포넌트의 Props 타입 */
type Props = {
  /** 현재 선택된 내 MBTI 유형 */
  selectedMbti: MbtiType;
  /** MBTI 선택 변경 콜백 (상위에서 상태 관리) */
  onSelect?: (mbti: MbtiType) => void;
  /** 최고/최악 카드와 순위 리스트 사이에 삽입되는 자식 요소 (예: MbtiGraph) */
  children?: React.ReactNode;
};

/**
 * 궁합 맵 탭의 메인 컴포넌트.
 *
 * 전체 흐름:
 * 1. 16개 MBTI 선택 버튼 → 선택된 MBTI 기준으로 궁합 데이터 계산
 * 2. 내림차순 정렬 후 최고/최악 궁합을 CompatCard로 표시
 * 3. children 슬롯 (MbtiGraph 등 외부 컴포넌트 삽입 영역)
 * 4. 동일 점수를 그룹으로 묶어 DetailScoreCard(categories)로 순위 렌더링
 * 5. 배지 클릭 시 DetailPanel 팝업으로 상세 정보 표시
 *
 * @param selectedMbti - 현재 선택된 MBTI 유형
 * @param onSelect     - MBTI 변경 시 호출되는 콜백
 * @param children     - 카드와 순위 사이에 삽입할 React 노드
 */
export default function MbtiGrid({ selectedMbti, onSelect, children }: Props) {
  const setSelectedMbti = onSelect ?? (() => {});
  const scrollRef = useRef<HTMLDivElement>(null);
  // const cardRef = useRef<HTMLDivElement>(null); // ReceiptShareImage .rc-card 직접 참조
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 이미지 미리보기 URL
  const { copied, copy: handleCopyLink } = useCopyLink();

  // 선택된 버튼이 보이도록 자동 스크롤 (쿼리 파라미터 초기 로드 포함)
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;
      const btn = container.querySelector<HTMLElement>("[data-selected='true']");
      if (!btn) return;
      const left = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    });
  }, [selectedMbti]);

  // 상세 팝업 모달의 표시 상태
  const [panel, setPanel] = useState<CompatDetailData>(null);

  // 선택된 MBTI를 제외한 15개 유형의 궁합 점수를 내림차순 정렬
  const scores = MBTI_TYPES.map((type) => ({
    type,
    score: COMPATIBILITY[selectedMbti][type],
  }))
    .filter((p) => p.type !== selectedMbti) // 자기 자신 제외
    .sort((a, b) => b.score - a.score); // 높은 점수 우선

  // 최고 궁합 (1등)과 최악 궁합 (꼴등) 추출
  const best = scores[0];
  const worst = scores[scores.length - 1];

  // 최고 점수와 동일한 점수를 가진 유형들 (공동 1등 처리)
  const bestGroup = scores
    .filter((p) => p.score === best.score)
    .map((p) => p.type);

  // 최악 점수와 동일한 점수를 가진 유형들 (공동 꼴등 처리)
  const worstGroup = scores
    .filter((p) => p.score === worst.score)
    .map((p) => p.type);

  // 동일 점수끼리 그룹화 — 순위 리스트 렌더링에 사용
  const grouped: GroupedPair[] = [];
  let i = 0;
  while (i < scores.length) {
    const s = scores[i].score;
    const group = scores.filter((p) => p.score === s).map((p) => p.type);
    grouped.push({ score: s, types: group });
    i += group.length; // 같은 점수 그룹은 건너뛰기
  }

  /* ── 이미지 저장 관련 (일시 비활성화) ──
  const shareData = {
    typeA: selectedMbti,
    typeB: bestGroup.join("·"),
    score: best.score,
    category: `🌐 ${MBTI_MAP.mapTitle}`,
    copy: { before: "", highlight: TYPE_PROFILES[selectedMbti].nickname, after: "" },
    tagline: `1위: ${bestGroup.join("·")} · 최하위: ${worstGroup.join("·")}`,
    matchType: "궁합 맵",
    stats: [
      { icon: "🏆", name: scores[0].type, value: scores[0].score, desc: "Best 1위" },
      { icon: "🥈", name: scores[1].type, value: scores[1].score, desc: "Best 2위" },
      { icon: "🥉", name: scores[2].type, value: scores[2].score, desc: "Best 3위" },
      { icon: "💀", name: worst.type, value: worst.score, desc: "최악 궁합" },
    ],
  };

  async function handleSaveImage() {
    if (!cardRef.current) return;
    const { toPng } = await import("html-to-image");
    await document.fonts.ready;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, width: 1080, height: 1350 });
    setPreviewUrl(dataUrl);
  }
  ── */

  /**
   * MBTI 배지 클릭 핸들러.
   * 클릭된 유형과의 궁합 데이터를 패널 상태에 저장하여 DetailPanel을 연다.
   * @param other - 클릭된 상대 MBTI 유형
   */
  function handleClickType(other: MbtiType) {
    setPanel({
      my: selectedMbti,
      other,
      score: COMPATIBILITY[selectedMbti][other],
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── 섹션 1: 내 MBTI 선택 ── */}
      <div
        className="rounded-2xl p-4 sm:p-5 transition-all duration-300 mb-2"
        style={{
          background: "rgba(168,85,247,0.08)",
          border: "1px solid rgba(168,85,247,0.22)",
        }}
      >
        <div className="flex flex-col gap-3 fade-in-up">
          <div className="flex items-center gap-2 pl-1">
            <span className="text-sm font-bold text-white/80">
              {MBTI_MAP.otherMbtiLabel}
            </span>
            <span className="text-lg">{MBTI_MAP.otherMbtiEmoji}</span>
          </div>
          <div
            ref={scrollRef}
            className="w-full flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide snap-x"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {MBTI_TYPES.map((type) => {
              const selected = selectedMbti === type;
              return (
                <button
                  key={type}
                  data-testid={`map-mbti-btn-${type}`}
                  data-selected={selected}
                  onClick={() => setSelectedMbti(type)}
                  className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold snap-center ${
                    selected ? "neon-btn-active" : "neon-btn"
                  }`}
                  style={{ "--neon": "168,85,247" } as React.CSSProperties}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 섹션 2~4: 결과 영역 ── */}
      <NeonCard rgb="168,85,247" className="p-5 sm:p-6 flex flex-col gap-6">
        {/* ── 캐치프레이즈 ── */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3 w-full">
            <span className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.35)" }} />
            <p
              className="text-2xl sm:text-3xl font-black tracking-widest"
              style={{
                color: "rgba(168,85,247,1)",
                textShadow:
                  "0 0 12px rgba(168,85,247,0.8), 0 0 30px rgba(168,85,247,0.4)",
              }}
            >
              {selectedMbti}
            </p>
            <span className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.35)" }} />
          </div>
          <p {...titleProps(TITLE2, "rgba(168,85,247,0.75)", "168,85,247", "italic")}>
            &ldquo;{TYPE_PROFILES[selectedMbti].nickname}&rdquo;
          </p>
          <span
            className="text-xs font-bold px-3 py-0.5 rounded-full mt-0.5"
            style={{
              color: "rgba(168,85,247,0.9)",
              background: "rgba(168,85,247,0.1)",
              border: "0.5px solid rgba(168,85,247,0.35)",
            }}
          >
            {MBTI_MAP.mapTitle}
          </span>
        </div>

        {/* 섹션 2: 최고/최악 궁합 카드 (2열 그리드) */}
        <div className="grid grid-cols-2 gap-3">
          <CompatCard score={best.score} variant="best">
            <div className="flex flex-wrap gap-1 justify-center">
              {bestGroup.map((type) => (
                <MbtiBadge
                  key={type}
                  type={type}
                  score={best.score}
                  onClick={() => handleClickType(type)}
                  themeColor="#f0a030"
                />
              ))}
            </div>
          </CompatCard>
          <CompatCard score={worst.score} variant="worst">
            <div className="flex flex-wrap gap-1 justify-center">
              {worstGroup.map((type) => (
                <MbtiBadge
                  key={type}
                  type={type}
                  score={worst.score}
                  onClick={() => handleClickType(type)}
                  themeColor="#e04070"
                />
              ))}
            </div>
          </CompatCard>
        </div>

        {/* 섹션 3: 외부 삽입 영역 (예: MbtiGraph 차트) */}
        {children}

        {/* 섹션 4: 전체 궁합 순위 리스트 (DetailScoreCard categories 모드) */}
        <p
          className="text-center text-[11px] font-medium -mb-3"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {MBTI_MAP.badgeClickHint}
        </p>
        <DetailScoreCard title={MBTI_MAP.rankTitle} themeRgb="168,85,247">
          {(() => {
            let rank = 1;
            return grouped.map((g, i) => {
              const info = getScoreInfo(g.score);
              const rankLabel =
                g.types.length > 1
                  ? `${rank}~${rank + g.types.length - 1}위`
                  : `${rank}위`;
              rank += g.types.length;
              return (
                <div key={g.score} className="flex flex-col gap-1.5">
                  <ScoreBar
                    emoji={info.emoji}
                    label={rankLabel}
                    score={g.score}
                    comment={info.label}
                    animationDelay={0.3 + i * 0.2}
                    labelExtra={g.types.map((type) => (
                      <MbtiBadge
                        key={type}
                        type={type}
                        score={g.score}
                        onClick={() => handleClickType(type)}
                      />
                    ))}
                  />
                </div>
              );
            });
          })()}
        </DetailScoreCard>

      </NeonCard>

      {/* ── 공유 버튼 행 ── */}
      <div className="flex gap-3">
        <button
          data-testid="copy-link-btn"
          onClick={handleCopyLink}
          className="neon-ghost w-full py-2.5 rounded-xl text-sm font-bold"
        >
          {copied ? MBTI_MAP.copiedMessage : MBTI_MAP.copyLinkBtn}
        </button>
        {/* 이미지 저장 버튼 (일시 비활성화)
        <button
          data-testid="save-image-btn"
          onClick={handleSaveImage}
          className="neon-ghost w-full py-2.5 rounded-xl text-sm font-bold"
        >
          📸 {MBTI_MAP.saveImageBtn}
        </button>
        */}
      </div>

      {/* ── 상세 팝업 패널 (배지 클릭 시 활성화) ── */}
      <CompatDetailModal data={panel} onClose={() => setPanel(null)} />

      {/* off-screen 캡처 영역 (일시 비활성화)
      <div
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, zIndex: -9999, pointerEvents: "none", opacity: 0 }}
      >
        <ReceiptShareImage data={shareData} cardRef={cardRef} />
      </div>

      <ImagePreviewModal
        imageDataUrl={previewUrl}
        fileName={`chemifit-map-${selectedMbti}.png`}
        onClose={() => setPreviewUrl(null)}
      />
      */}
    </div>
  );
}
