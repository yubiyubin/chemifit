/**
 * 그룹 궁합 역할 분석 데이터
 *
 * 16개 MBTI 타입을 5개 그룹 역할로 분류하고,
 * 역할 분포에 따라 그룹 전체 밈 + 인원별 해석을 생성한다.
 *
 * 역할 카테고리:
 * - 🎤 텐션 담당: EP 타입 (ENFP, ENTP, ESFP, ESTP)
 * - 🫶 케어 담당: Fe 우세 (ENFJ, ESFJ, ISFJ)
 * - 🧠 분석 담당: Ti/Te 사고형 (INTJ, INTP, ISTP, ISTJ)
 * - 🎯 진행 담당: Te 주도형 (ENTJ, ESTJ)
 * - 🌙 마이페이스: Fi 내향 (INFP, INFJ, ISFP)
 */

import type { MbtiType } from "@/data/compatibility";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

export type RoleId = "energy" | "care" | "analyst" | "leader" | "mypace";

type RoleInfo = {
  emoji: string;
  name: string;
  /** 인원 수별 효과 문구 — [1명, 2명, 3명+] */
  effects: [string, string, string];
};

/** analyzeGroup 반환값의 역할 항목 */
export type RoleEntry = RoleInfo & { id: RoleId; count: number; effect: string };

/** analyzeGroup 반환값 */
export type GroupAnalysis = {
  meme: string;
  roles: RoleEntry[];
};

// ─────────────────────────────────────────────
// 역할 정의
// ─────────────────────────────────────────────

const ROLES: Record<RoleId, RoleInfo> = {
  energy: {
    emoji: "🎤",
    name: "텐션 담당",
    effects: [
      "혼자서 분위기 띄우느라 지침 😮‍💨",
      "계속 텐션 올림 🔥",
      "조용할 틈이 없음 🗣️",
    ],
  },
  care: {
    emoji: "🫶",
    name: "케어 담당",
    effects: [
      "혼자 다 챙김 🍚",
      "서로 챙기느라 바쁨 💕",
      "다 엄마 아빠임 👨‍👩‍👧‍👦",
    ],
  },
  analyst: {
    emoji: "🧠",
    name: "분석 담당",
    effects: [
      "가끔 흐름 끊음 🔇",
      "둘이서 딴 얘기 시작함 💬",
      "회의가 시작됨 📊",
    ],
  },
  leader: {
    emoji: "🎯",
    name: "진행 담당",
    effects: [
      "방향은 잡아줌 🧭",
      "서로 주도권 다툼 ⚔️",
      "회사가 됨 🏢",
    ],
  },
  mypace: {
    emoji: "🌙",
    name: "마이페이스",
    effects: [
      "조용히 빠짐 🚪",
      "둘이서 따로 놂 🎧",
      "각자 세계에 사는 중 🌌",
    ],
  },
};

// ─────────────────────────────────────────────
// MBTI → 역할 매핑
// ─────────────────────────────────────────────

const MBTI_ROLE: Record<MbtiType, RoleId> = {
  ENFP: "energy",
  ENTP: "energy",
  ESFP: "energy",
  ESTP: "energy",
  ENFJ: "care",
  ESFJ: "care",
  ISFJ: "care",
  INTJ: "analyst",
  INTP: "analyst",
  ISTP: "analyst",
  ISTJ: "analyst",
  ENTJ: "leader",
  ESTJ: "leader",
  INFP: "mypace",
  INFJ: "mypace",
  ISFP: "mypace",
};

// ─────────────────────────────────────────────
// 그룹 밈 — 역할 분포 패턴에 따라 선택
// ─────────────────────────────────────────────

type MemeRule = {
  /** 조건: roleCounts를 받아 이 밈이 적용 가능한지 판단 */
  match: (counts: Record<RoleId, number>, total: number) => boolean;
  lines: string[];
};

