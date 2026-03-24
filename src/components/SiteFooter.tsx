/**
 * SiteFooter — 사이트 공통 푸터
 *
 * (tabs)/layout.tsx에서 사용.
 */

import { SITE } from "@/data/ui-text";

export default function SiteFooter() {
  return (
    <footer className="text-center py-8 text-white/25 text-xs">
      {SITE.copyright}
    </footer>
  );
}
