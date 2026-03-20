/**
 * MBTI 전역 상태 관리 (React Context)
 *
 * 3개 탭 전체에서 공유하는 상태:
 * - selectedMbti: 사용자가 선택한 MBTI (null이면 아직 미선택)
 * - showModal: MBTI 선택 모달 표시 여부 (초기값 true)
 *
 * 흐름:
 * 1. 앱 진입 → showModal=true → MbtiSelectModal 표시
 * 2. MBTI 선택 → selectMbti() → selectedMbti 저장, showModal=false
 * 3. 이후 모든 탭에서 selectedMbti 사용 가능
 *
 * Provider: (tabs)/layout.tsx에서 감싸줌
 * Consumer: useMbti() 훅으로 접근
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { MBTI_TYPES, type MbtiType } from "@/data/compatibility";

/** Context에 담기는 값의 타입 */
type MbtiContextValue = {
  /** 사용자가 선택한 MBTI (미선택 시 null) */
  selectedMbti: MbtiType | null;
  /** MBTI 선택 모달 표시 여부 */
  showModal: boolean;
  /** MBTI 선택 시 호출 — selectedMbti 저장 + 모달 닫기 */
  selectMbti: (mbti: MbtiType) => void;
  /** 모달 다시 열기 (MBTI 재선택 시) */
  openModal: () => void;
};

const MbtiContext = createContext<MbtiContextValue | null>(null);

export function MbtiProvider({ children }: { children: ReactNode }) {
  const [selectedMbti, setSelectedMbti] = useState<MbtiType | null>(null);
  const [showModal, setShowModal] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // URL의 쿼리 파라미터에서 mbti 값을 읽어와 초기 상태로 설정
    const params = new URLSearchParams(window.location.search);
    const mbti = params.get("mbti") as MbtiType;
    if (mbti && MBTI_TYPES.includes(mbti)) {
      setTimeout(() => {
        setSelectedMbti(mbti);
        setShowModal(false);
      }, 0);
    }
  }, []);

  const selectMbti = useCallback((mbti: MbtiType) => {
    setSelectedMbti(mbti);
    setShowModal(false);

    // URL 쿼리 파라미터 업데이트 (새로고침 없이)
    const params = new URLSearchParams(window.location.search);
    params.set("mbti", mbti);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <MbtiContext.Provider
      value={{ selectedMbti, showModal, selectMbti, openModal }}
    >
      {children}
    </MbtiContext.Provider>
  );
}

export function useMbti() {
  const ctx = useContext(MbtiContext);
  if (!ctx) throw new Error("useMbti must be used within MbtiProvider");
  return ctx;
}
