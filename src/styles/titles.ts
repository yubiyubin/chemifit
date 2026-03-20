/**
 * 타이틀 텍스트 스타일 변수 (색상 제외)
 *
 * TITLE1: 메인 문구 둘째줄 — 큰 임팩트 텍스트
 * TITLE2: 메인 문구 첫째줄 — 작은 서브 텍스트
 * TITLE3: 싸움 패턴 / 해결 핵심 카드 타이틀
 */

/** 공통 타이틀 스타일 타입 */
export type TitleStyle = {
  size: string;
  weight: string;
  glowNear: number;
  glowFar: number;
  glowNearOp: number;
  glowFarOp: number;
};

/** 메인 문구 둘째줄 — 큰 임팩트 텍스트 */
export const TITLE1: TitleStyle = {
  size: "text-2xl sm:text-3xl",
  weight: "font-black",
  glowNear: 14,
  glowFar: 40,
  glowNearOp: 0.55,
  glowFarOp: 0.2,
};

/** 메인 문구 첫째줄 — 작은 서브 텍스트 */
export const TITLE2: TitleStyle = {
  size: "text-base sm:text-lg",
  weight: "font-bold",
  glowNear: 10,
  glowFar: 0,
  glowNearOp: 0.35,
  glowFarOp: 0,
};

/** 싸움 패턴 / 해결 핵심 카드 타이틀 */
export const TITLE3: TitleStyle = {
  size: "text-base",
  weight: "font-black",
  glowNear: 10,
  glowFar: 25,
  glowNearOp: 0.4,
  glowFarOp: 0.15,
};

/** TITLE3보다 작고 글로우가 약한 보조 타이틀 */
export const TITLE4: TitleStyle = {
  size: "text-sm",
  weight: "font-bold",
  glowNear: 8,
  glowFar: 18,
  glowNearOp: 0.25,
  glowFarOp: 0.08,
};

/**
 * TitleStyle + 색상 정보를 받아 JSX에 스프레드할 수 있는 props 객체를 반환한다.
 *
 * @param title   - TitleStyle 객체 (TITLE1 / TITLE2 / TITLE3)
 * @param color   - 텍스트 색상 (HEX 또는 rgba 등)
 * @param glowRgb - 글로우에 사용할 RGB 문자열 (예: "236,72,153")
 * @param extra   - 추가 className (예: "pt-1 text-center")
 *
 * @example
 * <p {...titleProps(TITLE3, "#f472b6", "244,114,182")}>제목</p>
 * <p {...titleProps(TITLE1, "#fff", "236,72,153", "text-center z-10")}>큰 제목</p>
 */
export function titleProps(
  title: TitleStyle,
  color: string,
  glowRgb: string,
  extra?: string,
) {
  const glow = [
    title.glowNear > 0 && `0 0 ${title.glowNear}px rgba(${glowRgb},${title.glowNearOp})`,
    title.glowFar > 0 && `0 0 ${title.glowFar}px rgba(${glowRgb},${title.glowFarOp})`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    className: `${title.size} ${title.weight}${extra ? ` ${extra}` : ""}`,
    style: {
      color,
      ...(glow && { textShadow: glow }),
    } as React.CSSProperties,
  };
}
