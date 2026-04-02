/**
 * 커플 궁합 정적 페이지 — SEO용 256개 조합
 *
 * URL: /mbti-love/intj/enfp → params = { typeA: "intj", typeB: "enfp" }
 * generateStaticParams로 16×16 = 256개 정적 페이지를 빌드 타임에 생성.
 *
 * Server Component — MbtiContext나 클라이언트 훅을 사용하지 않는다.
 * 인터랙티브 버전은 /mbti-love?mbti=INTJ&partner=ENFP 에서 제공.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { MBTI_TYPES, COMPATIBILITY } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import { LOVE_DESC } from "@/features/mbti-love/consts/love-descriptions";
import { COUPLE_TIERS } from "@/data/labels";
import { getCategoryScores } from "@/features/mbti-love/consts/categories";
import StaticCoupleResult from "./StaticCoupleResult";

export function generateStaticParams() {
  return MBTI_TYPES.flatMap((a) =>
    MBTI_TYPES.map((b) => ({
      typeA: a.toLowerCase(),
      typeB: b.toLowerCase(),
    })),
  );
}

/** 점수에 해당하는 티어 이모지를 반환 (랜덤 라벨 없이 첫 번째 라벨 사용) */
function getStaticTier(score: number) {
  const tier = COUPLE_TIERS.find((t) => score >= t.min) ?? COUPLE_TIERS[COUPLE_TIERS.length - 1];
  return { emoji: tier.emoji, label: tier.labels[0] };
}

type Props = {
  params: Promise<{ typeA: string; typeB: string }>;
};

export default async function CoupleStaticPage({ params }: Props) {
  const { typeA, typeB } = await params;
  const a = typeA.toUpperCase() as MbtiType;
  const b = typeB.toUpperCase() as MbtiType;

  if (!MBTI_TYPES.includes(a) || !MBTI_TYPES.includes(b)) {
    notFound();
  }

  const score = COMPATIBILITY[a][b];
  const loveDesc = LOVE_DESC[a]?.[b];
  const tier = getStaticTier(score);
  const categories = getCategoryScores(a, b, score);

  return (
    <div className="flex flex-col gap-8">
      <StaticCoupleResult
        typeA={a}
        typeB={b}
        score={score}
        tier={tier}
        loveDesc={loveDesc}
        categories={categories}
      />

      {/* 인터랙티브 버전 CTA + 다른 조합 탐색 */}
      <div className="flex flex-col gap-4">
        <Link
          href={`/mbti-love?mbti=${a}&partner=${b}`}
          className="neon-action w-full py-3 rounded-xl text-sm font-bold text-center"
          style={{ "--neon": "236,72,153" } as React.CSSProperties}
        >
          직접 체험하기 →
        </Link>

        {/* 관련 조합 탐색 링크 (내부 링크 SEO) */}
        <div className="rounded-xl p-5" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm font-bold text-white/70 mb-3">{a}의 다른 궁합</p>
          <div className="flex flex-wrap gap-2">
            {MBTI_TYPES.filter((t) => t !== b).map((t) => (
              <Link
                key={t}
                href={`/mbti-love/${typeA}/${t.toLowerCase()}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-white/10"
                style={{ background: "rgba(168,85,247,0.1)", color: "rgba(255,255,255,0.7)" }}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)" }}>
          <p className="text-sm font-bold text-white/70 mb-3">{b}의 다른 궁합</p>
          <div className="flex flex-wrap gap-2">
            {MBTI_TYPES.filter((t) => t !== a).map((t) => (
              <Link
                key={t}
                href={`/mbti-love/${t.toLowerCase()}/${typeB}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-white/10"
                style={{ background: "rgba(236,72,153,0.1)", color: "rgba(255,255,255,0.7)" }}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
