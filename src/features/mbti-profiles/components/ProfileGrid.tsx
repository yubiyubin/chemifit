/**
 * ProfileGrid — MBTI 16타입 카드 그리드
 *
 * /mbti-profiles 랜딩 페이지에서 사용.
 * 현재 선택된 MBTI는 하이라이트 표시.
 * 카드 클릭 → /mbti-profiles/{type} 이동.
 */
"use client";

import { useRouter } from "next/navigation";
import { TYPE_PROFILES } from "@/data/type-profiles";
import { MBTI_TYPES } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import { PROFILES } from "@/data/ui-text";
import ProfileCard from "./ProfileCard";
import NeonCard from "@/components/NeonCard";
import { MINT_RGB } from "@/styles/card-themes";
import { titleProps, TITLE1, TITLE2 } from "@/styles/titles";

type Props = {
  selectedMbti: MbtiType | null;
};

export default function ProfileGrid({ selectedMbti }: Props) {
  const router = useRouter();

  return (
    <NeonCard rgb={MINT_RGB} className="p-5 sm:p-6 flex flex-col gap-4">
      {/* 섹션 타이틀 */}
      <div className="text-center">
        <p {...titleProps(TITLE1, "#fff", MINT_RGB, "text-center")}>{PROFILES.pageTitle}</p>
        <p {...titleProps(TITLE2, `rgba(${MINT_RGB},0.7)`, MINT_RGB, "text-center mt-1")}>{PROFILES.pageSubtitle}</p>
      </div>

      {/* 힌트 텍스트 */}
      <p className="text-xs text-white/40 text-center">{PROFILES.gridHint}</p>

      {/* 4열 그리드 (모바일 2열, sm 이상 4열) */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
      >
        {MBTI_TYPES.map((type) => (
          <ProfileCard
            key={type}
            profile={TYPE_PROFILES[type]}
            isSelected={selectedMbti === type}
            onClick={() => router.push(`/mbti-profiles/${type.toLowerCase()}`)}
          />
        ))}
      </div>
    </NeonCard>
  );
}
