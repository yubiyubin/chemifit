import { describe, it, expect } from "vitest";
import { OFFSCREEN_CAPTURE_STYLE } from "./capture";

describe("OFFSCREEN_CAPTURE_STYLE", () => {
  it("position은 fixed여야 한다", () => {
    expect(OFFSCREEN_CAPTURE_STYLE.position).toBe("fixed");
  });

  it("top, left는 0이어야 한다", () => {
    expect(OFFSCREEN_CAPTURE_STYLE.top).toBe(0);
    expect(OFFSCREEN_CAPTURE_STYLE.left).toBe(0);
  });

  it("zIndex는 -9999여야 한다 (실제 UI 뒤에 완전히 숨겨짐)", () => {
    expect(OFFSCREEN_CAPTURE_STYLE.zIndex).toBe(-9999);
  });

  it("pointerEvents는 none이어야 한다 (클릭 이벤트 차단)", () => {
    expect(OFFSCREEN_CAPTURE_STYLE.pointerEvents).toBe("none");
  });

  it("opacity는 0이어야 한다 (화면에서 보이지 않음)", () => {
    expect(OFFSCREEN_CAPTURE_STYLE.opacity).toBe(0);
  });
});
