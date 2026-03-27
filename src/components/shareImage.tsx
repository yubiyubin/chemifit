import { useState, useEffect, useRef } from "react";

const STAT_COLORS = [
  {
    from: "rgba(255,0,128,0.7)",
    to: "rgba(255,110,180,0.7)",
    glow: "rgba(255,0,128",
    shadow: "rgba(255,0,128",
  },
  {
    from: "rgba(168,85,247,0.7)",
    to: "rgba(192,132,252,0.7)",
    glow: "rgba(168,85,247",
    shadow: "rgba(168,85,247",
  },
  {
    from: "rgba(124,58,237,0.7)",
    to: "rgba(167,139,250,0.7)",
    glow: "rgba(124,58,237",
    shadow: "rgba(124,58,237",
  },
  {
    from: "rgba(236,72,153,0.7)",
    to: "rgba(244,114,182,0.7)",
    glow: "rgba(236,72,153",
    shadow: "rgba(236,72,153",
  },
];

const BARCODE_HEIGHTS = [
  28, 36, 20, 40, 24, 36, 16, 32, 40, 20, 36, 28, 40, 16, 32, 24, 40, 20, 36,
  28,
];

const defaultData = {
  typeA: "INTP",
  typeB: "ENFP",
  score: 68,
  category: "💥 생각의 불꽃놀이",
  copy: {
    before: "둘 다 ",
    highlight: "아이디어 중독",
    after: "이라\n현실이 안드로메다로",
  },
  tagline: "미묘하게 설레는 거 맞지? 😏",
  matchType: "연인 궁합",
  stats: [
    {
      icon: "🩷",
      name: "감정교류",
      value: 46,
      desc: "감정 표현 방식이 좀 다를 뿐",
    },
    {
      icon: "💬",
      name: "대화궁합",
      value: 61,
      desc: "서로 관심사 겹치는 게 많을 ✌",
    },
    {
      icon: "⚖️",
      name: "가치관",
      value: 61,
      desc: "핵심 가치관은 비슷한 편 💜",
    },
    {
      icon: "✨",
      name: "일상호환",
      value: 66,
      desc: "생활 리듬 꽤 맞는 편 👌",
    },
  ],
};

