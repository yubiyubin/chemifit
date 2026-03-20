/**
 * @file MbtiGraph.tsx
 * @description Canvas 기반 MBTI 궁합 네트워크 그래프 컴포넌트
 *
 * - 중앙에 사용자가 선택한 MBTI 타입을 배치하고, 궤도 위에 나머지 15개 타입을 원형으로 분포시킨다.
 * - 각 타입 간 궁합 점수(0~100)에 따라 노드까지의 거리, 연결선 두께, 색상(HSL)을 동적으로 계산한다.
 * - 마우스 호버 시 해당 연결선을 강조(glow + 두께 증가)하고, 클릭 시 상세 궁합 팝업을 표시한다.
 * - 노드 간 겹침을 방지하기 위해 반복적인 충돌 해소(repulsion) 알고리즘을 적용한다.
 * - MBTI 변경 시 이전 위치에서 새 위치로 easeInOut 보간 애니메이션을 수행한다.
 */
"use client";
import {
  MBTI_TYPES,
  COMPATIBILITY,
  MbtiType,
} from "@/data/compatibility";
import CompatDetailModal, { type CompatDetailData } from "./CompatDetailModal";
import { getGraphColor as getColor, hslToRgb } from "@/data/colors";
import { useEffect, useRef, useState, useCallback, type RefObject } from "react";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

/** 컴포넌트 Props: 선택된 MBTI 타입 */
type Props = { selectedMbti: MbtiType };

/**
 * 그래프 위 단일 노드의 위치·크기·메타 정보
 * @property x, y - 캔버스 내 절대 좌표
 * @property r - 노드 원의 반지름(px)
 * @property mbti - 해당 노드의 MBTI 타입
 * @property score - 중앙 타입과의 궁합 점수(0~100)
 * @property isCenter - 중앙(선택된) 노드 여부
 * @property isHighlight - 최고/최저 궁합으로 강조 표시 여부
 * @property highlightType - 강조 종류: "best"(최고궁합), "worst"(최저궁합), null(일반)
 */
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

/** 현재 호버 중인 연결선의 양 끝 노드 인덱스 (없으면 null) */
type HoverLine = { i: number; j: number } | null;

// 팝업 데이터 타입: CompatDetailModal과 공유

/**
 * 연결선 히트 테스트용 데이터
 * 캔버스에 그려진 각 연결선의 양 끝 좌표와 메타 정보를 저장하여
 * 마우스 이벤트 시 가장 가까운 선을 빠르게 탐색한다.
 */
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

// ─────────────────────────────────────────────
// 색상 / 위치 계산 유틸리티 함수
// ─────────────────────────────────────────────

// 색상 유틸리티: getColor(=getGraphColor), hslToRgb → @/data/colors에서 import

/**
 * 점(px, py)에서 선분(x1,y1)-(x2,y2)까지의 최단 거리를 계산한다.
 * 마우스 호버 시 가장 가까운 연결선을 판별하는 히트 테스트에 사용된다.
 * @returns 점에서 선분까지의 유클리드 거리(px)
 */
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
  // 선분 위의 가장 가까운 점을 매개변수 t(0~1)로 구한다
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)),
  );
  return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
}

/**
 * easeInOutQuad 이징 함수.
 * 애니메이션 시작/끝은 느리고 중간은 빠른 자연스러운 가속·감속 효과를 제공한다.
 * @param t - 진행률 (0.0 ~ 1.0)
 * @returns 이징이 적용된 진행률 (0.0 ~ 1.0)
 */
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ─────────────────────────────────────────────
// 노드 배치 상수 (궤도 위 지터링용)
// ─────────────────────────────────────────────

/**
 * 각 노드의 궤도 각도에 더해지는 미세 오프셋.
 * 균일한 원형 배치가 아닌 자연스럽게 흩어진 느낌을 주기 위해 사용한다.
 */
const ANGLE_OFFSETS = [
  0, 0.35, -0.28, 0.55, -0.42, 0.2, -0.5, 0.65, 0.1, -0.35, 0.45, -0.2, 0.6,
  -0.15, 0.25, -0.6,
];

