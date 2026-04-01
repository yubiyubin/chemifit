/**
 * MBTI 유형 설명 탭 — 16타입 그리드 랜딩 페이지
 *
 * 현재 선택된 MBTI를 하이라이트하여 바로 자신의 유형을 찾을 수 있도록 함.
 */
"use client";

import { useMbti } from "@/context/MbtiContext";
import ProfileGrid from "@/features/mbti-profiles/components/ProfileGrid";
import { PAGE_HEADINGS } from "@/data/ui-text";

export default function MbtiProfilesPage() {
  const { selectedMbti } = useMbti();

  return (
    <div>
      <h2 className="sr-only">{PAGE_HEADINGS.mbtiProfiles}</h2>

      <ProfileGrid selectedMbti={selectedMbti} />
    </div>
  );
}
