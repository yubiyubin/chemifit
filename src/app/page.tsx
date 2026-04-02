/**
 * 랜딩 페이지 ("/")
 *
 * 첫 방문자에게 ChemiFit의 기능을 소개하고 자연스럽게 유도.
 * (tabs) 레이아웃 바깥이므로 MbtiProvider 없이 동작하는 Server Component.
 * SEO 내부 링크 역할도 수행 (인기 조합 + 16 유형 그리드).
 */
import Link from "next/link";
import Image from "next/image";
import { TYPE_PROFILES } from "@/data/type-profiles";
import { MBTI_GROUPS } from "@/data/groups";
import { SITE } from "@/data/ui-text";
import SiteFooter from "@/components/SiteFooter";
import ScrollReveal from "@/components/ScrollReveal";

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
    desc: "16타입 궁합 순위를 네트워크 그래프로 시각화",
    href: "/mbti-map",
    rgb: "168,85,247",
    stats: "16타입 순위",
  },
  {
    emoji: "👥",
    title: "그룹 궁합",
    desc: "2~8명의 MBTI로 그룹 케미와 팀 역할까지 분석",
    href: "/group-match",
    rgb: "0,203,255",
    stats: "팀 역할 분석",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white overflow-hidden">

      {/* ── 배경: 움직이는 네온 오브 + 노이즈 텍스처 ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-[-15%] left-[50%] -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-[0.14]"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,1) 0%, transparent 60%)", animation: "float-orb 25s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[-5%] left-[15%] w-[700px] h-[700px] rounded-full opacity-[0.10]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,1) 0%, transparent 55%)", animation: "float-orb 30s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-[35%] right-[-8%] w-[600px] h-[600px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, rgba(0,203,255,1) 0%, transparent 55%)", animation: "float-orb 22s ease-in-out infinite 5s" }}
        />
        {/* 노이즈 텍스처 오버레이 */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "128px 128px" }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-8 flex flex-col">

        {/* ══════════════════════════════════════════════════════
            Hero Section
           ══════════════════════════════════════════════════════ */}
        <section className="flex flex-col items-center gap-8 pt-12 sm:pt-20 pb-20">
          {/* 로고 */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image src="/chemifit.svg" alt="ChemiFit 로고" width={200} height={65} priority />
          </Link>

          {/* 네온 구분선 */}
          <div className="w-16 h-[2px] rounded-full" style={{ background: "rgba(236,72,153,0.6)", boxShadow: "0 0 12px rgba(236,72,153,0.5), 0 0 30px rgba(236,72,153,0.2)" }} />

          {/* 헤드라인 */}
          <div className="relative text-center">
            <h1 className="text-5xl sm:text-7xl font-black leading-tight tracking-tight">
              <span className="block sm:inline text-white/95">MBTI 궁합,</span>
              <br className="hidden sm:block" />{" "}
              {/* 그라디언트 텍스트 + 복제 글로우 */}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
                  한눈에
                </span>
                {/* blur된 복제본으로 실제 글로우 효과 */}
                <span
                  className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent blur-2xl opacity-60"
                  aria-hidden="true"
                >
                  한눈에
                </span>
              </span>
            </h1>
          </div>

          <p className="text-base sm:text-lg text-white/45 max-w-md text-center leading-relaxed">
            연인 궁합부터 그룹 케미까지
            <br />
            256가지 MBTI 조합을 점수 · 그래프 · 상세 분석으로
          </p>

          {/* CTA — 네온 맥동 */}
          <Link
            href="/mbti-love"
            className="px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
            style={{
              background: "rgba(236,72,153,0.15)",
              border: "1.5px solid rgba(236,72,153,0.55)",
              color: "#f9a8d4",
              animation: "cta-glow 3s ease-in-out infinite",
            }}
          >
            지금 궁합 확인하기
          </Link>

          <p className="text-xs text-white/20">{SITE.subtitle}</p>
        </section>

        {/* 섹션 디바이더 */}
        <div className="w-full h-px mx-auto mb-16"
          style={{ background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.3), rgba(168,85,247,0.3), rgba(0,203,255,0.3), transparent)" }}
        />

        {/* ══════════════════════════════════════════════════════
            Features — 비대칭 레이아웃 (1 큰 + 2 작은)
           ══════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <section className="flex flex-col gap-6 mb-20">
            <h2 className="text-2xl sm:text-3xl font-black text-center text-white/90">
              무엇을 할 수 있나요?
            </h2>

            {/* 메인: 연인 궁합 — 풀 너비 */}
            <div className="flex flex-col gap-3">
              <Link
                href={FEATURES[0].href}
                className="neon-action flex items-center gap-5 rounded-2xl px-6 py-5 sm:py-6 no-underline"
                style={{ "--neon": FEATURES[0].rgb } as React.CSSProperties}
              >
                <span className="text-4xl shrink-0">{FEATURES[0].emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base sm:text-lg font-black" style={{ color: `rgb(${FEATURES[0].rgb})` }}>{FEATURES[0].title}</span>
                    <span className="text-[10px] font-bold text-white/30">{FEATURES[0].stats}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/40 mt-1 leading-relaxed">{FEATURES[0].desc}</p>
                </div>
                <span className="text-white/20 text-sm shrink-0">→</span>
              </Link>

              {/* 서브: 궁합맵 + 그룹궁합 — 반반 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.slice(1).map((f) => (
                  <Link
                    key={f.href}
                    href={f.href}
                    className="neon-action flex items-center gap-5 rounded-2xl px-6 py-5 sm:py-6 no-underline"
                    style={{ "--neon": f.rgb } as React.CSSProperties}
                  >
                    <span className="text-4xl shrink-0">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base sm:text-lg font-black" style={{ color: `rgb(${f.rgb})` }}>{f.title}</span>
                        <span className="text-[10px] font-bold text-white/30">{f.stats}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/40 mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                    <span className="text-white/20 text-sm shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* 섹션 디바이더 */}
        <div className="w-full h-px mx-auto mb-16"
          style={{ background: "linear-gradient(90deg, transparent, rgba(102,237,195,0.2), rgba(0,203,255,0.2), transparent)" }}
        />

        {/* ══════════════════════════════════════════════════════
            16 MBTI Types — 그룹별 정리
           ══════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <section className="flex flex-col gap-6 mb-20">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white/90">16가지 MBTI 유형</h2>
              <p className="text-sm text-white/30 mt-2">클릭하면 성격 특징, 장단점, 궁합을 확인할 수 있어요</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MBTI_GROUPS.map((group, gi) => (
                <ScrollReveal key={group.key} delay={gi * 100}>
                  <div
                    className="rounded-2xl p-4 sm:p-5"
                    style={{
                      background: `rgba(${group.rgb},0.04)`,
                      border: `1px solid rgba(${group.rgb},0.15)`,
                    }}
                  >
                    {/* 그룹 라벨 */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-xs font-black tracking-wider" style={{ color: `rgb(${group.rgb})` }}>{group.key}</span>
                      <span className="text-[11px] text-white/30 font-bold">{group.label}</span>
                      <div className="flex-1 h-px ml-1" style={{ background: `rgba(${group.rgb},0.15)` }} />
                    </div>

                    {/* 4개 MBTI 타입 */}
                    <div className="grid grid-cols-2 gap-2">
                      {group.types.map((type) => {
                        const profile = TYPE_PROFILES[type];
                        return (
                          <Link
                            key={type}
                            href={`/mbti-profiles/${type.toLowerCase()}`}
                            className="group relative rounded-xl p-3 flex flex-col gap-1 transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                              background: `rgba(${group.rgb},0.06)`,
                              border: `1px solid rgba(${group.rgb},0.12)`,
                            }}
                          >
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ boxShadow: `0 0 18px rgba(${group.rgb},0.2), 0 0 40px rgba(${group.rgb},0.08)` }} />
                            <div className="relative z-10">
                              <span className="text-sm font-black" style={{ color: `rgb(${group.rgb})` }}>{type}</span>
                              <p className="text-[10px] text-white/30 mt-0.5 leading-snug line-clamp-1">
                                {profile.nickname}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* 섹션 디바이더 */}
        <div className="w-full h-px mx-auto mb-12"
          style={{ background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.15), transparent)" }}
        />

        {/* ══════════════════════════════════════════════════════
            Bottom CTA — 풀폭 배너 스타일
           ══════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <section className="mb-8">
            <div
              className="relative rounded-2xl p-10 sm:p-14 flex flex-col items-center gap-6 text-center overflow-hidden"
              style={{
                background: "rgba(236,72,153,0.05)",
                border: "1.5px solid rgba(236,72,153,0.2)",
                boxShadow: "0 0 40px rgba(236,72,153,0.08)",
              }}
            >
              {/* 배경 글로우 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 60%)" }} />

              <p className="relative z-10 text-xl sm:text-2xl font-black text-white/70">
                나의 MBTI 궁합이 궁금하다면
              </p>
              <p className="relative z-10 text-sm text-white/30 -mt-2">
                256가지 조합 중 나의 궁합을 찾아보세요
              </p>
              <Link
                href="/mbti-love"
                className="relative z-10 px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                style={{
                  background: "rgba(236,72,153,0.15)",
                  border: "1.5px solid rgba(236,72,153,0.55)",
                  color: "#f9a8d4",
                  animation: "cta-glow 3s ease-in-out infinite 1.5s",
                }}
              >
                궁합 테스트 시작하기
              </Link>
            </div>
          </section>
        </ScrollReveal>
      </div>

      <SiteFooter />
    </main>
  );
}
