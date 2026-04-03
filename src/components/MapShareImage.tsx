/**
 * MapShareImage — 궁합맵 티어리스트 공유 이미지
 *
 * 1080x1350 레시피 스타일 카드.
 * 선택된 MBTI의 16타입 궁합 순위를 S~F 티어로 분류하여 표시.
 * html-to-image로 캡처하여 저장.
 */
import type React from "react";
import type { MbtiType } from "@/data/compatibility";
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

/** 티어 정의: 점수 범위 + 색상 */
const TIERS = [
  { label: "S", min: 90, color: "#fbbf24", bg: "rgba(251,191,36,", cls: "s" },
  { label: "A", min: 70, color: "#34d399", bg: "rgba(52,211,153,", cls: "a" },
  { label: "B", min: 55, color: "#60a5fa", bg: "rgba(96,165,250,", cls: "b" },
  { label: "C", min: 40, color: "#fb923c", bg: "rgba(251,146,60,", cls: "c" },
  { label: "D", min: 25, color: "#f87171", bg: "rgba(248,113,113,", cls: "d" },
  { label: "F", min: 0,  color: "#ef4444", bg: "rgba(239,68,68,", cls: "f" },
] as const;

export type MapShareData = {
  myMbti: MbtiType;
  nickname: string;
  scores: { type: MbtiType; score: number }[];
  best: { type: MbtiType; score: number };
  worst: { type: MbtiType; score: number };
};

type Props = {
  data: MapShareData;
  cardRef?: React.Ref<HTMLDivElement>;
};

