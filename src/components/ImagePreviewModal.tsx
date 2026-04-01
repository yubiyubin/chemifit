/**
 * ImagePreviewModal — 이미지 저장 전 미리보기 모달
 *
 * - open=true + imageDataUrl=null → 로딩 상태 (10s 프로그레스 바)
 * - open=true + imageDataUrl=string → 이미지 미리보기 + 저장 버튼
 * - open=false → 렌더링하지 않음
 */
"use client";

import ModalOverlay from "@/components/ModalOverlay";
import CloseButton from "@/components/CloseButton";
import { COMMON } from "@/data/ui-text";

type Props = {
  /** 모달 열림 여부. false면 렌더링하지 않음 */
  open: boolean;
  /** 미리보기할 이미지 data URL. null이면 로딩 상태로 표시 */
  imageDataUrl: string | null;
  /** 다운로드 파일명 */
  fileName: string;
  onClose: () => void;
};

export default function ImagePreviewModal({ open, imageDataUrl, fileName, onClose }: Props) {
  if (!open) return null;

  function handleSave() {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = imageDataUrl!;
    link.click();
  }

  return (
    <ModalOverlay
      onClose={onClose}
      blur
      rgb="168,85,247"
      cardClassName="w-full max-w-sm sm:max-w-md"
    >
      <div className="relative flex flex-col gap-4 p-5 bg-[#0f0f1a] rounded-2xl">
        <CloseButton onClick={onClose} />
        <p className="text-sm font-bold text-white/70 text-center pr-6">
          {imageDataUrl ? COMMON.previewTitle : COMMON.loadingText}
        </p>

        {imageDataUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL은 next/image 미지원 */}
            <img
              src={imageDataUrl}
              alt="미리보기"
              className="w-full rounded-xl object-contain"
              style={{ maxHeight: "60vh" }}
            />
            <button
              data-testid="preview-save-btn"
              onClick={handleSave}
              className="neon-ghost w-full py-2.5 rounded-xl text-sm font-bold"
              style={{ "--neon": "168,85,247" } as React.CSSProperties}
            >
              {COMMON.saveBtn}
            </button>
          </>
        ) : (
          /* 로딩 프로그레스 바: 10초 동안 0% → 100% CSS transition */
          <div className="flex flex-col gap-3 py-4">
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: "6px", background: "rgba(168,85,247,0.15)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: "100%",
                  background: "linear-gradient(90deg,rgba(168,85,247,0.8),rgba(236,72,153,0.8))",
                  boxShadow: "0 0 10px rgba(168,85,247,0.4)",
                  transform: "translateX(-100%)",
                  animation: "loading-progress 8s linear forwards",
                }}
              />
            </div>
            <style>{`
              @keyframes loading-progress {
                from { transform: translateX(-100%); }
                to   { transform: translateX(0%); }
              }
            `}</style>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
