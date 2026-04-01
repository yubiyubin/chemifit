/**
 * 사이트 전역 UI 텍스트 상수
 *
 * 컴포넌트에 하드코딩된 한국어 문구를 한곳에 모아 관리.
 * 나중에 다국어 지원 시 이 파일만 교체하면 됨.
 */

// ─────────────────────────────────────────────
// 공용 액션 라벨
// ─────────────────────────────────────────────

export const COMMON = {
  saveBtn: "저장",
  previewTitle: "이미지 미리보기",
  loadingText: "이미지 생성 중...",
} as const;

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
// 페이지별 heading (시맨틱 SEO)
// ─────────────────────────────────────────────

export const PAGE_HEADINGS = {
  mbtiLove: "MBTI 연애 궁합 테스트",
  mbtiMap: "MBTI 16타입 궁합 맵",
  groupMatch: "그룹 MBTI 궁합 분석",
  mbtiProfiles: "MBTI 16타입 유형 설명",
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
  detailOpenLabel: "펼치기",
  detailCloseLabel: "접기",
  detailScoreTitle: "💞 세부 궁합",
  saveImageBtn: "이미지 저장",
} as const;

// ─────────────────────────────────────────────
// 궁합 맵 (MbtiGrid)
// ─────────────────────────────────────────────

export const MBTI_MAP = {
  otherMbtiLabel: "다른 MBTI로 보기",
  otherMbtiEmoji: "👇",
  /** 캐치프레이즈 서브타이틀 */
  mapTitle: "궁합 랭킹 TOP 16",
  rankTitle: "📊 궁합 순위",
  copyLinkBtn: "링크 복사",
  copiedMessage: "복사 완료!",
  badgeClickHint: "원을 클릭하면 상세 궁합을 볼 수 있어요",
  graphTapHint: "원들을 탭해보세요",
  saveImageBtn: "이미지 저장",
} as const;

// ─────────────────────────────────────────────
// 그룹 궁합 (GroupGrid)
// ─────────────────────────────────────────────

export const GROUP = {
  emptyTitle: "최소 2명이 필요해요",
  emptySubtitle: "멤버를 추가하면 그룹 궁합을 분석해드려요",
  emptyEmoji: "👥",
  previewGuide: "멤버를 추가하면 궁합 맵이 나타나요",
  graphHint: "원을 클릭하면 상세 궁합을 볼 수 있어요",
  pairSectionTitle: "쌍별 궁합",
  roleAccordionOpen: "🎭 그룹 역할 분석 보기",
  roleAccordionClose: "접기",
  avgCompatLabel: "그룹 평균 궁합",
  // 공유
  shareButton: "링크 복사",
  copiedMessage: "복사 완료!",
  // 전체 페어 랭킹
  pairRankOpen: "전체 궁합 순위 보기",
  pairRankClose: "접기",
} as const;

// ─────────────────────────────────────────────
// 궁합 상세 모달 (CompatDetailModal)
// ─────────────────────────────────────────────

export const COMPAT_DETAIL = {
  percentileLabel: "전체 조합 중 상위",
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
// 탭 간 CTA 문구 (일반용 title+subtitle / 모달용 1줄)
// ─────────────────────────────────────────────

export const CTA_TEXTS = {
  /** 연애궁합 탭 → 다른 탭 CTA */
  love: {
    toMap: {
      title: "나랑 제일 잘 맞는 MBTI는? 🎯",
      subtitle: "전체 궁합 순위 한눈에 확인하기 →",
      modal: "내 MBTI 궁합 랭킹 1위는 누구? 🥇",
    },
    toGroup: {
      title: "친구들이랑 모이면 케미 어떻게 될까? 🔥",
      subtitle: "그룹 궁합 분석하러 가기 →",
      modal: "친구들이랑 케미 어떨까? 👀",
    },
  },
  /** 궁합맵 탭 → 다른 탭 CTA */
  map: {
    toLove: {
      title: "이 조합, 연애해도 될까? 🫣",
      subtitle: "싸움 패턴·해결법까지 상세 분석하기 →",
      modal: "이 MBTI랑 연애하면 어떨까? 💘",
    },
    toGroup: {
      title: "여러 명 붙이면 어떤 난리날까? 🎪",
      subtitle: "2~8명 그룹 궁합 바로 분석하기 →",
      modal: "여러 명이면 궁합이 어떻게 될까? 🧪",
    },
  },
  /** 그룹궁합 탭 → 다른 탭 CTA */
  group: {
    toLove: {
      title: "이 둘, 사귀면 어떻게 될까? 🫣",
      subtitle: "256가지 연애 궁합 상세 분석하기 →",
      modal: "이 둘, 사귀면 어떻게 될까? 🫣",
    },
    toMap: {
      title: "16명이랑 다 비교하면 누가 1등? 🏆",
      subtitle: "16타입 궁합 맵 한눈에 보기 →",
      modal: "내 MBTI 궁합 지도 펼쳐보기 🗺️",
    },
  },
} as const;

// ─────────────────────────────────────────────
// 유형 설명 페이지 (ProfileGrid, ProfileDetail)
// ─────────────────────────────────────────────

export const PROFILES = {
  pageTitle: "MBTI 유형 설명",
  pageSubtitle: "16가지 성격 유형의 특징을 알아보세요",
  gridHint: "유형을 클릭해서 상세 설명을 확인하세요",
  cardClickHint: "클릭하면 상세 설명을 볼 수 있어요",
  summaryTitle: "성격 요약",
  tagsTitle: "키워드",
  strengthsTitle: "✅ 장점",
  weaknessesTitle: "⚠️ 단점",
  loveStyleTitle: "💘 연애 스타일",
  compatTitle: "💞 추천 궁합",
  bestLabel: "베스트 궁합",
  worstLabel: "워스트 궁합",
  celebritiesTitle: "🌟 유명 인물·캐릭터",
  // CTA
  detailCtaLabel: "상세 프로필 보기",
  loveCtaLabel: "연애 궁합 보기",
  mapCtaLabel: "궁합 맵 보기",
  groupCtaLabel: "그룹 궁합 보기",
  // 공유
  shareButton: "링크 복사",
  saveImageBtn: "이미지 저장",
  copiedMessage: "복사 완료!",
  backToGrid: "← 전체 유형 보기",
} as const;

// ─────────────────────────────────────────────
// 공용 이모지
// ─────────────────────────────────────────────

export const EMOJIS = {
  best: "🏆",
  worst: "💀",
  hearts: ["💕", "💗", "💘", "♥", "💖"],
} as const;
