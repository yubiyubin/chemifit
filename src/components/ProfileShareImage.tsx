/**
 * ProfileShareImage — MBTI 유형 RPG 스탯 시트 공유 이미지
 *
 * 1080x1350 캐릭터 스탯 시트 스타일.
 * MBTI 4개 차원(E/I, S/N, T/F, J/P)을 기반으로 8개 능력치를 산출하여 표시.
 */
import type React from "react";
import type { MbtiProfile } from "@/data/type-profiles";
import { SHARE_IMAGE } from "@/data/ui-text";
import { useShareImageSetup } from "./useShareImageSetup";
import {
  BARCODE_HEIGHTS,
  SI_LOGO,
  SI_SUB,
  SI_HERO_PADDING,
  SI_HERO_TYPE_BASE,
  SI_HERO_TITLE_BASE,
  SI_SEP_D,
  SI_SEP_DB,
  SI_CARD_BG,
  SI_NOISE_URL,
  SI_RECEIPT_BG,
} from "./shareImageTokens";

/** 능력치 정의: MBTI 차원별 가중치로 점수 산출 + 점수 구간별 한 줄 설명 */
const STAT_DEFS = [
  { name: "리더십", emoji: "⚔️", weights: { E: 30, I: 5, N: 5, S: 5, T: 10, F: 5, J: 15, P: 5 },
    descs: { high: "팀 동기부여의 신", mid: "필요할 때 나서는 편", low: "뒤에서 서포트 선호" } },
  { name: "추진력", emoji: "🎯", weights: { E: 15, I: 5, N: 10, S: 5, T: 15, F: 5, J: 25, P: 5 },
    descs: { high: "그림 그리고 바로 실행", mid: "동기 있으면 밀어붙임", low: "흐름에 맡기는 스타일" } },
  { name: "논리력", emoji: "🧠", weights: { E: 5, I: 10, N: 20, S: 5, T: 30, F: 0, J: 5, P: 5 },
    descs: { high: "복잡할수록 빠른 판단", mid: "논리+감각 밸런스형", low: "직감으로 먼저 느끼는 편" } },
  { name: "효율성", emoji: "⚡", weights: { E: 5, I: 5, N: 5, S: 10, T: 20, F: 5, J: 25, P: 5 },
    descs: { high: "'개선안 세 가지' 자동생성", mid: "나름 체계적으로 처리", low: "과정도 즐기는 타입 🌿" } },
  { name: "창의력", emoji: "🎨", weights: { E: 5, I: 10, N: 30, S: 0, T: 5, F: 10, J: 0, P: 20 },
    descs: { high: "상상력 멈출 수 없음", mid: "전략적 창의성은 높음", low: "검증된 방법이 편함 📋" } },
  { name: "감수성", emoji: "💗", weights: { E: 5, I: 10, N: 10, S: 5, T: 0, F: 30, J: 5, P: 10 },
    descs: { high: "감정 안테나 항상 ON", mid: "공감은 하는데 표현은 적음", low: "차갑게 보일 때 있음 ❄️" } },
  { name: "사교성", emoji: "🤝", weights: { E: 35, I: 0, N: 5, S: 5, T: 0, F: 10, J: 5, P: 10 },
    descs: { high: "어디서든 분위기 메이커", mid: "목적 있는 네트워킹 장인", low: "소수 정예 인간관계 🔒" } },
  { name: "인내심", emoji: "🕊️", weights: { E: 0, I: 15, N: 5, S: 15, T: 5, F: 5, J: 10, P: 5 },
    descs: { high: "기다림의 달인 🧘", mid: "참을 건 참는 편", low: "느린 사람 보면 답답 💢" } },
] as const;

type MbtiDim = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

function computeStats(mbti: string) {
  const dims: MbtiDim[] = [mbti[0] as MbtiDim, mbti[1] as MbtiDim, mbti[2] as MbtiDim, mbti[3] as MbtiDim];
  return STAT_DEFS.map((def) => {
    const base = 20;
    const bonus = dims.reduce((sum, d) => sum + (def.weights[d] ?? 0), 0);
    const score = Math.min(99, Math.max(10, base + bonus));
    const desc = score >= 75 ? def.descs.high : score >= 45 ? def.descs.mid : def.descs.low;
    return { ...def, score, desc };
  });
}

function getGrade(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: "S", cls: "g-s" };
  if (score >= 75) return { label: "A", cls: "g-a" };
  if (score >= 55) return { label: "B", cls: "g-b" };
  if (score >= 35) return { label: "C", cls: "g-c" };
  return { label: "D", cls: "g-d" };
}

function getBarClass(score: number): string {
  if (score >= 75) return "psf-high";
  if (score >= 55) return "psf-mid";
  if (score >= 35) return "psf-low";
  return "psf-vlow";
}

