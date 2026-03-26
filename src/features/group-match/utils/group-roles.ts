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
  /** 인원 수별 효과 문구 — [1명 후보[], 2명 후보[], 3명+ 후보[]] */
  effects: [string[], string[], string[]];
};

/** analyzeGroup 반환값의 역할 항목 */
export type RoleEntry = RoleInfo & { id: RoleId; count: number; effect: string };

/** pairScores 입력 타입 — 두 멤버 이름과 궁합 점수 */
export type PairScore = { a: string; b: string; score: number };

/** 개인별 그룹 내 통계 */
export type MemberStat = {
  name: string;
  mbti: MbtiType;
  /** 그룹 내 다른 멤버들과의 평균 궁합 점수 */
  avgScore: number;
  /** 가장 궁합이 좋은 상대 이름 */
  bestPartner: string;
  /** 가장 궁합이 낮은 상대 이름 */
  worstPartner: string;
};

/** analyzeGroup 반환값 */
export type GroupAnalysis = {
  meme: string;
  roles: RoleEntry[];
  summary: string;
  membersByRole: Partial<Record<RoleId, string[]>>;
  /** pairScores가 제공된 경우에만 존재. 멤버별 그룹 내 통계 */
  memberStats?: MemberStat[];
  /** memberStats 중 avgScore 최고 멤버 이름 */
  popularMember?: string;
  /** memberStats 중 avgScore 최저 멤버 이름 */
  uniqueMember?: string;
  /** 그룹에 없는 역할 목록 */
  missingRoles: RoleId[];
  /**
   * 5개 역할 분포의 균형 점수 (0~100).
   * 모든 역할이 균등 분포(20%씩)이면 100, 한 역할에 완전 집중이면 0에 가까움.
   */
  balanceScore: number;
};

// ─────────────────────────────────────────────
// 캐시 — 세션 내 동일 키에 동일 문구 보장
// ─────────────────────────────────────────────

const effectCache = new Map<string, string>();

function pickCached(key: string, pool: string[]): string {
  const cached = effectCache.get(key);
  if (cached !== undefined) return cached;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  effectCache.set(key, picked);
  return picked;
}

// ─────────────────────────────────────────────
// 역할 정의
// ─────────────────────────────────────────────

