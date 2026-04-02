/**
 * MBTI 4대 그룹 분류
 *
 * MBTI 선택 모달, 랜딩 페이지, 연인 궁합 상대 선택 등에서
 * 16개 타입을 4그룹(분석/외교/관리/탐험)으로 묶어 표시할 때 사용.
 */
import type { MbtiType } from "./compatibility";
import { PURPLE_RGB, PINK_RGB, CYAN_RGB, MINT_RGB } from "@/styles/card-themes";

export type MbtiGroup = {
  /** 그룹 약어 (NT, NF, SJ, SP) */
  key: string;
  /** 한글 라벨 */
  label: string;
  /** 네온 RGB */
  rgb: string;
  /** 소속 MBTI 타입 */
  types: MbtiType[];
};

export const MBTI_GROUPS: MbtiGroup[] = [
  { key: "NT", label: "분석형", rgb: PURPLE_RGB, types: ["INTJ", "INTP", "ENTJ", "ENTP"] },
  { key: "NF", label: "외교형", rgb: PINK_RGB, types: ["INFJ", "INFP", "ENFJ", "ENFP"] },
  { key: "SJ", label: "관리형", rgb: CYAN_RGB, types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] },
  { key: "SP", label: "탐험형", rgb: MINT_RGB, types: ["ISTP", "ISFP", "ESTP", "ESFP"] },
];
