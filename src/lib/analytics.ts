/**
 * GA4 커스텀 이벤트 트래킹 유틸리티
 *
 * gtag()가 로드되어 있을 때만 이벤트를 전송한다.
 * 서버 사이드에서는 아무 동작도 하지 않는다.
 */

type EventParams = Record<string, string | number | boolean>;

/**
 * GA4 커스텀 이벤트를 전송한다.
 *
 * @param action - 이벤트 이름 (예: "mbti_select", "couple_result_view")
 * @param params - 이벤트 파라미터 (예: { type: "INTJ", score: 85 })
 */
export function trackEvent(action: string, params?: EventParams) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
}
