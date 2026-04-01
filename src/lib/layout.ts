/**
 * @file layout.ts
 * @description 그룹 궁합 네트워크 노드 배치 로직 (순수 함수)
 *
 * GroupGrid의 buildPositions에서 추출.
 * Canvas/React 의존 없이 테스트 가능하도록 분리했다.
 */

import { MbtiType, Member, getScore } from "@/data/compatibility";

/** 노드 위치·크기 정보 (GraphNode의 레이아웃 관련 서브셋) */
export type LayoutNode = {
  x: number;
  y: number;
  r: number;
  id: string;
  mbti: MbtiType;
  score: number;
  isCenter: boolean;
};

/** 궤도 위 지터링용 상수 */
const ANGLE_OFFSETS = [0, 0.35, -0.28, 0.55, -0.42, 0.2, -0.5, 0.65];
const DIST_MULTS = [1.0, 1.2, 0.88, 1.35, 0.82, 1.15, 0.92, 1.28];

/** 경계 패딩 (노드 가장자리에서 캔버스 가장자리까지 최소 거리) */
const EDGE_PAD = 10;

/** 충돌 해소에 필요한 최소 노드 속성 */
type CollisionNode = { x: number; y: number; r: number; isCenter: boolean };

/**
 * 노드 간 충돌(겹침)을 반복적 밀어내기로 해소한다.
 * GroupGrid와 MbtiGraph 모두에서 사용.
 */
export function resolveCollisions<T extends CollisionNode>(
  positions: T[],
  W: number,
  H: number,
  collisionGap = 12,
  edgePad = EDGE_PAD,
): void {
  for (let iter = 0; iter < 200; iter++) {
    let moved = false;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const minDist = a.r + b.r + collisionGap;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2 + 0.5;
          const nx = dx / dist;
          const ny = dy / dist;
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
              const pad = p.r + edgePad;
              p.x = Math.max(pad, Math.min(W - pad, p.x));
              p.y = Math.max(pad, Math.min(H - pad, p.y));
            }
          });
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

/**
 * 중앙(나) + 주변(다른 멤버) 노드 위치를 계산하고 충돌을 해소한다.
 *
 * @param members 그룹 멤버 배열 (첫 번째가 '나')
 * @param W 캔버스 너비 (px)
 * @param H 캔버스 높이 (px)
 * @param collisionGap 노드 사이 최소 간격 (px, 기본 12)
 * @returns 충돌이 해소된 노드 위치 배열
 */
export function computeGroupLayout(
  members: Member[],
  W: number,
  H: number,
  collisionGap = 12,
): LayoutNode[] {
  const myInfo = members[0];
  if (!myInfo) return [];
  const others = members.slice(1);
  const cx = W / 2;
  const cy = H / 2;
  const n = others.length;

  // 기본 크기 계산
  let centerR = W * Math.max(0.1, 0.19 - n * 0.013);
  let maxNodeR = W * Math.max(0.09, 0.17 - n * 0.012);
  let minNodeR = W * Math.max(0.075, 0.12 - n * 0.007);

  // 캔버스에 수용 가능한지 검증: centerR + maxNodeR + gap + maxNodeR + pad <= min(cx, cy)
  // 즉, 중앙에서 가장자리까지 centerR + gap + maxNodeR + pad 이하여야 함
  // 최대 궤도 = min(cx, cy) - EDGE_PAD - maxNodeR (주변 노드가 경계 안에 들어와야 함)
  // 최소 궤도 = centerR + maxNodeR + gap (중앙과 안 겹침)
  // 최대 궤도 >= 최소 궤도여야 함:
  //   min(cx,cy) - EDGE_PAD - maxNodeR >= centerR + maxNodeR + gap
  //   min(cx,cy) - EDGE_PAD - gap >= centerR + 2*maxNodeR
  const halfMin = Math.min(cx, cy);
  const budget = halfMin - EDGE_PAD - collisionGap;
  const needed = centerR + 2 * maxNodeR;
  if (needed > budget && needed > 0) {
    const scale = budget / needed;
    centerR *= scale;
    maxNodeR *= scale;
    minNodeR *= scale;
  }

  const baseOrbit = Math.min(W, H) * Math.max(0.33, 0.45 - n * 0.012);
  const minOrbit = centerR + maxNodeR + collisionGap;
  const maxOrbit = halfMin - EDGE_PAD - maxNodeR;
  const orbit = Math.max(Math.min(baseOrbit, maxOrbit), minOrbit);

  const positions: LayoutNode[] = [
    {
      x: cx,
      y: cy,
      r: centerR,
      id: "__center__",
      mbti: myInfo.mbti,
      score: 100,
      isCenter: true,
    },
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
    const mg = nodeR + EDGE_PAD;
    positions.push({
      x: Math.max(mg, Math.min(W - mg, cx + d * Math.cos(angle))),
      y: Math.max(mg, Math.min(H - mg, cy + d * Math.sin(angle))),
      r: nodeR,
      id: `${m.name}_${m.mbti}_${m.emoji}`,
      mbti: m.mbti,
      score,
      isCenter: false,
    });
  });

  // 충돌 해소
  resolveCollisions(positions, W, H, collisionGap);

  return positions;
}

/**
 * 노드 배열에서 겹치는 쌍이 있는지 검사한다.
 *
 * @returns 겹치는 쌍 목록 (빈 배열이면 겹침 없음)
 */
export function findOverlaps(
  nodes: LayoutNode[],
  gap = 0,
): { i: number; j: number; overlap: number }[] {
  const result: { i: number; j: number; overlap: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.r + b.r + gap;
      if (dist < minDist) {
        result.push({ i, j, overlap: minDist - dist });
      }
    }
  }
  return result;
}
