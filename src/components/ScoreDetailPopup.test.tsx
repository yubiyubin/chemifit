/**
 * @file ScoreDetailPopup.test.tsx
 * @description ScoreDetailPopup 컴포넌트 단위 테스트
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScoreDetailPopup from "./ScoreDetailPopup";

// Math.random 고정 — getScoreInfo / getLoveFriendLine 결과 안정화
vi.spyOn(Math, "random").mockReturnValue(0);

/** 필수 props 기본값 헬퍼 */
function baseProps(overrides: Partial<Parameters<typeof ScoreDetailPopup>[0]> = {}) {
  return {
    onClose: vi.fn(),
    rgb: "139,92,246",
    score: 68,
    metaSlot: null,
    gauge: <div data-testid="gauge">gauge</div>,
    children: <button data-testid="cta">CTA</button>,
    ...overrides,
  };
}

describe("ScoreDetailPopup", () => {
  it("필수 props 전달 시 점수 텍스트(68%)가 렌더된다", () => {
    render(<ScoreDetailPopup {...baseProps()} />);
    expect(screen.getByText("68%")).toBeInTheDocument();
  });

  it("metaSlot prop 전달 시 해당 콘텐츠가 렌더된다", () => {
    const meta = <span data-testid="meta-slot">ENFP x INTJ</span>;
    render(<ScoreDetailPopup {...baseProps({ metaSlot: meta })} />);
    expect(screen.getByTestId("meta-slot")).toBeInTheDocument();
    expect(screen.getByText("ENFP x INTJ")).toBeInTheDocument();
  });

  it("metaSlot 미전달(null) 시 meta-slot 영역이 없다", () => {
    render(<ScoreDetailPopup {...baseProps({ metaSlot: null })} />);
    expect(screen.queryByTestId("meta-slot")).not.toBeInTheDocument();
  });

  it("extraSlot prop 전달 시 해당 콘텐츠가 렌더된다", () => {
    const extra = <div data-testid="extra-slot">Extra Content</div>;
    render(<ScoreDetailPopup {...baseProps({ extraSlot: extra })} />);
    expect(screen.getByTestId("extra-slot")).toBeInTheDocument();
    expect(screen.getByText("Extra Content")).toBeInTheDocument();
  });

  it("extraSlot 미전달 시 extra-slot 영역이 없다", () => {
    render(<ScoreDetailPopup {...baseProps()} />);
    expect(screen.queryByTestId("extra-slot")).not.toBeInTheDocument();
  });

  it("CloseButton 클릭 시 onClose 콜백이 호출된다", () => {
    const onClose = vi.fn();
    render(<ScoreDetailPopup {...baseProps({ onClose })} />);
    fireEvent.click(screen.getByTestId("close-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("score=0 극단값에서 크래시 없이 렌더된다", () => {
    const { container } = render(<ScoreDetailPopup {...baseProps({ score: 0 })} />);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("score=100 극단값에서 크래시 없이 렌더된다", () => {
    const { container } = render(<ScoreDetailPopup {...baseProps({ score: 100 })} />);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("testId prop 전달 시 해당 data-testid가 존재한다", () => {
    render(<ScoreDetailPopup {...baseProps({ testId: "popup-root" })} />);
    expect(screen.getByTestId("popup-root")).toBeInTheDocument();
  });

  it("testId 미전달 시 루트 div에 data-testid 속성이 없다", () => {
    render(<ScoreDetailPopup {...baseProps()} />);
    expect(screen.queryByTestId("popup-root")).not.toBeInTheDocument();
  });

  it("gauge slot이 정상 렌더된다", () => {
    render(<ScoreDetailPopup {...baseProps()} />);
    expect(screen.getByTestId("gauge")).toBeInTheDocument();
  });

  it("children(CTA 버튼)이 정상 렌더된다", () => {
    render(<ScoreDetailPopup {...baseProps()} />);
    expect(screen.getByTestId("cta")).toBeInTheDocument();
  });
});
