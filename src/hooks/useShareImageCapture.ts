import { useState, useCallback } from "react";
import type React from "react";
import { trackEvent } from "@/lib/analytics";

type EventMeta = Record<string, string>;

export function useShareImageCapture(
  cardRef: React.RefObject<HTMLDivElement | null>,
  eventMeta: EventMeta,
) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSaveImage = useCallback(async () => {
    if (!cardRef.current) return;
    trackEvent("share_image_save", eventMeta);
    setPreviewUrl(null);
    setPreviewOpen(true);
    const { toPng } = await import("html-to-image");
    await document.fonts.ready;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      width: 1080,
      height: 1350,
      skipFonts: true,
    });
    setPreviewUrl(dataUrl);
  }, [cardRef, eventMeta]);

  const handleClose = useCallback(() => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  }, []);

  return { handleSaveImage, previewOpen, previewUrl, handleClose };
}
