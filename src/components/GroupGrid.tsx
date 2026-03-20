/**
 * @file GroupGrid.tsx
 * @description 그룹 궁합 네트워크 시각화 + 분석 컴포넌트
 *
 * 2~8명 멤버 간 모든 쌍(pair)의 MBTI 궁합 점수를 시각적으로 표시한다.
 * Canvas 기반 네트워크 그래프 위에 노드(멤버)와 연결선(궁합)을 그리며,
 * 연결선 호버/클릭 시 상세 팝업을 제공한다.
 *
 * 주요 기능:
 * - 중앙 노드(나) + 주변 노드(다른 멤버)의 원형 레이아웃
 * - 궁합 점수에 따라 선 두께·색상·노드 크기가 동적으로 변함
 * - 평균/최고/최저 궁합 하이라이트 요약 카드
 * - Canvas 기반 네트워크 그래프 + 팝업
 * - 노드 추가/제거 시 부드러운 보간(interpolation) 애니메이션
 * - 반응형 리사이즈 대응 (ResizeObserver)
 */
"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type RefObject,
} from "react";
import { COMPATIBILITY, MbtiType, Member } from "@/data/compatibility";
import CompatCard from "@/components/CompatCard";
import { CircularGauge } from "@/components/CoupleResult";
import { getLoveFriendLine } from "@/data/labels";
import { getGraphColor as getColor, hslToRgb } from "@/data/colors";

/** 컴포넌트 Props: 그룹에 포함된 멤버 배열 (첫 번째 멤버가 '나') */
type Props = { members: Member[] };

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

/**
 * 그래프 위 단일 노드의 위치·크기·메타 정보
 * @property x - 캔버스 내 x좌표 (px)
 * @property y - 캔버스 내 y좌표 (px)
 * @property r - 노드 원의 반지름 (궁합 점수에 비례하여 동적 결정)
 * @property m - 해당 노드에 대응하는 멤버 정보 (이름, MBTI, 이모지 등)
 * @property score - 중앙 멤버와의 궁합 점수 (0~100)
 * @property isCenter - 중앙(첫 번째) 멤버 여부
 */
type NodePos = {
  x: number;
  y: number;
  r: number;
  m: Member;
  score: number;
  isCenter: boolean;
};

/** 현재 호버 중인 연결선의 양 끝 노드 인덱스 (없으면 null) */
type HoverLine = { i: number; j: number } | null;

/** 팝업에 표시할 궁합 상세 데이터 (없으면 null) */
type PopupData = { mA: Member; mB: Member; score: number } | null;

/**
 * 연결선 히트 테스트용 데이터
 * 캔버스에 그려진 각 연결선의 양 끝 좌표와 멤버 정보를 저장하여
 * 마우스 이벤트 시 가장 가까운 선을 빠르게 탐색한다.
 * @property x1, y1 - 연결선 시작점 (노드 테두리 기준)
 * @property x2, y2 - 연결선 끝점 (노드 테두리 기준)
 * @property i, j - positions 배열에서의 양끝 노드 인덱스
 * @property mA, mB - 양끝 멤버 정보
 * @property score - 두 멤버 간 궁합 점수
 * @property isCenter - 중앙 노드가 포함된 연결선인지 여부
 */
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

// ─────────────────────────────────────────────
// 상수: 점수 구간별 이모지·라벨 매핑 테이블
// ─────────────────────────────────────────────

/**
 * 궁합 점수를 구간별로 이모지(e)와 한글 라벨(l)에 매핑하는 테이블.
 * 내림차순 min 기준으로 탐색하여 첫 매칭 항목을 반환한다.
 */
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

// ─────────────────────────────────────────────
// 유틸리티 함수들 (getScore, getInfo, getColor, hslToRgb, ptToSegDist, ease)
// ─────────────────────────────────────────────

/**
 * 점수에 해당하는 이모지·라벨 정보를 반환한다.
 * SCORE_EMOJI 테이블에서 score >= min 조건을 만족하는 첫 항목을 찾는다.
 * @param s - 궁합 점수 (0~100)
 * @returns 매칭된 { min, e(이모지), l(라벨) } 객체
 */
function getInfo(s: number) {
  return (
    SCORE_EMOJI.find((e) => s >= e.min) ?? SCORE_EMOJI[SCORE_EMOJI.length - 1]
  );
}

// 색상 유틸리티: getColor(=getGraphColor), hslToRgb → @/data/colors에서 import

/**
 * 두 MBTI 유형 간 궁합 점수를 조회한다.
 * COMPATIBILITY 테이블에서 양방향(a→b, b→a) 조회하며, 없으면 기본값 50 반환.
 * @param a - 첫 번째 MBTI 유형
 * @param b - 두 번째 MBTI 유형
 * @returns 궁합 점수 (0~100)
 */
function getScore(a: MbtiType, b: MbtiType) {
  return COMPATIBILITY[a]?.[b] ?? COMPATIBILITY[b]?.[a] ?? 50;
}

