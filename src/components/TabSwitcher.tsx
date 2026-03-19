"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  id: string;
  label: string;
  emoji: string;
};

type Props = {
  tabs: Tab[];
};

export default function TabSwitcher({ tabs }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 sm:gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
      {tabs.map((tab) => {
        const isActive = pathname === `/${tab.id}`;
        return (
          <Link
            key={tab.id}
            href={`/${tab.id}`}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 no-underline whitespace-nowrap"
            style={{
              backgroundColor: isActive ? "rgba(168,85,247,0.22)" : "rgba(168,85,247,0.05)",
              color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
              borderWidth: isActive ? 1.5 : 0.5,
              borderStyle: "solid",
              borderColor: isActive ? "rgba(168,85,247,0.6)" : "rgba(168,85,247,0.15)",
              boxShadow: isActive ? "0 0 16px rgba(168,85,247,0.3)" : "none",
              textShadow: isActive ? "0 0 8px rgba(168,85,247,0.6)" : "none",
            }}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
