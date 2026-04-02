/**
 * 커플 궁합 동적 OG 이미지
 *
 * Next.js ImageResponse로 각 MBTI 조합별 1200x630 OG 이미지를 빌드 타임에 생성.
 * 카카오톡/Twitter/Facebook 공유 시 미리보기로 표시된다.
 */
import { ImageResponse } from "next/og";
import { MBTI_TYPES, COMPATIBILITY } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import { getTierEmoji } from "@/data/labels";
import { LOVE_DESC } from "@/features/mbti-love/consts/love-descriptions";

export const alt = "ChemiFit MBTI 연애 궁합";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return MBTI_TYPES.flatMap((a) =>
    MBTI_TYPES.map((b) => ({
      typeA: a.toLowerCase(),
      typeB: b.toLowerCase(),
    })),
  );
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ typeA: string; typeB: string }>;
}) {
  const { typeA, typeB } = await params;
  const a = typeA.toUpperCase() as MbtiType;
  const b = typeB.toUpperCase() as MbtiType;
  const score = COMPATIBILITY[a]?.[b] ?? 0;
  const tierEmoji = getTierEmoji(score);
  const desc = LOVE_DESC[a]?.[b];
  const preview = desc?.preview ?? "";
  const previewShort = preview.length > 40 ? preview.slice(0, 40) + "…" : preview;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f0f1a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* 배경 글로우 */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          }}
        />

        {/* 로고 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.5)" }}>ChemiFit</span>
        </div>

        {/* MBTI 뱃지 + 점수 */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 24 }}>
          <div
            style={{
              padding: "16px 32px",
              borderRadius: 16,
              background: "rgba(168,85,247,0.2)",
              border: "2px solid rgba(168,85,247,0.4)",
              color: "#c084fc",
              fontSize: 48,
              fontWeight: 900,
            }}
          >
            {a}
          </div>
          <span style={{ fontSize: 48 }}>💕</span>
          <div
            style={{
              padding: "16px 32px",
              borderRadius: 16,
              background: "rgba(236,72,153,0.2)",
              border: "2px solid rgba(236,72,153,0.4)",
              color: "#f472b6",
              fontSize: 48,
              fontWeight: 900,
            }}
          >
            {b}
          </div>
        </div>

        {/* 점수 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 96, fontWeight: 900, color: "#f472b6" }}>{score}</span>
          <span style={{ fontSize: 48, fontWeight: 700, color: "rgba(244,114,182,0.6)" }}>점</span>
        </div>

        {/* 티어 이모지 + 미리보기 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 32 }}>{tierEmoji}</span>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", maxWidth: 600 }}>{previewShort}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
