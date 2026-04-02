/**
 * 랜딩 페이지 ("/")
 *
 * 첫 방문자에게 ChemiFit의 기능을 소개하고 자연스럽게 유도.
 * (tabs) 레이아웃 바깥이므로 MbtiProvider 없이 동작하는 Server Component.
 * SEO 내부 링크 역할도 수행 (인기 조합 + 16 유형 그리드).
 */
import Link from "next/link";
import Image from "next/image";
import { MBTI_TYPES, COMPATIBILITY } from "@/data/compatibility";
import type { MbtiType } from "@/data/compatibility";
import { TYPE_PROFILES } from "@/data/type-profiles";
import { COUPLE_TIERS } from "@/data/labels";
import { SITE } from "@/data/ui-text";
import SiteFooter from "@/components/SiteFooter";

/** 상위 5개 궁합 조합을 추출 (중복 없이) */
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

function getTierEmoji(score: number): string {
  const tier = COUPLE_TIERS.find((t) => score >= t.min) ?? COUPLE_TIERS[COUPLE_TIERS.length - 1];
  return tier.emoji;
}

/** MBTI 그룹 색상 */
const GROUP_COLORS: Record<string, string> = {
  NT: "168,85,247",   // 분석가 — 보라
  NF: "236,72,153",   // 외교관 — 핑크
  SJ: "0,203,255",    // 관리자 — 시안
  SP: "102,237,195",  // 탐험가 — 민트
};

function getMbtiGroup(type: MbtiType): string {
  const s = type[1]; // S or N
  const j = type[3]; // J or P
  if (s === "N" && (type[2] === "T")) return "NT";
  if (s === "N" && (type[2] === "F")) return "NF";
  if (s === "S" && j === "J") return "SJ";
  return "SP";
}

const FEATURES = [
  {
    emoji: "💕",
    title: "연인 궁합",
    desc: "나와 상대의 MBTI로 연애 궁합 점수, 싸움 패턴, 해결법까지 상세 분석",
    href: "/mbti-love",
    rgb: "236,72,153",
    stats: "256가지 조합",
  },
  {
    emoji: "🌐",
    title: "궁합 맵",
    desc: "내 MBTI와 16타입의 궁합 순위를 네트워크 그래프로 시각화",
    href: "/mbti-map",
    rgb: "168,85,247",
    stats: "16타입 순위",
  },
  {
    emoji: "👥",
    title: "그룹 궁합",
    desc: "2~8명의 MBTI로 그룹 케미, 최고/최악 조합, 팀 역할까지 분석",
    href: "/group-match",
    rgb: "0,203,255",
    stats: "팀 역할 분석",
  },
] as const;

