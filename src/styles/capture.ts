/**
 * off-screen 이미지 캡처 컨테이너 공용 스타일
 *
 * html-to-image로 캡처할 ShareImage 컴포넌트를 화면 밖에 숨기는 스타일.
 * CoupleResult, MbtiGrid, GroupGrid, ProfileDetail 4곳에서 동일하게 사용.
 *
 * fixed + opacity:0 조합: scale 트랜스폼 없이 1080×1350 원본 크기로 캡처하기 위해 필요.
 * zIndex:-9999로 실제 UI 뒤에 완전히 숨긴다.
 */
import type React from "react";

export const OFFSCREEN_CAPTURE_STYLE: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: -9999,
  pointerEvents: "none",
  opacity: 0,
};
