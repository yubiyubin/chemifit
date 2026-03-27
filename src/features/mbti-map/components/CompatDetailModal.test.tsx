/**
 * @file CompatDetailModal.test.tsx
 * @description CompatDetailModal 컴포넌트 단위 테스트
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CompatDetailModal from "./CompatDetailModal";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  usePathname: () => "/",
}));

// getScoreInfo 내부의 랜덤 의존성을 고정
vi.spyOn(Math, "random").mockReturnValue(0);

describe("CompatDetailModal", () => {
  it("data=null이면 compat-detail-modal testid가 렌더되지 않는다", () => {
    render(<CompatDetailModal data={null} onClose={vi.fn()} />);
    expect(screen.queryByTestId("compat-detail-modal")).not.toBeInTheDocument();
  });

  it("data가 있으면 compat-detail-modal이 렌더된다", () => {
    render(
      <CompatDetailModal
        data={{ my: "ENFP", other: "INTJ", score: 75 }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId("compat-detail-modal")).toBeInTheDocument();
  });

  it("score 값이 '75%' 형태로 화면에 표시된다", () => {
    render(
      <CompatDetailModal
        data={{ my: "ENFP", other: "INTJ", score: 75 }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("MBTI 조합(my × other)이 화면에 표시된다", () => {
    render(
      <CompatDetailModal
        data={{ my: "ENFP", other: "INTJ", score: 75 }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("ENFP × INTJ")).toBeInTheDocument();
  });


  it("연인 궁합 버튼 클릭 시 router.push가 /mbti-love 경로로 호출된다", () => {
    pushMock.mockClear();
    render(
      <CompatDetailModal
        data={{ my: "ENFP", other: "INTJ", score: 75 }}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("love-cta"));
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock.mock.calls[0][0]).toContain("/mbti-love");
  });

  it("연인 궁합 버튼 클릭 시 onClose도 함께 호출된다", () => {
    pushMock.mockClear();
    const onClose = vi.fn();
    render(
      <CompatDetailModal
        data={{ my: "ENFP", other: "INTJ", score: 75 }}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTestId("love-cta"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("연인 궁합 버튼 클릭 시 push URL에 my, other MBTI가 포함된다", () => {
    pushMock.mockClear();
    render(
      <CompatDetailModal
        data={{ my: "ENFP", other: "INTJ", score: 75 }}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("love-cta"));
    const url: string = pushMock.mock.calls[0][0];
    expect(url).toContain("ENFP");
    expect(url).toContain("INTJ");
  });

  it("score=100 극단값 — 에러 없이 렌더된다", () => {
    const { container } = render(
      <CompatDetailModal
        data={{ my: "INFJ", other: "ENFJ", score: 100 }}
        onClose={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("score=0 극단값 — 에러 없이 렌더된다", () => {
    const { container } = render(
      <CompatDetailModal
        data={{ my: "INTJ", other: "ESFP", score: 0 }}
        onClose={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("상단 CloseButton(close-btn) 클릭 시 onClose가 호출된다", () => {
    const onClose = vi.fn();
    render(
      <CompatDetailModal
        data={{ my: "ENFP", other: "INTJ", score: 75 }}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTestId("close-btn"));
    expect(onClose).toHaveBeenCalled();
  });
});
