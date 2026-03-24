/**
 * 세부 궁합 카테고리 정의 + 점수 계산 로직
 *
 * CoupleResult.tsx에서 사용.
 * 4개 카테고리(감정 교류, 대화 궁합, 가치관, 일상 호환)의
 * 라벨, 이모지, 점수 계산 가중치를 정의.
 */

import type { MbtiType } from "@/data/compatibility";
import { getCategoryComment } from "./category-comments";

/** 카테고리 정의 */
export type CategoryDef = {
  label: string;
  emoji: string;
  /** MBTI 4글자 중 어떤 위치(0=E/I, 1=S/N, 2=T/F, 3=J/P)의 일치 여부로 보너스를 줄지 */
  bonuses: { index: number; match: number; mismatch: number }[];
};

export const CATEGORIES: CategoryDef[] = [
  {
    label: "감정 교류",
    emoji: "💓",
    bonuses: [
      { index: 2, match: 25, mismatch: 0 }, // T/F 일치
      { index: 0, match: 10, mismatch: 5 }, // E/I 일치
    ],
  },
  {
    label: "대화 궁합",
    emoji: "💬",
    bonuses: [
      { index: 0, match: 20, mismatch: 5 }, // E/I 일치
      { index: 1, match: 15, mismatch: 0 }, // S/N 일치
    ],
  },
  {
    label: "가치관",
    emoji: "🌙",
    bonuses: [
      { index: 1, match: 20, mismatch: 5 }, // S/N 일치
      { index: 2, match: 15, mismatch: 0 }, // T/F 일치
    ],
  },
  {
    label: "일상 호환",
    emoji: "☀️",
    bonuses: [
      { index: 3, match: 25, mismatch: 5 }, // J/P 일치
      { index: 0, match: 10, mismatch: 0 }, // E/I 일치
    ],
  },
];

/** 0~100 범위로 제한 */
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/**
 * 두 MBTI의 4글자 일치 여부를 기반으로 카테고리별 점수를 산출한다.
 */
export function getCategoryScores(
  myMbti: MbtiType,
  partnerMbti: MbtiType,
  baseScore: number,
) {
  const matchFlags = [
    myMbti[0] === partnerMbti[0], // E/I
    myMbti[1] === partnerMbti[1], // S/N
    myMbti[2] === partnerMbti[2], // T/F
    myMbti[3] === partnerMbti[3], // J/P
  ];

  return CATEGORIES.map((cat) => {
    let score = baseScore * 0.6;
    for (const b of cat.bonuses) {
      score += matchFlags[b.index] ? b.match : b.mismatch;
    }
    const finalScore = clamp(score);
    return {
      label: cat.label,
      emoji: cat.emoji,
      score: finalScore,
      comment: getCategoryComment(cat.label, finalScore),
    };
  });
}
