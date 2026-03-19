"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type RefObject,
} from "react";
import {
  COMPATIBILITY,
  COMPATIBILITY_DESC,
  MbtiType,
  Member,
} from "@/data/compatibility";
import CompatCard from "@/components/CompatCard";

type Props = { members: Member[] };

type NodePos = {
  x: number;
  y: number;
  r: number;
  m: Member;
  score: number;
  isCenter: boolean;
};

type HoverLine = { i: number; j: number } | null;
type PopupData = { mA: Member; mB: Member; score: number } | null;

type LineHit = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  i: number;
  j: number;
  mA: Member;
  mB: Member;
  score: number;
  isCenter: boolean;
};

const SCORE_EMOJI = [
  { min: 95, e: "🏆", l: "천생연분" },
  { min: 88, e: "🔥", l: "환상의 궁합" },
  { min: 80, e: "✨", l: "최고의 궁합" },
  { min: 73, e: "💫", l: "아주 잘 맞아요" },
  { min: 65, e: "🎯", l: "잘 맞아요" },
  { min: 58, e: "🌿", l: "나쁘지 않아요" },
  { min: 50, e: "🤝", l: "보통이에요" },
  { min: 42, e: "🌧️", l: "노력이 필요해요" },
  { min: 35, e: "⚠️", l: "많이 달라요" },
  { min: 25, e: "🌊", l: "쉽지 않아요" },
  { min: 0, e: "💀", l: "극과 극이에요" },
];

function getInfo(s: number) {
  return (
    SCORE_EMOJI.find((e) => s >= e.min) ?? SCORE_EMOJI[SCORE_EMOJI.length - 1]
  );
}
function getColor(s: number) {
  s = Math.max(0, Math.min(100, s));
  return `hsl(${s * 3.2},${77 + s * 0.11}%,${52 + s * 0.05}%)`;
}
function hslToRgb(h: string): string {
  const m = h.match(/hsl\(([^,]+),([^,]+)%,([^)]+)%\)/);
  if (!m) return "200,100,255";
  const H = parseFloat(m[1]) / 360,
    S = parseFloat(m[2]) / 100,
    L = parseFloat(m[3]) / 100;
  let r: number, g: number, b: number;
  if (S === 0) {
    r = g = b = L;
  } else {
    const q = L < 0.5 ? L * (1 + S) : L + S - L * S,
      p = 2 * L - q;
    const f = (p: number, q: number, t: number) => {
      t = ((t % 1) + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 0.5) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = f(p, q, H + 1 / 3);
    g = f(p, q, H);
    b = f(p, q, H - 1 / 3);
  }
  return `${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)}`;
}
function getScore(a: MbtiType, b: MbtiType) {
  return COMPATIBILITY[a]?.[b] ?? COMPATIBILITY[b]?.[a] ?? 50;
}
function getDesc(a: MbtiType, b: MbtiType) {
  return (
    COMPATIBILITY_DESC[a]?.[b] ??
    COMPATIBILITY_DESC[b]?.[a] ??
    `${a}와 ${b}의 궁합이에요. 서로를 이해하고 배려하면 좋은 관계가 될 수 있어요.`
  );
}
function ptToSegDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1,
    dy = y2 - y1,
    len = Math.sqrt(dx * dx + dy * dy);
  if (!len) return Math.hypot(px - x1, py - y1);
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)),
  );
  return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
}
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const ANGLE_OFFSETS = [0, 0.35, -0.28, 0.55, -0.42, 0.2, -0.5, 0.65];
const DIST_MULTS = [1.0, 1.2, 0.88, 1.35, 0.82, 1.15, 0.92, 1.28];

