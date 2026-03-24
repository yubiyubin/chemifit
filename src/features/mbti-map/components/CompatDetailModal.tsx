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
import { COMPAT_DETAIL } from "@/data/ui-text";
import { scoreTierHue } from "@/data/colors";
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

  return (
    <ModalOverlay onClose={onClose} align="transform">
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 36px rgba(168,85,247,0.15)",
        }}
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

        {/* 궁합 설명 */}
        <p
          className="text-sm font-medium leading-relaxed"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {getLoveFriendLine(score)}
        </p>

        {/* 연인 궁합 바로가기 */}
        <button
          onClick={() => {
            onClose();
            router.push(`/mbti-love?mbti=${my}&partner=${other}`);
          }}
          className="neon-action mt-4 w-full py-2.5 rounded-xl text-sm font-bold"
          style={{ "--neon": "168,85,247" } as React.CSSProperties}
        >
          {COMPAT_DETAIL.loveCtaLabel}
        </button>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="neon-ghost mt-2 w-full py-2 rounded-xl text-sm"
        >
          {COMPAT_DETAIL.closeLabel}
        </button>
      </div>
    </ModalOverlay>
  );
}
