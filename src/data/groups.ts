/**
 * MBTI 4대 그룹 분류
 *
 * MBTI 선택 모달, 연인 궁합 상대 선택 등에서
 * 16개 타입을 4그룹(분석/외교/관리/탐험)으로 묶어 표시할 때 사용.
 */
import type { MbtiType } from "./compatibility";

export const MBTI_GROUPS: { label: string; types: MbtiType[] }[] = [
  { label: "분석형", types: ["INTJ", "INTP", "ENTJ", "ENTP"] },
  { label: "외교형", types: ["INFJ", "INFP", "ENFJ", "ENFP"] },
  { label: "관리형", types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] },
  { label: "탐험형", types: ["ISTP", "ISFP", "ESTP", "ESFP"] },
];
