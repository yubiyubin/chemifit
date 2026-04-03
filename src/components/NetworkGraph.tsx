/**
 * NetworkGraph — Canvas 기반 공유 네트워크 그래프 컴포넌트
 *
 * MbtiGraph(궁합맵)와 GroupGrid(그룹궁합)에서 재사용.
 * Canvas 레이어(연결선)와 DOM 레이어(노드 원)를 겹쳐 렌더링한다.
 *
 * 공유 기능: Canvas 렌더링, 보간 애니메이션, 마우스 이벤트, 리사이즈, 노드 풀 관리
 * 소비자가 props로 제공: 노드 위치 계산, 노드 스타일링, 이벤트 핸들러
 */
"use client";

import { useEffect, useRef, useState, useCallback, type RefObject } from "react";
import { COMPATIBILITY, type MbtiType, type Member } from "@/data/compatibility";
import { getGraphColor as getColor, hslToRgb } from "@/data/colors";

// ─────────────────────────────────────────────
// 공유 타입 정의
// ─────────────────────────────────────────────

/** 그래프 노드의 위치·크기·메타 정보 */
export type GraphNode = {
  x: number;
  y: number;
  r: number;
  /** 보간 매칭용 고유 키 (MbtiGraph: MBTI 타입, GroupGrid: name_mbti_emoji) */
  id: string;
  /** MBTI 타입 (궁합 점수 조회에 사용) */
  mbti: MbtiType;
  /** 중앙 노드와의 궁합 점수 (0~100) */
  score: number;
  /** 중앙(선택된) 노드 여부 */
  isCenter: boolean;
  /** 최고/최저 궁합 강조 여부 (MbtiGraph 전용) */
  isHighlight?: boolean;
  /** 강조 종류 (MbtiGraph 전용) */
  highlightType?: "best" | "worst" | null;
  /** 소비자별 추가 데이터 (GroupGrid: Member 객체 등) */
  data?: Member;
};

/** 연결선 히트 테스트용 데이터 */
type LineHit = {
  x1: number; y1: number;
  x2: number; y2: number;
  i: number; j: number;
  score: number;
  isCenter: boolean;
};

/** 호버 중인 연결선의 양 끝 인덱스 */
type HoverLine = { i: number; j: number } | null;

/** Canvas 라벨 렌더링용 데이터 */
type LabelInfo = {
  x: number; y: number;
  text: string; font: string;
  rgb: string; fillStyle: string;
  shadowBlur: number;
};

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

type Props = {
  /** 캔버스 크기를 받아 노드 위치 배열을 반환 (충돌 해소 포함) */
  buildPositions: (W: number, H: number) => GraphNode[];
  /** 노드 DOM 요소에 스타일·이벤트를 적용 */
  applyNodeStyles: (nodes: GraphNode[], els: HTMLDivElement[]) => void;
  /** 연결선 클릭 시 콜백 (팝업 표시 등) */
  onLineClick?: (nodeA: GraphNode, nodeB: GraphNode, score: number) => void;
  /** 애니메이션 완료 시 콜백 (요약 계산, 배지 페이드인 등) */
  onAnimComplete?: (nodes: GraphNode[], container: HTMLDivElement) => void;
  /** 연결선 색상 키 생성 함수 (미지정 시 score만으로 색상 결정) */
  getLineColorKey?: (a: GraphNode, b: GraphNode) => string;
  /** 궤도 노드 간 연결선 표시 여부 (기본: false — 중앙 연결선만) */
  drawNonCenterLines?: boolean;
  /** 캔버스 높이 = 너비 × heightRatio (기본: 1.0) */
  heightRatio?: number;
  /** 캔버스 최대 높이 (기본: 580) */
  maxHeight?: number;
  /** 보간 애니메이션 시간 ms (기본: 2500) */
  animDuration?: number;
  /** 초기 로드 시 페이드인 여부 (기본: true) */
  fadeIn?: boolean;
  /** buildPositions 변경 시 이전 위치 리셋 여부 (기본: true — 중심에서 펼침) */
  resetOnDataChange?: boolean;
  /** 색상 테마 — "cyan" 전달 시 시안 계열 선 색상 사용 (GroupGrid용) */
  colorTheme?: "cyan";
};

// ─────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────

/** 기본 궁합 점수 조회 */
const defaultGetLineScore = (a: GraphNode, b: GraphNode): number =>
  COMPATIBILITY[a.mbti]?.[b.mbti] ?? COMPATIBILITY[b.mbti]?.[a.mbti] ?? 50;