function buildPositions(
  myInfo: Member,
  others: Member[],
  W: number,
  H: number,
): NodePos[] {
  const cx = W / 2,
    cy = H / 2;
  const n = others.length;
  const centerR = W * Math.max(0.073, 0.147 - n * 0.0093) * (2 / 3) * 1.1;
  const maxNodeR = Math.min(
    centerR * 0.9,
    W * Math.max(0.08, 0.17 - n * 0.012) * (2 / 3) * 1.1,
  );
  const minNodeR = W * Math.max(0.065, 0.076 - n * 0.004) * (2 / 3) * 1.1;
  const orbit = Math.min(W, H) * Math.max(0.3, 0.42 - n * 0.012);

  const positions: NodePos[] = [
    { x: cx, y: cy, r: centerR, m: myInfo, score: 100, isCenter: true },
  ];

  others.forEach((m, i) => {
    const score = getScore(myInfo.mbti, m.mbti);
    const t = score / 100;
    const nodeR = minNodeR + Math.pow(t, 3) * (maxNodeR - minNodeR);
    const baseAngle = (2 * Math.PI * i) / n - Math.PI / 2;
    const jitter =
      ANGLE_OFFSETS[i % ANGLE_OFFSETS.length] * (0.6 / Math.max(n, 2));
    const angle = baseAngle + jitter;
    const d = orbit * DIST_MULTS[i % DIST_MULTS.length];
    const hoverScale = 1.28;
    const mgX = nodeR * hoverScale + 26;
    const mgY = nodeR * hoverScale + 34;
    positions.push({
      x: Math.max(mgX, Math.min(W - mgX, cx + d * Math.cos(angle))),
      y: Math.max(mgY, Math.min(H - mgY, cy + d * Math.sin(angle))),
      r: nodeR,
      m,
      score,
      isCenter: false,
    });
  });

  for (let iter = 0; iter < 50; iter++) {
    let moved = false;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i],
          b = positions[j];
        // 텍스트와 그림자 영역까지 고려한 충돌 반경 (매우 넓게)
        const minDist = a.r + b.r + 48;
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < minDist) {
          // 매우 큰 밀어내기 힘 적용
          const overlap = (minDist - dist) / 1.5,
            nx = dx / dist,
            ny = dy / dist;
          if (!a.isCenter) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          }
          if (!b.isCenter) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
          [a, b].forEach((p) => {
            if (!p.isCenter) {
              const padX = p.r * 1.28 + 26;
              const padY = p.r * 1.28 + 34;
              p.x = Math.max(padX, Math.min(W - padX, p.x));
              p.y = Math.max(padY, Math.min(H - padY, p.y));
            }
          });
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return positions;
}

function nodeKey(n: NodePos): string {
  return n.isCenter ? "__center__" : `${n.m.name}_${n.m.mbti}_${n.m.emoji}`;
}

function interpolatePos(
  from: NodePos[],
  to: NodePos[],
  t: number,
  cx: number,
  cy: number,
): NodePos[] {
  const fromMap = new Map(from.map((p) => [nodeKey(p), p]));
  return to.map((tg) => {
    const f = fromMap.get(nodeKey(tg)) ?? { ...tg, x: cx, y: cy, r: 0 };
    return {
      ...tg,
      x: f.x + (tg.x - f.x) * t,
      y: f.y + (tg.y - f.y) * t,
      r: f.r + (tg.r - f.r) * t,
    };
  });
}

function drawCanvas(
  canvas: HTMLCanvasElement,
  positions: NodePos[],
  W: number,
  H: number,
  hovered: HoverLine,
  lineHitsRef: RefObject<LineHit[]>,
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = W * 2;
  canvas.height = H * 2;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, W, H);
  lineHitsRef.current = [];

  // 1단계: 선 그리기 + 텍스트 위치 수집
  type LabelInfo = {
    x: number;
    y: number;
    text: string;
    font: string;
    color: string;
    shadowBlur: number;
    opacity: number;
    isCenter: boolean;
  };
  const labels: LabelInfo[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i],
        b = positions[j];
      const isCenter = a.isCenter || b.isCenter;
      const score = getScore(a.m.mbti, b.m.mbti);
      const color = getColor(score),
        rgb = hslToRgb(color);
      const dx = b.x - a.x,
        dy = b.y - a.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) continue;
      const nx = dx / dist,
        ny = dy / dist;
      const x1 = a.x + nx * a.r,
        y1 = a.y + ny * a.r;
      const x2 = b.x - nx * b.r,
        y2 = b.y - ny * b.r;
      const isHov = hovered?.i === i && hovered?.j === j;

      if (isCenter) {
        const sw = isHov ? 4 + (score / 100) * 9 : 1.5 + (score / 100) * 5;
        ctx.save();
        ctx.shadowColor = `rgba(${rgb},1)`;
        ctx.shadowBlur = isHov ? 28 : 12;
        ctx.strokeStyle = `rgba(${rgb},0.18)`;
        ctx.lineWidth = sw + 6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 1 : 0.82})`;
        ctx.lineWidth = sw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        const tx = (x1 + x2) / 2,
          ty = (y1 + y2) / 2,
          px = -ny * 26,
          py = nx * 26;
        labels.push({
          x: tx + px,
          y: ty + py,
          text: score + "%",
          font: `800 ${isHov ? 26 : 17}px sans-serif`,
          color: `rgba(${rgb},${isHov ? 1 : 0.97})`,
          shadowBlur: isHov ? 20 : 12,
          opacity: 1,
          isCenter: true,
        });
      } else {
        const sw = isHov
          ? 1.8 + (score / 100) * 3.5
          : 0.4 + (score / 100) * 1.6;
        ctx.save();
        ctx.shadowColor = `rgba(${rgb},1)`;
        ctx.shadowBlur = isHov ? 12 : 3;
        ctx.strokeStyle = `rgba(${rgb},0.05)`;
        ctx.lineWidth = sw + 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 0.65 : 0.2})`;
        ctx.lineWidth = sw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        const tx = (x1 + x2) / 2,
          ty = (y1 + y2) / 2,
          px = -ny * 14,
          py = nx * 14;
        labels.push({
          x: tx + px,
          y: ty + py,
          text: score + "%",
          font: `700 ${isHov ? 16 : 11}px sans-serif`,
          color: `rgba(${rgb},${isHov ? 0.97 : 0.52})`,
          shadowBlur: isHov ? 12 : 6,
          opacity: 1,
          isCenter: false,
        });
      }
      lineHitsRef.current.push({
        x1,
        y1,
        x2,
        y2,
        i,
        j,
        mA: a.m,
        mB: b.m,
        score,
        isCenter,
      });
    }
  }

  // 2단계: 텍스트 충돌 감지 후 밀어내기
  const minDist = 22;
  for (let iter = 0; iter < 8; iter++) {
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i],
          b = labels[j];
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
        if (d < minDist) {
          const push = (minDist - d) / 2;
          const nx = dx / d,
            ny = dy / d;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }
  }

  // 3단계: 텍스트 렌더링
  for (const lb of labels) {
    const rgb = lb.color.match(/\d+/g)?.slice(0, 3).join(",") ?? "255,255,255";
    ctx.save();
    ctx.font = lb.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = `rgba(${rgb},1)`;
    ctx.shadowBlur = lb.shadowBlur;
    ctx.fillStyle = lb.color;
    ctx.fillText(lb.text, lb.x, lb.y);
    ctx.restore();
  }
}

