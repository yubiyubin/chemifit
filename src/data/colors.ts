/**
 * 그래프 색상 유틸리티
 *
 * MbtiGraph와 GroupGrid에서 공유하는 색상 계산 함수.
 * 사이트 테마(보라~핑크)와 조화되도록 hue를 260°~340° 범위로 제한한다.
 */

/**
 * MBTI 문자열을 간단한 해시로 변환하여 색상 오프셋(hue shift)을 생성한다.
 * 같은 타입이면 항상 동일한 오프셋을 반환하므로 색상 일관성이 보장된다.
 * @param mbti - MBTI 타입 문자열 (예: "INTJ")
 * @returns -15 ~ +14 범위의 hue 오프셋 값
 */
function mbtiHash(mbti: string): number {
  let h = 0;
  for (let i = 0; i < mbti.length; i++) h = (h * 31 + mbti.charCodeAt(i)) | 0;
  return (h % 30) - 15;
}

/**
 * 궁합 점수와 MBTI 문자열을 기반으로 HSL 색상 문자열을 생성한다.
 * 테마(보라/핑크 계열)와 조화되면서도 구간별 차이가 뚜렷하도록 설계:
 * - 높은 점수(100): 밝은 로즈핑크(350°, 높은 채도·밝기)
 * - 중간 점수(50):  보라/마젠타(285°)
 * - 낮은 점수(0):   어두운 인디고(220°, 낮은 채도·밝기)
 * @param s - 궁합 점수 (0~100, 범위 밖은 클램프됨)
 * @param mbti - (선택) MBTI 문자열. 제공 시 해시 기반 hue 오프셋 적용
 * @returns HSL 색상 문자열 (예: "hsl(300,75%,55%)")
 */
export function getGraphColor(s: number, mbti?: string): string {
  s = Math.max(0, Math.min(100, s));
  const offset = mbti ? mbtiHash(mbti) * 0.4 : 0;
  const hue = 220 + (s / 100) * 130 + offset; // 220°(인디고) → 350°(로즈)
  const sat = 55 + (s / 100) * 30;             // 55% → 85%
  const lit = 42 + (s / 100) * 20;             // 42% → 62%
  return `hsl(${hue},${sat}%,${lit}%)`;
}

/**
 * HSL 색상 문자열을 "R,G,B" 형식의 RGB 문자열로 변환한다.
 * Canvas 2D API에서 rgba() 조합 시 사용된다.
 * @param h - HSL 색상 문자열 (예: "hsl(300,75%,55%)")
 * @returns "R,G,B" 형식 문자열 (예: "200,100,255"), 파싱 실패 시 기본값 반환
 */
export function hslToRgb(h: string): string {
  const m = h.match(/hsl\(([^,]+),([^,]+)%,([^)]+)%\)/);
  if (!m) return "200,100,255";
  const H = parseFloat(m[1]) / 360,
    S = parseFloat(m[2]) / 100,
    L = parseFloat(m[3]) / 100;
  let r: number, g: number, b: number;
  if (S === 0) {
    r = g = b = L;
  } else {
    const q = L < 0.5 ? L * (1 + S) : L + S - L * S,
      p = 2 * L - q;
    const f = (p: number, q: number, t: number) => {
      t = ((t % 1) + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 0.5) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = f(p, q, H + 1 / 3);
    g = f(p, q, H);
    b = f(p, q, H - 1 / 3);
  }
  return `${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)}`;
}