/** 점(px,py)에서 선분(x1,y1)-(x2,y2)까지의 최단 거리 */
function ptToSegDist(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
): number {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (!len) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
}

/** easeInOutQuad 이징 함수 */
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** 이전 위치에서 새 위치로 보간. 새 노드는 중심(cx,cy)에서 등장 */
function interpolatePos(
  from: GraphNode[], to: GraphNode[], t: number, cx: number, cy: number,
): GraphNode[] {
  const fromMap = new Map(from.map((p) => [p.id, p]));
  return to.map((tg) => {
    const f = fromMap.get(tg.id) ?? { ...tg, x: cx, y: cy, r: 0 };
    return {
      ...tg,
      x: f.x + (tg.x - f.x) * t,
      y: f.y + (tg.y - f.y) * t,
      r: f.r + (tg.r - f.r) * t,
    };
  });
}

// ─────────────────────────────────────────────
// Canvas 그리기 로직
// ─────────────────────────────────────────────

/**
 * Canvas에 연결선 + 점수 라벨을 그린다.
 * - hasHighlights가 true면 MbtiGraph 스타일(3단계: hover/highlight/normal)
 * - false면 GroupGrid 스타일(2단계: hover/normal, 더 두꺼운 기본 선)
 * - 라벨은 모두 수집 후 충돌 해소 → 렌더링 (라벨이 선 위에 표시됨)
 */
function drawCanvas(
  canvas: HTMLCanvasElement,
  positions: GraphNode[],
  W: number, H: number,
  hovered: HoverLine,
  lineHitsRef: RefObject<LineHit[]>,
  getLineColorKey: ((a: GraphNode, b: GraphNode) => string) | undefined,
  drawNonCenterLines: boolean,
  colorTheme?: "cyan",
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = W * 2;
  canvas.height = H * 2;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, W, H);
  lineHitsRef.current = [];

  const hasHL = positions.some((p) => p.isHighlight);
  const labels: LabelInfo[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i], b = positions[j];
      const isCenter = a.isCenter || b.isCenter;
      if (!isCenter && !drawNonCenterLines) continue;

      const score = defaultGetLineScore(a, b);
      const colorKey = getLineColorKey?.(a, b);
      const color = getColor(score, colorKey, colorTheme);
      const rgb = hslToRgb(color);
      const s = score / 100;

      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) continue;
      const nx = dx / dist, ny = dy / dist;
      const x1 = a.x + nx * a.r, y1 = a.y + ny * a.r;
      const x2 = b.x - nx * b.r, y2 = b.y - ny * b.r;

      const isHov = hovered?.i === i && hovered?.j === j;
      const isHLLine = hasHL && ((!a.isCenter && a.isHighlight) || (!b.isCenter && b.isHighlight));

      if (isCenter) {
        // ── 중앙 연결선 ──
        const sw = isHov ? 4 + s * 9
          : isHLLine ? 2 + s * 6
          : hasHL ? 0.8 + s * 3
          : 1.5 + s * 5;

        // 글로우 레이어
        ctx.save();
        ctx.shadowColor = `rgba(${rgb},1)`;
        ctx.shadowBlur = isHov ? 26 : isHLLine ? 14 : hasHL ? 6 : 12;
        ctx.strokeStyle = `rgba(${rgb},0.18)`;
        ctx.lineWidth = sw + 5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();

        // 메인 선
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 1 : isHLLine ? 0.85 : hasHL ? 0.45 : 0.82})`;
        ctx.lineWidth = sw;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();

        // 라벨 수집
        const tx = (x1 + x2) / 2, ty = (y1 + y2) / 2;
        const off = isHov ? 26 : 20;
        const fs = isHov ? 22 : isHLLine ? 13 : hasHL ? 9 : 17;
        const alpha = isHov ? 1 : isHLLine ? 0.97 : hasHL ? 0.55 : 0.97;
        labels.push({
          x: tx - ny * off, y: ty + nx * off,
          text: score + "%",
          font: `800 ${fs}px sans-serif`,
          rgb,
          fillStyle: `rgba(${rgb},${alpha})`,
          shadowBlur: isHov ? 18 : isHLLine ? 10 : hasHL ? 4 : 12,
        });
      } else {
        // ── 궤도 간 연결선 (drawNonCenterLines=true 시에만 도달) ──
        const sw = isHov ? 1.8 + s * 3.5 : 0.4 + s * 1.6;

        ctx.save();
        ctx.shadowColor = `rgba(${rgb},1)`;
        ctx.shadowBlur = isHov ? 12 : 3;
        ctx.strokeStyle = `rgba(${rgb},0.05)`;
        ctx.lineWidth = sw + 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 0.65 : 0.2})`;
        ctx.lineWidth = sw;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();

        const tx = (x1 + x2) / 2, ty = (y1 + y2) / 2;
        labels.push({
          x: tx - ny * 14, y: ty + nx * 14,
          text: score + "%",
          font: `700 ${isHov ? 16 : 11}px sans-serif`,
          rgb,
          fillStyle: `rgba(${rgb},${isHov ? 0.97 : 0.52})`,
          shadowBlur: isHov ? 12 : 6,
        });
      }

      lineHitsRef.current.push({ x1, y1, x2, y2, i, j, score, isCenter });
    }
  }

  // ── 라벨 충돌 해소 (반복적 밀어내기) ──
  const minLabelDist = 22;
  for (let iter = 0; iter < 8; iter++) {
    for (let li = 0; li < labels.length; li++) {
      for (let lj = li + 1; lj < labels.length; lj++) {
        const la = labels[li], lb = labels[lj];
        const dx = lb.x - la.x, dy = lb.y - la.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
        if (d < minLabelDist) {
          const push = (minLabelDist - d) / 2;
          const nx2 = dx / d, ny2 = dy / d;
          la.x -= nx2 * push; la.y -= ny2 * push;
          lb.x += nx2 * push; lb.y += ny2 * push;
        }
      }
    }
  }

  // ── 라벨 렌더링 ──
  for (const lb of labels) {
    ctx.save();
    ctx.font = lb.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = `rgba(${lb.rgb},1)`;
    ctx.shadowBlur = lb.shadowBlur;
    ctx.fillStyle = lb.fillStyle;
    ctx.fillText(lb.text, lb.x, lb.y);
    ctx.restore();
  }
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