const MEME_RULES: MemeRule[] = [
  {
    match: (c, t) => c.energy >= t * 0.5,
    lines: [
      "이 그룹 모이면 매번 난리남 🔥",
      "소음 민원 각 🚨",
      "옆 테이블이 쳐다봄 👀",
    ],
  },
  {
    match: (c, t) => c.analyst >= t * 0.5,
    lines: [
      "분석하다가 하루가 끝남 🧠",
      "모여서 토론만 함 📐",
      "결론 안 나는 회의 중 ♾️",
    ],
  },
  {
    match: (c, t) => c.mypace >= t * 0.5,
    lines: [
      "모이긴 했는데 각자 세계 🌙",
      "같은 공간 다른 차원 🪐",
      "연락 없이 흩어짐 👻",
    ],
  },
  {
    match: (c, t) => c.care >= t * 0.5,
    lines: [
      "서로 챙기다 하루 끝남 🫶",
      "누가 누굴 챙기는 건지 모름 🍳",
      "밥은 계속 먹게 됨 🍕",
    ],
  },
  {
    match: (c, t) => c.leader >= t * 0.4,
    lines: [
      "리더가 너무 많음 ⚔️",
      "결정은 빠른데 방향이 다름 🧭",
      "프로젝트가 시작됨 📋",
    ],
  },
  {
    match: (c) => c.energy >= 1 && c.mypace >= 1 && c.energy + c.mypace >= 3,
    lines: [
      "반은 떠들고 반은 잠옴 😴",
      "텐션 차이가 극과 극 📈📉",
      "누군가는 에너지가 빨림 🔋",
    ],
  },
  {
    match: (c) => c.energy >= 1 && c.analyst >= 1,
    lines: [
      "놀자는 쪽 vs 생각하자는 쪽 🎭",
      "한쪽은 달리고 한쪽은 멈춤 🏃‍♂️🧘",
      "에너지 방향이 정반대 ↔️",
    ],
  },
  {
    match: (c) => c.energy === 0,
    lines: [
      "텐션 올릴 사람이 없음 📉",
      "조용한 모임이 예상됨 🤫",
      "카페가 어울리는 그룹 ☕",
    ],
  },
  {
    match: (c) => c.leader === 0 && c.care === 0,
    lines: [
      "정리해 줄 사람이 없음 🫠",
      "아무도 안 챙기고 아무도 안 이끎 🌊",
      "자유롭지만 혼란스러움 🎪",
    ],
  },
];

/** 어떤 규칙에도 안 걸릴 때 기본 밈 */
const DEFAULT_MEMES = [
  "이 조합, 모이면 꼭 한 명은 기 빨림 😵",
  "나름 밸런스 잡힌 그룹 ⚖️",
  "의외로 잘 돌아가는 조합 🎲",
  "모이면 뭔가 되긴 됨 🤷",
];

// ─────────────────────────────────────────────
// 분석 함수
// ─────────────────────────────────────────────

/** 그룹 멤버의 MBTI 기반으로 역할 분포 분석 + 밈 생성 */
export function analyzeGroup(members: { mbti: MbtiType }[]): GroupAnalysis {
  const counts: Record<RoleId, number> = {
    energy: 0,
    care: 0,
    analyst: 0,
    leader: 0,
    mypace: 0,
  };

  members.forEach((m) => {
    counts[MBTI_ROLE[m.mbti]]++;
  });

  // 역할별 요약 (인원 수 > 0인 것만, 내림차순)
  const roles: RoleEntry[] = (Object.keys(counts) as RoleId[])
    .filter((id) => counts[id] > 0)
    .sort((a, b) => counts[b] - counts[a])
    .map((id) => {
      const count = counts[id];
      const role = ROLES[id];
      const effectIdx = Math.min(count - 1, 2);
      return {
        id,
        ...role,
        count,
        effect: role.effects[effectIdx],
      };
    });

  // 첫 번째 매칭 규칙의 lines에서 랜덤 선택
  const total = members.length;
  const matched = MEME_RULES.find((r) => r.match(counts, total));
  const pool = matched?.lines ?? DEFAULT_MEMES;
  const meme = pool[Math.floor(Math.random() * pool.length)];

  return { meme, roles };
}
