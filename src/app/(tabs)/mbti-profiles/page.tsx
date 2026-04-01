/**
 * MBTI 유형 설명 탭 — 16타입 그리드 랜딩 페이지
 *
 * 현재 선택된 MBTI를 하이라이트하여 바로 자신의 유형을 찾을 수 있도록 함.
 */
"use client";

import { useMbti } from "@/context/MbtiContext";
import ProfileGrid from "@/features/mbti-profiles/components/ProfileGrid";
import { PAGE_HEADINGS, PROFILES } from "@/data/ui-text";
import { titleProps, TITLE1, TITLE2 } from "@/styles/titles";
import { MINT_RGB } from "@/styles/card-themes";

export default function MbtiProfilesPage() {
  const { selectedMbti } = useMbti();

  return (
    <div>
      <h2 className="sr-only">{PAGE_HEADINGS.mbtiProfiles}</h2>

      {/* 섹션 타이틀 */}
      <div className="text-center mb-6">
        <p {...titleProps(TITLE1, "#fff", MINT_RGB, "text-center")}>{PROFILES.pageTitle}</p>
        <p {...titleProps(TITLE2, `rgba(${MINT_RGB},0.7)`, MINT_RGB, "text-center mt-1")}>{PROFILES.pageSubtitle}</p>
      </div>

      <ProfileGrid selectedMbti={selectedMbti} />
    </div>
  );
}
