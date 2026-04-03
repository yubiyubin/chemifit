import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/metadata";
import { MBTI_TYPES } from "@/data/compatibility";

/**
 * 날짜 상수: 콘텐츠를 대규모로 업데이트할 때만 변경.
 * `new Date()` 대신 고정값을 사용하여 매 빌드마다 sitemap이 변경되는 것을 방지.
 */
const MAIN_UPDATED = new Date("2025-04-01");
const CONTENT_UPDATED = new Date("2025-04-01");

export default function sitemap(): MetadataRoute.Sitemap {
  /** 메인 페이지 */
  const mainPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: MAIN_UPDATED, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/mbti-love`, lastModified: MAIN_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/mbti-map`, lastModified: MAIN_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/group-match`, lastModified: MAIN_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/mbti-profiles`, lastModified: MAIN_UPDATED, changeFrequency: "monthly", priority: 0.8 },
  ];

  /** 16개 MBTI 유형 프로필 페이지 */
  const profilePages: MetadataRoute.Sitemap = MBTI_TYPES.map((type) => ({
    url: `${SITE_URL}/mbti-profiles/${type.toLowerCase()}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  /** 256개 커플 궁합 정적 페이지 */
  const couplePages: MetadataRoute.Sitemap = MBTI_TYPES.flatMap((typeA) =>
    MBTI_TYPES.map((typeB) => ({
      url: `${SITE_URL}/mbti-love/${typeA.toLowerCase()}/${typeB.toLowerCase()}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...mainPages, ...profilePages, ...couplePages];
}
