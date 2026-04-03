/**
 * SharePanel — 통합 공유 + 이미지 저장 패널
 *
 * 카카오톡, 링크 복사, 이미지 저장 버튼을 균등 배치.
 * 사이트의 neon-btn 스타일 기반으로 통일된 디자인.
 */
"use client";

import { useState, useCallback } from "react";
import { shareKakao } from "@/lib/kakao";
import { trackEvent } from "@/lib/analytics";
import { SITE_URL } from "@/data/metadata";

type Props = {
  /** 공유 제목 */
  title: string;
  /** 공유 설명 */
  description: string;
  /** 공유 페이지 경로 (예: "/mbti-love/intj/enfp") */
  path: string;
  /** 네온 색상 RGB (버튼 테마) */
  rgb?: string;
  /** 콘텐츠 타입 (GA 이벤트용) */
  contentType?: string;
  /** 이미지 저장 핸들러 — 전달하면 이미지 저장 버튼 표시 */
  onSaveImage?: () => void;
};

export default function SharePanel({
  title,
  description,
  path,
  rgb = "236,72,153",
  contentType = "general",
  onSaveImage,
}: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${SITE_URL}${path}`;

  const handleKakao = useCallback(async () => {
    trackEvent("share_click", { platform: "kakao", content_type: contentType });
    try {
      await shareKakao({ title, description, pageUrl: path });
    } catch {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [title, description, path, contentType, fullUrl]);

  const handleCopy = useCallback(async () => {
    trackEvent("share_click", { platform: "copy", content_type: contentType });
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullUrl, contentType]);

  const btnClass = "neon-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold no-underline";

  return (
    <div
      className="rounded-2xl p-3"
      style={{
        background: `rgba(${rgb},0.04)`,
        border: `1px solid rgba(${rgb},0.12)`,
      }}
    >
      <div className="flex gap-2">
        {/* 이미지 저장 */}
        {onSaveImage && (
          <button
            data-testid="save-image-btn"
            onClick={onSaveImage}
            className={btnClass}
            style={{ "--neon": rgb } as React.CSSProperties}
            aria-label="이미지 저장"
          >
            <span>📸</span>
            <span>이미지 저장</span>
          </button>
        )}

        {/* 카카오톡 */}
        <button
          onClick={handleKakao}
          className={btnClass}
          style={{ "--neon": rgb } as React.CSSProperties}
          aria-label="카카오톡으로 공유"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#FEE500">
            <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.53-.96 3.4-.99 3.62 0 0-.02.17.09.23.11.07.24.02.24.02.32-.04 3.7-2.42 4.28-2.83.56.08 1.14.12 1.72.12 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"/>
          </svg>
          <span>카카오톡</span>
        </button>

        {/* 링크 복사 */}
        <button
          onClick={handleCopy}
          className={btnClass}
          style={{
            "--neon": rgb,
            ...(copied ? { background: `rgba(${rgb},0.2)`, color: "#fff" } : {}),
          } as React.CSSProperties}
          aria-label="링크 복사"
        >
          <span>{copied ? "✓" : "🔗"}</span>
          <span>{copied ? "복사됨" : "링크 복사"}</span>
        </button>
      </div>
    </div>
  );
}
