export const SCORE_EMOJI = [
  { min: 95, emoji: "🏆", label: "천생연분" },
  { min: 88, emoji: "🔥", label: "환상의 궁합" },
  { min: 80, emoji: "✨", label: "최고의 궁합" },
  { min: 73, emoji: "💫", label: "아주 잘 맞아요" },
  { min: 65, emoji: "🎯", label: "잘 맞아요" },
  { min: 58, emoji: "🌿", label: "나쁘지 않아요" },
  { min: 50, emoji: "🤝", label: "보통이에요" },
  { min: 42, emoji: "🌧️", label: "노력이 필요해요" },
  { min: 35, emoji: "⚠️", label: "많이 달라요" },
  { min: 25, emoji: "🌊", label: "쉽지 않아요" },
  { min: 0, emoji: "💀", label: "극과 극이에요" },
];

export function getScoreInfo(score: number) {
  return (
    SCORE_EMOJI.find((e) => score >= e.min) ??
    SCORE_EMOJI[SCORE_EMOJI.length - 1]
  );
}

/**
 * 커플 궁합 등급 테이블.
 * 각 등급별 여러 개의 재치 있는 라벨(labels[])을 보유하며,
 * getCoupleTier()에서 랜덤으로 하나를 선택하여 렌더마다 다른 문구를 보여준다.
 */
export const COUPLE_TIERS = [
  {
    min: 90,
    emoji: "💘",
    labels: [
      "전생에 뭐였길래,,,💗",
      "이 조합 실화?! 운명이다 운명 💫",
      "둘이 붙어다니면 주변이 힘듦 🔥",
      "커플링 각 잡아도 됨 💍",
    ],
  },
  {
    min: 75,
    emoji: "💕",
    labels: [
      "찐이야 이건",
      "썸 탈 필요 없이 바로 직진 🚀",
      "서로 취향 저격 중 🎯",
      "눈빛만 봐도 통하는 사이 👀",
    ],
  },
  {
    min: 60,
    emoji: "💗",
    labels: [
      "쏠리는 중",
      "좀만 더 밀면 넘어갈 듯 🌊",
      "미묘하게 설레는 거 맞지? 😏",
      "가능성 충분함, 밀어봐 💪",
    ],
  },
  {
    min: 45,
    emoji: "🫠",
    labels: [
      "밀당 각",
      "좋다가도 갑자기 멀어지는 느낌 🎢",
      "서로 다른 매력에 끌림 그 자체 🧲",
      "노력하면 반전 가능 🔄",
    ],
  },
  {
    min: 30,
    emoji: "🧊",
    labels: [
      "서로 외국어 하는 중",
      "말은 통하는데 맥락이 안 맞음 📡",
      "번역기 필요한 관계 🗣️",
      "이해하려면 매뉴얼 필요 📖",
    ],
  },
  {
    min: 0,
    emoji: "💀",
    labels: [
      "이건 사랑이 아니라 도전",
      "극한 도전: 연애 편 🏔️",
      "서로한테 외계인 👽",
      "호환 불가… 펌웨어 업데이트 필요 🔧",
    ],
  },
];

/**
 * 점수에 해당하는 커플 등급을 찾고, labels[] 중 랜덤으로 하나를 선택하여 반환한다.
 * @returns {{ emoji: string, label: string }}
 */
export function getCoupleTier(score: number) {
  const tier =
    COUPLE_TIERS.find((t) => score >= t.min) ??
    COUPLE_TIERS[COUPLE_TIERS.length - 1];
  const label = tier.labels[Math.floor(Math.random() * tier.labels.length)];
  return { emoji: tier.emoji, label };
}

// ─────────────────────────────────────────────
// 연애 vs 친구 한줄 요약
// ─────────────────────────────────────────────

/**
 * 궁합 점수 구간별 "연애 vs 친구" 한줄 비교 문구.
 * 궁합 맵/그룹 궁합 팝업에서 사용된다.
 * 이모지는 텍스트 뒤에 배치한다.
 */
const LOVE_FRIEND_LINES = [
  {
    min: 90,
    line: "연애는 운명급, 친구로는 소울메이트 💘🤝",
  },
  {
    min: 75,
    line: "연애도 좋고, 친구해도 찐한 사이 💕😎",
  },
  {
    min: 60,
    line: "연애는 노력하면 꽃피고, 친구는 꽤 잘 맞음 🌸🤜",
  },
  {
    min: 45,
    line: "연애는 노력 필요, 친구는 적당히 편한 사이 🫠☕",
  },
  {
    min: 30,
    line: "연애는 험난, 친구로는 가끔 통하는 정도 🧊🤏",
  },
  {
    min: 0,
    line: "연애도 친구도 서로 다른 세계관 💀🌌",
  },
];

/**
 * 점수에 해당하는 "연애 vs 친구" 한줄 요약을 반환한다.
 * 궁합 맵 팝업 및 그룹 궁합 팝업에서 호출된다.
 */
export function getLoveFriendLine(score: number): string {
  const entry =
    LOVE_FRIEND_LINES.find((e) => score >= e.min) ??
    LOVE_FRIEND_LINES[LOVE_FRIEND_LINES.length - 1];
  return entry.line;
}
