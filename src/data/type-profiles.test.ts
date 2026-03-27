import { describe, it, expect } from "vitest";
import { TYPE_PROFILES, type MbtiProfile } from "./type-profiles";
import { MBTI_TYPES } from "./compatibility";

describe("TYPE_PROFILES", () => {
  it("16개 타입이 모두 존재해야 한다", () => {
    expect(Object.keys(TYPE_PROFILES)).toHaveLength(16);
    MBTI_TYPES.forEach((t) => {
      expect(TYPE_PROFILES).toHaveProperty(t);
    });
  });

  it("각 프로필의 type 필드가 키와 일치해야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(TYPE_PROFILES[t].type).toBe(t);
    });
  });

  it("각 프로필에 필수 문자열 필드가 비어있지 않아야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      const p: MbtiProfile = TYPE_PROFILES[t];
      expect(p.nickname.length).toBeGreaterThan(0);
      expect(p.summary.length).toBeGreaterThan(0);
      expect(p.loveStyle.length).toBeGreaterThan(0);
    });
  });

  it("tags가 5~7개여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      const { tags } = TYPE_PROFILES[t];
      expect(tags.length).toBeGreaterThanOrEqual(5);
      expect(tags.length).toBeLessThanOrEqual(7);
    });
  });

  it("tags는 모두 # 으로 시작해야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      TYPE_PROFILES[t].tags.forEach((tag) => {
        expect(tag.startsWith("#")).toBe(true);
      });
    });
  });

  it("strengths가 3~4개여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      const { strengths } = TYPE_PROFILES[t];
      expect(strengths.length).toBeGreaterThanOrEqual(3);
      expect(strengths.length).toBeLessThanOrEqual(4);
    });
  });

  it("weaknesses가 3~4개여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      const { weaknesses } = TYPE_PROFILES[t];
      expect(weaknesses.length).toBeGreaterThanOrEqual(3);
      expect(weaknesses.length).toBeLessThanOrEqual(4);
    });
  });

  it("bestTypes가 정확히 3개여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(TYPE_PROFILES[t].bestTypes).toHaveLength(3);
    });
  });

  it("worstTypes가 정확히 3개여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(TYPE_PROFILES[t].worstTypes).toHaveLength(3);
    });
  });

  it("bestTypes의 모든 값이 유효한 MbtiType이어야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      TYPE_PROFILES[t].bestTypes.forEach((bt) => {
        expect(MBTI_TYPES).toContain(bt);
      });
    });
  });

  it("worstTypes의 모든 값이 유효한 MbtiType이어야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      TYPE_PROFILES[t].worstTypes.forEach((wt) => {
        expect(MBTI_TYPES).toContain(wt);
      });
    });
  });

  it("bestTypes에 자기 자신이 포함되지 않아야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(TYPE_PROFILES[t].bestTypes).not.toContain(t);
    });
  });

  it("worstTypes에 자기 자신이 포함되지 않아야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(TYPE_PROFILES[t].worstTypes).not.toContain(t);
    });
  });

  it("bestTypes와 worstTypes 사이에 중복이 없어야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      const { bestTypes, worstTypes } = TYPE_PROFILES[t];
      const overlap = bestTypes.filter((bt) => worstTypes.includes(bt));
      expect(overlap).toHaveLength(0);
    });
  });

  it("celebrities가 3~4명이어야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      const { celebrities } = TYPE_PROFILES[t];
      expect(celebrities.length).toBeGreaterThanOrEqual(3);
      expect(celebrities.length).toBeLessThanOrEqual(4);
    });
  });

  it("INTJ bestTypes가 [INTP, ENTP, INFJ]이어야 한다", () => {
    expect(TYPE_PROFILES.INTJ.bestTypes).toEqual(["INTP", "ENTP", "INFJ"]);
  });

  it("INTJ worstTypes가 [ESFP, ESFJ, ISFP]이어야 한다", () => {
    expect(TYPE_PROFILES.INTJ.worstTypes).toEqual(["ESFP", "ESFJ", "ISFP"]);
  });

  it("ENFP bestTypes가 [INFJ, ENTJ, INFP]이어야 한다", () => {
    expect(TYPE_PROFILES.ENFP.bestTypes).toEqual(["INFJ", "ENTJ", "INFP"]);
  });
});
