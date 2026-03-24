/**
 * 연애 궁합 상세 설명(detail) 불릿 이모티콘 매핑
 *
 * CoupleResult.tsx의 decorateBullets 함수에서 사용.
 * 헤딩 키워드 → 섹션 기본 이모지, 줄 키워드 → 세부 이모지.
 */

/** 섹션 헤딩 키워드 → 기본 이모지 */
export const SECTION_EMOJIS: { keyword: string; emoji: string }[] = [
  { keyword: "실제 상황", emoji: "🎬" },
  { keyword: "싸움", emoji: "⚡" },
  { keyword: "잘 맞는", emoji: "💡" },
  { keyword: "속마음", emoji: "💭" },
  { keyword: "관계 흐름", emoji: "📅" },
  { keyword: "궁합 요약", emoji: "✨" },
];

/** 줄 키워드 패턴 → 세부 이모지 (순서대로 매칭, 먼저 걸리면 우선) */
export const LINE_EMOJIS: { pattern: RegExp; emoji: string }[] = [
  { pattern: /^데이트[:：]/, emoji: "💑" },
  { pattern: /^연락\s*스타일[:：]/, emoji: "📱" },
  { pattern: /^초반[:：]/, emoji: "🌱" },
  { pattern: /^중반[:：]/, emoji: "🌿" },
  { pattern: /^장기[:：]/, emoji: "🌳" },
  { pattern: /^공통[:：]|\[공통\][:：]/, emoji: "🤝" },
  { pattern: /속마음\]?[:：]/, emoji: "💭" },
  { pattern: /에게\][:：]/, emoji: "💜" },
];

/** 기본 불릿 이모지 (어떤 패턴에도 매칭 안 될 때) */
export const DEFAULT_BULLET_EMOJI = "▸";
