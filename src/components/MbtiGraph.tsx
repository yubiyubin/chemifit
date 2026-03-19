"use client";
import {
  MBTI_TYPES,
  COMPATIBILITY,
  COMPATIBILITY_DESC,
  MbtiType,
} from "@/data/compatibility";
import { getScoreInfo } from "@/data/labels";
import { useEffect, useRef, useState, useCallback, type RefObject } from "react";

type Props = { selectedMbti: MbtiType };

type NodePos = {
  x: number;
  y: number;
  r: number;
  mbti: MbtiType;
  score: number;
  isCenter: boolean;
  isHighlight: boolean;
  highlightType: "best" | "worst" | null;
};

type HoverLine = { i: number; j: number } | null;
type PopupData = { mA: MbtiType; mB: MbtiType; score: number } | null;

type LineHit = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  i: number;
  j: number;
  mA: MbtiType;
  mB: MbtiType;
  score: number;
  isCenter: boolean;
};

function mbtiHash(mbti: string): number {
  let h = 0;
  for (let i = 0; i < mbti.length; i++) h = (h * 31 + mbti.charCodeAt(i)) | 0;
  return ((h % 30) - 15); // -15 ~ +14 hue offset
}

function getColor(s: number, mbti?: string): string {
  s = Math.max(0, Math.min(100, s));
  const offset = mbti ? mbtiHash(mbti) : 0;
  return `hsl(${s * 3.2 + offset},${77 + s * 0.11}%,${52 + s * 0.05}%)`;
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

function ptToSegDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
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

const ANGLE_OFFSETS = [
  0, 0.35, -0.28, 0.55, -0.42, 0.2, -0.5, 0.65, 0.1, -0.35, 0.45, -0.2, 0.6,
  -0.15, 0.25, -0.6,
];
const DIST_MULTS = [
  1.0, 1.2, 0.88, 1.35, 0.82, 1.15, 0.92, 1.28, 1.05, 0.85, 1.22, 0.9, 1.1,
  0.78, 1.3, 0.95,
];

function buildPositions(
  selectedMbti: MbtiType,
  W: number,
  H: number,
): NodePos[] {
  const others = MBTI_TYPES.filter((t) => t !== selectedMbti);
  const scores = others.map((t) => ({
    mbti: t,
    score: COMPATIBILITY[selectedMbti][t],
  }));
  const maxScore = Math.max(...scores.map((s) => s.score));
  const minScore = Math.min(...scores.map((s) => s.score));
  const bestSet = new Set(
    scores.filter((s) => s.score === maxScore).map((s) => s.mbti),
  );
  const worstSet = new Set(
    scores.filter((s) => s.score === minScore).map((s) => s.mbti),
  );
  const highlights = new Set([...bestSet, ...worstSet]);

  const cx = W / 2,
    cy = H / 2;
  const centerR = W * 0.1215;
  const normalR = W * 0.09;
  const halfR = W * 0.048;
  const orbit = Math.min(W, H) * 0.38;

  const positions: NodePos[] = [
    {
      x: cx,
      y: cy,
      r: centerR,
      mbti: selectedMbti,
      score: 100,
      isCenter: true,
      isHighlight: false,
      highlightType: null,
    },
  ];

  const n = others.length;
  others.forEach((mbti, i) => {
    const score = COMPATIBILITY[selectedMbti][mbti];
    const isHighlight = highlights.has(mbti);
    const r = isHighlight ? normalR : halfR;
    const baseAngle = (2 * Math.PI * i) / n - Math.PI / 2;
    const jitter =
      ANGLE_OFFSETS[i % ANGLE_OFFSETS.length] * (0.5 / Math.max(n, 3));
    const angle = baseAngle + jitter;
    const d = orbit * DIST_MULTS[i % DIST_MULTS.length];
    const mgX = r + 26;
    const mgY = r + 36;
    positions.push({
      x: Math.max(mgX, Math.min(W - mgX, cx + d * Math.cos(angle))),
      y: Math.max(mgY, Math.min(H - mgY, cy + d * Math.sin(angle))),
      r,
      mbti,
      score,
      isCenter: false,
      isHighlight,
      highlightType: bestSet.has(mbti)
        ? "best"
        : worstSet.has(mbti)
          ? "worst"
          : null,
    });
  });

  // 충돌 방지
  for (let iter = 0; iter < 200; iter++) {
    let moved = false;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i],
          b = positions[j];
        // 텍스트와 그림자 영역까지 고려한 여유 충돌 반경
        const minDist = a.r + b.r + 45;
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < minDist) {
          // 겹침을 확실히 해소하기 위해 강하게 밀어내기
          const overlap = (minDist - dist) / 1.5;
          const nx = dx / dist,
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
              const padX = p.r + 26;
              const padY = p.r + 36;
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

function interpolatePos(from: NodePos[], to: NodePos[], t: number): NodePos[] {
  const fromMap = new Map(from.map((p) => [p.mbti, p]));
  return to.map((tg) => {
    const f = fromMap.get(tg.mbti) ?? { ...tg, r: 0 };
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

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i],
        b = positions[j];
      const isCenter = a.isCenter || b.isCenter;
      const score = isCenter
        ? a.isCenter
          ? b.score
          : a.score
        : COMPATIBILITY[a.mbti][b.mbti];
      const lineKey = a.isCenter ? b.mbti : `${a.mbti}${b.mbti}`;
      const color = getColor(score, lineKey),
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
      const isHL =
        (!a.isCenter && a.isHighlight) || (!b.isCenter && b.isHighlight);

      if (isCenter) {
        const sw = isHov
          ? 4 + (score / 100) * 9
          : isHL
            ? 2 + (score / 100) * 6
            : 0.8 + (score / 100) * 3;
        ctx.save();
        ctx.shadowColor = `rgba(${rgb},1)`;
        ctx.shadowBlur = isHov ? 26 : isHL ? 14 : 6;
        ctx.strokeStyle = `rgba(${rgb},0.18)`;
        ctx.lineWidth = sw + 5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 1 : isHL ? 0.85 : 0.45})`;
        ctx.lineWidth = sw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        const tx = (x1 + x2) / 2,
          ty = (y1 + y2) / 2,
          px = -ny * (isHov ? 26 : 20),
          py = nx * (isHov ? 26 : 20);
        const fs = isHov ? 22 : isHL ? 13 : 9;
        const alpha = isHov ? 1 : isHL ? 0.97 : 0.55;
        ctx.save();
        ctx.font = `800 ${fs}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = `rgba(${rgb},1)`;
        ctx.shadowBlur = isHov ? 18 : isHL ? 10 : 4;
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.fillText(score + "%", tx + px, ty + py);
        ctx.restore();
      } else {
        const sw = isHov ? 1.5 + (score / 100) * 3 : 0.3 + (score / 100) * 1.2;
        ctx.save();
        ctx.shadowColor = `rgba(${rgb},1)`;
        ctx.shadowBlur = isHov ? 10 : 2;
        ctx.strokeStyle = `rgba(${rgb},0.04)`;
        ctx.lineWidth = sw + 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 0.6 : 0.14})`;
        ctx.lineWidth = sw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        if (isHov) {
          const tx = (x1 + x2) / 2,
            ty = (y1 + y2) / 2,
            px = -ny * 13,
            py = nx * 13;
          ctx.save();
          ctx.font = `700 14px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = `rgba(${rgb},1)`;
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(${rgb},0.95)`;
          ctx.fillText(score + "%", tx + px, ty + py);
          ctx.restore();
        }
      }
      lineHitsRef.current.push({
        x1,
        y1,
        x2,
        y2,
        i,
        j,
        mA: a.mbti,
        mB: b.mbti,
        score,
        isCenter,
      });
    }
  }
}

export default function MbtiGraph({ selectedMbti }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  const lineHitsRef = useRef<LineHit[]>([]);
  const nodeElsRef = useRef<HTMLDivElement[]>([]);
  const animRAFRef = useRef<number | null>(null);
  const prevPosRef = useRef<NodePos[]>([]);
  const lastInterpRef = useRef<NodePos[]>([]);
  const cachePosRef = useRef<NodePos[]>([]);
  const hoverRef = useRef<HoverLine>(null);
  const [popup, setPopup] = useState<PopupData>(null);
  const dimsRef = useRef({ W: 0, H: 0 });
  const [dims, setDims] = useState({ W: 0, H: 0 });

  const applyNodeStyles = useCallback(
    (positions: NodePos[]) => {
      positions.forEach((pos, idx) => {
        const el = nodeElsRef.current[idx];
        if (!el) return;
        const { r, mbti, isCenter, isHighlight, score, highlightType } =
          pos;
        const isBest = highlightType === "best";
        const isWorst = highlightType === "worst";
        const baseColor = isCenter
          ? "hsl(270,77%,58%)"
          : isBest
            ? "hsl(45,95%,58%)"
            : isWorst
              ? "hsl(0,80%,55%)"
              : getColor(score, mbti);
        const color = baseColor;
        const rgb = hslToRgb(color);
        const glowSz = isCenter
          ? 26
          : isHighlight
            ? Math.max(r * 0.7, 7)
            : Math.max(r * 0.4, 4);
        const glowOp = isCenter
          ? 0.48
          : isHighlight
            ? 0.3 + (score / 100) * 0.2
            : 0.12 + (score / 100) * 0.08;

        // 위치/크기는 애니메이션 루프가 제어
        el.style.border = `${isCenter ? "2.5px" : isHighlight ? "2px" : "1px"} solid rgba(${rgb},${isCenter ? 0.85 : isHighlight ? 0.8 : 0.35})`;
        el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.4}px rgba(${rgb},${isCenter ? 0.14 : isHighlight ? 0.1 : 0.05})`;
        el.style.background = `radial-gradient(circle at 35% 35%,rgba(${rgb},${isCenter ? 0.26 : isHighlight ? 0.2 : 0.1}) 0%,rgba(${rgb},0.05) 65%,transparent 100%),#07070f`;
        el.style.opacity = isHighlight || isCenter ? "1" : "0.75";
        el.style.zIndex = isCenter ? "4" : isHighlight ? "3" : "2";

        const ns = Math.max(r * 0.26, 5);
        const es = Math.max(r * 0.38, 7);
        const ms = Math.max(r * 0.28, 6);
        const badge = isBest ? "🏆" : isWorst ? "💀" : "";
        el.innerHTML = `
        ${badge ? `<span class="mbti-badge" style="font-size:${es}px;line-height:1;opacity:0;transition:opacity 2s ease;">${badge}</span>` : ""}
        <span style="font-size:${ns}px;font-weight:700;color:rgba(${rgb},${isHighlight || isCenter ? 0.85 : 0.6});text-shadow:0 0 6px rgba(${rgb},0.6);line-height:1.2;">${mbti}</span>
        <span style="font-size:${ms}px;font-weight:800;color:rgba(${rgb},1);text-shadow:0 0 8px rgba(${rgb},${isHighlight ? 0.9 : 0.5});line-height:1.2;">${isCenter ? "" : score + "%"}</span>
      `;

        if (!isCenter) {
          el.onmouseenter = () => {
            const hg = Math.max(r * 1.5, 14);
            el.style.boxShadow = `0 0 ${hg}px rgba(${rgb},0.85),0 0 ${hg * 2}px rgba(${rgb},0.4),inset 0 0 ${r * 0.6}px rgba(${rgb},0.28)`;
            el.style.transform = "translate(-50%,-50%) scale(1.25)";
            el.style.borderColor = `rgba(${rgb},1)`;
            el.style.opacity = "1";
          };
          el.onmouseleave = () => {
            el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.4}px rgba(${rgb},${isHighlight ? 0.1 : 0.05})`;
            el.style.transform = "translate(-50%,-50%) scale(1)";
            el.style.borderColor = `rgba(${rgb},${isCenter ? 0.85 : isHighlight ? 0.65 : 0.35})`;
            el.style.opacity = isHighlight ? "1" : "0.65";
          };
          el.onclick = (e) => {
            e.stopPropagation();
            setPopup({ mA: selectedMbti, mB: mbti, score });
          };
        }
      });
    },
    [selectedMbti],
  );

  const render = useCallback(
    (W: number, H: number) => {
      if (!canvasRef.current || !nodesRef.current || !wrapRef.current) return;
      const newPos = buildPositions(selectedMbti, W, H);
      const needed = newPos.length;
      const container = nodesRef.current;
      wrapRef.current.style.height = H + "px";
      container.style.height = H + "px";

      while (nodeElsRef.current.length < needed) {
        const node = document.createElement("div");
        node.style.cssText =
          "position:absolute;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transform:translate(-50%,-50%) scale(1);transition:box-shadow 0.55s ease,transform 0.38s cubic-bezier(.34,1.56,.64,1),opacity 0.4s ease;";
        container.appendChild(node);
        nodeElsRef.current.push(node);
      }
      while (nodeElsRef.current.length > needed) {
        nodeElsRef.current.pop()?.remove();
      }

      applyNodeStyles(newPos);

      const canvas = canvasRef.current;
      const cx = W / 2, cy = H / 2;

      if (animRAFRef.current) {
        cancelAnimationFrame(animRAFRef.current);
        animRAFRef.current = null;
        if (lastInterpRef.current.length > 0) {
          prevPosRef.current = [...lastInterpRef.current];
        }
      }
      const from =
        prevPosRef.current.length > 0
          ? [...prevPosRef.current]
          : newPos.map((p) => ({ ...p, x: cx, y: cy, r: 0 }));
      const start = performance.now(),
        dur = 2500;
      const isInitial = from[0]?.r === 0 || from[0]?.r === undefined;
      if (isInitial) {
        canvas.style.opacity = "0";
        container.style.opacity = "0";
      } else {
        canvas.style.opacity = "1";
        container.style.opacity = "1";
      }
      const frame = (now: number) => {
        const raw = Math.min((now - start) / dur, 1);
        const t = ease(raw);
        const interp = interpolatePos(from, newPos, t);
        lastInterpRef.current = interp;
        drawCanvas(canvas, interp, W, H, hoverRef.current, lineHitsRef);
        if (isInitial) {
          const opStr = String(Math.min(raw * 2, 1));
          canvas.style.opacity = opStr;
          container.style.opacity = opStr;
        }
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
          // 그래프 완료 후 배지 이모지 페이드인
          requestAnimationFrame(() => {
            container.querySelectorAll<HTMLElement>(".mbti-badge").forEach((el) => {
              el.style.opacity = "1";
            });
          });
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
        for (const h of lineHitsRef.current) {
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
    [selectedMbti, applyNodeStyles],
  );

  const updateDims = useCallback((W: number, H: number) => {
    const prev = dimsRef.current;
    if (prev.W !== W || prev.H !== H) {
      dimsRef.current = { W, H };
      setDims({ W, H });
    }
  }, []);

  useEffect(() => {
    prevPosRef.current = [];
    cachePosRef.current = [];
    if (!wrapRef.current) return;
    const W = wrapRef.current.getBoundingClientRect().width || 560;
    const H = Math.min(W * 0.88, 500);
    queueMicrotask(() => updateDims(W, H));
    render(W, H);
  }, [selectedMbti, render, updateDims]);

  useEffect(() => {
    const ob = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const W = wrapRef.current.getBoundingClientRect().width || 560;
      const H = Math.min(W * 0.88, 500);
      updateDims(W, H);
      render(W, H);
    });
    if (wrapRef.current) ob.observe(wrapRef.current);
    return () => ob.disconnect();
  }, [render, updateDims]);

  const color = popup ? getColor(popup.score, `${popup.mA}${popup.mB}`) : "#a855f7";
  const rgb = popup ? hslToRgb(color) : "168,85,247";
  const info = popup ? getScoreInfo(popup.score) : null;

  return (
    <>
      <div
        ref={wrapRef}
        className="relative w-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: "radial-gradient(circle at center, rgba(168,85,247,0.06) 0%, rgba(7,7,15,0.95) 80%)",
          border: "1px solid rgba(168,85,247,0.15)",
          boxShadow: "0 0 40px rgba(168,85,247,0.08)",
          height: dims.H || "auto",
          minHeight: 350,
        }}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full" />
        <div
          ref={nodesRef}
          className="relative w-full"
          style={{ height: dims.H || 200 }}
        />
      </div>

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
            <div className="text-4xl mb-2">{info?.emoji}</div>
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
              {popup.mA} × {popup.mB}
            </div>
            <div
              className="text-xs px-3 py-1 rounded-full inline-block mb-4"
              style={{
                color,
                background: `rgba(${rgb},0.1)`,
                border: `0.5px solid rgba(${rgb},0.35)`,
              }}
            >
              {info?.label}
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
              {COMPATIBILITY_DESC[popup.mA]?.[popup.mB] ??
                COMPATIBILITY_DESC[popup.mB]?.[popup.mA] ??
                `${popup.mA}와 {popup.mB}의 궁합이에요. 서로를 이해하고 배려하면
              좋은 관계가 될 수 있어요.`}
            </p>
          </div>
        </>
      )}
    </>
  );
}
