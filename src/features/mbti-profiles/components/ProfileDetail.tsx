/**
 * ProfileDetail — MBTI 유형 상세 페이지 본문
 *
 * 7섹션 레이아웃:
 * 1. 한 줄 밈 (nickname)
 * 2. 성격 요약 (summary)
 * 3. 키워드 태그 (tags)
 * 4. 장점 / 단점 (strengths / weaknesses)
 * 5. 연애 스타일 (loveStyle)
 * 6. Best / Worst 궁합 (bestTypes / worstTypes)
 * 7. 유명 인물·캐릭터 (celebrities)
 *
 * 하단: 이미지 저장 + 링크 복사 버튼
 */
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MbtiProfile } from "@/data/type-profiles";
import { COMPATIBILITY } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import NeonCard from "@/components/NeonCard";
import CtaButton from "@/components/CtaButton";
import MbtiBadge from "@/features/mbti-map/components/MbtiBadge";
import SharePanel from "@/components/SharePanel";
import { PROFILES } from "@/data/ui-text";
import { MINT_RGB, PINK_RGB, PURPLE_RGB, CYAN_RGB } from "@/styles/card-themes";
import ImagePreviewModal from "@/components/ImagePreviewModal";

type Props = {
  profile: MbtiProfile;
};

export default function ProfileDetail({ profile }: Props) {
  const router = useRouter();
  const detailRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false); // 이미지 미리보기 모달 열림 여부
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 이미지 미리보기 URL
  const [expandedCelebs, setExpandedCelebs] = useState<Set<string>>(new Set());

  const toggleCeleb = (name: string) => {
    setExpandedCelebs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSaveImage = async () => {
    if (!detailRef.current) return;
    setPreviewUrl(null);
    setPreviewOpen(true); // 로딩 상태로 모달 즉시 표시
    const { toPng } = await import("html-to-image");
    await document.fonts.ready;
    const dataUrl = await toPng(detailRef.current, {
      backgroundColor: "#0f0f1a",
      pixelRatio: 2,
      width: detailRef.current.offsetWidth,
      height: detailRef.current.offsetHeight,
    });
    setPreviewUrl(dataUrl); // 이미지 준비되면 교체
  };

  function handlePreviewClose() {
    setPreviewOpen(false);
    setPreviewUrl(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 뒤로가기 */}
      <button
        data-testid="back-to-grid"
        onClick={() => router.push("/mbti-profiles")}
        className="text-xs font-semibold text-white/40 hover:text-white/70 transition-colors self-start"
      >
        {PROFILES.backToGrid}
      </button>

      <NeonCard rgb={MINT_RGB} className="p-5 sm:p-6 flex flex-col gap-5">
      {/* 캡처 영역 */}
      <div ref={detailRef} className="flex flex-col gap-5">
        {/* ① 한 줄 밈 + 타입명 헤더 */}
        <div className="text-center flex flex-col gap-1">
          <h1
            className="text-3xl sm:text-4xl font-black tracking-widest"
            style={{
              color: `rgba(${MINT_RGB},1)`,
              textShadow: `0 0 20px rgba(${MINT_RGB},0.5), 0 0 40px rgba(${MINT_RGB},0.2)`,
            }}
          >
            {profile.type}
          </h1>
          <p
            className="text-sm sm:text-base font-bold"
            style={{ color: `rgba(${MINT_RGB},0.7)` }}
          >
            {profile.nickname}
          </p>
        </div>

        {/* ② 성격 요약 */}
        <NeonCard rgb={MINT_RGB} className="p-4 sm:p-5">
          <h2 className="text-xs font-black mb-2" style={{ color: `rgba(${MINT_RGB},0.8)` }}>
            {PROFILES.summaryTitle}
          </h2>
          {profile.summary.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-white/75 leading-relaxed mb-2 last:mb-0">
              {para}
            </p>
          ))}
        </NeonCard>

        {/* ③ 키워드 태그 */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-black" style={{ color: `rgba(${MINT_RGB},0.7)` }}>
            {PROFILES.tagsTitle}
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full font-bold"
                style={{
                  color: `rgba(${MINT_RGB},0.9)`,
                  background: `rgba(${MINT_RGB},0.1)`,
                  border: `0.5px solid rgba(${MINT_RGB},0.3)`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ④ 장점 / 단점 — 2컬럼 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 장점 */}
          <NeonCard rgb="34,197,94" className="p-4">
            <h2 className="text-xs font-black mb-2 text-green-400">
              {PROFILES.strengthsTitle}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {profile.strengths.map((s) => (
                <li key={s} className="text-xs text-white/70 flex gap-1.5">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </NeonCard>

          {/* 단점 */}
          <NeonCard rgb="239,68,68" className="p-4">
            <h2 className="text-xs font-black mb-2 text-red-400">
              {PROFILES.weaknessesTitle}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {profile.weaknesses.map((w) => (
                <li key={w} className="text-xs text-white/70 flex gap-1.5">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </NeonCard>
        </div>

        {/* ⑤ 연애 스타일 */}
        <NeonCard rgb={PINK_RGB} className="p-4 sm:p-5">
          <h2 className="text-xs font-black mb-2" style={{ color: `rgba(${PINK_RGB},0.85)` }}>
            {PROFILES.loveStyleTitle}
          </h2>
          {profile.loveStyle.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-white/75 leading-relaxed mb-2 last:mb-0">
              {para}
            </p>
          ))}
          <CtaButton
            title={PROFILES.loveCtaLabel}
            rgb={PINK_RGB}
            className="mt-3"
            onClick={() =>
              router.push(`/mbti-love?mbti=${profile.type}`)
            }
          />
        </NeonCard>

        {/* ⑥ Best / Worst 궁합 */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-black" style={{ color: `rgba(${PURPLE_RGB},0.7)` }}>
            {PROFILES.compatTitle}
          </h2>

          {/* Best */}
          <NeonCard rgb={PURPLE_RGB} className="p-4">
            <p className="text-xs font-bold text-white/50 mb-2">{PROFILES.bestLabel} 🏆</p>
            <div className="flex flex-wrap gap-2">
              {profile.bestTypes.map((type) => (
                <MbtiBadge
                  key={type}
                  type={type as MbtiType}
                  score={COMPATIBILITY[profile.type][type as MbtiType]}
                  onClick={() => router.push(`/mbti-profiles/${type.toLowerCase()}`)}
                />
              ))}
            </div>
          </NeonCard>

          {/* Worst */}
          <NeonCard rgb="239,68,68" className="p-4">
            <p className="text-xs font-bold text-white/50 mb-2">{PROFILES.worstLabel} 💀</p>
            <div className="flex flex-wrap gap-2">
              {profile.worstTypes.map((type) => (
                <MbtiBadge
                  key={type}
                  type={type as MbtiType}
                  score={COMPATIBILITY[profile.type][type as MbtiType]}
                  onClick={() => router.push(`/mbti-profiles/${type.toLowerCase()}`)}
                />
              ))}
            </div>
          </NeonCard>

          {/* 궁합맵 CTA */}
          <CtaButton
            title={PROFILES.mapCtaLabel}
            rgb={PURPLE_RGB}
            onClick={() => router.push(`/mbti-map?mbti=${profile.type}`)}
          />

          {/* 그룹 궁합 CTA */}
          <CtaButton
            title={PROFILES.groupCtaLabel}
            rgb={CYAN_RGB}
            onClick={() => router.push("/group-match")}
          />
        </div>

        {/* ⑦ 유명 인물·캐릭터 */}
        <NeonCard rgb={MINT_RGB} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black" style={{ color: `rgba(${MINT_RGB},0.8)` }}>
              {PROFILES.celebritiesTitle}
            </h2>
            <span className="text-[10px] font-medium" style={{ color: `rgba(${MINT_RGB},0.5)` }}>
              {PROFILES.celebritiesHint}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {profile.celebrities.map((celeb) => {
              const isOpen = expandedCelebs.has(celeb.name);
              return (
                <li
                  key={celeb.name}
                  role="button"
                  onClick={() => toggleCeleb(celeb.name)}
                  className="flex flex-col gap-1 p-2.5 rounded-xl cursor-pointer select-none transition-all"
                  style={{
                    background: isOpen
                      ? `rgba(${MINT_RGB},0.14)`
                      : `rgba(${MINT_RGB},0.08)`,
                    border: `0.5px solid rgba(${MINT_RGB},${isOpen ? 0.35 : 0.2})`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white/90">
                      {celeb.name}
                    </span>
                    <span
                      className="text-xl shrink-0 transition-transform"
                      style={{
                        color: `rgba(${MINT_RGB},${isOpen ? 1.0 : 0.85})`,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ▾
                    </span>
                  </div>
                  {isOpen && (
                    <span className="text-[11px] text-white/60 leading-relaxed break-keep">
                      {celeb.desc}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </NeonCard>
      </div>

      {/* 하단 공유 버튼 */}
      <div className="flex gap-3">
        <button
          data-testid="save-image-btn"
          onClick={handleSaveImage}
          className="flex-1 py-3 rounded-xl text-xs font-bold transition-all hover:opacity-80"
          style={{
            color: `rgba(${MINT_RGB},0.9)`,
            background: `rgba(${MINT_RGB},0.08)`,
            border: `1px solid rgba(${MINT_RGB},0.25)`,
          }}
        >
          📸 {PROFILES.saveImageBtn}
        </button>
      </div>
      <SharePanel
        title={`${profile.type} 성격 - ${profile.nickname}`}
        description={`${profile.type} 유형의 성격 특징, 장단점, 연애 스타일을 확인하세요.`}
        path={`/mbti-profiles/${profile.type.toLowerCase()}`}
        rgb={MINT_RGB}
        contentType="profile"
      />
      </NeonCard>

      {/* ── 이미지 미리보기 모달 ── */}
      <ImagePreviewModal
        open={previewOpen}
        imageDataUrl={previewUrl}
        fileName={`chemifit-${profile.type}.png`}
        onClose={handlePreviewClose}
      />
    </div>
  );
}
