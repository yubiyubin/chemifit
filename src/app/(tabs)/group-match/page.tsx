"use client";

import { useState, useEffect, useRef } from "react";
import { useMbti } from "@/context/MbtiContext";
import MemberInput from "@/components/MemberInput";
import GroupGrid from "@/components/GroupGrid";
import type { Member } from "@/data/compatibility";

export default function GroupMatchPage() {
  const { selectedMbti } = useMbti();
  const [members, setMembers] = useState<Member[]>(() =>
    selectedMbti ? [{ name: "나", mbti: selectedMbti, emoji: "⭐" }] : [],
  );
  
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 탭 전환 시 렌더링 지연을 고려해 약간 늦게 동작
    const timer = setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div ref={topRef} className="scroll-mt-4" />
      <MemberInput members={members} onChange={setMembers} />
      <GroupGrid members={members} />
    </div>
  );
}
