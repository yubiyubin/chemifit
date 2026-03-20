/**
 * 탭 공통 레이아웃 — (tabs) Route Group
 *
 * 역할:
 * - MbtiProvider로 전역 MBTI 상태를 3개 탭에 공유
 * - 최초 진입 시 MBTI 선택 모달 표시 (showModal=true → MbtiSelectModal 렌더)
 * - 페이지 헤더(타이틀), 탭 네비게이션(TabSwitcher), 푸터를 공통으로 표시
 *
 * 구조:
 * TabsLayout (MbtiProvider)
 *   └─ TabsLayoutInner (useMbti 소비)
 *        ├─ MbtiSelectModal (조건부)
 *        ├─ 헤더 "MBTI 궁합 맵"
 *        ├─ TabSwitcher (3개 탭)
 *        ├─ {children} (각 탭 페이지)
 *        └─ 푸터
 *
 * (tabs)는 Route Group이므로 URL 경로에 포함되지 않음.
 * ex) /mbti-love, /mbti-map, /group-match
 */
"use client";

import Link from "next/link";
import TabSwitcher from "@/components/TabSwitcher";
import MbtiSelectModal from "@/components/MbtiSelectModal";
import { MbtiProvider, useMbti } from "@/context/MbtiContext";

/** 탭 정의 — id는 URL 경로와 동일해야 함 */
const TABS = [
  { id: "mbti-love", label: "연인 궁합", emoji: "💕" },
  { id: "mbti-map", label: "궁합 맵", emoji: "🌐" },
  { id: "group-match", label: "그룹 궁합", emoji: "👥" },
];

/** Context를 소비하는 내부 레이아웃 (Provider 안에서만 사용 가능) */
function TabsLayoutInner({ children }: { children: React.ReactNode }) {
  const { showModal, selectMbti, openModal, selectedMbti } = useMbti();

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white">
      {showModal && <MbtiSelectModal onSelect={selectMbti} />}
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <Link href="/">
              <h1
                className="text-4xl font-black tracking-tight cursor-pointer hover:opacity-80 transition-opacity inline-block"
                style={{
                  color: "#ffffffce",
                  textShadow:
                    "0 0 8px rgba(168,85,247,0.4), 0 0 20px rgba(168,85,247,0.15)",
                }}
              >
                MBTI 궁합 맵
              </h1>
            </Link>
            <p className="text-white/50 text-sm">
              재미로 보는 궁합이에요 😊 과학적 근거는 없어요
            </p>
          </div>
          {selectedMbti && (
            <button
              onClick={openModal}
              className="group flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-2xl transition-all duration-300 hover:-translate-y-1 mt-1 shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(139,92,246,0.15) 100%)",
                border: "1px solid rgba(168,85,247,0.4)",
                boxShadow: "0 4px 20px rgba(168,85,247,0.2)",
              }}
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] sm:text-xs font-bold text-purple-300/80 mb-0.5">내 MBTI</span>
                <span className="text-base sm:text-lg font-black text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] leading-none">{selectedMbti}</span>
              </div>
              <div 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors group-hover:bg-purple-500/30"
                style={{ background: "rgba(168,85,247,0.2)" }}
              >
                <span className="text-xs font-bold text-purple-200">재선택</span>
                <span className="text-[10px] text-purple-200 group-hover:translate-x-0.5 transition-transform">❯</span>
              </div>
            </button>
          )}
        </div>

        <TabSwitcher tabs={TABS} />

        {children}
      </div>
      <footer className="text-center py-8 text-white/25 text-xs">
        © 2026 CYB Labs. All rights reserved.
      </footer>
    </main>
  );
}

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MbtiProvider>
      <TabsLayoutInner>{children}</TabsLayoutInner>
    </MbtiProvider>
  );
}
