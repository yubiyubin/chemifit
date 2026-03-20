/**
 * 그룹 궁합 탭 (/group-match)
 *
 * 2~8명의 MBTI 멤버를 입력받아 모든 쌍의 궁합을 분석.
 * - MemberInput: 멤버 추가/삭제 UI
 * - GroupGrid: 네트워크 시각화 + 평균/최고/최저 궁합
 *
 * 초기값: 내 MBTI가 첫 번째 멤버 ("나", ⭐)로 자동 추가됨.
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMbti } from "@/context/MbtiContext";
import MemberInput from "@/components/MemberInput";
import GroupGrid from "@/components/GroupGrid";
import type { Member } from "@/data/compatibility";

export default function GroupMatchPage() {
  const { selectedMbti } = useMbti();
  const [members, setMembers] = useState<Member[]>(() =>
    selectedMbti ? [{ name: "나", mbti: selectedMbti, emoji: "⭐" }] : [],
  );

  const router = useRouter();
  const pathname = usePathname();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 탭 전환 시 렌더링 지연을 고려해 약간 늦게 동작
    const timer = setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupParam = params.get("group");
    if (groupParam) {
      try {
        const parsedMembers = JSON.parse(decodeURIComponent(groupParam)) as Member[];
        if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
          setTimeout(() => {
            setMembers(parsedMembers);
          }, 0);
        }
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }, []);

  const handleMembersChange = useCallback((newMembers: Member[]) => {
    setMembers(newMembers);
    const params = new URLSearchParams(window.location.search);
    if (newMembers.length > 0) {
      params.set("group", encodeURIComponent(JSON.stringify(newMembers)));
    } else {
      params.delete("group");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  return (
    <div className="flex flex-col gap-6">
      <div ref={topRef} className="scroll-mt-4" />
      <MemberInput members={members} onChange={handleMembersChange} />
      <GroupGrid members={members} />
    </div>
  );
}