export default function LandingPage() {
  const topCouples = getTopCouples(5);

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white overflow-hidden">
      {/* ── 배경 글로우 (페이지 전체에 깔리는 조명 효과) ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 60%)" }} />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,203,255,0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 pt-12 pb-8 flex flex-col gap-20">

        {/* ══════════════════════════════════════════════════════
            Hero Section
           ══════════════════════════════════════════════════════ */}
        <section className="flex flex-col items-center gap-8 pt-8 sm:pt-16">
          {/* 로고 */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image src="/chemifit.svg" alt="ChemiFit 로고" width={180} height={60} priority />
          </Link>

          {/* 헤드라인 */}
          <div className="relative text-center">
            <div className="absolute inset-0 -z-10 blur-[100px] opacity-40"
              style={{ background: "radial-gradient(ellipse at center, rgba(236,72,153,0.5) 0%, rgba(168,85,247,0.3) 50%, transparent 80%)" }} />
            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
              <span className="block sm:inline">MBTI 궁합,</span>{" "}
              <span
                className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                style={{ textShadow: "0 0 60px rgba(236,72,153,0.3)" }}
              >
                한눈에
              </span>
            </h1>
          </div>

          <p className="text-base sm:text-lg text-white/50 max-w-lg text-center leading-relaxed">
            연인 궁합부터 그룹 케미까지.
            <br className="sm:hidden" />{" "}
            256가지 MBTI 조합을
            <br className="sm:hidden" />{" "}
            점수 · 그래프 · 상세 분석으로
          </p>

          {/* CTA */}
          <Link
            href="/mbti-love"
            className="px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
            style={{
              background: "rgba(236,72,153,0.15)",
              border: "1.5px solid rgba(236,72,153,0.55)",
              color: "#f9a8d4",
              boxShadow: "0 0 20px rgba(236,72,153,0.3), 0 0 50px rgba(236,72,153,0.15), 0 0 100px rgba(236,72,153,0.08)",
            }}
          >
            지금 궁합 확인하기
          </Link>

          <p className="text-xs text-white/25">{SITE.subtitle}</p>
        </section>

        {/* ══════════════════════════════════════════════════════
            Features Section — 3가지 기능
           ══════════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black">
              <span className="text-white/90">무엇을 할 수 있나요?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative rounded-2xl p-6 sm:p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: `rgba(${f.rgb},0.06)`,
                  border: `1.5px solid rgba(${f.rgb},0.25)`,
                  boxShadow: `0 0 15px rgba(${f.rgb},0.1), 0 0 40px rgba(${f.rgb},0.05)`,
                }}
              >
                {/* 호버 글로우 */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `0 0 25px rgba(${f.rgb},0.25), 0 0 60px rgba(${f.rgb},0.12)` }} />

                <div className="relative z-10 flex flex-col gap-3">
                  <span className="text-4xl">{f.emoji}</span>
                  <div>
                    <h3 className="text-lg font-black mb-1" style={{ color: `rgb(${f.rgb})` }}>{f.title}</h3>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: `rgba(${f.rgb},0.15)`, color: `rgba(${f.rgb},0.9)` }}
                    >
                      {f.stats}
                    </span>
                  </div>
                  <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            Best Couples — 인기 궁합 TOP 5
           ══════════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white/90">베스트 궁합 TOP 5</h2>
            <p className="text-sm text-white/35 mt-2">가장 높은 점수를 받은 MBTI 조합</p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(236,72,153,0.05)",
              border: "1.5px solid rgba(236,72,153,0.2)",
              boxShadow: "0 0 20px rgba(236,72,153,0.1), 0 0 50px rgba(236,72,153,0.05)",
            }}
          >
            {topCouples.map(({ a, b, score }, i) => (
              <Link
                key={`${a}-${b}`}
                href={`/mbti-love/${a.toLowerCase()}/${b.toLowerCase()}`}
                className="flex items-center gap-4 px-5 sm:px-6 py-4 transition-all duration-200 hover:bg-white/[0.03]"
                style={{ borderBottom: i < 4 ? "1px solid rgba(236,72,153,0.08)" : "none" }}
              >
                {/* 순위 */}
                <span
                  className="text-2xl font-black w-8 text-center shrink-0"
                  style={{
                    color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.2)",
                    textShadow: i < 3 ? `0 0 12px rgba(${i === 0 ? "251,191,36" : i === 1 ? "148,163,184" : "205,127,50"},0.5)` : "none",
                  }}
                >
                  {i + 1}
                </span>

                {/* MBTI 뱃지 쌍 */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-black shrink-0"
                    style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc" }}
                  >
                    {a}
                  </span>
                  <span className="text-white/20 text-xs">×</span>
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-black shrink-0"
                    style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.3)", color: "#f472b6" }}
                  >
                    {b}
                  </span>
                </div>

                {/* 점수 + 티어 */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg">{getTierEmoji(score)}</span>
                  <span
                    className="text-xl font-black tabular-nums"
                    style={{ color: "#f472b6", textShadow: "0 0 10px rgba(236,72,153,0.4)" }}
                  >
                    {score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            16 MBTI Types Grid
           ══════════════════════════════════════════════════════ */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white/90">16가지 MBTI 유형</h2>
            <p className="text-sm text-white/35 mt-2">클릭하면 성격 특징, 장단점, 궁합을 확인할 수 있어요</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MBTI_TYPES.map((type) => {
              const group = getMbtiGroup(type);
              const rgb = GROUP_COLORS[group];
              const profile = TYPE_PROFILES[type];
              return (
                <Link
                  key={type}
                  href={`/mbti-profiles/${type.toLowerCase()}`}
                  className="group relative rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: `rgba(${rgb},0.06)`,
                    border: `1px solid rgba(${rgb},0.2)`,
                    boxShadow: `0 0 12px rgba(${rgb},0.06)`,
                  }}
                >
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 20px rgba(${rgb},0.25), 0 0 50px rgba(${rgb},0.1)` }} />
                  <div className="relative z-10">
                    <span className="text-base font-black" style={{ color: `rgb(${rgb})` }}>{type}</span>
                    <p className="text-[11px] text-white/35 mt-1 leading-snug line-clamp-2">
                      {profile.nickname}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            Bottom CTA
           ══════════════════════════════════════════════════════ */}
        <section className="flex flex-col items-center gap-6 py-8">
          <div className="relative text-center">
            <div className="absolute inset-0 -z-10 blur-[80px] opacity-20"
              style={{ background: "radial-gradient(ellipse, rgba(236,72,153,0.5), transparent 70%)" }} />
            <p className="text-xl sm:text-2xl font-bold text-white/60">
              나의 MBTI 궁합이 궁금하다면
            </p>
          </div>
          <Link
            href="/mbti-love"
            className="px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
            style={{
              background: "rgba(236,72,153,0.15)",
              border: "1.5px solid rgba(236,72,153,0.55)",
              color: "#f9a8d4",
              boxShadow: "0 0 20px rgba(236,72,153,0.3), 0 0 50px rgba(236,72,153,0.15), 0 0 100px rgba(236,72,153,0.08)",
            }}
          >
            궁합 테스트 시작하기
          </Link>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
