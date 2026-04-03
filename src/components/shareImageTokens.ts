/**
 * shareImageTokens — 공유 이미지 컴포넌트 공통 CSS 토큰
 *
 * 4개 ShareImage 컴포넌트(ProfileShareImage, MapShareImage,
 * GroupShareImage, shareImage)에서 공유하는 인라인 스타일 문자열 상수.
 * 각 컴포넌트 <style> 태그 내에서 템플릿 리터럴로 삽입한다.
 *
 * 토큰화 제외 항목:
 * - text-shadow: 테마 컬러별로 다름 (각 파일 유지)
 * - em gradient 색상: 파일마다 다름 (각 파일 유지)
 */

/** 헤더 로고 "CHEMIFIT" */
export const SI_LOGO = `font-size:32px;font-weight:800;color:rgba(255,255,255,0.25);letter-spacing:4px`;

/** 헤더 서브 레이블 (예: CHARACTER STAT SHEET) */
export const SI_SUB = `font-size:12px;color:rgba(255,255,255,0.2);letter-spacing:4px;margin-top:4px`;

/** Hero 섹션 상하 패딩 */
export const SI_HERO_PADDING = `padding:20px 0`;

/**
 * Hero 주 텍스트 기본 스타일 (text-shadow 제외)
 * text-shadow는 테마 컬러별로 다르므로 각 컴포넌트에서 직접 추가한다.
 */
export const SI_HERO_TYPE_BASE = `font-size:76px;font-weight:800;color:#fff;letter-spacing:8px;line-height:1`;

/**
 * Hero 서브텍스트 기본 스타일
 * 일부 컴포넌트에서 color가 동일(rgba(255,255,255,0.5))하므로 포함.
 */
export const SI_HERO_TITLE_BASE = `font-size:19px;font-weight:700;color:rgba(255,255,255,0.5);margin-top:12px`;

/** 파선 구분선 */
export const SI_SEP_D = `border-top:2px dashed rgba(255,255,255,0.08)`;

/** 이중선 구분선 */
export const SI_SEP_DB = `border-top:3px double rgba(255,255,255,0.1)`;

/** 카드 배경 (가장 바깥 카드 요소) */
export const SI_CARD_BG = `background:#08000e`;

/** 노이즈 텍스처 SVG data URL */
export const SI_NOISE_URL = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Receipt 오버레이 배경 */
export const SI_RECEIPT_BG = `background:linear-gradient(145deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)`;

/**
 * 바코드 막대 높이 배열 (20개)
 * 모든 ShareImage 컴포넌트 푸터에서 동일하게 사용.
 */
export const BARCODE_HEIGHTS: number[] = [
  28, 36, 20, 40, 24, 36, 16, 32, 40, 20,
  36, 28, 40, 16, 32, 24, 40, 20, 36, 28,
];
