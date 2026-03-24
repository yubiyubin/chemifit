/**
 * 사이트 전역 UI 텍스트 상수
 *
 * 컴포넌트에 하드코딩된 한국어 문구를 한곳에 모아 관리.
 * 나중에 다국어 지원 시 이 파일만 교체하면 됨.
 */

// ─────────────────────────────────────────────
// 사이트 공통
// ─────────────────────────────────────────────

export const SITE = {
  title: "MBTI 궁합 맵",
  subtitle: "재미로 보는 궁합이에요 😊 과학적 근거는 없어요",
  copyright: "© 2026 CYB Labs. All rights reserved.",
  myMbtiLabel: "내 MBTI",
  reselectButton: "재선택",
} as const;

// ─────────────────────────────────────────────
// MBTI 선택 모달
// ─────────────────────────────────────────────

export const MBTI_SELECT = {
  defaultTitle: "내 MBTI는?",
  defaultSubtitle: "선택하면 바로 궁합을 볼 수 있어요",
  defaultEmoji: "🧬",
  partnerTitle: "상대방의 MBTI는?",
  partnerSubtitle: "궁금한 그 사람의 유형을 선택해주세요 💕",
  partnerEmoji: "💘",
  otherMbtiLabel: "다른 MBTI와 궁합 보기",
} as const;

// ─────────────────────────────────────────────
// 연인 궁합 (CoupleResult)
// ─────────────────────────────────────────────

export const COUPLE = {
  heroEmoji: "💥",
  mbtiSeparator: "💕",
  fightTitle: "🔥 싸움 패턴",
  solutionTitle: "🔧 해결 핵심",
  detailOpenLabel: "📖 더 자세히 보기",
  detailCloseLabel: "접기",
  rankCta: "이 궁합, 전체 중에서 몇 위일까? 👀",
  rankCtaSub: "👉 상위 몇 %인지 확인해보기",
  detailScoreTitle: "💞 세부 궁합",
} as const;

// ─────────────────────────────────────────────
// 궁합 맵 (MbtiGrid)
// ─────────────────────────────────────────────

export const MBTI_MAP = {
  otherMbtiLabel: "다른 MBTI로 보기",
  otherMbtiEmoji: "👇",
  rankTitle: "📊 궁합 순위",
} as const;

// ─────────────────────────────────────────────
// 그룹 궁합 (GroupGrid)
// ─────────────────────────────────────────────

export const GROUP = {
  emptyTitle: "최소 2명이 필요해요",
  emptySubtitle: "멤버를 추가하면 그룹 궁합을 분석해드려요",
  emptyEmoji: "👥",
  previewGuide: "멤버를 추가하면 궁합 맵이 나타나요",
  graphHint: "선을 클릭하면 상세 궁합을 볼 수 있어요",
  pairSectionTitle: "쌍별 궁합",
  roleAccordionOpen: "🎭 그룹 역할 분석 보기",
  roleAccordionClose: "접기",
  batteryLabel: "그룹 케미 충전량",
} as const;

// ─────────────────────────────────────────────
// 궁합 상세 모달 (CompatDetailModal)
// ─────────────────────────────────────────────

export const COMPAT_DETAIL = {
  loveCtaLabel: "💜 이 MBTI랑 연애하면?",
  closeLabel: "닫기",
} as const;

// ─────────────────────────────────────────────
// 멤버 입력 (MemberInput)
// ─────────────────────────────────────────────

export const MEMBER_INPUT = {
  maxMembers: 8,
  minMembers: 2,
  namePlaceholder: "이름 (비우면 랜덤)",
  countSuffix: "명 입력됨",
  minWarning: "최소 2명이 필요해요",
  addButton: "추가",
} as const;

// ─────────────────────────────────────────────
// 공용 이모지
// ─────────────────────────────────────────────

export const EMOJIS = {
  best: "🏆",
  worst: "💀",
  hearts: ["💕", "💗", "💘", "♥", "💖"],
} as const;
