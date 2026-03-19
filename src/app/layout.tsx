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
