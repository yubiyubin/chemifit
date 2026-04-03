/**
 * 루트 레이아웃 (최상위)
 *
 * 역할:
 * - <html>, <body> 태그 정의 (lang="ko")
 * - 글로벌 CSS 로드 (Tailwind + 커스텀 애니메이션)
 * - SEO 메타데이터: 타이틀, OG, Twitter 카드, 파비콘
 * - body에 overflow-x-hidden (좌우 스크롤 방지) + overscroll-y-contain (바운스 방지)
 *
 * 이 레이아웃은 모든 페이지에 공통 적용됨.
 * 탭별 공통 UI(헤더, 탭바, 푸터)는 (tabs)/layout.tsx에서 처리.
 */
import type { Metadata } from "next";
import Script from "next/script";
import { JsonLd } from "@/lib/json-ld";
import { SITE_URL, SITE_NAME, META, OG_IMAGE } from "@/data/metadata";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: META.root.titleTemplate,
    default: META.root.title,
  },
  description: META.root.description,
  keywords: META.root.keywords,
  alternates: { canonical: META.root.canonical },
  robots: { index: true, follow: true },
  icons: {
    icon: "/persona-lab.svg",
  },
  openGraph: {
    title: META.root.og.title,
    description: META.root.og.description,
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: META.root.twitter.title,
    description: META.root.twitter.description,
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3V9R7C99QG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3V9R7C99QG');
          `}
        </Script>
        <meta
          name="naver-site-verification"
          content="d4ba8fd2638dff474e78b0ac64d315a9d41648e9"
        />
      </head>
      <body className="overflow-x-hidden overscroll-y-contain">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ChemiFit",
            url: SITE_URL,
            description: META.root.description,
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "All",
            inLanguage: "ko",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "KRW",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
