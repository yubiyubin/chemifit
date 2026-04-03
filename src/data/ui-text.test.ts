import { describe, it, expect } from "vitest";
import { LANDING, LANDING_FEATURES } from "./ui-text";

describe("LANDING 상수 검증", () => {
  it("heroHeadline1이 정의되어야 한다", () => {
    expect(LANDING.heroHeadline1).toBeTruthy();
  });

  it("heroHeadline2가 정의되어야 한다", () => {
    expect(LANDING.heroHeadline2).toBeTruthy();
  });

  it("heroCta가 정의되어야 한다", () => {
    expect(LANDING.heroCta).toBeTruthy();
  });

  it("bottomCtaButton이 정의되어야 한다", () => {
    expect(LANDING.bottomCtaButton).toBeTruthy();
  });
});

describe("LANDING_FEATURES 구조 검증", () => {
  it("정확히 4개 피처 카드가 존재해야 한다", () => {
    expect(LANDING_FEATURES).toHaveLength(4);
  });

  it("각 피처 카드에 필수 필드가 모두 있어야 한다", () => {
    LANDING_FEATURES.forEach((f) => {
      expect(f).toHaveProperty("emoji");
      expect(f).toHaveProperty("title");
      expect(f).toHaveProperty("desc");
      expect(f).toHaveProperty("href");
      expect(f).toHaveProperty("rgb");
      expect(f).toHaveProperty("stats");
    });
  });

  it("각 href는 /로 시작해야 한다", () => {
    LANDING_FEATURES.forEach((f) => {
      expect(f.href).toMatch(/^\//);
    });
  });

  it("rgb는 'R,G,B' 형식이어야 한다", () => {
    LANDING_FEATURES.forEach((f) => {
      expect(f.rgb).toMatch(/^\d{1,3},\d{1,3},\d{1,3}$/);
    });
  });

  it("mbti-love, mbti-map, group-match, mbti-profiles 4개 경로가 존재해야 한다", () => {
    const hrefs = LANDING_FEATURES.map((f) => f.href);
    expect(hrefs).toContain("/mbti-love");
    expect(hrefs).toContain("/mbti-map");
    expect(hrefs).toContain("/group-match");
    expect(hrefs).toContain("/mbti-profiles");
  });
});
