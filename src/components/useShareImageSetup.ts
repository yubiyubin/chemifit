/**
 * useShareImageSetup — 공유 이미지 공통 초기화 훅
 *
 * 4개 ShareImage 컴포넌트에서 동일하게 반복되던 두 가지 side-effect를 통합:
 * 1. Google Fonts <link> 태그 동적 삽입 (html-to-image 캡처 전 폰트 보장)
 * 2. 1080×1350 카드를 뷰포트 크기에 맞게 scale-to-fit
 *
 * @returns wrapRef — 카드 래퍼 div에 attach할 RefObject
 */
import { useEffect, useRef } from "react";
import type React from "react";

export function useShareImageSetup(): React.RefObject<HTMLDivElement | null> {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Google Fonts를 <link> 태그로 동적 삽입
  // 동일 ID의 link가 이미 존재하면 중복 삽입하지 않는다.
  useEffect(() => {
    const FONT_ID = "chemifit-share-fonts";
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement("link");
      link.id = FONT_ID;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // 1080×1350 카드를 뷰포트에 맞게 축소 (scale-to-fit)
  // resize 이벤트에서 cleanup으로 리스너를 제거해 메모리 누수를 방지한다.
  useEffect(() => {
    function fit(): void {
      if (!wrapRef.current) return;
      const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1350, 1);
      wrapRef.current.style.transform = `scale(${s})`;
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return wrapRef;
}
