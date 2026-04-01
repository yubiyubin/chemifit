/**
 * 탭 네비게이션 바
 *
 * 3개 탭(연인 궁합, 궁합 맵, 그룹 궁합) 사이를 전환하는 네비게이션.
 * Next.js Link 기반 클라이언트 사이드 라우팅 사용.
 * usePathname()으로 현재 URL을 감지하여 활성 탭 하이라이트.
 *
 * 활성 탭: 보라색 배경 + 글로우 + 흰색 텍스트
 * 비활성 탭: 투명 배경 + 반투명 텍스트
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useMbti } from "@/context/MbtiContext";

type Tab = {
  id: string;    // URL 경로와 동일 (ex: "mbti-love")
  label: string; // 표시 텍스트 (ex: "연인 궁합")
  emoji: string; // 탭 아이콘 (ex: "💕")
};

type Props = {
  tabs: Tab[];
  /** 현재 활성 탭의 네온 RGB */
  activeNeon: string;
};

export default function TabSwitcher({ tabs, activeNeon }: Props) {
  const pathname = usePathname();
  const { selectedMbti } = useMbti();
  // useSyncExternalStore: 서버에서는 false, 클라이언트에서는 true → Hydration Mismatch 방지
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div
      className="flex gap-1 sm:gap-2 p-1 rounded-2xl bg-white/5"
      style={{
        border: `1px solid rgba(${activeNeon},0.15)`,
        transition: "border-color 0.5s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === `/${tab.id}` || pathname.startsWith(`/${tab.id}/`);

        let href = `/${tab.id}`;
        let search = "";
        
        // Hydration Mismatch 방지: 서버 및 첫 클라이언트 렌더링 시에는 window.location.search 접근 우회
        if (mounted) {
          const params = new URLSearchParams(window.location.search);
          if (selectedMbti) params.set("mbti", selectedMbti);
          search = params.toString();
        } else if (selectedMbti) {
          search = `mbti=${selectedMbti}`;
        }
        
        if (search) href += `?${search}`;

        return (
          <Link
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            href={href}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold no-underline whitespace-nowrap ${
              isActive ? "neon-btn-active" : "neon-btn"
            }`}
            style={{
              "--neon": activeNeon,
              textShadow: isActive ? `0 0 8px rgba(${activeNeon},0.6)` : "none",
              transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
            } as React.CSSProperties}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
