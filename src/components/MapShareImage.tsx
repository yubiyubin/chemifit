/**
 * MapShareImage — 궁합맵 티어리스트 공유 이미지
 *
 * 1080x1350 레시피 스타일 카드.
 * 선택된 MBTI의 16타입 궁합 순위를 S~F 티어로 분류하여 표시.
 * html-to-image로 캡처하여 저장.
 */
import { useEffect, useRef } from "react";
import type React from "react";
import type { MbtiType } from "@/data/compatibility";

const BARCODE_HEIGHTS = [28, 36, 20, 40, 24, 36, 16, 32, 40, 20, 36, 28, 40, 16, 32, 24, 40, 20, 36, 28];

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
  const wrapRef = useRef(null);

  useEffect(() => {
    const FONT_ID = "chemifit-share-fonts";
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement("link");
      link.id = FONT_ID;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    function fit() {
      if (!wrapRef.current) return;
      const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1350, 1);
      (wrapRef.current as HTMLElement).style.transform = `scale(${s})`;
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

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
        .ms-card{width:1080px;height:1350px;position:relative;overflow:hidden;background:#08000e}
        .ms-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(168,85,247,0.08) 0%,transparent 55%)}
        .ms-orb{position:absolute;border-radius:50%;filter:blur(70px);width:400px;height:400px;background:rgba(168,85,247,0.1);top:300px;left:50%;transform:translateX(-50%)}
        .ms-noise{position:absolute;inset:0;opacity:0.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        .ms-receipt{position:relative;z-index:2;margin:40px auto;width:820px;background:linear-gradient(145deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%);backdrop-filter:blur(40px) saturate(1.4);-webkit-backdrop-filter:blur(40px) saturate(1.4);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px 48px;display:flex;flex-direction:column;box-shadow:0 12px 60px rgba(0,0,0,0.4),0 1px 0 rgba(255,255,255,0.07) inset;height:calc(100% - 80px)}
        .ms-mono{font-family:'JetBrains Mono',monospace}
        .ms-sep{border:none;margin:14px 0}
        .ms-sep-d{border-top:2px dashed rgba(255,255,255,0.08)}
        .ms-sep-db{border-top:3px double rgba(255,255,255,0.1)}
        .ms-header{text-align:center;margin-bottom:4px}
        .ms-logo{font-size:32px;font-weight:800;color:#fff;letter-spacing:4px;text-shadow:0 0 16px rgba(168,85,247,0.3)}
        .ms-sub{font-size:13px;color:rgba(255,255,255,0.25);letter-spacing:3px;margin-top:4px}
        .ms-hero{text-align:center;padding:16px 0}
        .ms-hero-type{font-size:56px;font-weight:800;color:#fff;letter-spacing:6px;text-shadow:0 0 24px rgba(168,85,247,0.3);line-height:1}
        .ms-hero-title{font-size:20px;font-weight:900;color:rgba(255,255,255,0.5);margin-top:10px}
        .ms-hero-title em{font-style:normal;background:linear-gradient(90deg,#a78bfa,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .ms-th{font-size:12px;color:rgba(255,255,255,0.12);letter-spacing:3px;text-align:center;margin-bottom:8px}
        .ms-tiers{display:flex;flex-direction:column;gap:8px;flex:1}
        .ms-tr{display:flex;align-items:stretch;gap:0;border-radius:14px;overflow:hidden;min-height:52px}
        .ms-tl{width:64px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;flex-shrink:0;letter-spacing:2px}
        .ms-ti-wrap{flex:1;display:flex;align-items:center;gap:8px;padding:10px 16px;flex-wrap:wrap;background:linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.005));border:1px solid rgba(255,255,255,0.03);border-left:none}
        .ms-ti{padding:6px 16px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:2px;display:flex;align-items:center;gap:6px}
        .ms-ti-pct{font-size:12px;opacity:0.5}
        .ms-bw{display:flex;gap:12px}
        .ms-bw-card{flex:1;border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04)}
        .ms-bw-emoji{font-size:24px}
        .ms-bw-info{display:flex;flex-direction:column;gap:1px}
        .ms-bw-label{font-size:11px;color:rgba(255,255,255,0.15);letter-spacing:2px}
        .ms-bw-type{font-size:18px;font-weight:800;letter-spacing:2px}
        .ms-bw-val{margin-left:auto;font-size:24px;font-weight:800;color:#fff}
        .ms-bw-val span{font-size:12px;color:rgba(255,255,255,0.2)}
        .ms-footer{text-align:center;margin-top:auto;padding-top:8px}
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
