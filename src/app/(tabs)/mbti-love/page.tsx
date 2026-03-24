/**
 * 연인 궁합 탭 (/mbti-love)
 *
 * 내 MBTI(전역 Context)와 상대 MBTI(URL 쿼리 partner)를 조합하여
 * CoupleResult 컴포넌트에 전달.
 *
 * useSearchParams로 URL 쿼리 변화를 실시간 감지하므로,
 * 궁합맵에서 "이 MBTI랑 연애하면?"을 반복 클릭해도 항상 최신 partner가 반영된다.
 */
"use client";

import { Suspense, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMbti } from "@/context/MbtiContext";
import CoupleResult from "@/features/mbti-love/components/CoupleResult";
import { MBTI_TYPES, type MbtiType } from "@/data/compatibility";

/** useSearchParams는 Suspense boundary 필수 — 외부 래퍼에서 감싸준다 */
export default function MbtiLovePage() {
  return (
    <Suspense>
      <MbtiLoveContent />
    </Suspense>
  );
}

function MbtiLoveContent() {
  const { selectedMbti } = useMbti();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /** URL 쿼리에서 partner 값을 읽어 유효한 MBTI면 반환, 아니면 null */
  const rawPartner = searchParams.get("partner") as MbtiType | null;
  const partnerMbti =
    rawPartner && MBTI_TYPES.includes(rawPartner) ? rawPartner : null;

  const handlePartnerSelect = useCallback((mbti: MbtiType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("partner", mbti);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  if (!selectedMbti) return null;

  return (
    <CoupleResult
      myMbti={selectedMbti}
      partnerMbti={partnerMbti}
      onPartnerSelect={handlePartnerSelect}
    />
  );
}
