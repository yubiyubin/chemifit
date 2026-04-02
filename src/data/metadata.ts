/**
 * SEO 메타데이터 상수 (Single Source of Truth)
 *
 * 각 페이지 layout.tsx에서 import하여 Metadata 객체를 구성.
 * title, description, keywords, canonical, og, twitter 필드를 모두 포함.
 */

export const SITE_URL = "https://chemifit.cyb-labs.com";
export const SITE_NAME = "ChemiFit";
export const GA_ID = "G-3V9R7C99QG";

/** 카카오 JavaScript 앱 키 (공개 키 — https://developers.kakao.com 에서 발급) */
export const KAKAO_JS_KEY = "YOUR_KAKAO_JS_KEY";

/** 모든 페이지에서 공유하는 OG 이미지 설정 */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
} as const;

/** 페이지별 SEO 메타데이터 */
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
    canonical: "/",
    og: {
      title: "ChemiFit - MBTI & 성격 테스트 허브",
      description:
        "MBTI 궁합, 동물 매칭, 연애 유형 등 다양한 성격 콘텐츠를 즐겨보세요.",
    },
    twitter: {
      title: "ChemiFit - MBTI & 성격 테스트 허브",
      description:
        "MBTI 궁합, 동물 매칭, 연애 유형 등 다양한 성격 콘텐츠를 즐겨보세요.",
    },
  },
  mbtiLove: {
    title: "MBTI 연애 궁합 - 커플 궁합 테스트",
    description:
      "나와 상대의 MBTI 연애 궁합 점수, 싸움 패턴, 해결법까지 상세하게 분석합니다. 256가지 조합의 궁합을 확인하세요.",
    keywords: [
      "MBTI 연애 궁합",
      "커플 궁합 테스트",
      "MBTI 커플",
      "연인 궁합",
      "MBTI 사랑",
      "MBTI 연애 점수",
      "MBTI 커플 궁합표",
      "MBTI 짝꿍",
      "MBTI 연애 상성",
    ],
    canonical: "/mbti-love",
    og: {
      title: "MBTI 연애 궁합 - 커플 궁합 테스트 | ChemiFit",
      description:
        "나와 상대의 MBTI 연애 궁합 점수, 싸움 패턴, 해결법까지 상세하게.",
    },
    twitter: {
      title: "MBTI 연애 궁합 - 커플 궁합 테스트 | ChemiFit",
      description:
        "나와 상대의 MBTI 연애 궁합 점수, 싸움 패턴, 해결법까지 상세하게.",
    },
  },
  mbtiMap: {
    title: "MBTI 궁합 맵 - 16타입 궁합 순위",
    description:
      "내 MBTI와 16가지 유형의 궁합을 점수·순위로 한눈에 확인하세요. 네트워크 그래프로 시각화된 궁합 맵.",
    keywords: [
      "MBTI 궁합 순위",
      "16타입 궁합",
      "MBTI 궁합 맵",
      "MBTI 상성",
      "MBTI 궁합표",
      "MBTI 네트워크 그래프",
      "MBTI 유형별 궁합",
      "MBTI 순위표",
      "MBTI 궁합 점수표",
    ],
    canonical: "/mbti-map",
    og: {
      title: "MBTI 궁합 맵 - 16타입 궁합 순위 | ChemiFit",
      description:
        "내 MBTI와 16가지 유형의 궁합을 점수·순위로 한눈에 확인하세요.",
    },
    twitter: {
      title: "MBTI 궁합 맵 - 16타입 궁합 순위 | ChemiFit",
      description:
        "내 MBTI와 16가지 유형의 궁합을 점수·순위로 한눈에 확인하세요.",
    },
  },
  groupMatch: {
    title: "그룹 MBTI 궁합 - 팀 케미 분석",
    description:
      "2~8명의 MBTI로 그룹 궁합을 네트워크 그래프로 시각화. 평균·최고·최저 궁합과 팀 역할까지 분석합니다.",
    keywords: [
      "그룹 MBTI 궁합",
      "팀 케미",
      "팀 MBTI",
      "단체 궁합",
      "MBTI 그룹 분석",
      "팀 궁합 테스트",
      "MBTI 팀워크",
      "그룹 케미 분석",
      "MBTI 모임 궁합",
    ],
    canonical: "/group-match",
    og: {
      title: "그룹 MBTI 궁합 - 팀 케미 분석 | ChemiFit",
      description:
        "2~8명의 MBTI로 그룹 궁합을 네트워크 그래프로 시각화합니다.",
    },
    twitter: {
      title: "그룹 MBTI 궁합 - 팀 케미 분석 | ChemiFit",
      description:
        "2~8명의 MBTI로 그룹 궁합을 네트워크 그래프로 시각화합니다.",
    },
  },
  mbtiProfiles: {
    title: "MBTI 유형 설명 - 16가지 성격 특징",
    description:
      "INTJ, ENFP 등 16가지 MBTI 유형별 성격 특징, 장단점, 연애 스타일, 궁합을 한눈에 확인하세요.",
    keywords: [
      "MBTI 유형 설명",
      "MBTI 성격 특징",
      "INTJ 특징",
      "ENFP 성격",
      "MBTI 16가지",
      "MBTI 장단점",
      "MBTI 연애 스타일",
      "MBTI 유형별 특성",
      "성격 유형 설명",
    ],
    canonical: "/mbti-profiles",
    og: {
      title: "MBTI 유형 설명 - 16가지 성격 특징 | ChemiFit",
      description:
        "16가지 MBTI 유형별 성격 특징, 장단점, 연애 스타일을 확인하세요.",
    },
    twitter: {
      title: "MBTI 유형 설명 - 16가지 성격 특징 | ChemiFit",
      description:
        "16가지 MBTI 유형별 성격 특징, 장단점, 연애 스타일을 확인하세요.",
    },
  },
};