/**
 * 점(px, py)에서 선분(x1,y1)-(x2,y2)까지의 최단 거리를 계산한다.
 * 마우스 호버/클릭 시 연결선 히트 판정에 사용된다.
 *
 * 원리: 점을 선분 위에 투영(projection)하여 투영 비율 t를 구하고,
 * t를 [0, 1]로 클램핑한 후 투영점까지의 거리를 반환한다.
 *
 * @param px - 점의 x좌표 (마우스 위치)
 * @param py - 점의 y좌표
 * @param x1 - 선분 시작점 x
 * @param y1 - 선분 시작점 y
 * @param x2 - 선분 끝점 x
 * @param y2 - 선분 끝점 y
 * @returns 점에서 선분까지의 최단 거리 (px 단위)
 */
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
  // 선분 길이 0이면 시작점까지의 거리 반환
  if (!len) return Math.hypot(px - x1, py - y1);
  // t: 선분 위의 투영 비율 (0=시작점, 1=끝점, 클램핑)
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)),
  );
  return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
}

/**
 * 부드러운 가감속 이징 함수 (ease-in-out quadratic).
 * 노드 위치 보간 애니메이션에서 시작과 끝을 부드럽게 만든다.
 * @param t - 진행률 (0~1)
 * @returns 이징 적용된 진행률 (0~1)
 */
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ─────────────────────────────────────────────
// 멤버 수에 따른 동적 레이아웃 계산
// ─────────────────────────────────────────────

/**
 * 노드 배치 시 자연스러운 불규칙성을 위한 각도 오프셋 (인덱스별).
 * 완벽한 원형 대칭을 깨뜨려 더 자연스럽고 유기적인 레이아웃을 만든다.
 */
const ANGLE_OFFSETS = [0, 0.35, -0.28, 0.55, -0.42, 0.2, -0.5, 0.65];

/**
 * 노드 배치 시 궤도 거리에 변화를 주는 배율 (인덱스별).
 * 모든 노드가 동일 궤도 위에 놓이는 것을 방지한다.
 */
const DIST_MULTS = [1.0, 1.2, 0.88, 1.35, 0.82, 1.15, 0.92, 1.28];

/**
 * 중앙 노드(나)와 주변 노드(다른 멤버)의 위치·크기를 계산한다.
 *
 * 계산 흐름:
 * 1. 멤버 수(n)에 따라 중앙/주변 노드 크기·궤도 반경을 동적 결정
 * 2. 각 주변 노드를 원형 궤도 위에 배치 (불규칙 오프셋 적용)
 * 3. 궁합 점수가 높을수록 노드가 크게 표시됨 (3차 곡선 적용)
 * 4. 노드 간 겹침을 반복적 밀어내기(repulsion)로 해소 (최대 50회)
 *
 * @param myInfo - 중앙 노드 멤버 ('나')
 * @param others - 주변 노드 멤버 배열
 * @param W - 캔버스 너비 (px)
 * @param H - 캔버스 높이 (px)
 * @returns 모든 노드의 위치·크기 배열 (첫 번째가 중앙 노드)
 */
