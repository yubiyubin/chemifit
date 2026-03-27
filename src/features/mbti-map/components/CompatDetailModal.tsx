/**
 * CompatDetailModal — 궁합 상세 팝업 모달
 *
 * 궁합 맵(MbtiGrid)의 배지 클릭, 그래프(MbtiGraph)의 노드/선 클릭 시 공유하는 모달.
 * 등급 이모지, 점수, MBTI 조합, 게이지 바, 궁합 설명, 연인 궁합 바로가기를 포함한다.
 *
 * data가 null이면 렌더링하지 않는다.
 */
"use client";

import { useRouter } from "next/navigation";
import { getScoreInfo, getLoveFriendLine } from "@/data/labels";
import { COMPAT_DETAIL, CTA_TEXTS } from "@/data/ui-text";
import CtaButton from "@/components/CtaButton";
import { scoreTierHue } from "@/data/colors";
import { LOVE_DESC } from "@/features/mbti-love/consts/love-descriptions";
import { getScorePercentile } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import ScoreBar from "@/components/ScoreBar";
import CloseButton from "@/components/CloseButton";
import ModalOverlay from "@/components/ModalOverlay";

export type CompatDetailData = {
  my: string;
  other: string;
  score: number;
} | null;

type Props = {
  data: CompatDetailData;
  onClose: () => void;
};

export default function CompatDetailModal({ data, onClose }: Props) {
  const router = useRouter();
  if (!data) return null;

  const { my, other, score } = data;
  const info = getScoreInfo(score);
  const preview = LOVE_DESC[my as MbtiType]?.[other as MbtiType]?.preview;
  const percentile = getScorePercentile(score);

  return (
    <ModalOverlay onClose={onClose} align="transform" rgb="168,85,247">
      <div
        data-testid="compat-detail-modal"
        className="rounded-2xl p-6 text-center"
        style={{ background: "#0d0d1a" }}
      >
        <CloseButton onClick={onClose} />

        {/* 등급 이모지 */}
        <div className="text-4xl mb-2">{info.emoji}</div>

        {/* 궁합 점수 */}
        <div
          className="text-2xl font-black mb-1"
          style={{
            color: `hsl(${scoreTierHue(score)},70%,65%)`,
            textShadow: `0 0 12px hsla(${scoreTierHue(score)},70%,55%,0.6)`,
          }}
        >
          {score}%
        </div>

        {/* 순위 백분율 */}
        <p className="text-xs font-semibold mb-1" style={{ color: `hsl(${scoreTierHue(score)},70%,65%)` }}>
          {COMPAT_DETAIL.percentileLabel} {percentile}%
        </p>

        {/* MBTI 조합 */}
        <div className="text-sm font-bold text-white/80 mb-1">
          {my} × {other}
        </div>

        {/* 등급 라벨 배지 */}
        <div
          className="inline-block text-xs px-3 py-1 rounded-full mb-4"
          style={{
            color: `hsl(${scoreTierHue(score)},70%,65%)`,
            background: `hsla(${scoreTierHue(score)},60%,40%,0.12)`,
            border: `0.5px solid hsla(${scoreTierHue(score)},60%,50%,0.25)`,
          }}
        >
          {info.label}
        </div>

        {/* 게이지 바 */}
        <div className="mb-4">
          <ScoreBar score={score} height="h-1.5" />
        </div>

        {/* 구분선 */}
        <div className="h-px bg-white/10 mb-4" />

        {/* 밈 프리뷰 한 줄 */}
        {preview && (
          <p
            className="text-xs font-bold mb-2 italic"
            style={{ color: `hsl(${scoreTierHue(score)},70%,70%)` }}
          >
            &ldquo;{preview}&rdquo;
          </p>
        )}

        {/* 궁합 설명 */}
        <p
          className="text-xs sm:text-sm font-medium leading-relaxed mb-4"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {getLoveFriendLine(score)}
        </p>

        {/* 연인 궁합 바로가기 */}
        <CtaButton
          data-testid="love-cta"
          title={CTA_TEXTS.map.toLove.modal}
          rgb="236,72,153"
          onClick={() => { onClose(); router.push(`/mbti-love?mbti=${my}&partner=${other}`); }}
        />

        {/* 그룹 케미 CTA */}
        <CtaButton
          title={CTA_TEXTS.map.toGroup.modal}
          rgb="0,203,255"
          className="mt-2"
          onClick={() => { onClose(); router.push("/group-match"); }}
        />

      </div>
    </ModalOverlay>
  );
}
