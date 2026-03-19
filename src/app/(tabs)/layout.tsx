"use client";

import TabSwitcher from "@/components/TabSwitcher";
import MbtiSelectModal from "@/components/MbtiSelectModal";
import { MbtiProvider, useMbti } from "@/context/MbtiContext";

const TABS = [
  { id: "mbti-love", label: "연인 궁합", emoji: "💕" },
  { id: "mbti-map", label: "궁합 맵", emoji: "🌐" },
  { id: "group-match", label: "그룹 궁합", emoji: "👥" },
];

function TabsLayoutInner({ children }: { children: React.ReactNode }) {
  const { showModal, selectMbti } = useMbti();

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white">
      {showModal && <MbtiSelectModal onSelect={selectMbti} />}
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              color: "#ffffffce",
              textShadow:
                "0 0 8px rgba(168,85,247,0.4), 0 0 20px rgba(168,85,247,0.15)",
            }}
          >
            MBTI 궁합 맵
          </h1>
          <p className="text-white/50 text-sm">
            재미로 보는 궁합이에요 😊 과학적 근거는 없어요
          </p>
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
