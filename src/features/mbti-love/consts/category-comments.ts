/**
 * 세부 궁합 카테고리별 점수대 한 줄 코멘트
 *
 * CoupleResult.tsx의 DetailScoreCard에서 사용.
 * 각 카테고리(감정 교류, 대화 궁합, 가치관, 일상 호환)마다 4단계 코멘트를 정의.
 * 인덱스 0이 최고 점수대(75+), 인덱스 3이 최저 점수대(35 미만).
 */

export const CATEGORY_COMMENTS: Record<string, string[]> = {
  "감정 교류": [
    "눈빛만 봐도 통하는 사이 ✨",
    "감정 교류 꽤 원활한 편 👍",
    "가끔 통역이 필요함 🤔",
    "감정은 각자 알아서 처리 중 🧊",
  ],
  "대화 궁합": [
    "대화하다 밤새는 조합 🌙",
    "말이 잘 통하는 편 💬",
    "가끔 다른 나라 사람 같음 🌐",
    "대화보다 침묵이 편한 사이 🤐",
  ],
  가치관: [
    "인생관이 거의 쌍둥이 🧬",
    "큰 틀에선 방향이 비슷함 🧭",
    "중요한 건 좀 다르게 봄 🔀",
    "평행우주에서 온 것 같은 가치관 🪐",
  ],
  "일상 호환": [
    "같이 살아도 스트레스 제로 🏠",
    "생활 리듬 꽤 맞는 편 ☕",
    "습관 차이로 가끔 충돌 ⚡",
    "동거하면 서바이벌 시작 🏕️",
  ],
};

/**
 * 점수 구간에 따라 해당 카테고리의 코멘트를 반환한다.
 */
export function getCategoryComment(label: string, score: number): string {
  const comments = CATEGORY_COMMENTS[label];
  if (!comments) return "";
  if (score >= 75) return comments[0];
  if (score >= 55) return comments[1];
  if (score >= 35) return comments[2];
  return comments[3];
}
