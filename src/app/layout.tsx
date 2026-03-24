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
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chemifit.vercel.app"),
  title: {
    template: "%s | ChemiFit",
    default: "ChemiFit - MBTI 궁합 테스트",
  },
  description:
    "MBTI 궁합 점수, 연애 궁합, 그룹 궁합을 한눈에. 16가지 MBTI 유형 간 궁합을 점수·그래프·상세 분석으로 확인하세요.",
  keywords: [
    "MBTI 궁합",
    "MBTI 연애 궁합",
    "MBTI 궁합 테스트",
    "MBTI 그룹 궁합",
    "성격 유형 테스트",
    "MBTI 궁합 점수",
    "케미핏",
    "MBTI 궁합표",
    "MBTI 궁합 순위",
  ],
  icons: {
    icon: "/persona-lab.svg",
  },
  openGraph: {
    title: "ChemiFit - MBTI & 성격 테스트 허브",
    description:
      "MBTI 궁합, 동물 매칭, 연애 유형 등 다양한 성격 콘텐츠를 즐겨보세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "ChemiFit",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChemiFit - MBTI & 성격 테스트 허브",
    description:
      "MBTI 궁합, 동물 매칭, 연애 유형 등 다양한 성격 콘텐츠를 즐겨보세요.",
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
            url: "https://chemifit.vercel.app",
            description:
              "MBTI 궁합 점수, 연애 궁합, 그룹 궁합을 한눈에. 16가지 MBTI 유형 간 궁합을 점수·그래프·상세 분석으로 확인하세요.",
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
