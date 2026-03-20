/**
 * MBTI 선택 모달
 *
 * 앱 최초 진입 시 표시되는 전체화면 모달.
 * 4그룹(분석/외교/관리/탐험) × 4타입 = 16개 버튼 그리드.
 *
 * 터치 이슈 해결:
 * - 백드롭(어두운 배경): pointer-events-none → 터치 이벤트 통과
 * - 모달 카드: pointer-events-auto → 터치 이벤트 수신
 * - 컨테이너: overflow-y-auto → 작은 화면에서 스크롤 가능
 *
 * MBTI 선택 시 onSelect 콜백 호출 → MbtiContext.selectMbti()로 연결.
 */
"use client";

import type { MbtiType } from "@/data/compatibility";
import { MBTI_GROUPS } from "@/data/groups";

type Props = {
  onSelect: (mbti: MbtiType) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  emoji?: string;
  theme?: "purple" | "pink";
  inline?: boolean;
};

export default function MbtiSelectModal({
  onSelect,
  onClose,
  title = "내 MBTI는?",
  subtitle = "선택하면 바로 궁합을 볼 수 있어요",
  emoji = "🧬",
  theme = "purple",
  inline = false,
}: Props) {
  // Theme colors
  const isPink = theme === "pink";
  const mainColor = isPink ? "236,72,153" : "168,85,247"; // #ec4899 vs #a855f7
  
  const content = (
    <div
      className={`w-full max-w-md rounded-3xl p-8 flex flex-col gap-6 relative ${inline ? "mx-auto fade-in-up" : "pointer-events-auto"}`}
      style={{
        background: "#1a1a2e",
        border: `1px solid rgba(${mainColor},0.3)`,
        boxShadow: `0 0 60px rgba(${mainColor},0.18)`,
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="neon-ghost absolute top-4 right-5 text-xl border-0"
        >
          ✕
        </button>
      )}
      
      <div className="text-center flex flex-col gap-2 mt-2">
        <p className="text-3xl">{emoji}</p>
        <h2
          className="text-2xl font-black"
          style={{
            color: "#ffffffce",
            textShadow: `0 0 8px rgba(${mainColor},0.4)`,
          }}
        >
          {title}
        </h2>
        <p className="text-white/50 text-sm">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {MBTI_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1.5">
            <p className="text-[11px] text-white/40 font-medium pl-1">
              {group.label}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {group.types.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onSelect(type);
                    onClose?.();
                  }}
                  className="neon-btn py-2.5 rounded-xl text-sm font-bold hover:scale-105"
                  style={{ "--neon": mainColor } as React.CSSProperties}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${onClose ? "cursor-pointer" : ""}`}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        {content}
      </div>
    </>
  );
}