/**
 * 각 노드의 궤도 거리에 곱해지는 배율.
 * 노드가 동일 반경에 겹치지 않도록 거리 변화를 부여한다.
 */
const DIST_MULTS = [
  1.0, 1.2, 0.88, 1.35, 0.82, 1.15, 0.92, 1.28, 1.05, 0.85, 1.22, 0.9, 1.1,
  0.78, 1.3, 0.95,
];

// ─────────────────────────────────────────────
// 노드 위치 계산 + 충돌 방지 알고리즘
// ─────────────────────────────────────────────

/**
 * 선택된 MBTI를 중심으로 15개 타입의 그래프 노드 위치를 계산한다.
 *
 * 1) 중앙 노드 배치 (선택된 MBTI)
 * 2) 나머지 15개를 궤도 위에 각도·거리 지터링과 함께 배치
 * 3) 최고/최저 궁합 타입에 하이라이트 표시 부여
 * 4) 반복적 충돌 해소 루프로 노드 겹침 방지
 *
 * @param selectedMbti - 중앙에 놓일 사용자 선택 MBTI 타입
 * @param W - 캔버스 가로 크기(px)
 * @param H - 캔버스 세로 크기(px)
 * @returns 모든 노드(중앙 1 + 궤도 15)의 위치 배열
 */
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
  // 최고·최저 궁합 타입을 Set으로 관리 (동점 복수 가능)
  const bestSet = new Set(
    scores.filter((s) => s.score === maxScore).map((s) => s.mbti),
  );
  const worstSet = new Set(
    scores.filter((s) => s.score === minScore).map((s) => s.mbti),
  );
  const highlights = new Set([...bestSet, ...worstSet]);

  // 캔버스 중심 좌표 및 노드 크기 계산
  const cx = W / 2,
    cy = H / 2;
  const centerR = W * 0.1215;   // 중앙 노드 반지름 (가장 큼)
  const normalR = W * 0.09;     // 하이라이트 노드 반지름
  const halfR = W * 0.048;      // 일반 노드 반지름 (작음)
  const orbit = Math.min(W, H) * 0.38; // 궤도 기본 반경

  // 중앙 노드를 첫 번째로 추가
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

  // 나머지 15개 타입을 궤도 위에 배치
  const n = others.length;
  others.forEach((mbti, i) => {
    const score = COMPATIBILITY[selectedMbti][mbti];
    const isHighlight = highlights.has(mbti);
    const r = isHighlight ? normalR : halfR;
    // 균등 분할 각도 + 지터 오프셋으로 자연스러운 분포 생성
    const baseAngle = (2 * Math.PI * i) / n - Math.PI / 2;
    const jitter =
      ANGLE_OFFSETS[i % ANGLE_OFFSETS.length] * (0.5 / Math.max(n, 3));
    const angle = baseAngle + jitter;
    // 궤도 거리에 배율을 곱해 동일 원 위 겹침 방지
    const d = orbit * DIST_MULTS[i % DIST_MULTS.length];
    // 캔버스 경계 마진 (노드가 잘리지 않도록)
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

  // ── 충돌 방지 알고리즘 ──
  // 모든 노드 쌍을 검사하여 겹침이 있으면 서로 밀어낸다.
  // 최대 200회 반복하며, 한 번의 루프에서 이동이 없으면 조기 종료한다.
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
          // 중앙 노드는 고정, 나머지만 이동
          if (!a.isCenter) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          }
          if (!b.isCenter) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
          // 밀어낸 후 캔버스 범위를 벗어나지 않도록 클램프
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
    // 더 이상 겹침이 없으면 루프 조기 종료
    if (!moved) break;
  }

  return positions;
}

/**
 * 이전 위치 배열(from)과 새 위치 배열(to) 사이를 선형 보간한다.
 * MBTI 타입 이름으로 매칭하여, 타입이 동일한 노드끼리 x, y, r을 보간한다.
 * 새로 추가된 타입은 반지름 0에서 시작하여 자연스럽게 나타난다.
 *
 * @param from - 이전 프레임의 노드 위치 배열
 * @param to - 목표 노드 위치 배열
 * @param t - 보간 진행률 (0.0 ~ 1.0, 이징 적용 후 값)
 * @returns 보간된 중간 위치 배열
 */
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