function buildPositions(
  myInfo: Member,
  others: Member[],
  W: number,
  H: number,
): NodePos[] {
  // 캔버스 중심 좌표
  const cx = W / 2,
    cy = H / 2;
  const n = others.length;

  // 멤버 수에 따라 중앙 노드 크기를 동적 조절 (많을수록 작아짐)
  const centerR = W * Math.max(0.073, 0.147 - n * 0.0093) * (2 / 3) * 1.1;
  // 주변 노드의 최대/최소 반지름 (멤버 수에 비례하여 축소)
  const maxNodeR = Math.min(
    centerR * 0.9,
    W * Math.max(0.08, 0.17 - n * 0.012) * (2 / 3) * 1.1,
  );
  const minNodeR = W * Math.max(0.065, 0.076 - n * 0.004) * (2 / 3) * 1.1;
  // 주변 노드가 배치되는 궤도 반경 (멤버 수가 많을수록 약간 줄어듦)
  const orbit = Math.min(W, H) * Math.max(0.3, 0.42 - n * 0.012);

  // 중앙 노드('나')를 첫 번째로 배치
  const positions: NodePos[] = [
    { x: cx, y: cy, r: centerR, m: myInfo, score: 100, isCenter: true },
  ];

  // 주변 노드 배치: 원형 궤도 + 불규칙 오프셋으로 자연스러운 분포
  others.forEach((m, i) => {
    const score = getScore(myInfo.mbti, m.mbti);
    // 점수 비율(0~1)에 따라 노드 크기 결정 (3차 곡선으로 차이 강조)
    const t = score / 100;
    const nodeR = minNodeR + Math.pow(t, 3) * (maxNodeR - minNodeR);
    // 기본 각도: 균등 분할 + 12시 방향(-PI/2)에서 시작
    const baseAngle = (2 * Math.PI * i) / n - Math.PI / 2;
    // 자연스러운 불규칙성을 위한 각도 떨림(jitter) 적용
    const jitter =
      ANGLE_OFFSETS[i % ANGLE_OFFSETS.length] * (0.6 / Math.max(n, 2));
    const angle = baseAngle + jitter;
    // 궤도 거리에 변화를 주어 동일 궤도 배치 방지
    const d = orbit * DIST_MULTS[i % DIST_MULTS.length];
    // 호버 시 확대(scale 1.28) + 여백을 감안한 경계 클램핑
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

  // 노드 간 겹침 해소: 반복적 밀어내기 (최대 50회, 더 이상 이동 없으면 조기 종료)
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
          // 중앙 노드는 고정 — 주변 노드만 밀어냄
          if (!a.isCenter) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          }
          if (!b.isCenter) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
          // 밀어낸 후 캔버스 경계 안으로 클램핑
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

/**
 * 노드의 고유 키를 생성한다.
 * 애니메이션 보간 시 이전 프레임과 현재 프레임의 같은 노드를 매칭하는 데 사용.
 * @param n - 노드 위치 정보
 * @returns 고유 키 문자열 (중앙 노드는 "__center__", 나머지는 "이름_MBTI_이모지")
 */
function nodeKey(n: NodePos): string {
  return n.isCenter ? "__center__" : `${n.m.name}_${n.m.mbti}_${n.m.emoji}`;
}

/**
 * 이전 위치(from)에서 새 위치(to)로 보간된 중간 위치를 계산한다.
 * 노드 추가/제거/위치 변경 시 부드러운 전환 애니메이션에 사용.
 * 이전에 없던 새 노드는 캔버스 중심(cx, cy)에서 등장하도록 처리.
 * @param from - 이전 프레임의 노드 위치 배열
 * @param to - 목표 위치 배열
 * @param t - 보간 비율 (0=이전 위치, 1=목표 위치)
 * @param cx - 캔버스 중심 x (새 노드의 시작점)
 * @param cy - 캔버스 중심 y (새 노드의 시작점)
 * @returns 보간된 노드 위치 배열
 */
function interpolatePos(
  from: NodePos[],
  to: NodePos[],
  t: number,
  cx: number,
  cy: number,
): NodePos[] {
  const fromMap = new Map(from.map((p) => [nodeKey(p), p]));
  return to.map((tg) => {
    // 이전에 없던 노드는 캔버스 중심에서 등장하도록 처리
    const f = fromMap.get(nodeKey(tg)) ?? { ...tg, x: cx, y: cy, r: 0 };
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
 * Canvas에 네트워크 그래프(연결선 + 점수 라벨)를 그린다.
 *
 * 그리기 순서:
 * 1단계 — 모든 노드 쌍의 연결선을 그리고 점수 라벨 위치를 수집
 * 2단계 — 라벨 간 겹침을 반복적 밀어내기(repulsion)로 해소
 * 3단계 — 라벨 텍스트 렌더링
 *
 * 중앙 노드가 포함된 연결선은 더 두껍고 밝게, 주변끼리는 얇고 흐리게 표시.
 * 호버된 연결선은 강조(굵기 증가 + 글로우 강화) 처리.
 *
 * @param canvas - 대상 HTMLCanvasElement
 * @param positions - 현재 노드 위치 배열
 * @param W - 캔버스 논리 너비
 * @param H - 캔버스 논리 높이
 * @param hovered - 현재 호버 중인 연결선 (없으면 null)
 * @param lineHitsRef - 연결선 히트 영역을 저장할 ref (마우스 판정용으로 채워짐)
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
  // Retina(HiDPI) 디스플레이 대응: 물리 크기 2배, CSS 크기 1배
  canvas.width = W * 2;
  canvas.height = H * 2;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, W, H);
  // 이전 히트 영역 초기화 (매 프레임 재계산)
  lineHitsRef.current = [];

  // ── 1단계: 연결선 그리기 + 라벨 위치 수집 ──
  /** 점수 라벨의 위치·스타일 정보 (2단계 충돌 해소에 사용) */
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

  // 모든 노드 쌍 순회
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i],
        b = positions[j];
      const isCenter = a.isCenter || b.isCenter;
      const score = getScore(a.m.mbti, b.m.mbti);
      const color = getColor(score),
        rgb = hslToRgb(color);
      // 두 노드 간 방향 벡터 계산
      const dx = b.x - a.x,
        dy = b.y - a.y,
        dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) continue; // 노드가 거의 겹치면 선 생략
      // 단위 방향 벡터
      const nx = dx / dist,
        ny = dy / dist;
      // 노드 테두리에서 시작/끝하도록 보정 (원의 반지름만큼 안쪽으로)
      const x1 = a.x + nx * a.r,
        y1 = a.y + ny * a.r;
      const x2 = b.x - nx * b.r,
        y2 = b.y - ny * b.r;
      const isHov = hovered?.i === i && hovered?.j === j;

      if (isCenter) {
        // ── 중앙 노드 연결선: 굵고 밝은 글로우 ──
        // 선 두께: 호버 시 더 두껍게 + 점수에 비례
        const sw = isHov ? 4 + (score / 100) * 9 : 1.5 + (score / 100) * 5;
        // 외곽 글로우 레이어 (넓은 반투명 선)
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
        // 본체 선 (더 좁고 진한 선)
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 1 : 0.82})`;
        ctx.lineWidth = sw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        // 점수 라벨 위치: 선분 중점에서 법선(수직) 방향으로 26px 오프셋
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
        // ── 주변 노드 간 연결선: 얇고 흐린 스타일 ──
        const sw = isHov
          ? 1.8 + (score / 100) * 3.5
          : 0.4 + (score / 100) * 1.6;
        // 외곽 글로우 레이어 (매우 약하게)
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
        // 본체 선
        ctx.save();
        ctx.strokeStyle = `rgba(${rgb},${isHov ? 0.65 : 0.2})`;
        ctx.lineWidth = sw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        // 점수 라벨: 법선 방향 14px 오프셋 (중앙보다 짧게)
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
      // 히트 영역 데이터 저장 (마우스 이벤트 판정용)
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

  // ── 2단계: 라벨 간 겹침 해소 (반복적 밀어내기, 최대 8회) ──
  const minDist = 22; // 라벨 간 최소 거리 (px)
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

  // ── 3단계: 라벨 텍스트 렌더링 ──
  for (const lb of labels) {
    const rgb = lb.color.match(/\d+/g)?.slice(0, 3).join(",") ?? "255,255,255";
    ctx.save();
    ctx.font = lb.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 글로우 효과: shadowBlur로 네온 느낌 부여
    ctx.shadowColor = `rgba(${rgb},1)`;
    ctx.shadowBlur = lb.shadowBlur;
    ctx.fillStyle = lb.color;
    ctx.fillText(lb.text, lb.x, lb.y);
    ctx.restore();
  }
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

/**
 * 그룹 궁합 네트워크 시각화 컴포넌트.
 *
 * members 배열의 첫 번째 요소를 중앙 노드('나')로,
 * 나머지를 주변 노드로 배치하여 Canvas 기반 네트워크 그래프를 렌더링한다.
 *
 * 렌더 분기:
 * - 멤버 0명 → 프리뷰 화면 (더미 데이터 SVG 그래프)
 * - 멤버 1명 → 네트워크 그래프 + "최소 2명 필요" 안내
 * - 멤버 2명 이상 → 실제 네트워크 그래프 + 요약 카드 (평균/최고/최저)
 */
export default function GroupGrid({ members }: Props) {
  // ── DOM/상태 ref들 ──
  const wrapRef = useRef<HTMLDivElement>(null); // 컨테이너 div (리사이즈 감지 대상)
  const canvasRef = useRef<HTMLCanvasElement>(null); // 연결선을 그리는 Canvas
  const nodesRef = useRef<HTMLDivElement>(null); // 노드 DOM 요소들의 컨테이너
  const lineHitsRef = useRef<LineHit[]>([]); // 연결선 히트 영역 (마우스 판정)
  const nodeElsRef = useRef<HTMLDivElement[]>([]); // 각 노드의 DOM 요소 배열
  const animRAFRef = useRef<number | null>(null); // 현재 진행 중인 requestAnimationFrame ID
  const prevPosRef = useRef<NodePos[]>([]); // 이전 애니메이션의 시작 위치 (보간 기준)
  const cachePosRef = useRef<NodePos[]>([]); // 애니메이션 완료 후 최종 위치 캐시
  const hoverRef = useRef<HoverLine>(null); // 현재 호버 중인 연결선 (ref로 관리하여 리렌더 방지)
  const [popup, setPopup] = useState<PopupData>(null); // 궁합 상세 팝업 데이터
  const dimsRef = useRef({ W: 0, H: 0 }); // 캔버스 크기 ref (불필요한 리렌더 방지용)
  const [dims, setDims] = useState({ W: 0, H: 0 }); // 캔버스 크기 state (JSX 반영용)

  // 첫 번째 멤버가 '나', 나머지가 다른 멤버
  const myInfo = members[0] ?? null;
  const others = useMemo(() => members.slice(1), [members]);

  /**
   * 각 노드 DOM 요소에 스타일(색상, 글로우, 텍스트)과 마우스 이벤트를 적용한다.
   * 위치(left, top)는 애니메이션 루프가 별도로 제어하므로 여기서는 설정하지 않음.
   */
  const applyNodeStyles = useCallback(
    (positions: NodePos[]) => {
      positions.forEach((pos, idx) => {
        const el = nodeElsRef.current[idx];
        if (!el) return;
        const { r, m, isCenter, score } = pos;
        // 중앙 노드는 고정 보라색, 주변 노드는 점수 기반 동적 색상
        const color = isCenter ? "hsl(270,77%,58%)" : getColor(score);
        const rgb = hslToRgb(color);
        // 글로우 크기·투명도를 점수에 비례하여 동적 조절
        const glowSz = isCenter ? 26 : Math.max(r * 0.58, 7);
        const glowOp = isCenter ? 0.48 : 0.18 + (score / 100) * 0.17;
        const innerOp = isCenter ? 0.15 : 0.05 + (score / 100) * 0.07;

        // 위치/크기는 애니메이션 루프가 제어 — 여기선 설정하지 않음
        el.style.border = `${isCenter ? "2.5px" : "1.5px"} solid rgba(${rgb},${isCenter ? 0.85 : 0.5 + (score / 100) * 0.3})`;
        el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.45}px rgba(${rgb},${innerOp})`;
        el.style.background = `radial-gradient(circle at 35% 35%,rgba(${rgb},0.26) 0%,rgba(${rgb},0.07) 65%,transparent 100%),#07070f`;

        // 노드 내부 텍스트 크기: 노드 반지름에 비례하되 최소값 보장
        const ns = Math.max(r * 0.24, 5.5); // 이름 폰트 크기
        const es = Math.max(r * 0.5, 9); // 이모지 폰트 크기
        const ms = Math.max(r * 0.27, 6); // MBTI 폰트 크기
        el.innerHTML = `
        <span style="font-size:${ns}px;font-weight:700;color:rgba(${rgb},0.85);text-shadow:0 0 6px rgba(${rgb},0.7);line-height:1.25;">${m.name}</span>
        <span style="font-size:${es}px;line-height:1;filter:drop-shadow(0 0 ${Math.max(r * 0.1, 2)}px rgba(${rgb},0.8));">${m.emoji}</span>
        <span style="font-size:${ms}px;font-weight:800;color:rgba(${rgb},1);letter-spacing:0.3px;text-shadow:0 0 8px rgba(${rgb},0.9);line-height:1.25;">${m.mbti}</span>
      `;

        // ── 마우스 이벤트 핸들링 (주변 노드만 — 중앙 노드는 클릭 불가) ──
        if (!isCenter) {
          // 호버 시 확대(scale 1.28) + 글로우 강화
          el.onmouseenter = () => {
            const hg = Math.max(r * 1.4, 18);
            el.style.boxShadow = `0 0 ${hg}px rgba(${rgb},0.82),0 0 ${hg * 2.2}px rgba(${rgb},0.42),inset 0 0 ${r * 0.65}px rgba(${rgb},0.32)`;
            el.style.transform = "translate(-50%,-50%) scale(1.28)";
            el.style.borderColor = `rgba(${rgb},1)`;
          };
          // 호버 해제 시 원래 스타일로 복원
          el.onmouseleave = () => {
            el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.45}px rgba(${rgb},${innerOp})`;
            el.style.transform = "translate(-50%,-50%) scale(1)";
            el.style.borderColor = `rgba(${rgb},${0.5 + (score / 100) * 0.3})`;
          };
          // 클릭 시 궁합 상세 팝업 표시
          el.onclick = (e) => {
            e.stopPropagation();
            setPopup({ mA: myInfo!, mB: m, score });
          };
        }
      });
    },
    [myInfo],
  );

  // ── 결과 요약 섹션 상태 ──
  const [summary, setSummary] = useState<{
    avg: number; // 그룹 평균 궁합 점수
    best: { mA: Member; mB: Member; score: number }; // 최고 궁합 쌍
    worst: { mA: Member; mB: Member; score: number }; // 최저 궁합 쌍
  } | null>(null);

  /**
   * 모든 노드 쌍의 궁합을 계산하여 평균/최고/최저를 요약한다.
   * 애니메이션 완료 후 1회 호출되어 요약 카드에 반영된다.
   */
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

  /**
   * 전체 렌더 파이프라인.
   * 위치 계산 → DOM 노드 생성/삭제 → 스타일 적용 → 보간 애니메이션 시작 → 마우스 이벤트 바인딩.
   * members 배열 변경 또는 리사이즈 시 호출된다.
   */
  const render = useCallback(
    (W: number, H: number) => {
      if (!canvasRef.current || !nodesRef.current || !myInfo) return;
      const newPos = buildPositions(myInfo, others, W, H);
      const needed = newPos.length;
      const container = nodesRef.current;

      // 노드 DOM 요소 수를 positions 수와 맞춤 (부족하면 생성, 초과하면 제거)
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
      // 이전 위치가 있으면 그 지점에서 시작, 없으면 중심에서 펼쳐지는 애니메이션
      const from =
        prevPosRef.current.length > 0
          ? [...prevPosRef.current]
          : newPos.map((p) => ({ ...p, x: cx, y: cy, r: 0 }));

      // 진행 중인 애니메이션이 있으면 취소
      if (animRAFRef.current) {
        cancelAnimationFrame(animRAFRef.current);
        animRAFRef.current = null;
      }

      // ── 보간 애니메이션 루프 (1초 동안, ease-in-out 적용) ──
      const start = performance.now(),
        dur = 1000;
      const frame = (now: number) => {
        const raw = Math.min((now - start) / dur, 1); // 선형 진행률 (0~1)
        const t = ease(raw); // 이징 적용된 진행률
        const interp = interpolatePos(from, newPos, t, cx, cy);
        // Canvas 다시 그리기 (연결선 + 라벨)
        drawCanvas(canvas, interp, W, H, hoverRef.current, lineHitsRef);
        // 각 노드 DOM 위치·크기를 보간된 값으로 업데이트
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
          // 애니메이션 완료: 최종 위치를 캐시하고 요약 계산
          prevPosRef.current = [...newPos];
          cachePosRef.current = [...newPos];
          animRAFRef.current = null;
          renderSummary(newPos);
        }
      };
      animRAFRef.current = requestAnimationFrame(frame);

      // ── 마우스 이벤트/팝업 핸들링: 연결선 호버 감지 ──
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        // CSS 크기와 논리 크기의 비율로 마우스 좌표 보정
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        // 가장 가까운 연결선 탐색 (임계값 18px 이내)
        let best: HoverLine = null,
          bestD = 18;
        for (const h of lineHitsRef.current) {
          const d = ptToSegDist(mx, my, h.x1, h.y1, h.x2, h.y2);
          if (d < bestD) {
            bestD = d;
            best = { i: h.i, j: h.j };
          }
        }
        // 호버 상태가 변경되었을 때만 Canvas 다시 그림 (불필요한 재렌더 방지)
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

      // 마우스가 캔버스 밖으로 나가면 호버 해제
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

      // 연결선 클릭 시 궁합 상세 팝업 표시
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

  /**
   * 캔버스 크기(W, H) 변경을 감지하여 state를 업데이트한다.
   * 불필요한 리렌더를 방지하기 위해 ref와 비교 후 변경 시에만 setState 호출.
   */
  const updateDims = useCallback((W: number, H: number) => {
    const prev = dimsRef.current;
    if (prev.W !== W || prev.H !== H) {
      dimsRef.current = { W, H };
      setDims({ W, H });
    }
  }, []);

  // ── 멤버 변경 시 초기 렌더 ──
  useEffect(() => {
    if (!wrapRef.current || !myInfo) return;
    const W = wrapRef.current.getBoundingClientRect().width || 560;
    // 높이를 너비의 88% 비율로 설정 (최대 500px)
    const H = Math.min(W * 0.88, 500);
    queueMicrotask(() => updateDims(W, H));
    render(W, H);
  }, [members, render, myInfo, updateDims]);

  // ── 컨테이너 리사이즈 감지 (ResizeObserver로 반응형 대응) ──
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

  // ── 멤버 0명: 더미 데이터 프리뷰 화면 (SVG 기반) ──
  const showPreview = !myInfo;

  if (showPreview) {
    const guideText = "멤버를 추가하면 궁합 맵이 나타나요";
    // 프리뷰용 더미 중앙 노드
    const center = {
      x: 50,
      y: 48,
      label: "나",
      emoji: "⭐",
      color: "#a855f7",
      r: 10,
      score: 100,
    };
    // 프리뷰용 더미 주변 노드들 (다양한 MBTI 유형 예시)
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
        {/* 전체를 흐리게 표시하여 비활성 느낌 (opacity 0.35, 클릭 불가) */}
        <div
          className="flex flex-col gap-6"
          style={{ opacity: 0.35, pointerEvents: "none" }}
        >
          {/* 그룹 평균 궁합 미리보기 카드 */}
          <div
            className="rounded-2xl p-5 sm:p-6 text-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% -20%, rgba(168,85,247,0.1) 0%, rgba(15,15,26,0.95) 75%)",
              border: "1px solid rgba(168,85,247,0.25)",
              boxShadow: "0 0 30px rgba(168,85,247,0.06)",
            }}
          >
            <p
              className="text-xs mb-1 font-bold"
              style={{ color: "rgba(168,85,247,0.7)" }}
            >
              그룹 평균 궁합
            </p>
            <p
              className="text-3xl font-black mb-1"
              style={{
                color: "#c084fc",
                textShadow: "0 0 12px rgba(168,85,247,0.6)",
              }}
            >
              73%
            </p>
            <p
              className="text-sm font-bold mt-1"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              💫 아주 잘 맞아요
            </p>
            {/* 게이지 바 */}
            <div
              className="h-1.5 rounded-full overflow-hidden mt-4"
              style={{
                background: "rgba(255,255,255,0.1)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="h-full rounded-full gauge-bar"
                style={{
                  width: "73%",
                  background: "#c084fc",
                  boxShadow: "0 0 8px rgba(168,85,247,0.8)",
                }}
              />
            </div>
          </div>

          {/* SVG 기반 더미 네트워크 그래프 */}
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
                {/* 각 노드별 글로우 필터 정의 */}
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
                {/* 연결선 글로우 필터 */}
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
                {/* 각 노드별 방사형 그라데이션 (배경 채우기용) */}
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
              {/* 비중심 연결선 (주변 노드끼리, 흐리게) */}
              {allNodes.map((a, i) =>
                allNodes.slice(i + 1).map((b, j) => {
                  if (a === center || b === center) return null;
                  // 더미 점수: 양쪽 점수 평균의 1/3 수준으로 표시
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
                      {/* 점수 라벨: 선분 중점에서 법선 방향으로 오프셋 */}
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
              {/* 중심 연결선 (화려하게, 글로우 + 굵은 선) */}
              {dummyNodes.map((n, i) => {
                const midX = (center.x + n.x) / 2;
                const midY = (center.y + n.y) / 2;
                // 법선 방향 계산 (라벨 오프셋용)
                const dx = n.y - center.y;
                const dy = -(n.x - center.x);
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const offX = (dx / len) * 5;
                const offY = (dy / len) * 5;
                return (
                  <g key={`cline-${i}`}>
                    {/* 글로우 레이어 */}
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
                    {/* 본체 선 */}
                    <line
                      x1={center.x}
                      y1={center.y}
                      x2={n.x}
                      y2={n.y}
                      stroke={n.color}
                      strokeWidth={0.15 + (n.score / 100) * 0.3}
                      opacity="0.9"
                    />
                    {/* 점수 라벨 */}
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
              {/* 노드 (원형 + 이모지 + MBTI 라벨) */}
              {allNodes.map((n, i) => {
                const isCenter = n === center;
                return (
                  <g key={`node-${i}`} filter={`url(#glow-${i})`}>
                    {/* 외곽 링 (미묘한 테두리) */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r + 1.5}
                      fill="transparent"
                      stroke={n.color}
                      strokeWidth="0.15"
                      opacity="0.25"
                    />
                    {/* 그라데이션 배경 */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r}
                      fill={`url(#grad-${i})`}
                      stroke={n.color}
                      strokeWidth={isCenter ? "0.7" : "0.4"}
                      opacity="0.9"
                    />
                    {/* 어두운 내부 배경 (텍스트 가독성 확보) */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r}
                      fill="#07070f"
                      opacity="0.7"
                    />
                    {/* 이모지 */}
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
                    {/* MBTI/이름 라벨 */}
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

          {/* 미리보기 카드들 (최고/최악 궁합 더미) */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {/* 최고의 궁합 미리보기 카드 */}
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
                      boxShadow: "0 0 6px rgba(229,165,10,0.5)",
                    }}
                  />
                </div>
              </div>
              {/* 최악의 궁합 미리보기 카드 */}
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
                      boxShadow: "0 0 6px rgba(220,38,38,0.5)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 안내 문구 오버레이 — 부모의 opacity 영향을 받지 않는 별도 레이어 */}
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

  // ── 팝업 표시를 위한 색상/정보 사전 계산 ──
  const color = popup ? getColor(popup.score) : "#a855f7";
  const rgb = popup ? hslToRgb(color) : "168,85,247";
  const info = popup ? getInfo(popup.score) : null;

  // 멤버 1명(나만 있을 때): 네트워크는 보이지만 "추가 필요" 안내 표시
  const needMore = members.length === 1;

  return (
    <div className="flex flex-col gap-6">
      {/* ── 결과 요약 섹션: 평균(65%) + 최고/최악(35%) 가로 배치 ── */}
      {needMore && !summary ? (
        // 멤버 부족 시 비활성 상태 — 동일 레이아웃
        <div
          className="grid grid-cols-[2fr_1.5fr_1.5fr] gap-3"
          style={{ opacity: 0.35, pointerEvents: "none" }}
        >
          {/* 비활성 평균 궁합 */}
          <div
            className="rounded-2xl p-3 text-center flex flex-col justify-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% -20%, rgba(100,100,100,0.1) 0%, rgba(15,15,26,0.95) 75%)",
              border: "1px solid rgba(100,100,100,0.2)",
            }}
          >
            <p
              className="text-xs mb-1 font-bold"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              그룹 평균 궁합
            </p>
            <p
              className="text-xl font-black mb-1"
              style={{ color: "rgba(255,255,255,0.2)", textShadow: "none" }}
            >
              --%
            </p>
            <p
              className="text-xs font-bold mt-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              🤝 데이터 부족
            </p>
          </div>
          {/* 비활성 최고의 궁합 */}
          <div
            className="rounded-2xl p-3 text-center flex flex-col justify-center"
            style={{
              backgroundColor: "rgba(229,165,10,0.05)",
              border: "0.5px solid rgba(229,165,10,0.15)",
            }}
          >
            <p
              className="text-[10px] font-bold mb-1"
              style={{ color: "rgba(229,165,10,0.5)" }}
            >
              🏆 최고의 궁합
            </p>
            <div className="text-lg mb-0.5">✨</div>
            <div
              className="text-sm font-bold"
              style={{ color: "rgba(229,165,10,0.5)" }}
            >
              —
            </div>
          </div>
          {/* 비활성 최악의 궁합 */}
          <div
            className="rounded-2xl p-3 text-center flex flex-col justify-center"
            style={{
              backgroundColor: "rgba(220,38,38,0.05)",
              border: "0.5px solid rgba(220,38,38,0.15)",
            }}
          >
            <p
              className="text-[10px] font-bold mb-1"
              style={{ color: "rgba(220,38,38,0.5)" }}
            >
              💀 최악의 궁합
            </p>
            <div className="text-lg mb-0.5">🌧️</div>
            <div
              className="text-sm font-bold"
              style={{ color: "rgba(220,38,38,0.5)" }}
            >
              —
            </div>
          </div>
        </div>
      ) : summary ? (
        // 실제 요약: 평균(40%) | 최고(30%) | 최악(30%) 3열 가로 배치
        <div className="grid grid-cols-[2fr_1.5fr_1.5fr] gap-3 fade-in-up">
          {/* 그룹 평균 궁합 */}
          <div
            className="relative overflow-hidden rounded-2xl text-center flex flex-col justify-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% -20%, rgba(168,85,247,0.18) 0%, rgba(15,15,26,0.95) 75%)",
              border: "1px solid rgba(168,85,247,0.3)",
              boxShadow: "0 0 35px rgba(168,85,247,0.1)",
            }}
          >
            <div className="relative z-10 flex flex-col items-center gap-2 py-6 px-4">
              <p
                className="text-xs font-bold"
                style={{ color: "rgba(168,85,247,0.8)" }}
              >
                그룹 평균 궁합
              </p>
              <CircularGauge
                score={summary.avg}
                size={150}
                overrideColor="#a855f7"
              />
              <p
                className="text-sm font-black"
                style={{
                  color: "#fff",
                  textShadow: "0 0 12px rgba(168,85,247,0.5)",
                }}
              >
                {getInfo(summary.avg).e} {getInfo(summary.avg).l}
              </p>
            </div>
          </div>

          {/* 최고의 궁합 */}
          <CompatCard
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
            <p className="text-xs leading-tight" style={{ color: "#ffffffbb" }}>
              {summary.best.mA.emoji}
              {summary.best.mA.name} × {summary.best.mB.emoji}
              {summary.best.mB.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#ffffff38" }}>
              {summary.best.mA.mbti} + {summary.best.mB.mbti}
            </p>
          </CompatCard>

          {/* 최악의 궁합 */}
          <CompatCard
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
            <p className="text-xs leading-tight" style={{ color: "#ffffffbb" }}>
              {summary.worst.mA.emoji}
              {summary.worst.mA.name} × {summary.worst.mB.emoji}
              {summary.worst.mB.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#ffffff38" }}>
              {summary.worst.mA.mbti} + {summary.worst.mB.mbti}
            </p>
          </CompatCard>
        </div>
      ) : null}

      {/* ── 네트워크 그래프 영역 (Canvas + 노드 DOM) ── */}
      <div className="relative">
        <div
          ref={wrapRef}
          className="relative w-full rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background:
              "radial-gradient(circle at center, rgba(168,85,247,0.06) 0%, rgba(7,7,15,0.95) 80%)",
            border: "1px solid rgba(168,85,247,0.15)",
            boxShadow: "0 0 40px rgba(168,85,247,0.08)",
            height: dims.H || "auto",
            minHeight: 200,
          }}
        >
          {/* 연결선 + 점수 라벨을 그리는 Canvas 레이어 (하단) */}
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full" />
          {/* 노드 DOM 요소들이 배치되는 컨테이너 (Canvas 위에 오버레이) */}
          <div
            ref={nodesRef}
            className="relative w-full"
            style={{ height: dims.H || 200 }}
          />
        </div>
        {/* 멤버 1명일 때 "추가 필요" 안내 오버레이 */}
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

      {/* ── 궁합 상세 팝업 (모달) ── */}
      {popup && (
        <>
          {/* 배경 딤(dim) 레이어: 클릭 시 팝업 닫힘 */}
          <div
            className="fixed inset-0 z-50"
            style={{ background: "#00000075" }}
            onClick={() => setPopup(null)}
          />
          {/* 팝업 본체: 점수·이모지·라벨·게이지바·한줄평 표시 */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[300px] rounded-2xl p-7 text-center"
            style={{
              background: "#0d0d1a",
              border: `0.5px solid rgba(${rgb},0.32)`,
              boxShadow: `0 0 36px rgba(${rgb},0.18)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setPopup(null)}
              className="neon-ghost absolute top-3 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              ✕
            </button>
            {/* 궁합 등급 이모지 */}
            <div className="text-4xl mb-2">{info?.e}</div>
            {/* 궁합 점수 (네온 글로우) */}
            <div
              className="text-2xl font-black mb-1"
              style={{ color, textShadow: `0 0 14px rgba(${rgb},0.9)` }}
            >
              {popup.score}%
            </div>
            {/* 두 멤버 정보 (이모지 + 이름 + MBTI) */}
            <div
              className="text-sm font-bold mb-1"
              style={{ color: "#ffffffcc" }}
            >
              {popup.mA.emoji} {popup.mA.name}({popup.mA.mbti}) ×{" "}
              {popup.mB.emoji} {popup.mB.name}({popup.mB.mbti})
            </div>
            {/* 궁합 등급 라벨 배지 */}
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
            {/* 점수 게이지 바 */}
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
            {/* 궁합 한줄평 (점수 기반 동적 생성) */}
            <p
              className="text-sm font-medium leading-relaxed text-center"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {getLoveFriendLine(popup.score)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
