/**
 * 커플 궁합 정적 페이지 레이아웃 — 쌍별 동적 SEO
 *
 * generateMetadata로 256개 조합에 대해 고유 title/description/keywords 생성.
 * 예: "INTJ와 ENFP 연애 궁합 - 98점 | ChemiFit"
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/lib/json-ld";
import { SITE_URL, SITE_NAME } from "@/data/metadata";
import { MBTI_TYPES, COMPATIBILITY } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import { LOVE_DESC } from "@/features/mbti-love/consts/love-descriptions";

type Props = {
  params: Promise<{ typeA: string; typeB: string }>;
  children: ReactNode;
};

function validateTypes(typeA: string, typeB: string): { a: MbtiType; b: MbtiType } | null {
  const a = typeA.toUpperCase() as MbtiType;
  const b = typeB.toUpperCase() as MbtiType;
  if (!MBTI_TYPES.includes(a) || !MBTI_TYPES.includes(b)) return null;
  return { a, b };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ typeA: string; typeB: string }>;
}): Promise<Metadata> {
  const { typeA, typeB } = await params;
  const types = validateTypes(typeA, typeB);
  if (!types) return {};

  const { a, b } = types;
  const score = COMPATIBILITY[a][b];
  const desc = LOVE_DESC[a]?.[b];
  const preview = desc?.preview ?? `${a}와 ${b}의 연애 궁합을 확인하세요.`;

  const title = `${a}와 ${b} 연애 궁합 - ${score}점`;
  const description = `${a}와 ${b}의 MBTI 연애 궁합 ${score}점. ${preview}`;
  const canonical = `/mbti-love/${typeA.toLowerCase()}/${typeB.toLowerCase()}`;

  return {
    title,
    description,
    keywords: [
      `${a} ${b} 궁합`,
      `${a} ${b} 연애`,
      `${b} ${a} 궁합`,
      `MBTI 연애 궁합`,
      `${a} 궁합`,
      `${b} 궁합`,
      "MBTI 커플 궁합",
    ],
    alternates: { canonical },
    openGraph: {
      title: `${title} | ChemiFit`,
      description,
      url: canonical,
      type: "article",
      locale: "ko_KR",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ChemiFit`,
      description,
    },
  };
}

export default async function CoupleStaticLayout({ params, children }: Props) {
  const { typeA, typeB } = await params;
  const types = validateTypes(typeA, typeB);
  if (!types) notFound();

  const { a, b } = types;
  const pageUrl = `${SITE_URL}/mbti-love/${typeA.toLowerCase()}/${typeB.toLowerCase()}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "ChemiFit", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "연애 궁합", item: `${SITE_URL}/mbti-love` },
            { "@type": "ListItem", position: 3, name: `${a} × ${b}`, item: pageUrl },
          ],
        }}
      />
      {children}
    </>
  );
}
