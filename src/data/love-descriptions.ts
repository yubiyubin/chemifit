/**
 * 연인 궁합 상세 설명 — 타입 정의 + 4개 파일 합산
 *
 * 256개 조합 (16×16)의 연인 궁합 설명을 제공.
 * 데이터는 크기가 크므로 4개 파일(nt/nf/sj/sp)로 분할 저장.
 *
 * 사용처: CoupleResult.tsx에서 LOVE_DESC[myMbti][partnerMbti]로 접근.
 */
import type { MbtiType } from "./compatibility";

/** 연인 궁합 상세 설명 */
export type LoveDescription = {
  /** 밈 느낌 한 줄 — 공유용 카드 메인 텍스트 */
  preview: string;
  /** 🔥 싸움 패턴 한 줄 */
  fightStyle: string;
  /** 🔧 해결 핵심 한 줄 */
  solution: string;
  /** 아코디언 상세 (마크다운 형식) */
  detail: string;
};

// 각 파트 파일에서 가져와 합침
import { NT_LOVE_DESC } from "./love-desc/nt";
import { NF_LOVE_DESC } from "./love-desc/nf";
import { SJ_LOVE_DESC } from "./love-desc/sj";
import { SP_LOVE_DESC } from "./love-desc/sp";

export const LOVE_DESC = {
  ...NT_LOVE_DESC,
  ...NF_LOVE_DESC,
  ...SJ_LOVE_DESC,
  ...SP_LOVE_DESC,
} as Record<MbtiType, Record<MbtiType, LoveDescription>>;
