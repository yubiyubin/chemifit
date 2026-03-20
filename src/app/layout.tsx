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
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Personality Lab - MBTI & 성격 테스트 허브",
  description: "MBTI 궁합, 동물 매칭, 연애 유형 등 다양한 성격 콘텐츠를 즐겨보세요. 나와 맞는 성향을 찾고 친구들과 결과를 공유해보세요!",
  keywords: ["MBTI", "성격 테스트", "MBTI 궁합", "동물 매칭", "연애 테스트", "성격 유형", "페르소나 랩", "심리 테스트"],
  icons: {
    icon: "/persona-lab.svg",
  },
  openGraph: {
    title: "Personality Lab - MBTI & 성격 테스트",
    description: "MBTI 궁합, 동물 매칭, 연애 유형 등 다양한 성격 콘텐츠를 즐겨보세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "Personality Lab",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Personality Lab Preview Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personality Lab - MBTI & 성격 테스트",
    description: "MBTI 궁합, 동물 매칭, 연애 유형 등 다양한 성격 콘텐츠를 즐겨보세요.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="overflow-x-hidden overscroll-y-contain">{children}</body>
    </html>
  );
}
