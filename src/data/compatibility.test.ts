import { describe, it, expect } from "vitest";
import {
  MBTI_TYPES,
  COMPATIBILITY,
  getScore,
} from "./compatibility";

describe("MBTI_TYPES", () => {
  it("정확히 16개의 타입을 포함해야 한다", () => {
    expect(MBTI_TYPES).toHaveLength(16);
  });

  it("중복 없이 모두 고유한 값이어야 한다", () => {
    const unique = new Set(MBTI_TYPES);
    expect(unique.size).toBe(16);
  });

  it("잘 알려진 MBTI 타입들을 포함해야 한다", () => {
    const known: string[] = [
      "INTJ", "INTP", "ENTJ", "ENTP",
      "INFJ", "INFP", "ENFJ", "ENFP",
      "ISTJ", "ISFJ", "ESTJ", "ESFJ",
      "ISTP", "ISFP", "ESTP", "ESFP",
    ];
    known.forEach((t) => expect(MBTI_TYPES).toContain(t));
  });

  it("각 타입은 정확히 4글자여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(t).toHaveLength(4);
    });
  });

  it("각 타입은 대문자만으로 구성되어야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(t).toMatch(/^[A-Z]{4}$/);
    });
  });

  it("각 타입의 1번째 글자는 E 또는 I 여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(["E", "I"]).toContain(t[0]);
    });
  });

  it("각 타입의 2번째 글자는 S 또는 N 여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(["S", "N"]).toContain(t[1]);
    });
  });

  it("각 타입의 3번째 글자는 T 또는 F 여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(["T", "F"]).toContain(t[2]);
    });
  });

  it("각 타입의 4번째 글자는 J 또는 P 여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      expect(["J", "P"]).toContain(t[3]);
    });
  });
});

describe("COMPATIBILITY 행렬", () => {
  it("모든 점수가 0~100 범위 내에 있어야 한다", () => {
    MBTI_TYPES.forEach((a) => {
      MBTI_TYPES.forEach((b) => {
        const score = COMPATIBILITY[a][b];
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  it("16개 타입 모두 행에 존재해야 한다", () => {
    const rows = Object.keys(COMPATIBILITY);
    expect(rows).toHaveLength(16);
    MBTI_TYPES.forEach((t) => expect(rows).toContain(t));
  });

  it("16개 타입 모두 열에 존재해야 한다", () => {
    MBTI_TYPES.forEach((row) => {
      const cols = Object.keys(COMPATIBILITY[row]);
      expect(cols).toHaveLength(16);
      MBTI_TYPES.forEach((col) => expect(cols).toContain(col));
    });
  });

  it("전체 256개 값이 undefined 없이 존재해야 한다", () => {
    MBTI_TYPES.forEach((a) => {
      MBTI_TYPES.forEach((b) => {
        expect(COMPATIBILITY[a][b]).not.toBeUndefined();
        expect(typeof COMPATIBILITY[a][b]).toBe("number");
      });
    });
  });

  it("행렬이 대칭이어야 한다 (A-B === B-A)", () => {
    MBTI_TYPES.forEach((a) => {
      MBTI_TYPES.forEach((b) => {
        expect(COMPATIBILITY[a][b]).toBe(COMPATIBILITY[b][a]);
      });
    });
  });

  it("INTJ-INTP 고정값이 98이어야 한다", () => {
    expect(COMPATIBILITY["INTJ"]["INTP"]).toBe(98);
  });

  it("INTJ-ESFP 고정값이 0이어야 한다 (극과 극)", () => {
    expect(COMPATIBILITY["INTJ"]["ESFP"]).toBe(0);
  });

  it("INTP-ENTP 고정값이 100이어야 한다", () => {
    expect(COMPATIBILITY["INTP"]["ENTP"]).toBe(100);
  });
});

describe("getScore()", () => {
  it("유효한 MBTI 쌍의 점수를 반환해야 한다", () => {
    const score = getScore("INTJ", "INTP");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(typeof score).toBe("number");
  });

  it("동일한 타입에 대해 점수를 반환해야 한다", () => {
    const score = getScore("INTJ", "INTJ");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("INTJ-INTP 점수가 98이어야 한다", () => {
    expect(getScore("INTJ", "INTP")).toBe(98);
  });

  it("양방향으로 동일한 점수를 반환해야 한다 (대칭)", () => {
    expect(getScore("INTJ", "INTP")).toBe(getScore("INTP", "INTJ"));
  });

  it("모든 16개 타입의 자기 자신과의 점수가 0~100 범위여야 한다", () => {
    MBTI_TYPES.forEach((t) => {
      const score = getScore(t, t);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it("모든 가능한 조합에서 에러 없이 숫자를 반환해야 한다", () => {
    MBTI_TYPES.forEach((a) => {
      MBTI_TYPES.forEach((b) => {
        const score = getScore(a, b);
        expect(typeof score).toBe("number");
        expect(isNaN(score)).toBe(false);
      });
    });
  });

  it("ENFP-INFJ 대칭 확인", () => {
    expect(getScore("ENFP", "INFJ")).toBe(getScore("INFJ", "ENFP"));
  });

  it("ENTJ-INTJ 대칭 확인", () => {
    expect(getScore("ENTJ", "INTJ")).toBe(getScore("INTJ", "ENTJ"));
  });
});