/** 연애 스타일을 공유 이미지용으로 줄임 — 문장 경계에서 자름 */
function shortenLoveStyle(text: string): string {
  const first = text.split("\n\n")[0];
  if (first.length <= 100) return first;
  // 100자 이내 마지막 문장 끝(. 또는 요)에서 자름
  const cutoff = first.slice(0, 100);
  const lastDot = Math.max(cutoff.lastIndexOf(". "), cutoff.lastIndexOf("요."), cutoff.lastIndexOf("요 "));
  return lastDot > 30 ? first.slice(0, lastDot + 1) + "…" : cutoff + "…";
}

type Props = {
  profile: MbtiProfile;
  cardRef?: React.Ref<HTMLDivElement>;
};

export default function ProfileShareImage({ profile, cardRef }: Props) {
  const wrapRef = useShareImageSetup();
  const stats = computeStats(profile.type);

  return (
    <>
      <style>{`
        .ps-wrap{width:1080px;height:1350px;transform-origin:center center}
        .ps-card{width:1080px;height:1350px;position:relative;overflow:hidden;${SI_CARD_BG}}
        .ps-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 35%,rgba(102,237,195,0.08) 0%,transparent 55%)}
        .ps-orb{position:absolute;border-radius:50%;filter:blur(70px);width:400px;height:400px;background:rgba(102,237,195,0.1);top:250px;left:50%;transform:translateX(-50%)}
        .ps-noise{position:absolute;inset:0;opacity:0.04;background-image:${SI_NOISE_URL}}
        .ps-receipt{position:relative;z-index:2;width:100%;height:100%;${SI_RECEIPT_BG};padding:40px 56px;display:flex;flex-direction:column}
        .ps-mono{font-family:'JetBrains Mono',monospace}
        .ps-sep{border:none;margin:12px 0}
        .ps-sep-d{${SI_SEP_D}}
        .ps-sep-db{${SI_SEP_DB}}
        .ps-header{text-align:center;margin-bottom:4px}
        .ps-logo{${SI_LOGO}}
        .ps-sub{${SI_SUB}}
        .ps-hero{text-align:center;${SI_HERO_PADDING}}
        .ps-hero-type{${SI_HERO_TYPE_BASE};text-shadow:0 0 32px rgba(102,237,195,0.65),0 0 64px rgba(102,237,195,0.25)}
        .ps-hero-title{${SI_HERO_TITLE_BASE}}
        .ps-hero-title em{font-style:normal;background:linear-gradient(90deg,#66edc3,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .ps-sh{font-size:12px;color:rgba(255,255,255,0.12);letter-spacing:3px;text-align:center;margin-bottom:6px}
        .ps-stats{display:flex;flex-direction:column;gap:2px;flex:1}
        .ps-stat{display:flex;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.025)}
        .ps-stat:last-child{border-bottom:none}
        .ps-sn{font-size:15px;color:rgba(255,255,255,0.45);width:120px;flex-shrink:0;display:flex;align-items:center;gap:6px}
        .ps-bar{flex:4;height:10px;border-radius:5px;background:rgba(255,255,255,0.04);overflow:hidden;margin:0 14px}
        .ps-fill{height:100%;border-radius:5px}
        .psf-high{background:linear-gradient(90deg,rgba(52,211,153,0.7),rgba(110,231,183,0.7));box-shadow:0 0 12px rgba(52,211,153,0.35)}
        .psf-mid{background:linear-gradient(90deg,rgba(168,85,247,0.7),rgba(192,132,252,0.7));box-shadow:0 0 12px rgba(168,85,247,0.35)}
        .psf-low{background:linear-gradient(90deg,rgba(251,146,60,0.6),rgba(253,186,116,0.6));box-shadow:0 0 10px rgba(251,146,60,0.25)}
        .psf-vlow{background:linear-gradient(90deg,rgba(248,113,113,0.6),rgba(252,165,165,0.6));box-shadow:0 0 10px rgba(248,113,113,0.25)}
        .ps-sv{font-size:16px;font-weight:700;color:rgba(255,255,255,0.5);width:48px;text-align:right;flex-shrink:0}
        .ps-sg{font-size:13px;font-weight:700;padding:3px 10px;border-radius:4px;width:36px;text-align:center;margin-left:8px}
        .ps-desc{font-size:12px;color:rgba(255,255,255,0.25);margin-left:10px;flex:1;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .g-s{color:#fbbf24;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.12)}
        .g-a{color:#34d399;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.12)}
        .g-b{color:#60a5fa;background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.12)}
        .g-c{color:#fb923c;background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.12)}
        .g-d{color:#f87171;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.12)}
        .ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .ps-gc{border-radius:14px;padding:16px 18px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04)}
        .ps-gl{font-size:12px;letter-spacing:2px;margin-bottom:8px}
        .ps-gl-love{color:rgba(236,72,153,0.4)}
        .ps-gl-fame{color:rgba(255,255,255,0.15)}
        .ps-gl-best{color:rgba(52,211,153,0.5)}
        .ps-gl-worst{color:rgba(248,113,113,0.5)}
        .ps-gt{font-size:13px;color:rgba(255,255,255,0.3);line-height:1.5}
        .ps-types{display:flex;gap:6px;flex-wrap:wrap}
        .ps-tp{padding:5px 14px;border-radius:6px;font-size:14px;font-weight:700;letter-spacing:2px}
        .ps-tp-best{color:#34d399;background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.1)}
        .ps-tp-worst{color:#f87171;background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.1)}
        .ps-names{display:flex;gap:6px;flex-wrap:wrap}
        .ps-nm{font-size:13px;color:rgba(255,255,255,0.28);padding:4px 12px;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);white-space:nowrap}
        .ps-footer{text-align:center;margin-top:auto;padding-top:6px}
        .ps-cta{font-size:14px;color:rgba(255,255,255,0.18);margin-bottom:6px}
        .ps-url{font-size:18px;font-weight:700;color:#66edc3;text-shadow:0 0 12px rgba(102,237,195,0.3);letter-spacing:2px}
        .ps-barcode{margin-top:10px;display:flex;gap:3px;justify-content:center;align-items:flex-end}
        .ps-barcode div{width:3px;background:rgba(255,255,255,0.1);border-radius:1px}
      `}</style>

      <div ref={wrapRef} className="ps-wrap">
        <div className="ps-card" ref={cardRef}>
          <div className="ps-bg" />
          <div className="ps-orb" />
          <div className="ps-noise" />

          <div className="ps-receipt" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* 헤더 */}
            <div className="ps-header ps-mono">
              <div className="ps-logo">CHEMIFIT</div>
              <div className="ps-sub">CHARACTER STAT SHEET</div>
            </div>
            <hr className="ps-sep ps-sep-db" />

            {/* 히어로 */}
            <div className="ps-hero">
              <div className="ps-mono ps-hero-type">{profile.type}</div>
              <div className="ps-hero-title">&ldquo;<em>{profile.nickname}</em>&rdquo;</div>
            </div>
            <hr className="ps-sep ps-sep-d" />

            {/* 능력치 */}
            <div className="ps-mono ps-sh">{SHARE_IMAGE.profileStatsHeader}</div>
            <div className="ps-stats ps-mono">
              {stats.map((stat) => {
                const grade = getGrade(stat.score);
                return (
                  <div key={stat.name} className="ps-stat">
                    <div className="ps-sn">{stat.emoji} {stat.name}</div>
                    <div className="ps-bar">
                      <div className={`ps-fill ${getBarClass(stat.score)}`} style={{ width: `${stat.score}%` }} />
                    </div>
                    <div className="ps-sv">{stat.score}%</div>
                    <div className={`ps-sg ${grade.cls}`}>{grade.label}</div>
                    <div className="ps-desc">{stat.desc}</div>
                  </div>
                );
              })}
            </div>
            <hr className="ps-sep ps-sep-d" />

            {/* 하단 4칸 그리드 */}
            <div className="ps-grid ps-mono">
              <div className="ps-gc">
                <div className="ps-gl ps-gl-love">💘 연애 스타일</div>
                <div className="ps-gt">{shortenLoveStyle(profile.loveStyle)}</div>
              </div>
              <div className="ps-gc">
                <div className="ps-gl ps-gl-fame">⭐ 유명 인물</div>
                <div className="ps-names">
                  {profile.celebrities.slice(0, 4).map((c) => (
                    <div key={c.name} className="ps-nm">{c.name}</div>
                  ))}
                </div>
              </div>
              <div className="ps-gc">
                <div className="ps-gl ps-gl-best">🏆 BEST</div>
                <div className="ps-types">
                  {profile.bestTypes.map((t) => (
                    <div key={t} className="ps-tp ps-tp-best">{t}</div>
                  ))}
                </div>
              </div>
              <div className="ps-gc">
                <div className="ps-gl ps-gl-worst">💀 WORST</div>
                <div className="ps-types">
                  {profile.worstTypes.map((t) => (
                    <div key={t} className="ps-tp ps-tp-worst">{t}</div>
                  ))}
                </div>
              </div>
            </div>
            <hr className="ps-sep ps-sep-d" />

            {/* 푸터 */}
            <div className="ps-footer ps-mono">
              <div className="ps-cta">{SHARE_IMAGE.profileCtaFooter}</div>
              <div className="ps-url">chemifit.cyb-labs.com</div>
              <div className="ps-barcode">
                {BARCODE_HEIGHTS.map((h, i) => (
                  <div key={i} style={{ height: `${h}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
