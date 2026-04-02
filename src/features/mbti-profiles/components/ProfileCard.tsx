/**
 * ProfileCard — MBTI 유형 그리드의 개별 카드
 *
 * ProfileGrid에서 16타입을 나열할 때 사용.
 * 클릭 시 /mbti-profiles/{type} 상세 페이지로 이동.
 */
"use client";

import type { MbtiProfile } from "@/data/type-profiles";
import { MINT_RGB } from "@/styles/card-themes";
import { PROFILES } from "@/data/ui-text";

type Props = {
  profile: MbtiProfile;
  isSelected: boolean;
  onClick: () => void;
};

export default function ProfileCard({ profile, isSelected, onClick }: Props) {
  const rgb = MINT_RGB;

  return (
    <button
      data-testid={`profile-card-${profile.type}`}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-4 text-left flex flex-col gap-1.5 transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 w-full"
      style={{
        background: isSelected
          ? `rgba(${rgb},0.15)`
          : `rgba(${rgb},0.05)`,
        border: `1px solid rgba(${rgb},${isSelected ? 0.5 : 0.2})`,
        boxShadow: isSelected
          ? `0 0 20px rgba(${rgb},0.2), 0 0 40px rgba(${rgb},0.08)`
          : `0 0 10px rgba(${rgb},0.04)`,
      }}
    >
      {/* 타입명 */}
      <span
        className="text-lg font-black tracking-wide"
        style={{
          color: `rgba(${rgb},${isSelected ? 1 : 0.85})`,
          textShadow: isSelected ? `0 0 12px rgba(${rgb},0.6)` : "none",
        }}
      >
        {profile.type}
      </span>

      {/* 닉네임 */}
      <span className="text-[11px] font-medium text-white/60 leading-tight line-clamp-2">
        {profile.nickname}
      </span>

      {/* 태그 첫 2개 */}
      <div className="flex flex-wrap gap-1 mt-0.5">
        {profile.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{
              color: `rgba(${rgb},0.8)`,
              background: `rgba(${rgb},0.08)`,
              border: `0.5px solid rgba(${rgb},0.2)`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 선택된 경우 우측 상단 표시 */}
      {isSelected && (
        <span
          className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
          style={{
            color: `rgba(${rgb},1)`,
            background: `rgba(${rgb},0.15)`,
            border: `0.5px solid rgba(${rgb},0.4)`,
          }}
        >
          {PROFILES.myTypeBadge}
        </span>
      )}
    </button>
  );
}
