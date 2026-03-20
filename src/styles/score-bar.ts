/**
 * ScoreBar 네온 게이지 바 스타일 변수
 *
 * 조정 시 이 파일만 수정하면 모든 ScoreBar에 반영된다.
 */

// ── 텍스트 ──
export const TEXT_SAT = 70;          // 채도
export const TEXT_LIT = 58;          // 밝기
export const TEXT_GLOW_SAT = 75;
export const TEXT_GLOW_LIT = 45;
export const TEXT_GLOW_OP = 0.7;     // 글로우 불투명도
export const TEXT_GLOW_R = 12;       // 글로우 반경(px)

// ── 바 그라데이션 ──
export const BAR_SAT_L = 68;         // 왼쪽(어두운 끝) 채도
export const BAR_LIT_L = 32;         // 왼쪽 밝기
export const BAR_SAT_R = 75;         // 오른쪽(밝은 끝) 채도
export const BAR_LIT_R = 43;         // 오른쪽 밝기

// ── 바 글로우 (3단계: 근거리 / 중거리 / 원거리) ──
export const GLOW_1 = { r: 10, sat: 75, lit: 40, op: 0.85 };
export const GLOW_2 = { r: 24, sat: 70, lit: 36, op: 0.45 };
export const GLOW_3 = { r: 44, sat: 65, lit: 32, op: 0.18 };

// ── 트랙 inset 글로우 ──
export const TRACK_SAT = 50;
export const TRACK_LIT = 40;
export const TRACK_OP = 0.4;
