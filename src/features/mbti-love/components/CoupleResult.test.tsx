/**
 * @file CoupleResult.test.tsx
 * @description CoupleResult CTA 버튼 + 이미지 저장 버튼 렌더링 테스트
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CoupleResult from "./CoupleResult";
import { COUPLE } from "@/data/ui-text";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  usePathname: () => "/mbti-love",
}));

// Math.random 고정 → pool[0] 선택
vi.spyOn(Math, "random").mockReturnValue(0);

beforeEach(() => {
  pushMock.mockClear();
});

describe("CoupleResult — rank-cta 버튼", () => {
  it("partnerMbti가 있을 때 rank-cta 버튼이 렌더된다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti="INTJ"
        onPartnerSelect={vi.fn()}
      />,
    );
    expect(screen.getByTestId("rank-cta")).toBeInTheDocument();
  });

  it("partnerMbti가 null일 때 rank-cta 버튼이 렌더되지 않는다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti={null}
        onPartnerSelect={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("rank-cta")).not.toBeInTheDocument();
  });
});

describe("CoupleResult — save-image-btn 버튼", () => {
  it("partnerMbti가 있을 때 이미지 저장 버튼이 렌더된다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti="INTJ"
        onPartnerSelect={vi.fn()}
      />,
    );
    const btn = screen.getByTestId("save-image-btn");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent(COUPLE.saveImageLabel);
  });

  it("partnerMbti가 null일 때 이미지 저장 버튼이 렌더되지 않는다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti={null}
        onPartnerSelect={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("save-image-btn")).not.toBeInTheDocument();
  });
});

describe("CoupleResult — group-cta 버튼", () => {
  it("partnerMbti가 있을 때 그룹 케미 CTA 버튼이 렌더된다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti="INTJ"
        onPartnerSelect={vi.fn()}
      />,
    );
    const btn = screen.getByTestId("group-cta");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent(COUPLE.groupCta);
    expect(btn).toHaveTextContent(COUPLE.groupCtaSub);
  });

  it("partnerMbti가 null일 때 group-cta 버튼이 렌더되지 않는다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti={null}
        onPartnerSelect={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("group-cta")).not.toBeInTheDocument();
  });

  it("group-cta 클릭 시 /group-match로 네비게이션한다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti="INTJ"
        onPartnerSelect={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("group-cta"));
    expect(pushMock).toHaveBeenCalledWith("/group-match");
  });

  it("rank-cta 클릭 시 /mbti-map?mbti=ENFP로 네비게이션한다", () => {
    render(
      <CoupleResult
        myMbti="ENFP"
        partnerMbti="INTJ"
        onPartnerSelect={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("rank-cta"));
    expect(pushMock).toHaveBeenCalledWith("/mbti-map?mbti=ENFP");
  });
});
