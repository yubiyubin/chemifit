/**
 * SiteHeader — 사이트 공통 헤더
 *
 * 로고, 타이틀, MBTI 재선택 버튼을 포함.
 * (tabs)/layout.tsx에서 사용.
 */
"use client";

import Link from "next/link";
import type { MbtiType } from "@/data/compatibility";
import { SITE } from "@/data/ui-text";
import { SYMBOLS } from "@/data/symbols";

type Props = {
  selectedMbti: MbtiType | null;
  onOpenModal: () => void;
  /** 현재 탭의 네온 RGB (탭 테마 색상) */
  neonRgb: string;
};

export default function SiteHeader({ selectedMbti, onOpenModal, neonRgb }: Props) {
  return (
    <>
      <header className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex flex-col md:flex-row items-start md:items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {/* SVG는 next/image 최적화 불필요 — 네이티브 img로 항상 선명하게 렌더링 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chemifit.svg"
              alt="Chemifit 로고"
              style={{ height: "50px", width: "auto" }}
            />
          </Link>
        </div>
        {selectedMbti && (
          <button
            data-testid="reselect-btn"
            onClick={onOpenModal}
            className="group flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-2xl hover:-translate-y-1 shrink-0"
            style={{
              background: `linear-gradient(135deg, rgba(${neonRgb},0.15) 0%, rgba(${neonRgb},0.1) 100%)`,
              border: `1px solid rgba(${neonRgb},0.4)`,
              boxShadow: `0 4px 20px rgba(${neonRgb},0.2)`,
              transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div className="flex flex-col items-start">
              <span
                className="text-[10px] sm:text-xs font-bold mb-0.5"
                style={{ color: `rgba(${neonRgb},0.8)`, transition: "color 0.5s cubic-bezier(0.4,0,0.2,1)" }}
              >
                {SITE.myMbtiLabel}
              </span>
              <span
                className="text-base sm:text-lg font-black text-white leading-none"
                style={{ filter: `drop-shadow(0 0 8px rgba(${neonRgb},0.6))`, transition: "filter 0.5s cubic-bezier(0.4,0,0.2,1)" }}
              >
                {selectedMbti}
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
              style={{ background: `rgba(${neonRgb},0.2)`, transition: "background 0.5s cubic-bezier(0.4,0,0.2,1)" }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: `rgba(${neonRgb},0.85)`, transition: "color 0.5s cubic-bezier(0.4,0,0.2,1)" }}
              >
                {SITE.reselectButton}
              </span>
              <span
                className="text-[10px] group-hover:translate-x-0.5 transition-transform"
                style={{ color: `rgba(${neonRgb},0.85)`, transition: "color 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.2s" }}
              >
                {SYMBOLS.arrowRight}
              </span>
            </div>
          </button>
        )}
      </header>
    </>
  );
}