// ─────────────────────────────────────────────
// Canvas 그리기 로직
// ─────────────────────────────────────────────

/**
 * Canvas 위에 모든 연결선(중앙↔궤도, 궤도↔궤도)을 그린다.
 *
 * 각 연결선은 두 번 그려진다:
 *  1) 넓은 폭 + 낮은 투명도로 glow(외곽 발광) 레이어
 *  2) 실제 폭 + 높은 투명도로 메인 선 레이어
 *
 * 중앙 연결선은 점수 라벨을 항상 표시하며,
 * 궤도 간 연결선은 호버 시에만 라벨을 표시한다.
 * 그린 모든 선의 좌표를 lineHitsRef에 저장하여 히트 테스트에 활용한다.
 *
 * @param canvas - 대상 HTMLCanvasElement
 * @param positions - 현재 프레임의 노드 위치 배열
 * @param W - 캔버스 가로 크기(논리 픽셀)
 * @param H - 캔버스 세로 크기(논리 픽셀)
 * @param hovered - 현재 호버 중인 연결선 인덱스 (없으면 null)
 * @param lineHitsRef - 히트 테스트용 연결선 데이터를 누적할 Ref
 */
function drawCanvas(
  canvas: HTMLCanvasElement,
  positions: NodePos[],
  W: number,
  H: number,
  hovered: HoverLine,
  lineHitsRef: RefObject<LineHit[]>,
) {
  const ctx = canvas.getContext("2d")!;
  // Retina 대응: 물리 크기를 2배로 설정하고 CSS 크기는 원래대로 유지
  canvas.width = W * 2;
  canvas.height = H * 2;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, W, H);
  lineHitsRef.current = [];

  // 모든 노드 쌍에 대해 연결선 그리기
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i],
        b = positions[j];
      // 한쪽이 중앙 노드인지 여부에 따라 선 스타일이 달라진다
      const isCenter = a.isCenter || b.isCenter;
      // 궁합 점수 결정: 중앙↔궤도이면 해당 궤도 노드의 score, 궤도↔궤도이면 COMPATIBILITY 조회
      const score = isCenter
        ? a.isCenter
          ? b.score
          : a.score
        : COMPATIBILITY[a.mbti][b.mbti];
      // 색상 계산용 키 (동일 쌍에 일관된 색상 보장)
      const lineKey = a.isCenter ? b.mbti : `${a.mbti}${b.mbti}`;
      const color = getColor(score, lineKey),
        rgb = hslToRgb(color);

      // 두 노드 간 거리 및 방향 벡터 계산
      const dx = b.x - a.x,
        dy = b.y - a.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) continue; // 너무 가까우면 그리지 않음
      const nx = dx / dist,
        ny = dy / dist;

      // 선의 시작·끝점을 노드 원 가장자리로 조정 (원 내부를 관통하지 않도록)
      const x1 = a.x + nx * a.r,
        y1 = a.y + ny * a.r;
      const x2 = b.x - nx * b.r,
        y2 = b.y - ny * b.r;

      const isHov = hovered?.i === i && hovered?.j === j;
      const isHL =
        (!a.isCenter && a.isHighlight) || (!b.isCenter && b.isHighlight);

      if (isCenter) {
        // ── 중앙 노드와 연결된 주요 선 그리기 ──
        // 선 두께: 호버 > 하이라이트 > 일반 순으로 두꺼움
        const sw = isHov
          ? 4 + (score / 100) * 9
          : isHL
            ? 2 + (score / 100) * 6
            : 0.8 + (score / 100) * 3;

        // 1) glow(외곽 발광) 레이어
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

        // 2) 메인 선 레이어
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 1 : isHL ? 0.85 : 0.45})`;
        ctx.lineWidth = sw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();

        // 3) 선 중간에 궁합 점수 라벨 표시
        // 선의 법선 방향으로 오프셋하여 텍스트가 선과 겹치지 않게 한다
        const tx = (x1 + x2) / 2,
          ty = (y1 + y2) / 2,
          px = -ny * (isHov ? 26 : 20),
          py = nx * (isHov ? 26 : 20);
        const fs = isHov ? 22 : isHL ? 13 : 9;      // 폰트 크기
        const alpha = isHov ? 1 : isHL ? 0.97 : 0.55; // 텍스트 투명도
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
        // ── 궤도 노드끼리의 보조 연결선: 내 MBTI와 무관하므로 숨김 ──
        continue;
      }
      // 히트 테스트를 위해 중앙 연결선만 저장
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

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

/**
 * MBTI 궁합 네트워크 그래프 컴포넌트.
 *
 * Canvas 레이어(연결선)와 DOM 레이어(노드 원)를 겹쳐 렌더링한다.
 * - Canvas: 모든 연결선 + 점수 라벨 (성능을 위해 2D Context 직접 사용)
 * - DOM: 각 MBTI 노드 (hover/click 이벤트 + CSS transition 활용)
 *
 * @param selectedMbti - 중앙에 배치할 사용자 선택 MBTI 타입
 */
export default function MbtiGraph({ selectedMbti }: Props) {
  // ── Ref 선언부 ──
  const wrapRef = useRef<HTMLDivElement>(null);       // 최외곽 래퍼 div
  const canvasRef = useRef<HTMLCanvasElement>(null);   // 연결선 그리기용 Canvas
  const nodesRef = useRef<HTMLDivElement>(null);       // DOM 노드 컨테이너
  const lineHitsRef = useRef<LineHit[]>([]);           // 연결선 히트 테스트 데이터
  const nodeElsRef = useRef<HTMLDivElement[]>([]);     // 개별 노드 DOM 엘리먼트 배열
  const animRAFRef = useRef<number | null>(null);      // 현재 진행 중인 rAF ID (취소용)
  const prevPosRef = useRef<NodePos[]>([]);             // 이전 프레임 노드 위치 (보간 시작점)
  const lastInterpRef = useRef<NodePos[]>([]);          // 마지막 보간 결과 (애니메이션 중단 시 이어가기용)
  const cachePosRef = useRef<NodePos[]>([]);            // 애니메이션 완료 후 최종 위치 캐시
  const hoverRef = useRef<HoverLine>(null);            // 현재 호버 중인 연결선
  const [popup, setPopup] = useState<CompatDetailData>(null); // 팝업 표시 상태
  const dimsRef = useRef({ W: 0, H: 0 });             // 캔버스 크기 Ref (불필요한 리렌더 방지)
  const [dims, setDims] = useState({ W: 0, H: 0 });   // 캔버스 크기 State (JSX 반영용)

  /**
   * 각 노드 DOM 엘리먼트에 스타일(색상, 글로우, 크기, 이벤트 핸들러)을 적용한다.
   * 위치(left, top)는 애니메이션 루프가 별도로 제어하므로 여기서는 다루지 않는다.
   */
  const applyNodeStyles = useCallback(
    (positions: NodePos[]) => {
      positions.forEach((pos, idx) => {
        const el = nodeElsRef.current[idx];
        if (!el) return;
        const { r, mbti, isCenter, isHighlight, score, highlightType } =
          pos;
        const isBest = highlightType === "best";
        const isWorst = highlightType === "worst";

        // 노드 기본 색상: 중앙=보라, 최고궁합=밝은 핑크, 최저궁합=딥 퍼플, 일반=점수 기반
        const baseColor = isCenter
          ? "hsl(270,77%,58%)"
          : isBest
            ? "hsl(36,88%,56%)"
            : isWorst
              ? "hsl(340,75%,56%)"
              : getColor(score, mbti);
        const color = baseColor;
        const rgb = hslToRgb(color);

        // 글로우(외곽 발광) 크기와 투명도: 중앙 > 하이라이트 > 일반
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

        // 노드 내부 텍스트 크기 계산
        const ns = Math.max(r * 0.26, 5);  // MBTI 이름 폰트 크기
        const es = Math.max(r * 0.38, 7);  // 배지 이모지 폰트 크기
        const ms = Math.max(r * 0.28, 6);  // 점수 텍스트 폰트 크기
        const badge = isBest ? "🏆" : isWorst ? "💀" : "";
        el.innerHTML = `
        ${badge ? `<span class="mbti-badge" style="font-size:${es}px;line-height:1;opacity:0;transition:opacity 2s ease;">${badge}</span>` : ""}
        <span style="font-size:${ns}px;font-weight:700;color:rgba(${rgb},${isHighlight || isCenter ? 0.85 : 0.6});text-shadow:0 0 6px rgba(${rgb},0.6);line-height:1.2;">${mbti}</span>
        <span style="font-size:${ms}px;font-weight:800;color:rgba(${rgb},1);text-shadow:0 0 8px rgba(${rgb},${isHighlight ? 0.9 : 0.5});line-height:1.2;">${isCenter ? "" : score + "%"}</span>
      `;

        // 중앙 노드가 아닌 경우에만 호버/클릭 이벤트 등록
        if (!isCenter) {
          // 마우스 진입: 노드 확대 + 강한 글로우
          el.onmouseenter = () => {
            const hg = Math.max(r * 1.5, 14);
            el.style.boxShadow = `0 0 ${hg}px rgba(${rgb},0.85),0 0 ${hg * 2}px rgba(${rgb},0.4),inset 0 0 ${r * 0.6}px rgba(${rgb},0.28)`;
            el.style.transform = "translate(-50%,-50%) scale(1.25)";
            el.style.borderColor = `rgba(${rgb},1)`;
            el.style.opacity = "1";
          };
          // 마우스 이탈: 원래 스타일로 복원
          el.onmouseleave = () => {
            el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.4}px rgba(${rgb},${isHighlight ? 0.1 : 0.05})`;
            el.style.transform = "translate(-50%,-50%) scale(1)";
            el.style.borderColor = `rgba(${rgb},${isCenter ? 0.85 : isHighlight ? 0.65 : 0.35})`;
            el.style.opacity = isHighlight ? "1" : "0.65";
          };
          // 클릭: 궁합 상세 팝업 표시
          el.onclick = (e) => {
            e.stopPropagation();
            setPopup({ my: selectedMbti, other: mbti, score });
          };
        }
      });
    },
    [selectedMbti],
  );

  // ─────────────────────────────────────────────
  // 메인 렌더 함수 (Canvas + DOM 노드 통합)
  // ─────────────────────────────────────────────

  /**
   * 그래프 전체를 (재)렌더링한다.
   * 1) 노드 위치 계산 (buildPositions)
   * 2) DOM 노드 풀 조정 (부족하면 생성, 초과하면 제거)
   * 3) 스타일 적용 (applyNodeStyles)
   * 4) 보간 애니메이션 시작 (이전 위치 → 새 위치, 2.5초)
   * 5) Canvas 마우스 이벤트 핸들러 등록
   */
  const render = useCallback(
    (W: number, H: number) => {
      if (!canvasRef.current || !nodesRef.current || !wrapRef.current) return;
      const newPos = buildPositions(selectedMbti, W, H);
      const needed = newPos.length;
      const container = nodesRef.current;
      wrapRef.current.style.height = H + "px";
      container.style.height = H + "px";

      // DOM 노드 풀 관리: 필요한 만큼 생성/제거
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

      // 진행 중인 애니메이션이 있으면 취소하고 현재 보간 위치를 시작점으로 저장
      if (animRAFRef.current) {
        cancelAnimationFrame(animRAFRef.current);
        animRAFRef.current = null;
        if (lastInterpRef.current.length > 0) {
          prevPosRef.current = [...lastInterpRef.current];
        }
      }

      // 이전 위치가 없으면(초기 로드) 중앙에서 r=0으로 시작
      const from =
        prevPosRef.current.length > 0
          ? [...prevPosRef.current]
          : newPos.map((p) => ({ ...p, x: cx, y: cy, r: 0 }));
      const start = performance.now(),
        dur = 2500; // 애니메이션 총 시간 (ms)
      const isInitial = from[0]?.r === 0 || from[0]?.r === undefined;

      // 초기 로드 시 페이드인 효과를 위해 투명도 0으로 시작
      if (isInitial) {
        canvas.style.opacity = "0";
        container.style.opacity = "0";
      } else {
        canvas.style.opacity = "1";
        container.style.opacity = "1";
      }

      // ── requestAnimationFrame 애니메이션 루프 ──
      const frame = (now: number) => {
        const raw = Math.min((now - start) / dur, 1); // 0~1 선형 진행률
        const t = ease(raw); // 이징 적용된 진행률
        const interp = interpolatePos(from, newPos, t);
        lastInterpRef.current = interp;

        // Canvas에 현재 보간 위치로 연결선 그리기
        drawCanvas(canvas, interp, W, H, hoverRef.current, lineHitsRef);

        // 초기 로드 시 페이드인: 진행률의 2배 속도로 투명도 증가
        if (isInitial) {
          const opStr = String(Math.min(raw * 2, 1));
          canvas.style.opacity = opStr;
          container.style.opacity = opStr;
        }

        // 각 DOM 노드의 위치·크기를 보간 값으로 업데이트
        interp.forEach((pos, idx) => {
          const el = nodeElsRef.current[idx];
          if (!el) return;
          el.style.left = `${pos.x}px`;
          el.style.top = `${pos.y}px`;
          el.style.width = `${pos.r * 2}px`;
          el.style.height = `${pos.r * 2}px`;
        });

        if (raw < 1) {
          // 아직 완료되지 않았으면 다음 프레임 요청
          animRAFRef.current = requestAnimationFrame(frame);
        } else {
          // 애니메이션 완료: 최종 위치 캐시 저장
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

      // ─────────────────────────────────────────────
      // 마우스 이벤트 핸들링 (Canvas 위)
      // ─────────────────────────────────────────────

      /**
       * mousemove: 마우스 위치에서 가장 가까운 연결선을 찾아 호버 상태를 갱신한다.
       * 임계 거리(18px) 이내의 선만 호버 대상으로 인정한다.
       */
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        // CSS 크기와 논리 크기가 다를 수 있으므로 비율 보정
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        let best: HoverLine = null,
          bestD = 18; // 호버 감지 임계 거리(px)
        for (const h of lineHitsRef.current) {
          const d = ptToSegDist(mx, my, h.x1, h.y1, h.x2, h.y2);
          if (d < bestD) {
            bestD = d;
            best = { i: h.i, j: h.j };
          }
        }
        // 호버 상태가 변경된 경우에만 Canvas를 다시 그린다 (성능 최적화)
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

      /** mouseleave: 캔버스 밖으로 나가면 호버 상태 초기화 */
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

      /** click: 가장 가까운 연결선을 클릭하면 궁합 상세 팝업을 표시한다 */
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
        if (hit) setPopup({ my: hit.mA, other: hit.mB, score: hit.score });
      };
    },
    [selectedMbti, applyNodeStyles],
  );

  /**
   * 캔버스 크기(W, H)가 변경되었을 때만 state를 업데이트한다.
   * Ref와 State를 병행하여 불필요한 리렌더를 방지한다.
   */
  const updateDims = useCallback((W: number, H: number) => {
    const prev = dimsRef.current;
    if (prev.W !== W || prev.H !== H) {
      dimsRef.current = { W, H };
      setDims({ W, H });
    }
  }, []);

  // ── selectedMbti 변경 시 초기화 및 재렌더 ──
  useEffect(() => {
    prevPosRef.current = [];
    cachePosRef.current = [];
    if (!wrapRef.current) return;
    const W = wrapRef.current.getBoundingClientRect().width || 560;
    const H = Math.min(W * 0.88, 500);
    queueMicrotask(() => updateDims(W, H));
    render(W, H);
  }, [selectedMbti, render, updateDims]);

  // ── 컨테이너 리사이즈 감지 → 재렌더 ──
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

  return (
    <>
      {/* 그래프 래퍼: Canvas(연결선)와 DOM 노드를 겹쳐 배치 */}
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
        {/* 연결선 Canvas 레이어 (절대 위치, 노드 아래) */}
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full" />
        {/* DOM 노드 컨테이너 (Canvas 위에 겹침) */}
        <div
          ref={nodesRef}
          className="relative w-full"
          style={{ height: dims.H || 200 }}
        />
      </div>

      {/* 궁합 상세 모달 (노드/연결선 클릭 시 표시) */}
      <CompatDetailModal data={popup} onClose={() => setPopup(null)} />
    </>
  );
}