export default function GroupGrid({ members }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  const lineHitsRef = useRef<LineHit[]>([]);
  const nodeElsRef = useRef<HTMLDivElement[]>([]);
  const animRAFRef = useRef<number | null>(null);
  const prevPosRef = useRef<NodePos[]>([]);
  const cachePosRef = useRef<NodePos[]>([]);
  const hoverRef = useRef<HoverLine>(null);
  const [popup, setPopup] = useState<PopupData>(null);
  const dimsRef = useRef({ W: 0, H: 0 });
  const [dims, setDims] = useState({ W: 0, H: 0 });

  const myInfo = members[0] ?? null;
  const others = useMemo(() => members.slice(1), [members]);

  const applyNodeStyles = useCallback(
    (positions: NodePos[]) => {
      positions.forEach((pos, idx) => {
        const el = nodeElsRef.current[idx];
        if (!el) return;
        const { r, m, isCenter, score } = pos;
        const color = isCenter ? "hsl(270,77%,58%)" : getColor(score);
        const rgb = hslToRgb(color);
        const glowSz = isCenter ? 26 : Math.max(r * 0.58, 7);
        const glowOp = isCenter ? 0.48 : 0.18 + (score / 100) * 0.17;
        const innerOp = isCenter ? 0.15 : 0.05 + (score / 100) * 0.07;

        // 위치/크기는 애니메이션 루프가 제어 — 여기선 설정하지 않음
        el.style.border = `${isCenter ? "2.5px" : "1.5px"} solid rgba(${rgb},${isCenter ? 0.85 : 0.5 + (score / 100) * 0.3})`;
        el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.45}px rgba(${rgb},${innerOp})`;
        el.style.background = `radial-gradient(circle at 35% 35%,rgba(${rgb},0.26) 0%,rgba(${rgb},0.07) 65%,transparent 100%),#07070f`;

        const ns = Math.max(r * 0.24, 5.5);
        const es = Math.max(r * 0.5, 9);
        const ms = Math.max(r * 0.27, 6);
        el.innerHTML = `
        <span style="font-size:${ns}px;font-weight:700;color:rgba(${rgb},0.85);text-shadow:0 0 6px rgba(${rgb},0.7);line-height:1.25;">${m.name}</span>
        <span style="font-size:${es}px;line-height:1;filter:drop-shadow(0 0 ${Math.max(r * 0.1, 2)}px rgba(${rgb},0.8));">${m.emoji}</span>
        <span style="font-size:${ms}px;font-weight:800;color:rgba(${rgb},1);letter-spacing:0.3px;text-shadow:0 0 8px rgba(${rgb},0.9);line-height:1.25;">${m.mbti}</span>
      `;

        if (!isCenter) {
          el.onmouseenter = () => {
            const hg = Math.max(r * 1.4, 18);
            el.style.boxShadow = `0 0 ${hg}px rgba(${rgb},0.82),0 0 ${hg * 2.2}px rgba(${rgb},0.42),inset 0 0 ${r * 0.65}px rgba(${rgb},0.32)`;
            el.style.transform = "translate(-50%,-50%) scale(1.28)";
            el.style.borderColor = `rgba(${rgb},1)`;
          };
          el.onmouseleave = () => {
            el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.45}px rgba(${rgb},${innerOp})`;
            el.style.transform = "translate(-50%,-50%) scale(1)";
            el.style.borderColor = `rgba(${rgb},${0.5 + (score / 100) * 0.3})`;
          };
          el.onclick = (e) => {
            e.stopPropagation();
            setPopup({ mA: myInfo!, mB: m, score });
          };
        }
      });
    },
    [myInfo],
  );

  const [summary, setSummary] = useState<{
    avg: number;
    best: { mA: Member; mB: Member; score: number };
    worst: { mA: Member; mB: Member; score: number };
  } | null>(null);

  const renderSummary = useCallback((positions: NodePos[]) => {
    const pairs: { mA: Member; mB: Member; score: number }[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const score = getScore(positions[i].m.mbti, positions[j].m.mbti);
        pairs.push({ mA: positions[i].m, mB: positions[j].m, score });
      }
    }
    if (!pairs.length) return;
    const avg = Math.round(
      pairs.reduce((s, p) => s + p.score, 0) / pairs.length,
    );
    const best = pairs.reduce((a, b) => (a.score > b.score ? a : b));
    const worst = pairs.reduce((a, b) => (a.score < b.score ? a : b));
    setSummary({ avg, best, worst });
  }, []);

  const render = useCallback(
    (W: number, H: number) => {
      if (!canvasRef.current || !nodesRef.current || !myInfo) return;
      const newPos = buildPositions(myInfo, others, W, H);
      const needed = newPos.length;
      const container = nodesRef.current;

      while (nodeElsRef.current.length < needed) {
        const node = document.createElement("div");
        node.style.cssText =
          "position:absolute;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transform:translate(-50%,-50%) scale(1);transition:box-shadow 0.55s ease,transform 0.38s cubic-bezier(.34,1.56,.64,1);";
        container.appendChild(node);
        nodeElsRef.current.push(node);
      }
      while (nodeElsRef.current.length > needed) {
        nodeElsRef.current.pop()?.remove();
      }

      // 최종 위치 스타일(색상, 이벤트 등)만 적용 — 위치는 애니메이션 루프가 제어
      applyNodeStyles(newPos);

      const canvas = canvasRef.current;
      const cx = W / 2,
        cy = H / 2;
      const from =
        prevPosRef.current.length > 0
          ? [...prevPosRef.current]
          : newPos.map((p) => ({ ...p, x: cx, y: cy, r: 0 }));

      if (animRAFRef.current) {
        cancelAnimationFrame(animRAFRef.current);
        animRAFRef.current = null;
      }
      const start = performance.now(),
        dur = 1000;
      const frame = (now: number) => {
        const raw = Math.min((now - start) / dur, 1);
        const t = ease(raw);
        const interp = interpolatePos(from, newPos, t, cx, cy);
        drawCanvas(canvas, interp, W, H, hoverRef.current, lineHitsRef);
        interp.forEach((pos, idx) => {
          const el = nodeElsRef.current[idx];
          if (!el) return;
          el.style.left = `${pos.x}px`;
          el.style.top = `${pos.y}px`;
          el.style.width = `${pos.r * 2}px`;
          el.style.height = `${pos.r * 2}px`;
        });
        if (raw < 1) {
          animRAFRef.current = requestAnimationFrame(frame);
        } else {
          prevPosRef.current = [...newPos];
          cachePosRef.current = [...newPos];
          animRAFRef.current = null;
          renderSummary(newPos);
        }
      };
      animRAFRef.current = requestAnimationFrame(frame);

      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        let best: HoverLine = null,
          bestD = 18;
        for (const h of lineHitsRef.current) {
          const d = ptToSegDist(mx, my, h.x1, h.y1, h.x2, h.y2);
          if (d < bestD) {
            bestD = d;
            best = { i: h.i, j: h.j };
          }
        }
        if (JSON.stringify(best) !== JSON.stringify(hoverRef.current)) {
          hoverRef.current = best;
          canvas.style.cursor = best ? "pointer" : "default";
          drawCanvas(
            canvas,
            cachePosRef.current.length ? cachePosRef.current : newPos,
            W,
            H,
            hoverRef.current,
            lineHitsRef,
          );
        }
      };
      canvas.onmouseleave = () => {
        hoverRef.current = null;
        drawCanvas(
          canvas,
          cachePosRef.current.length ? cachePosRef.current : newPos,
          W,
          H,
          null,
          lineHitsRef,
        );
        canvas.style.cursor = "default";
      };
      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        let best: LineHit | null = null;
        let bestD = 18;
        for (const h of lineHitsRef.current as LineHit[]) {
          const d = ptToSegDist(mx, my, h.x1, h.y1, h.x2, h.y2);
          if (d < bestD) {
            bestD = d;
            best = h;
          }
        }
        const hit = best as LineHit | null;
        if (hit) setPopup({ mA: hit.mA, mB: hit.mB, score: hit.score });
      };
    },
    [myInfo, others, applyNodeStyles, renderSummary],
  );

  const updateDims = useCallback((W: number, H: number) => {
    const prev = dimsRef.current;
    if (prev.W !== W || prev.H !== H) {
      dimsRef.current = { W, H };
      setDims({ W, H });
    }
  }, []);

  useEffect(() => {
    if (!wrapRef.current || !myInfo) return;
    const W = wrapRef.current.getBoundingClientRect().width || 560;
    const H = Math.min(W * 0.88, 500);
    queueMicrotask(() => updateDims(W, H));
    render(W, H);
  }, [members, render, myInfo, updateDims]);

  useEffect(() => {
    const ob = new ResizeObserver(() => {
      if (!wrapRef.current || !myInfo) return;
      const W = wrapRef.current.getBoundingClientRect().width || 560;
      const H = Math.min(W * 0.88, 500);
      updateDims(W, H);
      render(W, H);
    });
    if (wrapRef.current) ob.observe(wrapRef.current);
    return () => ob.disconnect();
  }, [render, myInfo, updateDims]);

  const showPreview = !myInfo;

  if (showPreview) {
    const guideText = "멤버를 추가하면 궁합 맵이 나타나요";
    const center = {
      x: 50,
      y: 48,
      label: "나",
      emoji: "⭐",
      color: "#a855f7",
      r: 10,
      score: 100,
    };
    const dummyNodes = [
      {
        x: 48,
        y: 14,
        label: "ENFP",
        emoji: "🦊",
        color: "#818cf8",
        r: 8,
        score: 92,
      },
      {
        x: 13,
        y: 38,
        label: "INTJ",
        emoji: "🦉",
        color: "#34d399",
        r: 5.5,
        score: 65,
      },
      {
        x: 88,
        y: 42,
        label: "ISFJ",
        emoji: "🐻",
        color: "#fb923c",
        r: 7,
        score: 78,
      },
      {
        x: 22,
        y: 80,
        label: "ENTP",
        emoji: "🐬",
        color: "#f87171",
        r: 4.5,
        score: 45,
      },
      {
        x: 78,
        y: 78,
        label: "INFP",
        emoji: "🦋",
        color: "#f472b6",
        r: 7.5,
        score: 85,
      },
    ];
    const allNodes = [center, ...dummyNodes];
    return (
      <div className="relative">
        <div
          className="flex flex-col gap-6"
          style={{ opacity: 0.35, pointerEvents: "none" }}
        >
          {/* 그룹 평균 궁합 미리보기 */}
          <div
            className="rounded-2xl p-5 sm:p-6 text-center"
            style={{
              background: "radial-gradient(ellipse at 50% -20%, rgba(168,85,247,0.1) 0%, rgba(15,15,26,0.95) 75%)",
              border: "1px solid rgba(168,85,247,0.25)",
              boxShadow: "0 0 30px rgba(168,85,247,0.06)",
            }}
          >
            <p className="text-xs mb-1 font-bold" style={{ color: "rgba(168,85,247,0.7)" }}>
              그룹 평균 궁합
            </p>
            <p className="text-3xl font-black mb-1" style={{ color: "#c084fc", textShadow: "0 0 12px rgba(168,85,247,0.6)" }}>
              73%
            </p>
            <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              💫 아주 잘 맞아요
            </p>
            <div
              className="h-1.5 rounded-full overflow-hidden mt-4"
              style={{ background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
            >
              <div
                className="h-full rounded-full gauge-bar"
                style={{ width: "73%", background: "#c084fc", boxShadow: "0 0 8px rgba(168,85,247,0.8)" }}
              />
            </div>
          </div>

          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ background: "#07070f" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full"
              style={{ opacity: 0.45 }}
            >
              <defs>
                {allNodes.map((n, i) => (
                  <filter
                    key={`glow-${i}`}
                    id={`glow-${i}`}
                    x="-80%"
                    y="-80%"
                    width="260%"
                    height="260%"
                  >
                    <feGaussianBlur
                      stdDeviation={n === center ? "2.5" : "1.8"}
                      result="blur1"
                    />
                    <feFlood
                      floodColor={n.color}
                      floodOpacity={n === center ? "0.8" : "0.6"}
                    />
                    <feComposite in2="blur1" operator="in" result="glow1" />
                    <feGaussianBlur
                      in="SourceGraphic"
                      stdDeviation="0.6"
                      result="blur2"
                    />
                    <feFlood floodColor={n.color} floodOpacity="0.35" />
                    <feComposite in2="blur2" operator="in" result="glow2" />
                    <feMerge>
                      <feMergeNode in="glow1" />
                      <feMergeNode in="glow2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
                <filter
                  id="line-glow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {allNodes.map((n, i) => (
                  <radialGradient
                    key={`grad-${i}`}
                    id={`grad-${i}`}
                    cx="35%"
                    cy="35%"
                  >
                    <stop offset="0%" stopColor={n.color} stopOpacity="0.35" />
                    <stop offset="50%" stopColor={n.color} stopOpacity="0.1" />
                    <stop
                      offset="100%"
                      stopColor="transparent"
                      stopOpacity="0"
                    />
                  </radialGradient>
                ))}
              </defs>
              {/* 비중심 연결선 (흐리게) */}
              {allNodes.map((a, i) =>
                allNodes.slice(i + 1).map((b, j) => {
                  if (a === center || b === center) return null;
                  const score = Math.round((a.score + b.score) / 3);
                  return (
                    <g key={`line-${i}-${j}`} filter="url(#line-glow)">
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="#666"
                        strokeWidth="0.2"
                        opacity="0.3"
                      />
                      <text
                        x={(a.x + b.x) / 2 + (b.y - a.y) * 0.08}
                        y={(a.y + b.y) / 2 - (b.x - a.x) * 0.08}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="1.8"
                        fontWeight="700"
                        opacity="0.4"
                      >
                        {score}%
                      </text>
                    </g>
                  );
                }),
              )}
              {/* 중심 연결선 (화려하게) */}
              {dummyNodes.map((n, i) => {
                const midX = (center.x + n.x) / 2;
                const midY = (center.y + n.y) / 2;
                const dx = n.y - center.y;
                const dy = -(n.x - center.x);
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const offX = (dx / len) * 5;
                const offY = (dy / len) * 5;
                return (
                  <g key={`cline-${i}`}>
                    <line
                      x1={center.x}
                      y1={center.y}
                      x2={n.x}
                      y2={n.y}
                      stroke={n.color}
                      strokeWidth={0.3 + (n.score / 100) * 0.8}
                      opacity="0.6"
                      filter={`url(#glow-${i + 1})`}
                    />
                    <line
                      x1={center.x}
                      y1={center.y}
                      x2={n.x}
                      y2={n.y}
                      stroke={n.color}
                      strokeWidth={0.15 + (n.score / 100) * 0.3}
                      opacity="0.9"
                    />
                    <text
                      x={midX + offX * 0.6}
                      y={midY + offY * 0.6}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={n.color}
                      fontSize="2.5"
                      fontWeight="800"
                      opacity="0.85"
                      filter={`url(#glow-${i + 1})`}
                    >
                      {n.score}%
                    </text>
                  </g>
                );
              })}
              {/* 노드 */}
              {allNodes.map((n, i) => {
                const isCenter = n === center;
                return (
                  <g key={`node-${i}`} filter={`url(#glow-${i})`}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r + 1.5}
                      fill="transparent"
                      stroke={n.color}
                      strokeWidth="0.15"
                      opacity="0.25"
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r}
                      fill={`url(#grad-${i})`}
                      stroke={n.color}
                      strokeWidth={isCenter ? "0.7" : "0.4"}
                      opacity="0.9"
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r}
                      fill="#07070f"
                      opacity="0.7"
                    />
                    <text
                      x={n.x}
                      y={n.y - (isCenter ? 1.5 : 0.5)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={n.color}
                      fontSize={isCenter ? "4" : Math.max(n.r * 0.45, 2.5)}
                      fontWeight="700"
                      opacity="0.95"
                    >
                      {n.emoji}
                    </text>
                    <text
                      x={n.x}
                      y={n.y + (isCenter ? 3.5 : n.r * 0.55)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={n.color}
                      fontSize={isCenter ? "3" : Math.max(n.r * 0.38, 2)}
                      fontWeight="800"
                      opacity="0.8"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 미리보기 카드들 */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-4 text-center"
                style={{
                  backgroundColor: "rgba(229,165,10,0.05)",
                  border: "0.5px solid rgba(229,165,10,0.15)",
                }}
              >
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "rgba(229,165,10,0.5)" }}
                >
                  🏆 최고의 궁합
                </p>
                <div className="text-3xl mb-1">✨</div>
                <div
                  className="text-xl font-bold mb-1"
                  style={{ color: "rgba(229,165,10,0.5)" }}
                >
                  92%
                </div>
                <div className="text-xs text-white/30 mb-3">최고의 궁합</div>
                <p className="text-xs" style={{ color: "#ffffff50" }}>
                  🦊 × 🦋
                </p>
                <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full gauge-bar"
                    style={{
                      width: "92%",
                      backgroundColor: "rgba(229,165,10,0.4)",
                    }}
                  />
                </div>
              </div>
              <div
                className="rounded-2xl p-4 text-center"
                style={{
                  backgroundColor: "rgba(220,38,38,0.05)",
                  border: "0.5px solid rgba(220,38,38,0.15)",
                }}
              >
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "rgba(220,38,38,0.5)" }}
                >
                  최악의 궁합
                </p>
                <div className="text-3xl mb-1">🌧️</div>
                <div
                  className="text-xl font-bold mb-1"
                  style={{ color: "rgba(220,38,38,0.5)" }}
                >
                  45%
                </div>
                <div className="text-xs text-white/30 mb-3">
                  노력이 필요해요
                </div>
                <p className="text-xs" style={{ color: "#ffffff50" }}>
                  🦉 × 🐬
                </p>
                <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full gauge-bar"
                    style={{
                      width: "45%",
                      backgroundColor: "rgba(220,38,38,0.4)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 문구 오버레이 - opacity 영향 안 받음 */}
        <div className="absolute inset-0 flex items-start justify-center pt-6 pointer-events-none">
          <p
            className="text-white text-lg font-bold px-7 py-3.5 rounded-2xl"
            style={{
              background: "rgba(15,15,26,0.9)",
              border: "0.5px solid rgba(168,85,247,0.2)",
              boxShadow: "0 0 15px rgba(168,85,247,0.08)",
              textShadow: "0 0 6px rgba(168,85,247,0.15)",
            }}
          >
            {guideText}
          </p>
        </div>
      </div>
    );
  }

  const color = popup ? getColor(popup.score) : "#a855f7";
  const rgb = popup ? hslToRgb(color) : "168,85,247";
  const info = popup ? getInfo(popup.score) : null;

  const needMore = members.length === 1;

  return (
    <div className="flex flex-col gap-6">
      {needMore && !summary ? (
        <div
          className="rounded-2xl p-5 sm:p-6 text-center"
          style={{
            background: "radial-gradient(ellipse at 50% -20%, rgba(100,100,100,0.1) 0%, rgba(15,15,26,0.95) 75%)",
            border: "1px solid rgba(100,100,100,0.2)",
          }}
        >
          <p className="text-xs mb-1 font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
            그룹 평균 궁합
          </p>
          <p className="text-3xl font-black mb-1" style={{ color: "rgba(255,255,255,0.2)", textShadow: "none" }}>
            --%
          </p>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            🤝 데이터 부족
          </p>
          <div
            className="h-1.5 rounded-full overflow-hidden mt-4"
            style={{ background: "rgba(255,255,255,0.05)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: "0%", background: "#444" }}
            />
          </div>
        </div>
      ) : summary ? (
        <div
          className="rounded-2xl p-5 sm:p-6 text-center fade-in-up"
          style={{
            background: `radial-gradient(ellipse at 50% -20%, rgba(${hslToRgb(getColor(summary.avg))},0.15) 0%, rgba(15,15,26,0.95) 75%)`,
            border: `1px solid rgba(${hslToRgb(getColor(summary.avg))},0.35)`,
            boxShadow: `0 0 35px rgba(${hslToRgb(getColor(summary.avg))},0.1)`,
          }}
        >
          <p className="text-xs mb-1 font-bold" style={{ color: `rgba(${hslToRgb(getColor(summary.avg))},0.8)` }}>
            그룹 평균 궁합
          </p>
          <p
            className="text-3xl font-black mb-1"
            style={{
              color: getColor(summary.avg),
              textShadow: `0 0 14px rgba(${hslToRgb(getColor(summary.avg))},0.7)`,
            }}
          >
            {summary.avg}%
          </p>
          <p
            className="text-sm font-bold mt-1"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {getInfo(summary.avg).e} {getInfo(summary.avg).l}
          </p>
          <div
            className="h-1 rounded-full overflow-hidden mt-3"
            style={{ background: "#ffffff0a" }}
          >
            <div
              className="h-full rounded-full gauge-bar"
              style={{
                width: `${summary.avg}%`,
                background: getColor(summary.avg),
                boxShadow: `0 0 6px rgba(${hslToRgb(getColor(summary.avg))},0.7)`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="relative">
        <div
          ref={wrapRef}
          className="relative w-full rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: "radial-gradient(circle at center, rgba(168,85,247,0.06) 0%, rgba(7,7,15,0.95) 80%)",
            border: "1px solid rgba(168,85,247,0.15)",
            boxShadow: "0 0 40px rgba(168,85,247,0.08)",
            height: dims.H || "auto",
            minHeight: 200,
          }}
        >
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full" />
          <div
            ref={nodesRef}
            className="relative w-full"
            style={{ height: dims.H || 200 }}
          />
        </div>
        {needMore && (
          <div className="absolute inset-0 flex items-start justify-center pt-6 pointer-events-none">
            <p
              className="text-white text-lg font-bold px-7 py-3.5 rounded-2xl"
              style={{
                background: "rgba(15,15,26,0.9)",
                border: "0.5px solid rgba(168,85,247,0.2)",
                boxShadow: "0 0 15px rgba(168,85,247,0.08)",
                textShadow: "0 0 6px rgba(168,85,247,0.15)",
              }}
            >
              최소 2명이 필요해요 — 1명 더 추가해주세요
            </p>
          </div>
        )}
      </div>

      {needMore ? (
        <div
          className="flex flex-col gap-3"
          style={{ opacity: 0.35, pointerEvents: "none" }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                backgroundColor: "rgba(229,165,10,0.05)",
                border: "0.5px solid rgba(229,165,10,0.15)",
              }}
            >
              <p
                className="text-xs font-bold mb-2"
                style={{ color: "rgba(229,165,10,0.5)" }}
              >
                🏆 최고의 궁합
              </p>
              <div className="text-3xl mb-1">✨</div>
              <div
                className="text-xl font-bold mb-1"
                style={{ color: "rgba(229,165,10,0.5)" }}
              >
                —
              </div>
              <div className="text-xs text-white/30 mb-3">데이터 부족</div>
              <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "0%",
                    backgroundColor: "rgba(229,165,10,0.4)",
                  }}
                />
              </div>
            </div>
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                backgroundColor: "rgba(220,38,38,0.05)",
                border: "0.5px solid rgba(220,38,38,0.15)",
              }}
            >
              <p
                className="text-xs font-bold mb-2"
                style={{ color: "rgba(220,38,38,0.5)" }}
              >
                💀 최악의 궁합
              </p>
              <div className="text-3xl mb-1">🌧️</div>
              <div
                className="text-xl font-bold mb-1"
                style={{ color: "rgba(220,38,38,0.5)" }}
              >
                —
              </div>
              <div className="text-xs text-white/30 mb-3">데이터 부족</div>
              <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "0%",
                    backgroundColor: "rgba(220,38,38,0.4)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : summary ? (
        <div className="flex flex-col gap-3 fade-in-up">
          <div className="grid grid-cols-2 gap-3">
            <CompatCard
              title="최고의 궁합"
              score={summary.best.score}
              variant="best"
              onClick={() =>
                setPopup({
                  mA: summary.best.mA,
                  mB: summary.best.mB,
                  score: summary.best.score,
                })
              }
            >
              <p className="text-xs" style={{ color: "#ffffffbb" }}>
                {summary.best.mA.emoji}
                {summary.best.mA.name} × {summary.best.mB.emoji}
                {summary.best.mB.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#ffffff38" }}>
                {summary.best.mA.mbti} + {summary.best.mB.mbti}
              </p>
            </CompatCard>
            <CompatCard
              title="최악의 궁합"
              score={summary.worst.score}
              variant="worst"
              onClick={() =>
                setPopup({
                  mA: summary.worst.mA,
                  mB: summary.worst.mB,
                  score: summary.worst.score,
                })
              }
            >
              <p className="text-xs" style={{ color: "#ffffffbb" }}>
                {summary.worst.mA.emoji}
                {summary.worst.mA.name} × {summary.worst.mB.emoji}
                {summary.worst.mB.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#ffffff38" }}>
                {summary.worst.mA.mbti} + {summary.worst.mB.mbti}
              </p>
            </CompatCard>
          </div>
        </div>
      ) : null}

      {popup && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: "#00000075" }}
            onClick={() => setPopup(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[300px] rounded-2xl p-7 text-center"
            style={{
              background: "#0d0d1a",
              border: `0.5px solid rgba(${rgb},0.32)`,
              boxShadow: `0 0 36px rgba(${rgb},0.18)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPopup(null)}
              className="absolute top-3 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "0.5px solid rgba(255,255,255,0.18)",
                color: "#ffffffaa",
              }}
            >
              ✕
            </button>
            <div className="text-4xl mb-2">{info?.e}</div>
            <div
              className="text-2xl font-black mb-1"
              style={{ color, textShadow: `0 0 14px rgba(${rgb},0.9)` }}
            >
              {popup.score}%
            </div>
            <div
              className="text-sm font-bold mb-1"
              style={{ color: "#ffffffcc" }}
            >
              {popup.mA.emoji} {popup.mA.name}({popup.mA.mbti}) ×{" "}
              {popup.mB.emoji} {popup.mB.name}({popup.mB.mbti})
            </div>
            <div
              className="text-xs px-3 py-1 rounded-full inline-block mb-4"
              style={{
                color,
                background: `rgba(${rgb},0.1)`,
                border: `0.5px solid rgba(${rgb},0.35)`,
              }}
            >
              {info?.l}
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden mb-4"
              style={{ background: "#ffffff0a" }}
            >
              <div
                className="h-full rounded-full gauge-bar"
                style={{
                  width: `${popup.score}%`,
                  background: color,
                  boxShadow: `0 0 8px rgba(${rgb},0.8)`,
                }}
              />
            </div>
            <p
              className="text-xs leading-relaxed text-left"
              style={{ color: "#ffffff48" }}
            >
              {getDesc(popup.mA.mbti, popup.mB.mbti)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
