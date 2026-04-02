/**
 * SharePanel — 통합 공유 버튼 패널
 *
 * 카카오톡, 트위터(X), 링크 복사 버튼을 한 줄로 표시.
 * 모바일에서 Web Share API 가용 시 네이티브 공유 시트도 지원.
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
};

export default function SharePanel({
  title,
  description,
  path,
  rgb = "236,72,153",
  contentType = "general",
}: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${SITE_URL}${path}`;

  const handleKakao = useCallback(async () => {
    trackEvent("share_click", { platform: "kakao", content_type: contentType });
    await shareKakao({ title, description, pageUrl: path });
  }, [title, description, path, contentType]);

  const handleTwitter = useCallback(() => {
    trackEvent("share_click", { platform: "twitter", content_type: contentType });
    const text = `${title} - ${description}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [title, description, fullUrl, contentType]);

  const handleCopy = useCallback(async () => {
    trackEvent("share_click", { platform: "copy", content_type: contentType });
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullUrl, contentType]);

  const handleNativeShare = useCallback(async () => {
    trackEvent("share_click", { platform: "native", content_type: contentType });
    await navigator.share({ title, text: description, url: fullUrl });
  }, [title, description, fullUrl, contentType]);

  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="flex items-center gap-2">
      {/* 카카오톡 */}
      <button
        onClick={handleKakao}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "rgba(254,229,0,0.12)",
          border: "1px solid rgba(254,229,0,0.3)",
          color: "#FEE500",
        }}
        aria-label="카카오톡으로 공유"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FEE500">
          <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.53-.96 3.4-.99 3.62 0 0-.02.17.09.23.11.07.24.02.24.02.32-.04 3.7-2.42 4.28-2.83.56.08 1.14.12 1.72.12 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"/>
        </svg>
        카카오톡
      </button>

      {/* 트위터(X) */}
      <button
        onClick={handleTwitter}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "rgba(29,155,240,0.12)",
          border: "1px solid rgba(29,155,240,0.3)",
          color: "#1D9BF0",
        }}
        aria-label="트위터로 공유"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1D9BF0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X
      </button>

      {/* 링크 복사 */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: `rgba(${rgb},0.1)`,
          border: `1px solid rgba(${rgb},0.25)`,
          color: copied ? "#4ade80" : `rgba(${rgb},0.8)`,
        }}
        aria-label="링크 복사"
      >
        {copied ? "✓ 복사됨" : "🔗 링크"}
      </button>

      {/* 네이티브 공유 (모바일) */}
      {supportsNativeShare && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.6)",
          }}
          aria-label="공유"
        >
          ↗ 더보기
        </button>
      )}
    </div>
  );
}
