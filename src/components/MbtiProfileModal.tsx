/**
 * MbtiProfileModal — MBTI 타입 짧은 프로필 모달
 *
 * 궁합맵/그룹궁합에서 중앙 노드 클릭 시 표시.
 * - 타입명, nickname, 태그(최대 4개), 장점(최대 3개)
 * - "상세 프로필 보기" / "연애 궁합 보기" CTA
 */
"use client";

import { useRouter } from "next/navigation";
import { TYPE_PROFILES } from "@/data/type-profiles";
import type { MbtiType } from "@/data/compatibility";
import ModalOverlay from "@/components/ModalOverlay";
import CloseButton from "@/components/CloseButton";
import CtaButton from "@/components/CtaButton";
import { PROFILES } from "@/data/ui-text";
import { MINT_RGB, PINK_RGB } from "@/styles/card-themes";

type Props = {
  /** null이면 렌더링 안 함 */
  mbtiType: MbtiType | null;
  /** 모달 테마 색상 (궁합맵: PURPLE_RGB, 그룹궁합: CYAN_RGB) */
  rgb: string;
  onClose: () => void;
};

export default function MbtiProfileModal({ mbtiType, rgb, onClose }: Props) {
  const router = useRouter();

  if (!mbtiType) return null;

  const profile = TYPE_PROFILES[mbtiType];

  return (
    <ModalOverlay
      onClose={onClose}
      align="transform"
      widthClass="w-[340px]"
      rgb={rgb}
    >
      <div className="relative flex flex-col gap-4 p-6 bg-[#0f0f1a] rounded-2xl">
        <CloseButton onClick={onClose} />

        {/* 타입명 + nickname */}
        <div className="text-center flex flex-col gap-1 pt-1">
          <h2
            className="text-3xl font-black tracking-widest"
            style={{
              color: `rgba(${rgb},1)`,
              textShadow: `0 0 16px rgba(${rgb},0.55), 0 0 32px rgba(${rgb},0.2)`,
            }}
          >
            {profile.type}
          </h2>
          <p className="text-sm font-bold" style={{ color: `rgba(${rgb},0.7)` }}>
            {profile.nickname}
          </p>
        </div>

        {/* 태그 (최대 4개) */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {profile.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full font-bold"
              style={{
                color: `rgba(${rgb},0.9)`,
                background: `rgba(${rgb},0.1)`,
                border: `0.5px solid rgba(${rgb},0.3)`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 장점 (최대 3개) */}
        <ul className="flex flex-col gap-1.5">
          {profile.strengths.slice(0, 3).map((s) => (
            <li key={s} className="text-xs text-white/70 flex gap-1.5">
              <span className="text-green-400 mt-0.5 shrink-0">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>

        {/* CTA 버튼 */}
        <div className="flex flex-col gap-2 pt-1">
          <CtaButton
            data-testid="profile-modal-detail-btn"
            title={PROFILES.detailCtaLabel}
            rgb={MINT_RGB}
            onClick={() => {
              onClose();
              router.push(`/mbti-profiles/${mbtiType.toLowerCase()}`);
            }}
          />
          <CtaButton
            data-testid="profile-modal-love-btn"
            title={PROFILES.loveCtaLabel}
            rgb={PINK_RGB}
            onClick={() => {
              onClose();
              router.push(`/mbti-love?mbti=${mbtiType}`);
            }}
          />
        </div>
      </div>
    </ModalOverlay>
  );
}
