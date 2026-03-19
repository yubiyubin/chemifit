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

export const COUPLE_TIERS = [
  {
    min: 90,
    emoji: "💘",
    labels: [
      "이건 그냥 운명 말고 설명이 안 됨 💘",
      "이건 진짜… 헤어지면 국가적 손실임 💥",
      "이거 놓치면 진짜 후회함 😭",
      "영화였으면 해피엔딩 확정 🎬",
      "이건 진짜 놓치면 평생 생각남 🥹",
      "타이밍까지 완벽하게 맞아떨어진 케이스 🧩",
      "이 조합은 누가 봐도 끝까지 간다 🔥",
    ],
  },
  {
    min: 75,
    emoji: "💕",
    labels: [
      "싸워도 금방 다시 붙는 타입 🔁",
      "중간에 위기 있어도 결국 이어짐 🎢",
      "적당히 맞고 적당히 참는 관계 🤝",
      "좀 부딪혀도 결국 다시 맞춰짐 🧠",
      "시간 갈수록 더 괜찮아지는 조합 ⏳",
      "위기 와도 금방 회복하는 편 🩹",
    ],
  },
  {
    min: 60,
    emoji: "💗",
    labels: [
      "지금부터 서사 쌓이는 구간 📖",
      "평균 이상은 한다 🙂",
      "지금부터 어떻게 하느냐가 중요함 🎯",
      "조금만 맞추면 확 좋아질 수 있음 📈",
      "생각보다 케미는 나쁘지 않음 😏",
      "지금이 제일 중요한 구간 ⏰",
    ],
  },
  {
    min: 45,
    emoji: "🫠",
    labels: [
      "좋은데… 쉽진 않다 이거 🫠",
      "좋은데 왜 자꾸 체력 깎이지 🪫",
      "좋긴 한데 타이밍 자꾸 어긋남 ⏱️",
      "좋은데 왜 자꾸 고민이 생기지 🤯",
      "노력 대비 효율이 애매함 📉",
      "좋긴 한데 자꾸 삐끗남 😵‍💫",
    ],
  },
  {
    min: 30,
    emoji: "🧊",
    labels: [
      "대화는 하는데 번역이 필요함 🌐",
      "대화는 하는데 자막이 필요함 🎧",
      "둘이 같은 말 하는데 번역이 다름 🔄",
      "합은 안 맞는데 웃기긴 함 😂",
    ],
  },
  {
    min: 0,
    emoji: "💀",
    labels: [
      "연애가 아니라 챌린지 모드 🎮",
      "이건 서로 인내심 테스트 중 🧘",
      "이건 비극 루트임 🥀",
      "연애가 아니라 서바이벌 모드 🏝️",
      "이건 사랑이 아니라 실험 🧪",
    ],
  },
];

export function getCoupleTier(score: number) {
  const tier =
    COUPLE_TIERS.find((t) => score >= t.min) ??
    COUPLE_TIERS[COUPLE_TIERS.length - 1];
  const label = tier.labels[Math.floor(Math.random() * tier.labels.length)];
  return { emoji: tier.emoji, label };
}
