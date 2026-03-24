/**
 * SEO 메타데이터 상수
 *
 * app/layout.tsx 및 각 페이지 layout.tsx에서 사용.
 */

export const SITE_URL = "https://chemifit.vercel.app";
export const SITE_NAME = "ChemiFit";
export const GA_ID = "G-3V9R7C99QG";

export const META = {
  root: {
    title: "ChemiFit - MBTI 궁합 테스트",
    titleTemplate: "%s | ChemiFit",
    description:
      "MBTI 궁합 점수, 연애 궁합, 그룹 궁합을 한눈에. 16가지 MBTI 유형 간 궁합을 점수·그래프·상세 분석으로 확인하세요.",
    keywords: [
      "MBTI 궁합",
      "MBTI 연애 궁합",
      "MBTI 궁합 테스트",
      "MBTI 그룹 궁합",
      "성격 유형 테스트",
      "MBTI 궁합 점수",
      "케미핏",
      "MBTI 궁합표",
      "MBTI 궁합 순위",
    ],
  },
  mbtiLove: {
    title: "MBTI 연애 궁합 - 커플 궁합 테스트",
    description:
      "나와 상대의 MBTI 연애 궁합 점수, 싸움 패턴, 해결법까지 상세하게 분석합니다. 256가지 조합의 궁합을 확인하세요.",
  },
  mbtiMap: {
    title: "MBTI 궁합 맵 - 16타입 궁합 순위",
    description:
      "내 MBTI와 16가지 유형의 궁합을 점수·순위로 한눈에 확인하세요. 네트워크 그래프로 시각화된 궁합 맵.",
  },
  groupMatch: {
    title: "그룹 MBTI 궁합 - 팀 케미 분석",
    description:
      "2~8명의 MBTI로 그룹 궁합을 네트워크 그래프로 시각화. 평균·최고·최저 궁합과 팀 역할까지 분석합니다.",
  },
} as const;
