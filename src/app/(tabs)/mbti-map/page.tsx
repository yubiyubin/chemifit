"use client";

import { useRef, useEffect } from "react";
import { useMbti } from "@/context/MbtiContext";
import MbtiGrid from "@/components/MbtiGrid";
import MbtiGraph from "@/components/MbtiGraph";

export default function MbtiMapPage() {
  const { selectedMbti } = useMbti();
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
      <MbtiGrid selectedMbti={selectedMbti} onSelect={() => {}}>
        <MbtiGraph selectedMbti={selectedMbti} />
      </MbtiGrid>
    </div>
  );
}
