import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/metadata";
import { MBTI_TYPES } from "@/data/compatibility";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  /** 메인 페이지 */
  const mainPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/mbti-love`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/mbti-map`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/group-match`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/mbti-profiles`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  /** 16개 MBTI 유형 프로필 페이지 */
  const profilePages: MetadataRoute.Sitemap = MBTI_TYPES.map((type) => ({
    url: `${SITE_URL}/mbti-profiles/${type.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  /** 256개 커플 궁합 정적 페이지 */
  const couplePages: MetadataRoute.Sitemap = MBTI_TYPES.flatMap((typeA) =>
    MBTI_TYPES.map((typeB) => ({
      url: `${SITE_URL}/mbti-love/${typeA.toLowerCase()}/${typeB.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...mainPages, ...profilePages, ...couplePages];
}
