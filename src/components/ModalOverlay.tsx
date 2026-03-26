/**
 * ModalOverlay — 공통 모달 백드롭 + 중앙 카드 래퍼
 *
 * MbtiSelectModal, CompatDetailModal, GroupGrid 팝업에서 공유.
 * 백드롭 클릭 시 닫기, z-index 통일, 터치 이벤트 관리.
 *
 * rgb prop을 전달하면 NeonCard 공식과 동일한 border/glow가 카드 래퍼에 적용됨.
 */
"use client";

import React from "react";

/** NeonCard 공식과 동일한 border + boxShadow 계산 */
function neonBorderStyle(rgb: string, borderAlpha = 0.53): React.CSSProperties {
  const ringAlpha = Math.round(borderAlpha * 0.28 * 100) / 100;
  const nearAlpha = Math.round(borderAlpha * 0.75 * 100) / 100;
  const farAlpha = Math.round(borderAlpha * 0.28 * 100) / 100;
  return {
    border: `1.5px solid rgba(${rgb},${borderAlpha})`,
    boxShadow: `0 0 0 1px rgba(${rgb},${ringAlpha}), 0 0 18px rgba(${rgb},${nearAlpha}), 0 0 50px rgba(${rgb},${farAlpha})`,
  };
}

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  /** 백드롭 블러 여부 (기본: false) */
  blur?: boolean;
  /** 중앙 정렬 모드: "flex" (기본, 큰 모달) 또는 "transform" (작은 팝업) */
  align?: "flex" | "transform";
  /** transform 모드 시 카드 너비 클래스 (기본: "w-[300px]") */
  widthClass?: string;
  /** flex 모드 + rgb 사용 시 카드 래퍼 너비 클래스 (기본: "w-full max-w-md") */
  cardClassName?: string;
  /** NeonCard 스타일 border/glow를 카드 래퍼에 적용할 rgb ("R,G,B") */
  rgb?: string;
  /** 테두리 투명도 (기본: 0.53) — rgb 없으면 무시 */
  borderAlpha?: number;
};

export default function ModalOverlay({
  children,
  onClose,
  blur = false,
  align = "flex",
  widthClass = "w-[300px]",
  rgb,
  borderAlpha,
  cardClassName = "w-full max-w-md",
}: Props) {
  if (align === "transform") {
    return (
      <>
        <div
          className={`fixed inset-0 z-50 ${onClose ? "cursor-pointer" : ""}`}
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
        <div
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${widthClass} z-50${rgb ? " rounded-2xl overflow-hidden" : ""}`}
          style={rgb ? neonBorderStyle(rgb, borderAlpha) : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 ${blur ? "backdrop-blur-sm" : ""} ${onClose ? "cursor-pointer" : ""}`}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        {rgb ? (
          <div
            className={`rounded-2xl overflow-hidden pointer-events-auto ${cardClassName}`}
            style={neonBorderStyle(rgb, borderAlpha)}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
