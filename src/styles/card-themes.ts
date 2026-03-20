/**
 * 카드 테마 스타일 변수
 *
 * CardTheme: 테마 카드의 색상·투명도 설정 타입
 * FIGHT_THEME: 싸움 패턴 카드 (빨강 톤)
 * SOLUTION_THEME: 해결 핵심 카드 (보라 톤)
 * VARIANT_CONFIG: 최고/최악 궁합 카드 variant별 속성
 */

/** 테마 카드 스타일 타입 */
export type CardTheme = {
  rgb: string;           // 테마 RGB
  title: string;         // 타이틀 HEX 색상
  titleGlowRgb: string;  // 타이틀 글로우 RGB
  bgAlpha: number;       // 배경 투명도
  borderAlpha: number;
  shadowAlpha: number;
};

/** 🔥 싸움 패턴 카드 테마 (빨강 톤) */
export const FIGHT_THEME: CardTheme = {
  rgb: "239,68,68",
  title: "#fb7185",
  titleGlowRgb: "251,113,133",
  bgAlpha: 0.08,
  borderAlpha: 0.2,
  shadowAlpha: 0.06,
};

/** 🔧 해결 핵심 카드 테마 (보라 톤) */
export const SOLUTION_THEME: CardTheme = {
  rgb: "168,85,247",
  title: "#c084fc",
  titleGlowRgb: "192,132,252",
  bgAlpha: 0.08,
  borderAlpha: 0.2,
  shadowAlpha: 0.06,
};

/** 최고/최악 궁합 카드 variant별 고정 속성 */
export const VARIANT_CONFIG = {
  best: { title: "최고의 궁합", color: "#f0a030", rgb: "240,160,48", hue: 36 },
  worst: { title: "최악의 궁합", color: "#e04070", rgb: "224,64,112", hue: 340 },
} as const;
