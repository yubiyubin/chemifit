/**
 * 루트 페이지 ("/")
 *
 * 사용자가 "/" 접속 시 기본 탭인 "/mbti-love"(연인 궁합)로 리다이렉트.
 * 서버 사이드에서 즉시 리다이렉트되므로 이 컴포넌트의 UI는 보이지 않음.
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/mbti-love");
}
