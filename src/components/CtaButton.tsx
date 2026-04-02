/**
 * CtaButton — 탭 간 이동을 위한 공용 CTA 버튼
 *
 * neon-action CSS 클래스 기반. --neon 변수로 목적지 탭의 테마 색 주입.
 * subtitle 있으면 2줄(일반), 없으면 1줄(모달/팝업용).
 */
"use client";

import React from "react";
import { trackEvent } from "@/lib/analytics";

interface CtaButtonProps {
  /** 메인 텍스트 (항상 표시) */
  title: string;
  /** 서브 텍스트 — 있으면 2줄(일반), 없으면 1줄(모달용) */
  subtitle?: string;
  /** 네온 색상 ("R,G,B" 형식, 목적지 탭 테마 색) */
  rgb: string;
  onClick: () => void;
  /** 추가 Tailwind 클래스 (margin 등 override) */
  className?: string;
  "data-testid"?: string;
}

export default function CtaButton({
  title,
  subtitle,
  rgb,
  onClick,
  className = "",
  "data-testid": testId,
}: CtaButtonProps) {
  return (
    <button
      data-testid={testId}
      onClick={() => { trackEvent("cta_click", { title }); onClick(); }}
      className={`neon-action w-full rounded-xl text-center ${subtitle ? "py-4" : "py-2.5"} ${className}`}
      style={{ "--neon": rgb } as React.CSSProperties}
    >
      <p className="text-sm font-bold" style={{ color: `rgba(${rgb},0.85)` }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: `rgba(${rgb},0.55)` }}>
          {subtitle}
        </p>
      )}
    </button>
  );
}
