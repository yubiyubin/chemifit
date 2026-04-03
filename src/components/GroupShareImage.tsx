/**
 * GroupShareImage — 그룹 궁합 공유 이미지
 *
 * 1080x1350 레시피 스타일. 멤버 목록, 베스트/워스트 쌍,
 * 조합별 궁합 바 게이지, 그룹 역할을 표시.
 */
import type React from "react";
import type { Member } from "@/data/compatibility";
import type { GroupAnalysis } from "@/features/group-match/utils/group-roles";
import { getScoreInfo } from "@/data/labels";
import { SHARE_IMAGE } from "@/data/ui-text";
import { useShareImageSetup } from "./useShareImageSetup";
import {
  BARCODE_HEIGHTS,
  SI_LOGO,
  SI_SUB,
  SI_HERO_PADDING,
  SI_HERO_TYPE_BASE,
  SI_SEP_D,
  SI_SEP_DB,
  SI_CARD_BG,
  SI_NOISE_URL,
  SI_RECEIPT_BG,
} from "./shareImageTokens";

export type GroupShareData = {
  members: Member[];
  avg: number;
  best: { mA: Member; mB: Member; score: number };
  worst: { mA: Member; mB: Member; score: number };
  pairs: { mA: Member; mB: Member; score: number }[];
  analysis: GroupAnalysis;
};

type Props = {
  data: GroupShareData;
  cardRef?: React.Ref<HTMLDivElement>;
};

function barClass(score: number): string {
  if (score >= 65) return "gsf-high";
  if (score >= 45) return "gsf-mid";
  if (score >= 25) return "gsf-low";
  return "gsf-vlow";
}

