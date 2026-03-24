/**
 * ModalOverlay — 공통 모달 백드롭 + 중앙 카드 래퍼
 *
 * MbtiSelectModal, CompatDetailModal, GroupGrid 팝업에서 공유.
 * 백드롭 클릭 시 닫기, z-index 통일, 터치 이벤트 관리.
 */
"use client";

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  /** 백드롭 블러 여부 (기본: false) */
  blur?: boolean;
  /** 중앙 정렬 모드: "flex" (기본, 큰 모달) 또는 "transform" (작은 팝업) */
  align?: "flex" | "transform";
  /** transform 모드 시 카드 너비 클래스 (기본: "w-[300px]") */
  widthClass?: string;
};

export default function ModalOverlay({
  children,
  onClose,
  blur = false,
  align = "flex",
  widthClass = "w-[300px]",
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
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${widthClass} z-50`}
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
        {children}
      </div>
    </>
  );
}
