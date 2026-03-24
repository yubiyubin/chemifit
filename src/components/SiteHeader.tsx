/**
 * SiteHeader — 사이트 공통 헤더
 *
 * 로고, 타이틀, MBTI 재선택 버튼을 포함.
 * (tabs)/layout.tsx에서 사용.
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import type { MbtiType } from "@/data/compatibility";
import { SITE } from "@/data/ui-text";
import { SYMBOLS } from "@/data/symbols";

type Props = {
  selectedMbti: MbtiType | null;
  onOpenModal: () => void;
};

export default function SiteHeader({ selectedMbti, onOpenModal }: Props) {
  return (
    <>
      <header className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex flex-col md:flex-row items-start md:items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/chemifit.svg"
              alt="Chemifit 로고"
              width={150}
              height={50}
              priority
            />
            <h1
              className="text-xl md:text-2xl pl-2 pt-0 md:pt-3 md:pl-0 font-bold tracking-tight"
              style={{
                color: "#ffffffce",
                textShadow:
                  "0 0 8px rgba(168,85,247,0.4), 0 0 20px rgba(168,85,247,0.15)",
              }}
            >
              {SITE.title}
            </h1>
          </Link>
        </div>
        {selectedMbti && (
          <button
            onClick={onOpenModal}
            className="group flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-2xl transition-all duration-300 hover:-translate-y-1 mt-1 shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(139,92,246,0.15) 100%)",
              border: "1px solid rgba(168,85,247,0.4)",
              boxShadow: "0 4px 20px rgba(168,85,247,0.2)",
            }}
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] sm:text-xs font-bold text-purple-300/80 mb-0.5">
                {SITE.myMbtiLabel}
              </span>
              <span className="text-base sm:text-lg font-black text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] leading-none">
                {selectedMbti}
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors group-hover:bg-purple-500/30"
              style={{ background: "rgba(168,85,247,0.2)" }}
            >
              <span className="text-xs font-bold text-purple-200">
                {SITE.reselectButton}
              </span>
              <span className="text-[10px] text-purple-200 group-hover:translate-x-0.5 transition-transform">
                {SYMBOLS.arrowRight}
              </span>
            </div>
          </button>
        )}
      </header>
      <p className="text-white/50 text-sm md:text-base pl-2  pb-8">
        {SITE.subtitle}
      </p>
    </>
  );
}