const ROLES: Record<RoleId, RoleInfo> = {
  energy: {
    emoji: "🎤",
    name: "텐션 담당",
    effects: [
      [
        "혼자서 분위기 띄우느라 지침 😮‍💨",
        "1인 텐션 머신 가동 중 🔊",
        "혼자 축제 열고 혼자 지침 🎪",
      ],
      [
        "계속 텐션 올림 🔥",
        "둘이서 분위기 폭주 중 🚀",
        "서로 텐션 끌어올리다 과열 ⚡",
      ],
      [
        "조용할 틈이 없음 🗣️",
        "소음 레벨 위험 수준 🚨",
        "주변 테이블 이사 감 🏃",
        "이 그룹에 뮤트 버튼이 필요함 🔇",
      ],
    ],
  },
  care: {
    emoji: "🫶",
    name: "케어 담당",
    effects: [
      [
        "혼자 다 챙김 🍚",
        "이 그룹의 엄마 역할 담당 👩‍🍳",
        "모든 챙김은 이 한 사람에게서 나옴 🫂",
      ],
      [
        "서로 챙기느라 바쁨 💕",
        "둘이 챙기기 경쟁 중 🏅",
        "케어 듀오 결성됨 🤝",
      ],
      [
        "다 엄마 아빠임 👨‍👩‍👧‍👦",
        "챙김의 끝판왕 그룹 💝",
        "서로 밥 먹었냐는 카톡이 쏟아짐 📱",
        "관심이 과잉인 그룹 🧸",
      ],
    ],
  },
  analyst: {
    emoji: "🧠",
    name: "분석 담당",
    effects: [
      [
        "가끔 흐름 끊음 🔇",
        "갑자기 현실 분석 시작함 📊",
        "혼자 생각에 빠져 있음 💭",
      ],
      [
        "둘이서 딴 얘기 시작함 💬",
        "분석 토론이 시작됨 🔬",
        "데이터 기반 의사결정 중 📈",
      ],
      [
        "회의가 시작됨 📊",
        "분석 마비가 올 수 있음 🤯",
        "밥집도 리뷰 분석해서 감 🔎",
        "세미나가 개최됨 🎓",
      ],
    ],
  },
  leader: {
    emoji: "🎯",
    name: "진행 담당",
    effects: [
      [
        "방향은 잡아줌 🧭",
        "이 한 명이 모든 걸 결정함 👑",
        "일정은 이 사람이 짜옴 📋",
      ],
      [
        "서로 주도권 다툼 ⚔️",
        "리더 둘이면 방향이 두 개 🔀",
        "기획서가 두 개 나옴 📄📄",
      ],
      [
        "회사가 됨 🏢",
        "조직도가 필요한 수준 🗂️",
        "프로젝트 매니저가 3명인 그룹 📊",
      ],
    ],
  },
  mypace: {
    emoji: "🌙",
    name: "마이페이스",
    effects: [
      [
        "조용히 빠짐 🚪",
        "어느 순간 사라져 있음 👻",
        "혼자만의 세계에 입장함 🎧",
      ],
      [
        "둘이서 따로 놂 🎧",
        "옆에 있는데 각자 세계 🪐",
        "둘이 있어도 혼자 같은 평화 ☁️",
      ],
      [
        "각자 세계에 사는 중 🌌",
        "모였는데 흩어진 것 같은 에너지 🌫️",
        "연락 없이 자연 해산 가능 💨",
        "같이 있어도 각자 충전 중 🔋",
      ],
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
  // ── 2인 전용 밈 ──
  {
    match: (c, t) => t === 2 && c.energy === 2,
    lines: [
      "둘이서 카페를 클럽으로 만드는 조합 🪩",
      "2인 소란 제조기 가동 완료 🔊",
      "이 둘 모이면 목소리 볼륨부터 올라감 📢",
    ],
  },
  {
    match: (c, t) => t === 2 && c.mypace === 2,
    lines: [
      "둘이 만났는데 둘 다 폰 보는 중 📱📱",
      "같이 있는데 혼자 있는 느낌의 극치 🧘‍♂️🧘‍♀️",
      "대화 없이도 편한 관계 — 근데 진짜 대화가 없음 🤐",
    ],
  },
  {
    match: (c, t) => t === 2 && c.analyst === 2,
    lines: [
      "둘이서 밥집 고르는 데 40분 걸림 🧮",
      "2인 분석 세미나 개최 🔬",
      "대화의 80%가 '근거가 뭐야?'로 시작됨 📊",
    ],
  },
  {
    match: (c, t) => t === 2 && c.leader === 2,
    lines: [
      "2인인데 주도권 싸움 발생 ⚔️",
      "둘 다 리더라 따르는 사람이 없음 👑👑",
      "일정이 두 개 나와서 결국 가위바위보 ✌️",
    ],
  },
  {
    match: (c, t) => t === 2 && c.care === 2,
    lines: [
      "서로 밥 먹었냐고 물어보느라 정작 밥을 못 먹음 🍚🍚",
      "둘 다 챙겨주다 둘 다 과로 💦",
      "케어 전쟁 — 누가 더 잘 챙기나 대결 🏆",
    ],
  },
  // ── 전원 동일 역할 ──
  {
    match: (c, t) => t >= 3 && c.energy === t,
    lines: [
      "전원 텐션 담당이라 멈출 사람이 없음 🎢",
      "소음 측정기가 필요한 모임 📣",
      "이 그룹 모이면 가게 매출이 올라감 💸",
    ],
  },
  {
    match: (c, t) => t >= 3 && c.analyst === t,
    lines: [
      "전원 분석 담당이라 결론이 안 남 ♾️",
      "토론은 깊은데 행동은 제로 🧠→🚫",
      "논문 발표회가 시작됨 📝",
    ],
  },
  {
    match: (c, t) => t >= 3 && c.mypace === t,
    lines: [
      "전원 마이페이스라 모인 의미가 흐려짐 🌌",
      "같은 공간에 있지만 차원이 다른 사람들 🪐",
      "자연 해산까지 평균 47분 소요 ⏱️",
    ],
  },
  {
    match: (c, t) => t >= 3 && c.care === t,
    lines: [
      "전원 케어 담당이라 챙길 대상이 서로밖에 없음 🔄",
      "다 엄마인 그룹 — 밥 6번 먹음 🍱🍱🍱",
      "서로 양보하다 결정이 안 남 🤷‍♀️🤷‍♂️🤷",
    ],
  },
  // ── 비율 기반 밈 (기존 + 확장) ──
  {
    match: (c, t) => c.energy >= t * 0.5,
    lines: [
      "이 그룹 모이면 매번 난리남 🔥",
      "소음 민원 각 🚨",
      "옆 테이블이 쳐다봄 👀",
      "볼륨 조절이 안 되는 그룹 📢",
    ],
  },
  {
    match: (c, t) => c.analyst >= t * 0.5,
    lines: [
      "분석하다가 하루가 끝남 🧠",
      "모여서 토론만 함 📐",
      "결론 안 나는 회의 중 ♾️",
      "모이면 일단 분석부터 시작 🔬",
    ],
  },
  {
    match: (c, t) => c.mypace >= t * 0.5,
    lines: [
      "모이긴 했는데 각자 세계 🌙",
      "같은 공간 다른 차원 🪐",
      "연락 없이 흩어짐 👻",
      "모였는데 해산한 것 같은 에너지 🌫️",
    ],
  },
  {
    match: (c, t) => c.care >= t * 0.5,
    lines: [
      "서로 챙기다 하루 끝남 🫶",
      "누가 누굴 챙기는 건지 모름 🍳",
      "밥은 계속 먹게 됨 🍕",
      "따뜻한데 정신없는 그룹 💞",
    ],
  },
  {
    match: (c, t) => c.leader >= t * 0.4,
    lines: [
      "리더가 너무 많음 ⚔️",
      "결정은 빠른데 방향이 다름 🧭",
      "프로젝트가 시작됨 📋",
      "리더 과잉 — 팔로워 모집 중 📣",
    ],
  },
  // ── 특수 조합 밈 ──
  {
    match: (c) => c.care >= 1 && c.analyst >= 1 && c.care + c.analyst >= 3,
    lines: [
      "챙기는 파 vs 분석하는 파로 나뉨 🫶🧠",
      "감성 담당과 이성 담당이 공존 💕📊",
      "밥 뭐 먹을지도 감정 vs 데이터 전쟁 🍽️",
    ],
  },
  {
    match: (c) => c.care >= 1 && c.leader >= 1 && c.care + c.leader >= 3,
    lines: [
      "이끄는 사람과 챙기는 사람이 딱 나뉨 👑🫶",
      "리더가 밀면 케어가 당김 — 밸런스 완성 ⚖️",
      "방향은 잡혀있고 분위기도 따뜻한 그룹 🌤️",
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
      "노는 파 vs 생각하는 파, 의견 조율에 60% 소요 ⏳",
    ],
  },
  {
    match: (c) => c.care >= 1 && c.mypace >= 1,
    lines: [
      "챙겨주려는데 상대가 혼자 있고 싶어함 🫶🌙",
      "한쪽은 밥 챙기고 한쪽은 이어폰 꽂음 🍚🎧",
      "애정 공세 vs 나만의 공간 — 간극이 있음 💕🚪",
    ],
  },
  {
    match: (c) => c.leader >= 1 && c.mypace >= 1,
    lines: [
      "리더가 이끄는데 따르는 사람이 사라짐 🎯👻",
      "방향은 잡혔는데 일행이 증발 중 🧭💨",
      "리더 혼자 신나는 상황 발생 주의 👑🌙",
    ],
  },
  {
    match: (c) => c.energy === 0,
    lines: [
      "텐션 올릴 사람이 없음 📉",
      "조용한 모임이 예상됨 🤫",
      "카페가 어울리는 그룹 ☕",
      "분위기 메이커 공석 — 지원자 구함 📝",
    ],
  },
  {
    match: (c) => c.leader === 0 && c.care === 0,
    lines: [
      "정리해 줄 사람이 없음 🫠",
      "아무도 안 챙기고 아무도 안 이끎 🌊",
      "자유롭지만 혼란스러움 🎪",
      "흘러가는 대로 사는 그룹 🍃",
    ],
  },
];

/** 어떤 규칙에도 안 걸릴 때 기본 밈 */
const DEFAULT_MEMES = [
  "이 조합, 모이면 꼭 한 명은 기 빨림 😵",
  "나름 밸런스 잡힌 그룹 ⚖️",
  "의외로 잘 돌아가는 조합 🎲",
  "모이면 뭔가 되긴 됨 🤷",
  "평범한 듯 비범한 구성 🎯",
];

// ─────────────────────────────────────────────
// 그룹 요약 (summary) 생성
// ─────────────────────────────────────────────

type SummaryRule = {
  match: (
    counts: Record<RoleId, number>,
    total: number,
    avgScore?: number,
  ) => boolean;
  lines: string[];
};

const SUMMARY_RULES: SummaryRule[] = [
  // avgScore 기반 규칙
  {
    match: (_c, _t, avg) => avg !== undefined && avg >= 90,
    lines: [
      "전생에 한솥밥 먹던 사이. 궁합이 비정상적으로 좋음 ✨",
      "이 그룹은 우주가 맺어준 인연 🌌",
      "궁합 점수 보고 앱이 감동받음 🥹",
    ],
  },
  {
    match: (_c, _t, avg) => avg !== undefined && avg <= 30,
    lines: [
      "솔직히 기적적으로 모인 조합. 근데 기적이 좋은 건 아님 💀",
      "궁합 앱이 '진짜요?' 하고 되물어보는 그룹 🫠",
      "이 조합으로 여행 가면 전쟁 가능 ⚔️",
    ],
  },
  // 역할 비율 기반 규칙
  {
    match: (c) => c.energy >= 1 && c.care >= 1,
    lines: [
      "시끄러운데 따뜻함. 헤어질 때 꼭 '다음엔 또 뭐 먹지?' 나오는 그룹 🍽️",
      "텐션은 높고 챙김은 넘치는 이상적 조합 🔥💕",
      "소란스럽지만 아무도 소외 안 되는 그룹 🫂",
    ],
  },
  {
    match: (c, t) => c.analyst >= t * 0.5,
    lines: [
      "모이면 일단 분석부터 함. 밥 먹을 집도 논문 쓰듯 고름 📝",
      "대화의 시작이 항상 '근데 이거 왜 그런지 아냐?'인 그룹 🤓",
      "사고력은 높은데 행동력은 의문 🧠→❓",
    ],
  },
  {
    match: (c, t) => c.leader >= t * 0.4,
    lines: [
      "결정은 빠른데 방향이 세 개임. 출발은 했는데 목적지가 제각각 🧭",
      "프로젝트 매니저만 있고 실무자가 없는 구조 📋",
      "이 그룹에선 회의가 3분 만에 끝남 — 근데 결론이 세 개 💼",
    ],
  },
  {
    match: (c, t) => c.care >= t * 0.5,
    lines: [
      "다들 챙겨주려다 정작 본인은 못 챙김. 밥은 가장 많이 먹는 그룹 🍚",
      "서로 양보하다 시간만 감. 밥집 고르는 데 30분 🤷",
      "따뜻함 과잉 — 감기 걸릴 일 없는 그룹 🧣",
    ],
  },
  {
    match: (c, t) => c.mypace >= t * 0.5,
    lines: [
      "각자의 세계가 명확함. 같이 있는데 혼자 있는 느낌이 드는 그룹 🌙",
      "모이는 건 좋아하는데 대화가 필요 없는 관계 🤐✨",
      "자연 해산까지 평균 1시간. 근데 다 만족 😌",
    ],
  },
  {
    match: (c) => c.energy >= 1 && c.analyst >= 1,
    lines: [
      "노는 파 vs 생각하는 파로 나뉨. 의견 맞추는 데 시간의 60% 씀 ⏳",
      "텐션 올리는 쪽과 분석하는 쪽이 공존. 카오스 속 질서 🎭",
      "파티 플래너와 감사 위원이 한 그룹에 있음 🎉📊",
    ],
  },
  {
    match: (c) => c.energy >= 1 && c.mypace >= 1,
    lines: [
      "텐션 양극화 그룹. 한쪽은 불꽃이고 한쪽은 달빛 🔥🌙",
      "에너지 차이 극명 — 근데 그래서 밸런스가 됨 📈📉",
      "시끄러운 애와 조용한 애가 공존하는 생태계 🌿",
    ],
  },
  {
    match: (c) => c.care >= 1 && c.leader >= 1,
    lines: [
      "이끄는 사람과 챙기는 사람이 있어서 그룹이 잘 돌아감 ⚙️",
      "방향도 잡혀있고 분위기도 따뜻한 밸런스 그룹 🌤️",
      "리더가 앞장서고 케어가 뒷수습하는 황금 구조 👑🫶",
    ],
  },
  {
    match: (c) => c.leader === 0 && c.care === 0,
    lines: [
      "이끄는 사람도 챙기는 사람도 없어서 자유방임. 근데 편함 🍃",
      "무정부주의 그룹. 규칙 없음, 리더 없음, 근데 어쩐지 잘 됨 🏴",
      "자유롭지만 가끔 누가 정리해줬으면 하는 그룹 🫠",
    ],
  },
  {
    match: (c) => c.energy === 0,
    lines: [
      "텐션 메이커가 없어서 조용한 모임. 카페가 딱인 그룹 ☕",
      "분위기 올려줄 사람이 필요한 그룹. 근데 다들 그게 본인이 아니라고 생각 🤫",
    ],
  },
];

const DEFAULT_SUMMARIES = [
  "나름 밸런스가 잡힌 구성. 모이면 뭔가 되긴 하는 그룹 ⚖️",
  "특별한 치우침 없이 각자 역할이 있는 그룹 🎲",
  "균형 잡힌 조합 — 큰 사건은 없지만 편한 그룹 🛋️",
];

// ─────────────────────────────────────────────
// 분석 함수
// ─────────────────────────────────────────────

/** 그룹 멤버의 MBTI 기반으로 역할 분포 분석 + 밈 생성 */
export function analyzeGroup(
  members: { mbti: MbtiType; name?: string }[],
  pairScores?: PairScore[],
  avgScore?: number,
): GroupAnalysis {
  const counts: Record<RoleId, number> = {
    energy: 0,
    care: 0,
    analyst: 0,
    leader: 0,
    mypace: 0,
  };

  const membersByRole: Partial<Record<RoleId, string[]>> = {};

  members.forEach((m) => {
    const role = MBTI_ROLE[m.mbti];
    counts[role]++;
    if (m.name) {
      if (!membersByRole[role]) membersByRole[role] = [];
      membersByRole[role]!.push(m.name);
    }
  });

  // 역할별 요약 (인원 수 > 0인 것만, 내림차순)
  const roles: RoleEntry[] = (Object.keys(counts) as RoleId[])
    .filter((id) => counts[id] > 0)
    .sort((a, b) => counts[b] - counts[a])
    .map((id) => {
      const count = counts[id];
      const role = ROLES[id];
      const effectIdx = Math.min(count - 1, 2);
      const cacheKey = `${id}:${count}`;
      const effect = pickCached(cacheKey, role.effects[effectIdx]);
      return {
        id,
        ...role,
        count,
        effect,
      };
    });

  // 첫 번째 매칭 규칙의 lines에서 랜덤 선택
  const total = members.length;
  const matched = MEME_RULES.find((r) => r.match(counts, total));
  const pool = matched?.lines ?? DEFAULT_MEMES;
  const meme = pool[Math.floor(Math.random() * pool.length)];

  // summary 생성
  const summaryMatched = SUMMARY_RULES.find((r) =>
    r.match(counts, total, avgScore),
  );
  const summaryPool = summaryMatched?.lines ?? DEFAULT_SUMMARIES;
  const summary =
    summaryPool[Math.floor(Math.random() * summaryPool.length)];

  // 빠진 역할 목록
  const missingRoles: RoleId[] = (Object.keys(counts) as RoleId[]).filter(
    (id) => counts[id] === 0,
  );

  // 역할 분포 균형 점수 (표준편차 기반, 균등 분포일수록 100에 가까움)
  // 각 역할의 비율이 이상적인 1/5(=0.2)에 가까울수록 높은 점수
  const proportions = (Object.keys(counts) as RoleId[]).map(
    (id) => counts[id] / total,
  );
  const ideal = 1 / 5;
  const variance =
    proportions.reduce((sum, p) => sum + (p - ideal) ** 2, 0) / 5;
  const stdDev = Math.sqrt(variance);
  // 최대 표준편차: 한 역할에 100% → stdDev = sqrt((4*(0-0.2)^2 + (1-0.2)^2) / 5) = 0.4
  const MAX_STD_DEV = 0.4;
  const balanceScore = Math.round(100 * (1 - stdDev / MAX_STD_DEV));

  // 개인별 통계 (pairScores가 있고 멤버에 이름이 있을 때만)
  let memberStats: MemberStat[] | undefined;
  let popularMember: string | undefined;
  let uniqueMember: string | undefined;

  if (pairScores && pairScores.length > 0) {
    const namedMembers = members.filter((m) => m.name);
    if (namedMembers.length >= 2) {
      memberStats = namedMembers.map((m) => {
        const name = m.name!;
        const pairs = pairScores.filter((p) => p.a === name || p.b === name);
        const scores = pairs.map((p) => ({
          partner: p.a === name ? p.b : p.a,
          score: p.score,
        }));
        const avg =
          scores.length > 0
            ? Math.round(
                scores.reduce((s, p) => s + p.score, 0) / scores.length,
              )
            : 0;
        const best = scores.reduce(
          (best, p) => (p.score > best.score ? p : best),
          scores[0],
        );
        const worst = scores.reduce(
          (worst, p) => (p.score < worst.score ? p : worst),
          scores[0],
        );
        return {
          name,
          mbti: m.mbti,
          avgScore: avg,
          bestPartner: best?.partner ?? "",
          worstPartner: worst?.partner ?? "",
        };
      });

      if (memberStats.length > 0) {
        popularMember = memberStats.reduce((a, b) =>
          a.avgScore >= b.avgScore ? a : b,
        ).name;
        uniqueMember = memberStats.reduce((a, b) =>
          a.avgScore <= b.avgScore ? a : b,
        ).name;
      }
    }
  }

  return {
    meme,
    roles,
    summary,
    membersByRole,
    memberStats,
    popularMember,
    uniqueMember,
    missingRoles,
    balanceScore,
  };
}
