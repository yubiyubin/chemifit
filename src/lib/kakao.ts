/**
 * 카카오 JavaScript SDK 로더 + 공유 유틸리티
 *
 * SDK를 동적 로드하고, 초기화 후 Feed 템플릿으로 카카오톡 공유를 실행한다.
 * 서버사이드에서는 동작하지 않는다.
 */
import { KAKAO_JS_KEY, SITE_URL } from "@/data/metadata";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: KakaoFeedParams) => void;
      };
    };
  }
}

type KakaoFeedParams = {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: { mobileWebUrl: string; webUrl: string };
  };
  buttons: {
    title: string;
    link: { mobileWebUrl: string; webUrl: string };
  }[];
};

let loadPromise: Promise<void> | null = null;

/** 카카오 SDK 스크립트를 동적 로드 + 초기화 (한 번만 실행) */
export function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Kakao?.isInitialized()) return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // 이미 로드된 경우
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.integrity = "sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Ber76k";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
      }
      resolve();
    };
    script.onerror = () => reject(new Error("카카오 SDK 로드 실패"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

type ShareOptions = {
  title: string;
  description: string;
  /** OG 이미지 절대 URL */
  imageUrl?: string;
  /** 공유 페이지 절대 URL */
  pageUrl: string;
  /** 버튼 텍스트 */
  buttonText?: string;
};

/** 카카오톡 Feed 템플릿으로 공유 */
export async function shareKakao({ title, description, imageUrl, pageUrl, buttonText = "궁합 확인하기" }: ShareOptions) {
  await loadKakaoSdk();

  if (!window.Kakao?.isInitialized()) return;

  const url = pageUrl.startsWith("http") ? pageUrl : `${SITE_URL}${pageUrl}`;
  const ogImage = imageUrl ?? `${SITE_URL}/og.png`;

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl: ogImage,
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [
      {
        title: buttonText,
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
  });
}
