/**
 * 궁합 맵 탭 (/mbti-map)
 *
 * 내 MBTI 기준으로 16개 타입과의 궁합을 시각화.
 * - MbtiGrid: 점수 순위 리스트 + 최고/최악 카드
 * - MbtiGraph: Canvas 네트워크 그래프 (MbtiGrid의 children으로 삽입)
 *
 * 탭 진입 시 smooth 스크롤로 상단 이동 (최고/최악 카드가 보이도록).
 */
"use client";

import { useRef, useEffect } from "react";
import { useMbti } from "@/context/MbtiContext";
import MbtiGrid from "@/components/MbtiGrid";
import MbtiGraph from "@/components/MbtiGraph";

export default function MbtiMapPage() {
  const { selectedMbti, selectMbti } = useMbti();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedMbti) return;
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [selectedMbti]);

  if (!selectedMbti) return null;

  return (
    <div ref={topRef}>
      <MbtiGrid selectedMbti={selectedMbti} onSelect={selectMbti}>
        <MbtiGraph selectedMbti={selectedMbti} />
      </MbtiGrid>
    </div>
  );
}
