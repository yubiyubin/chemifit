/**
 * UI 제어 기호 상수
 *
 * 컴포넌트 전반에서 사용하는 닫기·화살표·드롭다운 등의 기호.
 * 나중에 아이콘 폰트나 SVG로 교체 시 이 파일만 수정하면 됨.
 */

export const SYMBOLS = {
  /** 닫기 버튼 (CloseButton, MbtiSelectModal) */
  close: "✕",
  /** 오른쪽 화살표 (SiteHeader 재선택 버튼) */
  arrowRight: "❯",
  /** 드롭다운 표시 (MemberInput, CoupleResult 아코디언) */
  dropdown: "▼",
} as const;
