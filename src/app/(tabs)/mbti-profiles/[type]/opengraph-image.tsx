/**
 * MBTI 유형 프로필 동적 OG 이미지
 *
 * 각 MBTI 유형별 1200x630 OG 이미지를 빌드 타임에 생성.
 */
import { ImageResponse } from "next/og";
import { MBTI_TYPES } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import { TYPE_PROFILES } from "@/data/type-profiles";

export const alt = "ChemiFit MBTI 유형 설명";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return MBTI_TYPES.map((type) => ({ type: type.toLowerCase() }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const mbtiType = type.toUpperCase() as MbtiType;
  const profile = TYPE_PROFILES[mbtiType];

  if (!profile) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a", color: "white", fontSize: 48 }}>
        ChemiFit
      </div>,
      { ...size },
    );
  }

  const tags = profile.tags.slice(0, 4);

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
          background: "linear-gradient(135deg, #0f0f1a 0%, #0a1e2e 50%, #0f0f1a 100%)",
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
            background: "radial-gradient(circle, rgba(102,237,195,0.12) 0%, transparent 70%)",
          }}
        />

        {/* 로고 */}
        <div style={{ display: "flex", marginBottom: 24 }}>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.5)" }}>ChemiFit</span>
        </div>

        {/* MBTI 타입 */}
        <div
          style={{
            padding: "20px 48px",
            borderRadius: 20,
            background: "rgba(102,237,195,0.15)",
            border: "2px solid rgba(102,237,195,0.3)",
            color: "#66edc3",
            fontSize: 72,
            fontWeight: 900,
            marginBottom: 20,
          }}
        >
          {mbtiType}
        </div>

        {/* 닉네임 */}
        <div style={{ fontSize: 36, fontWeight: 700, color: "white", marginBottom: 20, maxWidth: 800, textAlign: "center" }}>
          {profile.nickname}
        </div>

        {/* 태그 */}
        <div style={{ display: "flex", gap: 12 }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: 12,
                background: "rgba(102,237,195,0.1)",
                border: "1px solid rgba(102,237,195,0.2)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 20,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
