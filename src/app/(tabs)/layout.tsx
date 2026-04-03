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

import { usePathname } from "next/navigation";
import TabSwitcher from "@/components/TabSwitcher";
import MbtiSelectModal from "@/components/MbtiSelectModal";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { MbtiProvider, useMbti } from "@/context/MbtiContext";
import { TABS, DEFAULT_TAB_NEON } from "@/data/tabs";

/** Context를 소비하는 내부 레이아웃 (Provider 안에서만 사용 가능) */
function TabsLayoutInner({ children }: { children: React.ReactNode }) {
  const { showModal, selectMbti, openModal, closeModal, selectedMbti } =
    useMbti();
  const pathname = usePathname();
  const activeNeon =
    TABS.find(
      (t) => pathname === `/${t.id}` || pathname.startsWith(`/${t.id}/`)
    )?.neonRgb ?? DEFAULT_TAB_NEON;

  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white">
      {showModal && (
        <MbtiSelectModal
          onSelect={selectMbti}
          onClose={selectedMbti ? closeModal : undefined}
        />
      )}
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap">
        <SiteHeader selectedMbti={selectedMbti} onOpenModal={openModal} neonRgb={activeNeon} />
        <nav aria-label="메인 탭" className="mt-10 mb-3">
          <TabSwitcher tabs={TABS} activeNeon={activeNeon} />
        </nav>
        <section aria-label="페이지 콘텐츠">{children}</section>
      </div>
      <SiteFooter />
    </main>
  );
}

/** 공유 URL로 접근한 정적 결과 페이지: MBTI 선택 모달 없이 바로 콘텐츠 표시 */
function useIsStaticResultPage() {
  const pathname = usePathname();
  return (
    /^\/mbti-love\/[a-z]+\/[a-z]+/.test(pathname) ||
    /^\/mbti-profiles\/[a-z]+/.test(pathname)
  );
}

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isStaticResultPage = useIsStaticResultPage();
  return (
    <MbtiProvider initialShowModal={!isStaticResultPage}>
      <TabsLayoutInner>{children}</TabsLayoutInner>
    </MbtiProvider>
  );
}