export default function MapShareImage({ data, cardRef }: Props) {
  const { myMbti, nickname, scores, best, worst } = data;
  const wrapRef = useShareImageSetup();

  /** 점수 배열을 티어별로 그룹핑 */
  const tierGroups = TIERS.map((tier) => ({
    ...tier,
    items: scores.filter((s) => {
      const nextTier = TIERS[TIERS.indexOf(tier) - 1];
      return s.score >= tier.min && (!nextTier || s.score < nextTier.min);
    }),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <style>{`
        .ms-wrap{width:1080px;height:1350px;transform-origin:center center}
        .ms-card{width:1080px;height:1350px;position:relative;overflow:hidden;${SI_CARD_BG}}
        .ms-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(168,85,247,0.08) 0%,transparent 55%)}
        .ms-orb{position:absolute;border-radius:50%;filter:blur(70px);width:400px;height:400px;background:rgba(168,85,247,0.1);top:300px;left:50%;transform:translateX(-50%)}
        .ms-noise{position:absolute;inset:0;opacity:0.04;background-image:${SI_NOISE_URL}}
        .ms-receipt{position:relative;z-index:2;width:100%;height:100%;${SI_RECEIPT_BG};padding:48px 56px;display:flex;flex-direction:column}
        .ms-mono{font-family:'JetBrains Mono',monospace}
        .ms-sep{border:none;margin:20px 0}
        .ms-sep-d{${SI_SEP_D}}
        .ms-sep-db{${SI_SEP_DB}}
        .ms-header{text-align:center;margin-bottom:4px}
        .ms-logo{${SI_LOGO}}
        .ms-sub{${SI_SUB}}
        .ms-hero{text-align:center;${SI_HERO_PADDING}}
        .ms-hero-type{${SI_HERO_TYPE_BASE};text-shadow:0 0 32px rgba(168,85,247,0.65),0 0 64px rgba(168,85,247,0.25)}
        .ms-hero-title{${SI_HERO_TITLE_BASE}}
        .ms-hero-title em{font-style:normal;background:linear-gradient(90deg,#a78bfa,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .ms-th{font-size:12px;color:rgba(255,255,255,0.12);letter-spacing:3px;text-align:center;margin-bottom:8px}
        .ms-tiers{display:flex;flex-direction:column;gap:8px}
        .ms-top3{display:flex;flex-direction:column;gap:6px}
        .ms-t3-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.025)}
        .ms-t3-row:last-child{border-bottom:none}
        .ms-t3-rank{font-size:18px;width:28px;flex-shrink:0;text-align:center}
        .ms-t3-type{font-size:15px;font-weight:700;letter-spacing:2px;width:56px;flex-shrink:0}
        .ms-t3-bar{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,0.04);overflow:hidden}
        .ms-t3-fill{height:100%;border-radius:4px}
        .ms-t3-pct{font-size:14px;font-weight:700;color:rgba(255,255,255,0.45);width:40px;text-align:right;flex-shrink:0}
        .ms-tr{display:flex;align-items:stretch;gap:0;border-radius:14px;overflow:hidden;min-height:52px}
        .ms-tl{width:64px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;flex-shrink:0;letter-spacing:2px}
        .ms-ti-wrap{flex:1;display:flex;align-items:center;gap:8px;padding:10px 16px;flex-wrap:wrap;background:linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.005));border:1px solid rgba(255,255,255,0.03);border-left:none}
        .ms-ti{padding:6px 16px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:2px;display:flex;align-items:center;gap:6px}
        .ms-ti-pct{font-size:12px;opacity:0.5}
        .ms-bw{display:flex;gap:12px;margin-top:auto}
        .ms-bw-card{flex:1;border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04)}
        .ms-bw-emoji{font-size:24px;line-height:1;display:flex;align-items:center}
        .ms-bw-info{display:flex;flex-direction:column;gap:1px}
        .ms-bw-label{font-size:11px;color:rgba(255,255,255,0.15);letter-spacing:2px}
        .ms-bw-type{font-size:18px;font-weight:800;letter-spacing:2px}
        .ms-bw-val{margin-left:auto;font-size:24px;font-weight:800;color:#fff}
        .ms-bw-val span{font-size:12px;color:rgba(255,255,255,0.2)}
        .ms-footer{text-align:center;padding-top:8px}
        .ms-cta{font-size:14px;color:rgba(255,255,255,0.18);margin-bottom:6px}
        .ms-url{font-size:18px;font-weight:700;color:#c084fc;text-shadow:0 0 12px rgba(168,85,247,0.3);letter-spacing:2px}
        .ms-barcode{margin-top:10px;display:flex;gap:3px;justify-content:center;align-items:flex-end}
        .ms-barcode div{width:3px;background:rgba(255,255,255,0.1);border-radius:1px}
      `}</style>

      <div ref={wrapRef} className="ms-wrap">
        <div className="ms-card" ref={cardRef}>
          <div className="ms-bg" />
          <div className="ms-orb" />
          <div className="ms-noise" />

          <div className="ms-receipt" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* 헤더 */}
            <div className="ms-header ms-mono">
              <div className="ms-logo">CHEMIFIT</div>
              <div className="ms-sub">COMPATIBILITY TIER LIST</div>
            </div>
            <hr className="ms-sep ms-sep-d" />

            {/* 히어로 */}
            <div className="ms-hero">
              <div className="ms-mono ms-hero-type">{myMbti}</div>
              <div className="ms-hero-title">&ldquo;<em>{nickname}</em>&rdquo;</div>
            </div>
            <hr className="ms-sep ms-sep-db" />

            {/* 티어 리스트 */}
            <div className="ms-mono ms-th">── TIER RANKING ──</div>
            <div className="ms-tiers ms-mono">
              {tierGroups.map((tier) => (
                <div key={tier.label} className="ms-tr">
                  <div
                    className="ms-tl"
                    style={{
                      background: `${tier.bg}0.12)`,
                      color: tier.color,
                      textShadow: `0 0 12px ${tier.bg}0.3)`,
                    }}
                  >
                    {tier.label}
                  </div>
                  <div className="ms-ti-wrap">
                    {tier.items.map((item) => (
                      <div
                        key={item.type}
                        className="ms-ti"
                        style={{
                          color: tier.color,
                          background: `${tier.bg}0.06)`,
                          border: `1px solid ${tier.bg}0.1)`,
                        }}
                      >
                        {item.type}
                        <span className="ms-ti-pct">{item.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <hr className="ms-sep ms-sep-d" />

            {/* TOP 3 */}
            <div className="ms-mono ms-th">── TOP 3 ──</div>
            <div className="ms-top3 ms-mono">
              {scores.slice(0, 3).map((item, i) => {
                const tier = TIERS.find((t) => item.score >= t.min) ?? TIERS[TIERS.length - 1];
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={item.type} className="ms-t3-row">
                    <div className="ms-t3-rank">{medals[i]}</div>
                    <div className="ms-t3-type" style={{ color: tier.color }}>{item.type}</div>
                    <div className="ms-t3-bar">
                      <div
                        className="ms-t3-fill"
                        style={{
                          width: `${item.score}%`,
                          background: `linear-gradient(90deg,${tier.bg}0.7),${tier.bg}0.5))`,
                          boxShadow: `0 0 8px ${tier.bg}0.3)`,
                        }}
                      />
                    </div>
                    <div className="ms-t3-pct">{item.score}%</div>
                  </div>
                );
              })}
            </div>
            <hr className="ms-sep ms-sep-d" />

            {/* Best / Worst */}
            <div className="ms-bw ms-mono">
              <div className="ms-bw-card">
                <div className="ms-bw-emoji">🏆</div>
                <div className="ms-bw-info">
                  <div className="ms-bw-label">BEST</div>
                  <div className="ms-bw-type" style={{ color: "#34d399" }}>{best.type}</div>
                </div>
                <div className="ms-bw-val">{best.score}<span>%</span></div>
              </div>
              <div className="ms-bw-card">
                <div className="ms-bw-emoji">💀</div>
                <div className="ms-bw-info">
                  <div className="ms-bw-label">WORST</div>
                  <div className="ms-bw-type" style={{ color: "#f87171" }}>{worst.type}</div>
                </div>
                <div className="ms-bw-val">{worst.score}<span>%</span></div>
              </div>
            </div>
            <hr className="ms-sep ms-sep-d" />

            {/* 푸터 */}
            <div className="ms-footer ms-mono">
              <div className="ms-cta">너도 궁합 맵 확인해봐</div>
              <div className="ms-url">chemifit.cyb-labs.com</div>
              <div className="ms-barcode">
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