export default function ReceiptShareImage({ data = defaultData }) {
  const { typeA, typeB, score, category, copy, tagline, matchType, stats } =
    data;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  const wrapRef = useRef(null);

  // Google Fonts를 <link> 태그로 동적 삽입 (html-to-image 캡처 전 폰트 로딩 보장)
  useEffect(() => {
    const FONT_ID = "chemifit-share-fonts";
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement("link");
      link.id = FONT_ID;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    function fit() {
      if (!wrapRef.current) return;
      const s = Math.min(
        window.innerWidth / 1080,
        window.innerHeight / 1350,
        1,
      );
      (wrapRef.current as HTMLElement).style.transform = `scale(${s})`;
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const copyText = copy.before + copy.highlight + copy.after;
  const copyParts = copyText.split(copy.highlight);

  return (
    <>
      <style>{`
        .rc-wrap { width:1080px; height:1350px; transform-origin:center center; }
        .rc-card { width:1080px; height:1350px; position:relative; overflow:hidden; background:#08000e; }
        .rc-bg { position:absolute; inset:0; background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(255,0,128,0.1) 0%,transparent 55%); }
        .rc-orb { position:absolute; width:400px; height:400px; border-radius:50%; background:rgba(255,0,128,0.12); filter:blur(70px); top:300px; left:50%; transform:translateX(-50%); }
        .rc-noise { position:absolute; inset:0; opacity:0.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .rc-receipt { position:relative; z-index:2; margin:40px auto; width:820px; background:linear-gradient(145deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%); backdrop-filter:blur(40px) saturate(1.4); -webkit-backdrop-filter:blur(40px) saturate(1.4); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:48px 52px; display:flex; flex-direction:column; box-shadow:0 12px 60px rgba(0,0,0,0.4),0 1px 0 rgba(255,255,255,0.07) inset; height:calc(100% - 80px); }
        .rc-header { text-align:center; margin-bottom:24px; }
        .rc-logo { font-family:'JetBrains Mono',monospace; font-size:32px; font-weight:800; color:#fff; letter-spacing:4px; text-shadow:0 0 16px rgba(255,0,128,0.3); }
        .rc-sub { font-family:'JetBrains Mono',monospace; font-size:14px; color:rgba(255,255,255,0.25); letter-spacing:3px; margin-top:4px; }
        .rc-dotline { border:none; border-top:2px dashed rgba(255,255,255,0.08); margin:20px 0; }
        .rc-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; }
        .rc-rlabel { font-family:'JetBrains Mono',monospace; font-size:16px; color:rgba(255,255,255,0.35); letter-spacing:1px; }
        .rc-rvalue { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:rgba(255,255,255,0.6); }
        .rc-main { text-align:center; padding:32px 0; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; }
        .rc-types { display:flex; align-items:center; gap:16px; justify-content:center; }
        .rc-type { font-family:'JetBrains Mono',monospace; font-size:32px; font-weight:800; letter-spacing:3px; }
        .rc-type-a { color:#c4b5fd; text-shadow:0 0 12px rgba(167,139,250,0.4); }
        .rc-type-b { color:#ff7eb8; text-shadow:0 0 12px rgba(255,100,170,0.4); }
        .rc-heart { font-size:24px; filter:drop-shadow(0 0 10px rgba(255,50,150,0.6)); }
        .rc-pct { font-family:'JetBrains Mono',monospace; font-size:100px; font-weight:800; color:#fff; line-height:1; text-shadow:0 0 24px rgba(255,0,128,0.25); }
        .rc-pct span { font-size:36px; color:rgba(255,255,255,0.3); }
        .rc-copy { font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Nanum Gothic',sans-serif; font-size:36px; font-weight:900; color:#fff; line-height:1.5; word-break:keep-all; }
        .rc-copy em { font-style:normal; background:linear-gradient(90deg,#ff6eb4,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .rc-csb { font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Nanum Gothic',sans-serif; font-size:20px; color:rgba(255,255,255,0.25); }
        .rc-stats { display:flex; flex-direction:column; gap:2px; }
        .rc-stat { display:flex; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.025); }
        .rc-stat:last-child { border-bottom:none; }
        .rc-sname { font-family:'JetBrains Mono',monospace; font-size:15px; color:rgba(255,255,255,0.5); width:130px; display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .rc-sbar { width:340px; height:10px; border-radius:5px; background:rgba(255,255,255,0.04); overflow:hidden; flex-shrink:0; }
        .rc-sfill { height:100%; border-radius:4px; }
        .rc-sval { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:rgba(255,255,255,0.5); width:48px; text-align:right; flex-shrink:0; margin:0 12px; }
        .rc-sdesc { font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Nanum Gothic',sans-serif; font-size:13px; color:rgba(255,255,255,0.35); flex:1; text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .rc-footer { text-align:center; margin-top:auto; }
        .rc-cta { font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Nanum Gothic',sans-serif; font-size:16px; color:rgba(255,255,255,0.2); margin-bottom:8px; }
        .rc-url { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:700; color:#ff7eb8; text-shadow:0 0 12px rgba(255,100,170,0.3); letter-spacing:2px; }
        .rc-barcode { margin-top:16px; display:flex; gap:3px; justify-content:center; align-items:flex-end; }
        .rc-barcode div { width:3px; background:rgba(255,255,255,0.1); border-radius:1px; }
      `}</style>

      <div ref={wrapRef} className="rc-wrap">
        <div className="rc-card">
          <div className="rc-bg" />
          <div className="rc-orb" />
          <div className="rc-noise" />

          <div className="rc-receipt">
            <div className="rc-header">
              <div className="rc-logo">CHEMIFIT</div>
              <div className="rc-sub">MBTI COMPATIBILITY REPORT</div>
            </div>

            <hr className="rc-dotline" />

            <div className="rc-row">
              <div className="rc-rlabel">DATE</div>
              <div className="rc-rvalue">{today}</div>
            </div>
            <div className="rc-row">
              <div className="rc-rlabel">TYPE</div>
              <div className="rc-rvalue">{matchType}</div>
            </div>

            <hr className="rc-dotline" />

            <div className="rc-main">
              <div className="rc-types">
                <span className="rc-type rc-type-a">{typeA}</span>
                <span className="rc-heart">💕</span>
                <span className="rc-type rc-type-b">{typeB}</span>
              </div>
              <div className="rc-pct">
                {score}
                <span>%</span>
              </div>
              <div className="rc-copy">
                &ldquo;{copy.before}
                <em>{copy.highlight}</em>
                {copy.after.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
                &rdquo;
              </div>
              <div className="rc-csb">
                {category} · {tagline}
              </div>
            </div>

            <hr className="rc-dotline" />

            <div className="rc-stats">
              {stats.map((stat, i) => {
                const c = STAT_COLORS[i % STAT_COLORS.length];
                return (
                  <div key={i} className="rc-stat">
                    <div className="rc-sname">
                      {stat.icon} {stat.name}
                    </div>
                    <div className="rc-sbar">
                      <div
                        className="rc-sfill"
                        style={{
                          width: `${stat.value}%`,
                          background: `linear-gradient(90deg,${c.from},${c.to})`,
                          boxShadow: `0 0 14px ${c.glow},0.5), 0 0 40px ${c.shadow},0.15)`,
                        }}
                      />
                    </div>
                    <div className="rc-sval">{stat.value}%</div>
                    <div className="rc-sdesc">{stat.desc}</div>
                  </div>
                );
              })}
            </div>

            <hr className="rc-dotline" />

            <div className="rc-footer">
              <div className="rc-cta">너도 궁합 확인해봐</div>
              <div className="rc-url">chemifit.cyb-labs.com</div>
              <div className="rc-barcode">
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
