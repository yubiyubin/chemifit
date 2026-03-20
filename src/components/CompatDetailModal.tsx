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
import ScoreBar from "./ScoreBar";

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
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* 모달 본체 */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] z-50 rounded-2xl p-6 text-center"
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 36px rgba(168,85,247,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 ✕ */}
        <button
          onClick={onClose}
          className="neon-ghost absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs"
        >
          ✕
        </button>

        {/* 등급 이모지 */}
        <div className="text-4xl mb-2">{info.emoji}</div>

        {/* 궁합 점수 */}
        <div
          className="text-2xl font-black mb-1"
          style={{
            color: `hsl(${scoreToHue(score)},70%,65%)`,
            textShadow: `0 0 12px hsla(${scoreToHue(score)},70%,55%,0.6)`,
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
            color: `hsl(${scoreToHue(score)},70%,65%)`,
            background: `hsla(${scoreToHue(score)},60%,40%,0.12)`,
            border: `0.5px solid hsla(${scoreToHue(score)},60%,50%,0.25)`,
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
          💜 이 MBTI랑 연애하면?
        </button>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="neon-ghost mt-2 w-full py-2 rounded-xl text-sm"
        >
          닫기
        </button>
      </div>
    </>
  );
}

/** 점수 구간별 HSL hue — 모달 텍스트/배지 색상용 */
function scoreToHue(score: number): number {
  if (score >= 80) return 270; // 보라
  if (score >= 60) return 220; // 파랑
  if (score >= 40) return 340; // 핑크
  return 0;                     // 레드
}