export default function GroupShareImage({ data, cardRef }: Props) {
  const { members, avg, best, worst, pairs, analysis } = data;
  const wrapRef = useShareImageSetup();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  const avgInfo = getScoreInfo(avg);

  const sortedPairs = [...pairs].sort((a, b) => b.score - a.score);
  const activeRoles = analysis.roles.filter((r) => r.count > 0);

  return (
    <>
      <style>{`
        .gs-wrap{width:1080px;height:1350px;transform-origin:center center}
        .gs-card{width:1080px;height:1350px;position:relative;overflow:hidden;${SI_CARD_BG}}
        .gs-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 35%,rgba(0,203,255,0.08) 0%,transparent 55%)}
        .gs-orb{position:absolute;border-radius:50%;filter:blur(70px);width:400px;height:400px;background:rgba(0,203,255,0.1);top:250px;left:50%;transform:translateX(-50%)}
        .gs-noise{position:absolute;inset:0;opacity:0.04;background-image:${SI_NOISE_URL}}
        .gs-receipt{position:relative;z-index:2;width:100%;height:100%;${SI_RECEIPT_BG};padding:36px 56px;display:flex;flex-direction:column}
        .gs-mono{font-family:'JetBrains Mono',monospace}
        .gs-sep{border:none;margin:10px 0}
        .gs-sep-d{${SI_SEP_D}}
        .gs-sep-db{${SI_SEP_DB}}
        .gs-header{text-align:center;margin-bottom:2px}
        .gs-logo{${SI_LOGO}}
        .gs-sub{${SI_SUB}}
        .gs-row{display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:rgba(255,255,255,0.28)}
        .gs-row .gs-v{font-weight:700;color:rgba(255,255,255,0.5)}
        .gs-hero{text-align:center;${SI_HERO_PADDING}}
        .gs-hero-score{${SI_HERO_TYPE_BASE};text-shadow:0 0 32px rgba(0,203,255,0.65),0 0 64px rgba(0,203,255,0.25)}
        .gs-hero-score span{font-size:28px;color:rgba(255,255,255,0.3)}
        .gs-hero-copy{font-size:22px;font-weight:700;color:rgba(255,255,255,0.5);margin-top:12px}
        .gs-hero-copy em{font-style:normal;background:linear-gradient(90deg,#22d3ee,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .gs-sh{font-size:12px;color:rgba(255,255,255,0.12);letter-spacing:3px;text-align:center;margin-bottom:6px}
        .gs-members{display:flex;flex-direction:column;gap:0}
        .gs-m{display:flex;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.025)}
        .gs-m:last-child{border-bottom:none}
        .gs-m-icon{font-size:18px;width:32px;flex-shrink:0}
        .gs-m-name{font-size:16px;font-weight:700;color:rgba(255,255,255,0.5);flex:1}
        .gs-m-type{font-size:14px;font-weight:700;letter-spacing:2px;padding:4px 14px;border-radius:6px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)}
        .gs-m-role{font-size:12px;color:rgba(255,255,255,0.2);margin-left:12px;width:90px;text-align:right}
        .gs-bw{display:flex;gap:12px}
        .gs-bw-card{flex:1;border-radius:14px;padding:14px 16px;text-align:center;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04)}
        .gs-bw-label{font-size:11px;letter-spacing:2px;margin-bottom:4px}
        .gs-bw-best .gs-bw-label{color:rgba(52,211,153,0.5)}
        .gs-bw-worst .gs-bw-label{color:rgba(248,113,113,0.5)}
        .gs-bw-pair{font-size:14px;font-weight:700;color:rgba(255,255,255,0.45);margin-bottom:3px}
        .gs-bw-pct{font-size:32px;font-weight:800;color:#fff;line-height:1;text-shadow:0 0 12px rgba(0,203,255,0.15)}
        .gs-bw-pct span{font-size:14px;color:rgba(255,255,255,0.25)}
        .gs-pairs{display:flex;flex-direction:column;gap:1px}
        .gs-p{display:flex;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.02)}
        .gs-p:last-child{border-bottom:none}
        .gs-p-rank{width:24px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.2);flex-shrink:0}
        .gs-p-names{font-size:13px;color:rgba(255,255,255,0.4);width:170px;flex-shrink:0}
        .gs-p-bar{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,0.03);overflow:hidden;margin:0 10px}
        .gs-p-fill{height:100%;border-radius:4px}
        .gsf-high{background:linear-gradient(90deg,rgba(52,211,153,0.7),rgba(110,231,183,0.7));box-shadow:0 0 10px rgba(52,211,153,0.3)}
        .gsf-mid{background:linear-gradient(90deg,rgba(168,85,247,0.7),rgba(192,132,252,0.7));box-shadow:0 0 10px rgba(168,85,247,0.3)}
        .gsf-low{background:linear-gradient(90deg,rgba(251,146,60,0.6),rgba(253,186,116,0.6));box-shadow:0 0 8px rgba(251,146,60,0.2)}
        .gsf-vlow{background:linear-gradient(90deg,rgba(248,113,113,0.6),rgba(252,165,165,0.6));box-shadow:0 0 8px rgba(248,113,113,0.2)}
        .gs-p-pct{font-size:14px;font-weight:700;color:rgba(255,255,255,0.45);width:40px;text-align:right;flex-shrink:0}
        .gs-roles{display:flex;flex-direction:column;gap:5px}
        .gs-role{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.03)}
        .gs-role-icon{font-size:15px}
        .gs-role-title{font-size:13px;font-weight:700;color:rgba(255,255,255,0.4);width:90px;flex-shrink:0}
        .gs-role-members{font-size:12px;color:rgba(255,255,255,0.3);flex:1}
        .gs-role-desc{font-size:11px;color:rgba(255,255,255,0.18);text-align:right}
        .gs-footer{text-align:center;margin-top:auto;padding-top:6px}
        .gs-cta{font-size:14px;color:rgba(255,255,255,0.18);margin-bottom:6px}
        .gs-url{font-size:18px;font-weight:700;color:#22d3ee;text-shadow:0 0 12px rgba(0,203,255,0.3);letter-spacing:2px}
        .gs-barcode{margin-top:10px;display:flex;gap:3px;justify-content:center;align-items:flex-end}
        .gs-barcode div{width:3px;background:rgba(255,255,255,0.1);border-radius:1px}
      `}</style>

      <div ref={wrapRef} className="gs-wrap">
        <div className="gs-card" ref={cardRef}>
          <div className="gs-bg" />
          <div className="gs-orb" />
          <div className="gs-noise" />

          <div className="gs-receipt" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* 헤더 */}
            <div className="gs-header gs-mono">
              <div className="gs-logo">CHEMIFIT</div>
              <div className="gs-sub">GROUP COMPATIBILITY</div>
            </div>
            <hr className="gs-sep gs-sep-db" />
            <div className="gs-mono">
              <div className="gs-row"><span>DATE</span><span className="gs-v">{today}</span></div>
              <div className="gs-row"><span>GROUP</span><span className="gs-v">{members.length}명</span></div>
            </div>
            <hr className="gs-sep gs-sep-d" />

            {/* 히어로 */}
            <div className="gs-hero">
              <div className="gs-mono gs-hero-score">{avg}<span>%</span></div>
              <div className="gs-hero-copy">{avgInfo.emoji} &ldquo;<em>{avgInfo.label}</em>&rdquo;</div>
            </div>
            <hr className="gs-sep gs-sep-d" />

            {/* 멤버 목록 */}
            <div className="gs-mono gs-sh">{SHARE_IMAGE.groupMembersHeader}</div>
            <div className="gs-members gs-mono">
              {members.map((m, i) => {
                const role = analysis.roles.find((r) =>
                  analysis.membersByRole[r.id]?.includes(m.name),
                );
                return (
                  <div key={i} className="gs-m">
                    <div className="gs-m-icon">{m.emoji}</div>
                    <div className="gs-m-name">{m.name}</div>
                    <div className="gs-m-type">{m.mbti}</div>
                    {role && <div className="gs-m-role">{role.name}</div>}
                  </div>
                );
              })}
            </div>
            <hr className="gs-sep gs-sep-d" />

            {/* 베스트/워스트 */}
            <div className="gs-bw gs-mono">
              <div className="gs-bw-card gs-bw-best">
                <div className="gs-bw-label">🏆 BEST PAIR</div>
                <div className="gs-bw-pair">{best.mA.emoji}{best.mA.name} × {best.mB.emoji}{best.mB.name}</div>
                <div className="gs-bw-pct">{best.score}<span>%</span></div>
              </div>
              <div className="gs-bw-card gs-bw-worst">
                <div className="gs-bw-label">💀 WORST PAIR</div>
                <div className="gs-bw-pair">{worst.mA.emoji}{worst.mA.name} × {worst.mB.emoji}{worst.mB.name}</div>
                <div className="gs-bw-pct">{worst.score}<span>%</span></div>
              </div>
            </div>
            <hr className="gs-sep gs-sep-d" />

            {/* 조합별 궁합 */}
            <div className="gs-mono gs-sh">{SHARE_IMAGE.groupPairsHeader}</div>
            <div className="gs-pairs gs-mono">
              {sortedPairs.map(({ mA, mB, score }, i) => (
                <div key={i} className="gs-p">
                  <div className="gs-p-rank">{i + 1}</div>
                  <div className="gs-p-names">{mA.emoji}{mA.name} × {mB.emoji}{mB.name}</div>
                  <div className="gs-p-bar"><div className={`gs-p-fill ${barClass(score)}`} style={{ width: `${score}%` }} /></div>
                  <div className="gs-p-pct">{score}%</div>
                </div>
              ))}
            </div>
            <hr className="gs-sep gs-sep-d" />

            {/* 그룹 역할 */}
            <div className="gs-mono gs-sh">{SHARE_IMAGE.groupRolesHeader}</div>
            <div className="gs-roles gs-mono">
              {activeRoles.map((role) => (
                <div key={role.id} className="gs-role">
                  <div className="gs-role-icon">{role.emoji}</div>
                  <div className="gs-role-title">{role.name}</div>
                  <div className="gs-role-members">{analysis.membersByRole[role.id]?.join(", ")}</div>
                  <div className="gs-role-desc">{role.effect}</div>
                </div>
              ))}
            </div>
            <hr className="gs-sep gs-sep-d" />

            {/* 푸터 */}
            <div className="gs-footer gs-mono">
              <div className="gs-cta">{SHARE_IMAGE.groupCtaFooter}</div>
              <div className="gs-url">chemifit.cyb-labs.com</div>
              <div className="gs-barcode">
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
