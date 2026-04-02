/**
 * 랜딩 페이지 ("/")
 *
 * 첫 방문자에게 ChemiFit의 3가지 기능을 소개하고 자연스럽게 유도.
 * (tabs) 레이아웃 바깥이므로 MbtiProvider 없이 동작하는 Server Component.
 * SEO 내부 링크 역할도 수행 (인기 조합 + 16 유형 그리드).
 */
import Link from "next/link";
import { MBTI_TYPES, COMPATIBILITY } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import { SITE } from "@/data/ui-text";
import SiteFooter from "@/components/SiteFooter";

/** 상위 5개 궁합 조합을 추출 (중복 없이, 예: INTJ-ENFP와 ENFP-INTJ는 동일) */
function getTopCouples(count: number) {
  const seen = new Set<string>();
  const pairs: { a: MbtiType; b: MbtiType; score: number }[] = [];

  for (const a of MBTI_TYPES) {
    for (const b of MBTI_TYPES) {
      if (a === b) continue;
      const key = [a, b].sort().join("-");
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ a, b, score: COMPATIBILITY[a][b] });
    }
  }

  return pairs.sort((x, y) => y.score - x.score).slice(0, count);
}

const FEATURES = [
  {
    emoji: "💕",
    title: "연인 궁합",
    desc: "256가지 MBTI 조합의 연애 궁합 점수, 싸움 패턴, 해결법까지",
    href: "/mbti-love",
    rgb: "236,72,153",
  },
  {
    emoji: "🌐",
    title: "궁합 맵",
    desc: "16타입 궁합 순위를 네트워크 그래프로 한눈에",
    href: "/mbti-map",
    rgb: "168,85,247",
  },
  {
    emoji: "👥",
    title: "그룹 궁합",
    desc: "2~8명의 MBTI로 팀 케미와 역할까지 분석",
    href: "/group-match",
    rgb: "0,203,255",
  },
] as const;

export default function LandingPage() {
  const topCouples = getTopCouples(5);

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col gap-16">
        {/* ── Hero ── */}
        <section className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-30"
              style={{ background: "radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.2) 50%, transparent 80%)" }}
            />
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              MBTI 궁합,{" "}
              <span style={{ color: "#f472b6", textShadow: "0 0 20px rgba(236,72,153,0.5)" }}>한눈에</span>
            </h1>
          </div>
          <p className="text-base sm:text-lg text-white/60 max-w-md">
            연인 궁합부터 그룹 케미까지. 256가지 MBTI 조합을 점수, 그래프, 상세 분석으로 확인하세요.
          </p>
          <Link
            href="/mbti-love"
            className="neon-action px-8 py-3.5 rounded-xl text-base font-bold"
            style={{ "--neon": "236,72,153" } as React.CSSProperties}
          >
            지금 궁합 확인하기
          </Link>
          <p className="text-xs text-white/30">{SITE.subtitle}</p>
        </section>

        {/* ── 3가지 기능 소개 ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center text-white/80">무엇을 할 수 있나요?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="rounded-xl p-6 flex flex-col gap-3 transition-transform hover:scale-[1.02]"
                style={{
                  background: `rgba(${f.rgb},0.06)`,
                  border: `1px solid rgba(${f.rgb},0.2)`,
                }}
              >
                <span className="text-3xl">{f.emoji}</span>
                <h3 className="text-base font-bold" style={{ color: `rgb(${f.rgb})` }}>{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 인기 궁합 TOP 5 ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center text-white/80">인기 궁합 TOP 5</h2>
          <div className="flex flex-col gap-3">
            {topCouples.map(({ a, b, score }, i) => (
              <Link
                key={`${a}-${b}`}
                href={`/mbti-love/${a.toLowerCase()}/${b.toLowerCase()}`}
                className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/5"
                style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.1)" }}
              >
                <span className="text-lg font-black text-white/30 w-6 text-center">{i + 1}</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-bold" style={{ color: "#c084fc" }}>{a}</span>
                  <span className="text-white/30">×</span>
                  <span className="font-bold" style={{ color: "#f472b6" }}>{b}</span>
                </div>
                <span className="text-lg font-black" style={{ color: "#f472b6" }}>{score}점</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 16 MBTI 유형 그리드 ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center text-white/80">16가지 MBTI 유형</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {MBTI_TYPES.map((type) => (
              <Link
                key={type}
                href={`/mbti-profiles/${type.toLowerCase()}`}
                className="rounded-xl py-3 text-center text-sm font-bold transition-colors hover:bg-white/10"
                style={{ background: "rgba(102,237,195,0.06)", border: "1px solid rgba(102,237,195,0.15)", color: "rgba(255,255,255,0.7)" }}
              >
                {type}
              </Link>
            ))}
          </div>
        </section>

        {/* ── 하단 CTA ── */}
        <section className="flex flex-col items-center gap-4 text-center">
          <p className="text-base text-white/50">무료로 시작하세요</p>
          <Link
            href="/mbti-love"
            className="neon-action px-8 py-3.5 rounded-xl text-base font-bold"
            style={{ "--neon": "236,72,153" } as React.CSSProperties}
          >
            궁합 테스트 시작
          </Link>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
