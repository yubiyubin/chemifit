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
import { useMbti } from "@/context/MbtiContext";

type Tab = {
  id: string;    // URL 경로와 동일 (ex: "mbti-love")
  label: string; // 표시 텍스트 (ex: "연인 궁합")
  emoji: string; // 탭 아이콘 (ex: "💕")
};

type Props = {
  tabs: Tab[];
};

export default function TabSwitcher({ tabs }: Props) {
  const pathname = usePathname();
  const { selectedMbti } = useMbti();

  return (
    <div className="flex gap-1 sm:gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
      {tabs.map((tab) => {
        const isActive = pathname === `/${tab.id}`;
        
        let href = `/${tab.id}`;
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          if (selectedMbti) params.set("mbti", selectedMbti);
          const search = params.toString();
          if (search) href += `?${search}`;
        } else if (selectedMbti) {
          href += `?mbti=${selectedMbti}`;
        }

        return (
          <Link
            key={tab.id}
            href={href}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold no-underline whitespace-nowrap ${
              isActive ? "neon-btn-active" : "neon-btn"
            }`}
            style={{
              "--neon": "168,85,247",
              textShadow: isActive ? "0 0 8px rgba(168,85,247,0.6)" : "none",
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
