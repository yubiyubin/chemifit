/**
 * @file MbtiGrid.test.tsx
 * @description MbtiGrid 컴포넌트 핵심 케이스 단위 테스트
 *
 * MbtiGraph(Canvas 기반)는 children 없이 테스트한다.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MbtiGrid from "./MbtiGrid";
import { MBTI_TYPES } from "@/data/compatibility";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  usePathname: () => "/",
}));

vi.mock("@/data/type-profiles", () => ({
  TYPE_PROFILES: Object.fromEntries(
    ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
     "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"]
      .map((t) => [t, { nickname: "test" }])
  ),
}));

vi.spyOn(Math, "random").mockReturnValue(0);

describe("MbtiGrid", () => {
  it("16개 MBTI 선택 버튼이 모두 렌더된다", () => {
    render(<MbtiGrid selectedMbti="ENFP" />);
    MBTI_TYPES.forEach((type) => {
      expect(screen.getByTestId(`map-mbti-btn-${type}`)).toBeInTheDocument();
    });
  });

  it("선택된 MBTI 버튼에 data-selected='true'가 붙는다", () => {
    render(<MbtiGrid selectedMbti="ENFP" />);
    const selectedBtn = screen.getByTestId("map-mbti-btn-ENFP");
    expect(selectedBtn.getAttribute("data-selected")).toBe("true");
  });

  it("선택되지 않은 MBTI 버튼에는 data-selected='false'가 붙는다", () => {
    render(<MbtiGrid selectedMbti="ENFP" />);
    const unselectedBtn = screen.getByTestId("map-mbti-btn-INTJ");
    expect(unselectedBtn.getAttribute("data-selected")).toBe("false");
  });

  it("다른 MBTI 버튼 클릭 시 onSelect 콜백이 호출된다", () => {
    const onSelect = vi.fn();
    render(<MbtiGrid selectedMbti="ENFP" onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId("map-mbti-btn-INTJ"));
    expect(onSelect).toHaveBeenCalledWith("INTJ");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("현재 선택된 버튼 클릭 시에도 onSelect 콜백이 호출된다", () => {
    const onSelect = vi.fn();
    render(<MbtiGrid selectedMbti="ENFP" onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId("map-mbti-btn-ENFP"));
    expect(onSelect).toHaveBeenCalledWith("ENFP");
  });

  it("MbtiBadge가 최소 1개 이상 렌더된다 (mbti-badge-* testid 패턴)", () => {
    const { container } = render(<MbtiGrid selectedMbti="ENFP" />);
    const badges = container.querySelectorAll("[data-testid^='mbti-badge-']");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("onSelect 없이도 버튼 클릭 시 에러가 발생하지 않는다", () => {
    render(<MbtiGrid selectedMbti="ENFP" />);
    expect(() => {
      fireEvent.click(screen.getByTestId("map-mbti-btn-INTJ"));
    }).not.toThrow();
  });

  it("children prop 없이 렌더해도 에러가 발생하지 않는다", () => {
    const { container } = render(<MbtiGrid selectedMbti="INTJ" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("children prop 전달 시 children이 렌더된다", () => {
    render(
      <MbtiGrid selectedMbti="INTJ">
        <div data-testid="custom-child">그래프 영역</div>
      </MbtiGrid>,
    );
    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
  });

  it("selectedMbti 변경 시 새로운 MBTI의 data-selected가 true로 변경된다", () => {
    const { rerender } = render(<MbtiGrid selectedMbti="ENFP" />);
    expect(screen.getByTestId("map-mbti-btn-ENFP").getAttribute("data-selected")).toBe("true");
    expect(screen.getByTestId("map-mbti-btn-INTJ").getAttribute("data-selected")).toBe("false");

    rerender(<MbtiGrid selectedMbti="INTJ" />);
    expect(screen.getByTestId("map-mbti-btn-INTJ").getAttribute("data-selected")).toBe("true");
    expect(screen.getByTestId("map-mbti-btn-ENFP").getAttribute("data-selected")).toBe("false");
  });

  it("배지 클릭 시 compat-detail-modal이 열린다", () => {
    render(<MbtiGrid selectedMbti="ENFP" />);
    // 첫 번째 mbti-badge-* 배지를 클릭
    const firstBadge = screen
      .getAllByTestId(/^mbti-badge-/)
      .find((el) => el.getAttribute("data-testid") !== "mbti-badge-ENFP");
    if (firstBadge) {
      fireEvent.click(firstBadge);
      expect(screen.getByTestId("compat-detail-modal")).toBeInTheDocument();
    }
  });
});
