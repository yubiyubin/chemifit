/**
 * CloseButton — 모달 우측 상단 ✕ 닫기 버튼
 *
 * CompatDetailModal, GroupGrid 팝업, MbtiSelectModal 등에서 공유.
 */
"use client";

import { SYMBOLS } from "@/data/symbols";

type Props = {
  onClick: () => void;
  className?: string;
};

export default function CloseButton({ onClick, className }: Props) {
  return (
    <button
      onClick={onClick}
      className={`neon-ghost absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs ${className ?? ""}`}
    >
      {SYMBOLS.close}
    </button>
  );
}
