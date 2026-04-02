/**
 * Google Analytics gtag() 전역 함수 타입 선언
 */

interface Window {
  gtag?: (
    command: "config" | "event" | "js" | "set",
    targetIdOrAction: string | Date,
    params?: Record<string, string | number | boolean>,
  ) => void;
}