export default function NetworkGraph({
  buildPositions,
  applyNodeStyles,
  onLineClick,
  onAnimComplete,
  getLineColorKey,
  drawNonCenterLines = false,
  heightRatio = 1.0,
  maxHeight = 580,
  animDuration = 2500,
  fadeIn = true,
  resetOnDataChange = true,
  colorTheme,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  const lineHitsRef = useRef<LineHit[]>([]);
  const nodeElsRef = useRef<HTMLDivElement[]>([]);
  const animRAFRef = useRef<number | null>(null);
  const prevPosRef = useRef<GraphNode[]>([]);
  const lastInterpRef = useRef<GraphNode[]>([]);
  const cachePosRef = useRef<GraphNode[]>([]);
  const hoverRef = useRef<HoverLine>(null);
  const dimsRef = useRef({ W: 0, H: 0 });
  const [dims, setDims] = useState({ W: 0, H: 0 });

  // 최신 콜백을 ref로 저장하여 stale closure 방지
  const cbRef = useRef({ applyNodeStyles, onLineClick, onAnimComplete, getLineColorKey, drawNonCenterLines, animDuration, fadeIn, colorTheme });
  useEffect(() => {
    cbRef.current = { applyNodeStyles, onLineClick, onAnimComplete, getLineColorKey, drawNonCenterLines, animDuration, fadeIn, colorTheme };
  });

  const updateDims = useCallback((W: number, H: number) => {
    const prev = dimsRef.current;
    if (prev.W !== W || prev.H !== H) {
      dimsRef.current = { W, H };
      setDims({ W, H });
    }
  }, []);

  /** 전체 렌더 파이프라인: 위치 계산 → 노드 풀 → 스타일 → 애니메이션 → 이벤트 */
  const render = useCallback(
    (W: number, H: number) => {
      if (!canvasRef.current || !nodesRef.current || !wrapRef.current) return;
      const cb = cbRef.current;

      const newPos = buildPositions(W, H);
      if (!newPos.length) return;
      const container = nodesRef.current;
      wrapRef.current.style.height = H + "px";
      container.style.height = H + "px";

      // ── DOM 노드 풀 관리 ──
      while (nodeElsRef.current.length < newPos.length) {
        const node = document.createElement("div");
        node.style.cssText =
          "position:absolute;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transform:translate(-50%,-50%) scale(1);transition:box-shadow 0.55s ease,transform 0.38s cubic-bezier(.34,1.56,.64,1),opacity 0.4s ease;";
        container.appendChild(node);
        nodeElsRef.current.push(node);
      }
      while (nodeElsRef.current.length > newPos.length) {
        nodeElsRef.current.pop()?.remove();
      }

      cb.applyNodeStyles(newPos, nodeElsRef.current);

      const canvas = canvasRef.current;
      const cx = W / 2, cy = H / 2;

      // 진행 중인 애니메이션을 취소하고 현재 보간 위치를 시작점으로 저장
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

      const start = performance.now();
      const dur = cb.animDuration ?? 2500;
      const shouldFadeIn = cb.fadeIn !== false;
      const isInitial = from[0]?.r === 0 || from[0]?.r === undefined;

      if (shouldFadeIn && isInitial) {
        canvas.style.opacity = "0";
        container.style.opacity = "0";
      } else {
        canvas.style.opacity = "1";
        container.style.opacity = "1";
      }

      // ── 보간 애니메이션 루프 ──
      const frame = (now: number) => {
        const raw = Math.min((now - start) / dur, 1);
        const t = ease(raw);
        const interp = interpolatePos(from, newPos, t, cx, cy);
        lastInterpRef.current = interp;

        drawCanvas(canvas, interp, W, H, hoverRef.current, lineHitsRef,
          cb.getLineColorKey, cb.drawNonCenterLines ?? false, cb.colorTheme);

        if (shouldFadeIn && isInitial) {
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
          cb.onAnimComplete?.(newPos, container);
        }
      };
      animRAFRef.current = requestAnimationFrame(frame);

      // ── 마우스 이벤트 ──
      const redraw = () => {
        drawCanvas(canvas,
          cachePosRef.current.length ? cachePosRef.current : newPos,
          W, H, hoverRef.current, lineHitsRef,
          cb.getLineColorKey, cb.drawNonCenterLines ?? false, cb.colorTheme);
      };

      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        let best: HoverLine = null, bestD = 18;
        for (const h of lineHitsRef.current) {
          const d = ptToSegDist(mx, my, h.x1, h.y1, h.x2, h.y2);
          if (d < bestD) { bestD = d; best = { i: h.i, j: h.j }; }
        }
        if (JSON.stringify(best) !== JSON.stringify(hoverRef.current)) {
          hoverRef.current = best;
          canvas.style.cursor = best ? "pointer" : "default";
          redraw();
        }
      };

      canvas.onmouseleave = () => {
        hoverRef.current = null;
        redraw();
        canvas.style.cursor = "default";
      };

      canvas.onclick = (e) => {
        if (!cbRef.current.onLineClick) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        let best: LineHit | null = null, bestD = 18;
        for (const h of lineHitsRef.current) {
          const d = ptToSegDist(mx, my, h.x1, h.y1, h.x2, h.y2);
          if (d < bestD) { bestD = d; best = h; }
        }
        if (best) {
          const nodes = cachePosRef.current.length ? cachePosRef.current : newPos;
          cbRef.current.onLineClick!(nodes[best.i], nodes[best.j], best.score);
        }
      };
    },
    [buildPositions],
  );

  // ── buildPositions 변경(데이터 변경) 시 재렌더 ──
  useEffect(() => {
    if (resetOnDataChange) {
      prevPosRef.current = [];
      cachePosRef.current = [];
    }
    if (!wrapRef.current) return;
    const W = wrapRef.current.getBoundingClientRect().width || 560;
    const H = Math.min(W * heightRatio, maxHeight);
    queueMicrotask(() => updateDims(W, H));
    render(W, H);
  }, [buildPositions, render, updateDims, resetOnDataChange, heightRatio, maxHeight]);

  // ── 리사이즈 감지 ──
  useEffect(() => {
    const ob = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const W = wrapRef.current.getBoundingClientRect().width || 560;
      const H = Math.min(W * heightRatio, maxHeight);
      updateDims(W, H);
      render(W, H);
    });
    if (wrapRef.current) ob.observe(wrapRef.current);
    return () => ob.disconnect();
  }, [render, updateDims, heightRatio, maxHeight]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full rounded-2xl overflow-hidden transition-all duration-300"
      style={colorTheme === "cyan" ? {
        background: "radial-gradient(circle at center, rgba(0,203,255,0.06) 0%, rgba(7,7,15,0.95) 80%)",
        border: "1px solid rgba(0,203,255,0.15)",
        boxShadow: "0 0 40px rgba(0,203,255,0.08)",
      } : {
        background: "radial-gradient(circle at center, rgba(168,85,247,0.06) 0%, rgba(7,7,15,0.95) 80%)",
        border: "1px solid rgba(168,85,247,0.15)",
        boxShadow: "0 0 40px rgba(168,85,247,0.08)",
      }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full" />
      <div ref={nodesRef} className="relative w-full" style={{ height: dims.H || 200 }} />
    </div>
  );
}
