/**
 * DropdownPicker — 통일된 드롭다운 선택 컴포넌트
 *
 * 이모지 아바타 선택, MBTI 타입 선택 등에서 같은 형식으로 재사용.
 * 트리거 버튼 클릭 → 드롭다운 그리드 표시 → 항목 선택 → 닫기.
 */
"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

type Props<T extends string> = {
  /** 현재 선택된 값 */
  value: T;
  /** 선택 가능한 옵션 배열 */
  options: T[];
  /** 값 변경 콜백 */
  onChange: (value: T) => void;
  /** 드롭다운 그리드 열 수 (기본: 4) */
  columns?: number;
  /** 트리거 버튼에 표시할 내용 (기본: value 텍스트) */
  renderValue?: (v: T) => ReactNode;
  /** 드롭다운 각 항목에 표시할 내용 (기본: option 텍스트) */
  renderOption?: (v: T, selected: boolean) => ReactNode;
  /** 트리거 버튼 추가 className */
  className?: string;
};

export default function DropdownPicker<T extends string>({
  value,
  options,
  onChange,
  columns = 4,
  renderValue,
  renderOption,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className={`neon-btn h-12 rounded-xl flex items-center justify-center gap-1 ${className ?? "w-12 text-2xl"}`}
        style={{ "--neon": "168,85,247" } as React.CSSProperties}
      >
        {renderValue ? renderValue(value) : value}
        <span className="text-[10px] text-white/40">▼</span>
      </button>

      {/* 드롭다운 */}
      {open && (
        <div
          className="absolute top-14 left-0 z-30 p-3 pr-4 rounded-xl bg-gray-900 border border-white/20"
          style={{
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "0.5rem",
            minWidth: columns === 1 ? "auto" : columns <= 4 ? "200px" : "280px",
            ...(columns === 1 && { maxHeight: "280px", overflowY: "auto" as const }),
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`neon-btn rounded-lg flex items-center justify-center font-bold ${
                opt === value ? "neon-btn-active" : ""
              }`}
              style={{
                "--neon": "168,85,247",
                height: "2.75rem",
              } as React.CSSProperties}
            >
              {renderOption ? renderOption(opt, opt === value) : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
