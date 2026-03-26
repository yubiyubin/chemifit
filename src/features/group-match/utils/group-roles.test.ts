import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyzeGroup } from "./group-roles";

describe("analyzeGroup()", () => {
  beforeEach(() => {
    // Math.random을 0으로 고정 → pool[0]이 선택됨
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ENFP 1명 → roles에 energy 포함, count=1", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }]);
    const energyRole = result.roles.find((r) => r.id === "energy");
    expect(energyRole).toBeDefined();
    expect(energyRole!.count).toBe(1);
  });

  it("INTJ + INTP 2명 → analyst count=2", () => {
    const result = analyzeGroup([{ mbti: "INTJ" }, { mbti: "INTP" }]);
    const analystRole = result.roles.find((r) => r.id === "analyst");
    expect(analystRole).toBeDefined();
    expect(analystRole!.count).toBe(2);
  });

  it("roles가 count 내림차순으로 정렬되어야 한다", () => {
    // INTJ, INTP, ENTJ → analyst 2, leader 1
    const result = analyzeGroup([
      { mbti: "INTJ" },
      { mbti: "INTP" },
      { mbti: "ENTJ" },
    ]);
    for (let i = 1; i < result.roles.length; i++) {
      expect(result.roles[i - 1].count).toBeGreaterThanOrEqual(
        result.roles[i].count,
      );
    }
  });

  it("count=0인 역할은 roles에 포함되지 않아야 한다", () => {
    // ENFP 1명 → energy만 count>0
    const result = analyzeGroup([{ mbti: "ENFP" }]);
    result.roles.forEach((r) => {
      expect(r.count).toBeGreaterThan(0);
    });
  });

  it("effect: count=1 → effects[0] 배열 중 하나 선택", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }]);
    const energyRole = result.roles.find((r) => r.id === "energy")!;
    expect(energyRole.effects[0]).toContain(energyRole.effect);
  });

  it("effect: count=2 → effects[1] 배열 중 하나 선택", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ENTP" }]);
    const energyRole = result.roles.find((r) => r.id === "energy")!;
    expect(energyRole.effects[1]).toContain(energyRole.effect);
  });

  it("effect: count=3+ → effects[2] 배열 중 하나 선택", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "ENTP" },
      { mbti: "ESFP" },
    ]);
    const energyRole = result.roles.find((r) => r.id === "energy")!;
    expect(energyRole.effects[2]).toContain(energyRole.effect);
  });

  describe("밈 규칙 매칭 (Math.random=0 → pool[0])", () => {
    it("energy 2명/전체 2명 → 2인 전용 밈 '둘이서 카페를 클럽으로'", () => {
      const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ENTP" }]);
      expect(result.meme).toBe("둘이서 카페를 클럽으로 만드는 조합 🪩");
    });

    it("analyst 2명/전체 2명 → 2인 전용 밈 '둘이서 밥집 고르는 데 40분'", () => {
      const result = analyzeGroup([{ mbti: "INTJ" }, { mbti: "INTP" }]);
      expect(result.meme).toBe("둘이서 밥집 고르는 데 40분 걸림 🧮");
    });

    it("mypace 2명/전체 2명 → 2인 전용 밈 '둘이 만났는데 둘 다 폰 보는 중'", () => {
      const result = analyzeGroup([{ mbti: "INFP" }, { mbti: "INFJ" }]);
      expect(result.meme).toBe("둘이 만났는데 둘 다 폰 보는 중 📱📱");
    });

    it("energy=0 (INTJ+INFP) → analyst 2인 전용 밈", () => {
      // INTJ(analyst) + INFP(mypace): analyst=1/2=50%, mypace=1/2=50%
      // 2인 전용 analyst 규칙 안 걸림 (analyst === 1, not 2)
      // → analyst≥50% 규칙 매칭
      const result = analyzeGroup([{ mbti: "INTJ" }, { mbti: "INFP" }]);
      expect(result.meme).toBe("분석하다가 하루가 끝남 🧠");
    });

    it("energy=0인 케이스: INFJ+INFP → 2인 전용 mypace 밈", () => {
      // INFJ(mypace) + INFP(mypace): mypace=2/2=100% → 2인 전용 mypace 밈
      const result = analyzeGroup([{ mbti: "INFJ" }, { mbti: "INFP" }]);
      expect(result.meme).toBe("둘이 만났는데 둘 다 폰 보는 중 📱📱");
    });

    it("energy=0 규칙: ISTJ+ISFJ → analyst 1/care 1 → analyst≥50%", () => {
      // ISTJ(analyst) + ISFJ(care): 각 50% → analyst 규칙이 먼저 (no 2인 전용 매칭)
      const result = analyzeGroup([{ mbti: "ISTJ" }, { mbti: "ISFJ" }]);
      expect(result.meme).toBe("분석하다가 하루가 끝남 🧠");
    });

    it("care 4명(50%) → '서로 챙기다 하루 끝남'", () => {
      // care(ENFJ, ESFJ) 2명, leader(ENTJ, ESTJ) 2명 → care=2/4=50% → care 규칙 매칭
      const result = analyzeGroup([
        { mbti: "ENFJ" },
        { mbti: "ENTJ" },
        { mbti: "ESFJ" },
        { mbti: "ESTJ" },
      ]);
      expect(result.meme).toBe("서로 챙기다 하루 끝남 🫶");
    });

    it("DEFAULT_MEMES[0]: care 33%, leader 33%, analyst 33% 케이스", () => {
      // ENFJ(care) + ENTJ(leader) + INTJ(analyst): 각 1/3=33%, energy=0 → energy=0 규칙
      const result = analyzeGroup([
        { mbti: "ENFJ" },
        { mbti: "ENTJ" },
        { mbti: "INTJ" },
      ]);
      expect(result.meme).toBe("텐션 올릴 사람이 없음 📉");
    });

    it("5명 균등 → energy+analyst 규칙 매칭", () => {
      const result = analyzeGroup([
        { mbti: "ENFP" },
        { mbti: "ENFJ" },
        { mbti: "ENTJ" },
        { mbti: "INTJ" },
        { mbti: "ISFP" },
      ]);
      expect(result.meme).toBe("놀자는 쪽 vs 생각하자는 쪽 🎭");
    });

    it("ESFJ+ENFJ → 2인 전용 care 밈", () => {
      const result = analyzeGroup([{ mbti: "ESFJ" }, { mbti: "ENFJ" }]);
      // care=2/2=100% → 2인 전용 care 규칙
      expect(result.meme).toBe(
        "서로 밥 먹었냐고 물어보느라 정작 밥을 못 먹음 🍚🍚",
      );
    });
  });

  it("leader=0, care=0 규칙: ENFP+ISFP → energy≥50% 규칙이 먼저", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ISFP" }]);
    expect(result.meme).toBe("이 그룹 모이면 매번 난리남 🔥");
  });

  it("leader+energy만 있음: ENFP+ENTJ → energy=50% → energy 규칙", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ENTJ" }]);
    expect(result.meme).toBe("이 그룹 모이면 매번 난리남 🔥");
  });

  it("leader≥40% 규칙: ENTJ×2 + INTJ + INTP + ISFJ = 5명, leader=2/5=40%", () => {
    const result = analyzeGroup([
      { mbti: "ENTJ" },
      { mbti: "ENTJ" },
      { mbti: "INTJ" },
      { mbti: "INTP" },
      { mbti: "ISFJ" },
    ]);
    expect(result.meme).toBe("리더가 너무 많음 ⚔️");
  });

  it("8명 최대 입력 → 정상 동작", () => {
    const members = [
      { mbti: "INTJ" as const },
      { mbti: "INTP" as const },
      { mbti: "ENFP" as const },
      { mbti: "INFJ" as const },
      { mbti: "ENTJ" as const },
      { mbti: "ISFJ" as const },
      { mbti: "ISTP" as const },
      { mbti: "ESFP" as const },
    ];
    const result = analyzeGroup(members);
    expect(result.meme).toBeDefined();
    expect(result.roles.length).toBeGreaterThan(0);
    const totalCount = result.roles.reduce((sum, r) => sum + r.count, 0);
    expect(totalCount).toBe(8);
  });

  it("반환값에 meme, roles, summary, membersByRole, missingRoles, suggestions, balanceScore가 있어야 한다", () => {
    const result = analyzeGroup([{ mbti: "INTJ" }]);
    expect(result).toHaveProperty("meme");
    expect(result).toHaveProperty("roles");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("membersByRole");
    expect(result).toHaveProperty("missingRoles");
    expect(result).toHaveProperty("suggestions");
    expect(result).toHaveProperty("balanceScore");
    expect(typeof result.meme).toBe("string");
    expect(typeof result.summary).toBe("string");
    expect(Array.isArray(result.roles)).toBe(true);
    expect(typeof result.membersByRole).toBe("object");
    expect(Array.isArray(result.missingRoles)).toBe(true);
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(typeof result.balanceScore).toBe("number");
  });
});

describe("MBTI → role 매핑 검증", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const energyTypes = ["ENFP", "ENTP", "ESFP", "ESTP"] as const;
  const careTypes = ["ENFJ", "ESFJ", "ISFJ"] as const;
  const analystTypes = ["INTJ", "INTP", "ISTP", "ISTJ"] as const;
  const leaderTypes = ["ENTJ", "ESTJ"] as const;
  const mypaceTypes = ["INFP", "INFJ", "ISFP"] as const;

  energyTypes.forEach((mbti) => {
    it(`${mbti} → energy 역할`, () => {
      const result = analyzeGroup([{ mbti }]);
      const role = result.roles.find((r) => r.id === "energy");
      expect(role).toBeDefined();
      expect(role!.count).toBe(1);
    });
  });

  careTypes.forEach((mbti) => {
    it(`${mbti} → care 역할`, () => {
      const result = analyzeGroup([{ mbti }]);
      const role = result.roles.find((r) => r.id === "care");
      expect(role).toBeDefined();
      expect(role!.count).toBe(1);
    });
  });

  analystTypes.forEach((mbti) => {
    it(`${mbti} → analyst 역할`, () => {
      const result = analyzeGroup([{ mbti }]);
      const role = result.roles.find((r) => r.id === "analyst");
      expect(role).toBeDefined();
      expect(role!.count).toBe(1);
    });
  });

  leaderTypes.forEach((mbti) => {
    it(`${mbti} → leader 역할`, () => {
      const result = analyzeGroup([{ mbti }]);
      const role = result.roles.find((r) => r.id === "leader");
      expect(role).toBeDefined();
      expect(role!.count).toBe(1);
    });
  });

  mypaceTypes.forEach((mbti) => {
    it(`${mbti} → mypace 역할`, () => {
      const result = analyzeGroup([{ mbti }]);
      const role = result.roles.find((r) => r.id === "mypace");
      expect(role).toBeDefined();
      expect(role!.count).toBe(1);
    });
  });
});

describe("RoleEntry 구조 검증", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("각 RoleEntry에 id, emoji, name, count, effect, effects 필드가 있어야 한다", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "INTJ" },
      { mbti: "ENFJ" },
    ]);
    result.roles.forEach((role) => {
      expect(role).toHaveProperty("id");
      expect(role).toHaveProperty("emoji");
      expect(role).toHaveProperty("name");
      expect(role).toHaveProperty("count");
      expect(role).toHaveProperty("effect");
      expect(role).toHaveProperty("effects");
      expect(typeof role.id).toBe("string");
      expect(typeof role.emoji).toBe("string");
      expect(typeof role.name).toBe("string");
      expect(typeof role.count).toBe("number");
      expect(typeof role.effect).toBe("string");
      expect(Array.isArray(role.effects)).toBe(true);
      // effects는 [string[], string[], string[]] 구조
      role.effects.forEach((tier) => {
        expect(Array.isArray(tier)).toBe(true);
        tier.forEach((s) => expect(typeof s).toBe("string"));
      });
    });
  });

  it("GroupAnalysis 타입: meme + roles + summary + membersByRole 구조 확인", () => {
    const result = analyzeGroup([{ mbti: "INFP" }, { mbti: "INTJ" }]);
    expect(typeof result.meme).toBe("string");
    expect(result.meme.length).toBeGreaterThan(0);
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(result.roles)).toBe(true);
    expect(result.roles.length).toBeGreaterThan(0);
    expect(typeof result.membersByRole).toBe("object");
  });

  it("5명 그룹 테스트: count 합이 5여야 한다", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "INTJ" },
      { mbti: "ISFJ" },
      { mbti: "ENTJ" },
      { mbti: "INFP" },
    ]);
    const total = result.roles.reduce((sum, r) => sum + r.count, 0);
    expect(total).toBe(5);
  });
});

describe("밈 규칙 추가 케이스", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mypace 3명(100%) → 전원 동일 역할 밈", () => {
    const result = analyzeGroup([
      { mbti: "INFP" },
      { mbti: "INFJ" },
      { mbti: "ISFP" },
    ]);
    expect(result.meme).toBe("전원 마이페이스라 모인 의미가 흐려짐 🌌");
  });

  it("care 3명(100%) → 전원 동일 역할 밈", () => {
    const result = analyzeGroup([
      { mbti: "ENFJ" },
      { mbti: "ESFJ" },
      { mbti: "ISFJ" },
    ]);
    expect(result.meme).toBe(
      "전원 케어 담당이라 챙길 대상이 서로밖에 없음 🔄",
    );
  });

  it("leader 100% → 전원 동일 역할 밈 (ENTJ×2 + ESTJ = 3/3)", () => {
    const result = analyzeGroup([
      { mbti: "ENTJ" },
      { mbti: "ENTJ" },
      { mbti: "ESTJ" },
    ]);
    // leader=3/3=100% → leader≥40% 규칙이 먼저 매칭 (전원 leader 전용 밈은 없음)
    expect(result.meme).toBe("리더가 너무 많음 ⚔️");
  });

  it("energy≥1 AND analyst≥1 (2인) → energy≥50%가 먼저", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "INTJ" },
    ]);
    // energy=1/2=50% → energy≥50% 규칙 먼저 매칭
    expect(result.meme).toBe("이 그룹 모이면 매번 난리남 🔥");
  });

  it("energy=0 → '텐션 올릴 사람이 없음' (analyst+leader+care만)", () => {
    const result = analyzeGroup([
      { mbti: "INTJ" },
      { mbti: "ENTJ" },
      { mbti: "ENFJ" },
    ]);
    expect(result.meme).toBe("텐션 올릴 사람이 없음 📉");
  });

  it("energy+mypace≥3 & energy<50% → mypace≥50% 규칙 먼저", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "INFP" },
      { mbti: "INFJ" },
      { mbti: "INTJ" },
    ]);
    expect(result.meme).toBe("모이긴 했는데 각자 세계 🌙");
  });
});

describe("2인 전용 밈 규칙", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("energy 2인 → 2인 전용 밈", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ENTP" }]);
    expect(result.meme).toBe("둘이서 카페를 클럽으로 만드는 조합 🪩");
  });

  it("mypace 2인 → 2인 전용 밈", () => {
    const result = analyzeGroup([{ mbti: "INFP" }, { mbti: "INFJ" }]);
    expect(result.meme).toBe("둘이 만났는데 둘 다 폰 보는 중 📱📱");
  });

  it("analyst 2인 → 2인 전용 밈", () => {
    const result = analyzeGroup([{ mbti: "INTJ" }, { mbti: "INTP" }]);
    expect(result.meme).toBe("둘이서 밥집 고르는 데 40분 걸림 🧮");
  });

  it("leader 2인 → 2인 전용 밈", () => {
    const result = analyzeGroup([{ mbti: "ENTJ" }, { mbti: "ESTJ" }]);
    expect(result.meme).toBe("2인인데 주도권 싸움 발생 ⚔️");
  });

  it("care 2인 → 2인 전용 밈", () => {
    const result = analyzeGroup([{ mbti: "ESFJ" }, { mbti: "ENFJ" }]);
    expect(result.meme).toBe(
      "서로 밥 먹었냐고 물어보느라 정작 밥을 못 먹음 🍚🍚",
    );
  });
});

describe("summary 생성", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("avgScore=95 → 높은 점수 summary", () => {
    const result = analyzeGroup(
      [{ mbti: "ENFP" }, { mbti: "ENFJ" }],
      undefined,
      95,
    );
    expect(result.summary).toContain("전생에 한솥밥");
  });

  it("avgScore=25 → 낮은 점수 summary", () => {
    const result = analyzeGroup(
      [{ mbti: "ENFP" }, { mbti: "INTJ" }],
      undefined,
      25,
    );
    expect(result.summary).toContain("기적적으로 모인 조합");
  });

  it("avgScore 없이 호출 → 역할 기반 summary", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ENFJ" }]);
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it("energy+care → '시끄러운데 따뜻함' 계열 summary", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "ENFJ" },
      { mbti: "ESFJ" },
    ]);
    expect(result.summary).toContain("시끄러운데 따뜻함");
  });
});

describe("membersByRole 생성", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("name이 있는 멤버 → 역할별로 분류됨", () => {
    const result = analyzeGroup([
      { mbti: "ENFP", name: "철수" },
      { mbti: "INTJ", name: "영희" },
      { mbti: "ENFJ", name: "민수" },
    ]);
    expect(result.membersByRole.energy).toEqual(["철수"]);
    expect(result.membersByRole.analyst).toEqual(["영희"]);
    expect(result.membersByRole.care).toEqual(["민수"]);
  });

  it("name이 없는 멤버 → membersByRole에 포함되지 않음", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "INTJ" }]);
    expect(result.membersByRole.energy).toBeUndefined();
    expect(result.membersByRole.analyst).toBeUndefined();
  });

  it("같은 역할에 여러 멤버 → 배열에 모두 포함", () => {
    const result = analyzeGroup([
      { mbti: "ENFP", name: "A" },
      { mbti: "ENTP", name: "B" },
      { mbti: "ESFP", name: "C" },
    ]);
    expect(result.membersByRole.energy).toEqual(["A", "B", "C"]);
  });
});

describe("효과 캐시 동작", () => {
  it("같은 (roleId, count) 두 번 호출 → 동일 effect 반환", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const first = analyzeGroup([{ mbti: "ENFP" }]);
    const firstEffect = first.roles.find((r) => r.id === "energy")!.effect;

    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const second = analyzeGroup([{ mbti: "ENTP" }]);
    const secondEffect = second.roles.find((r) => r.id === "energy")!.effect;

    expect(firstEffect).toBe(secondEffect);
  });
});

describe("missingRoles & suggestions", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ENFP 1명(energy만) → 나머지 4개 역할이 missingRoles에 포함", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }]);
    expect(result.missingRoles).toHaveLength(4);
    expect(result.missingRoles).toContain("care");
    expect(result.missingRoles).toContain("analyst");
    expect(result.missingRoles).toContain("leader");
    expect(result.missingRoles).toContain("mypace");
  });

  it("5개 역할 모두 존재하면 missingRoles와 suggestions 모두 빈 배열", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },   // energy
      { mbti: "ENFJ" },   // care
      { mbti: "INTJ" },   // analyst
      { mbti: "ENTJ" },   // leader
      { mbti: "INFP" },   // mypace
    ]);
    expect(result.missingRoles).toHaveLength(0);
    expect(result.suggestions).toHaveLength(0);
  });

  it("energy, care만 있으면 analyst, leader, mypace가 missingRoles", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ISFJ" }]);
    expect(result.missingRoles).toContain("analyst");
    expect(result.missingRoles).toContain("leader");
    expect(result.missingRoles).toContain("mypace");
    expect(result.missingRoles).not.toContain("energy");
    expect(result.missingRoles).not.toContain("care");
  });

  it("suggestions 길이가 missingRoles 길이와 동일", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ISFJ" }]);
    expect(result.suggestions).toHaveLength(result.missingRoles.length);
  });

  it("energy 없을 때 suggestions에 텐션 담당 제안 문구 포함", () => {
    // INTJ(analyst)만 → energy 없음
    const result = analyzeGroup([{ mbti: "INTJ" }]);
    const energySuggestion = result.suggestions.find((s) =>
      s.includes("텐션 담당"),
    );
    expect(energySuggestion).toBeDefined();
    expect(energySuggestion).toContain("ENFP");
  });

  it("leader 없을 때 suggestions에 진행 담당 제안 문구 포함", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }, { mbti: "ISFJ" }]);
    const leaderSuggestion = result.suggestions.find((s) =>
      s.includes("진행 담당"),
    );
    expect(leaderSuggestion).toBeDefined();
    expect(leaderSuggestion).toContain("ENTJ");
  });

  it("suggestions의 각 항목은 비어있지 않은 문자열", () => {
    const result = analyzeGroup([{ mbti: "ENFP" }]);
    result.suggestions.forEach((s) => {
      expect(typeof s).toBe("string");
      expect(s.length).toBeGreaterThan(0);
    });
  });
});

describe("balanceScore", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("5개 역할 균등(각 1명) → balanceScore = 100", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },   // energy
      { mbti: "ENFJ" },   // care
      { mbti: "INTJ" },   // analyst
      { mbti: "ENTJ" },   // leader
      { mbti: "INFP" },   // mypace
    ]);
    expect(result.balanceScore).toBe(100);
  });

  it("한 역할에 완전 집중(energy 5명) → balanceScore가 낮아야 함", () => {
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "ENTP" },
      { mbti: "ESFP" },
      { mbti: "ESTP" },
      { mbti: "ENFP" },
    ]);
    expect(result.balanceScore).toBeLessThan(20);
  });

  it("balanceScore는 0 이상 100 이하", () => {
    const cases = [
      [{ mbti: "ENFP" as const }],
      [{ mbti: "ENFP" as const }, { mbti: "INTJ" as const }],
      [
        { mbti: "ENFP" as const },
        { mbti: "ENFJ" as const },
        { mbti: "INTJ" as const },
        { mbti: "ENTJ" as const },
        { mbti: "INFP" as const },
      ],
    ];
    cases.forEach((members) => {
      const result = analyzeGroup(members);
      expect(result.balanceScore).toBeGreaterThanOrEqual(0);
      expect(result.balanceScore).toBeLessThanOrEqual(100);
    });
  });
});

describe("memberStats / popularMember / uniqueMember", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const pairScores = [
    { a: "철수", b: "영희", score: 80 },
    { a: "철수", b: "민수", score: 40 },
    { a: "영희", b: "민수", score: 60 },
  ];

  it("pairScores 없이 호출 → memberStats/popularMember/uniqueMember 모두 undefined", () => {
    const result = analyzeGroup([
      { mbti: "ENFP", name: "철수" },
      { mbti: "INTJ", name: "영희" },
    ]);
    expect(result.memberStats).toBeUndefined();
    expect(result.popularMember).toBeUndefined();
    expect(result.uniqueMember).toBeUndefined();
  });

  it("pairScores 제공 → memberStats에 각 멤버 통계 포함", () => {
    const result = analyzeGroup(
      [
        { mbti: "ENFP", name: "철수" },
        { mbti: "INTJ", name: "영희" },
        { mbti: "ENFJ", name: "민수" },
      ],
      pairScores,
    );
    expect(result.memberStats).toHaveLength(3);
    const 철수 = result.memberStats!.find((m) => m.name === "철수")!;
    expect(철수.avgScore).toBe(60); // (80+40)/2
    expect(철수.bestPartner).toBe("영희");
    expect(철수.worstPartner).toBe("민수");
  });

  it("popularMember → avgScore 가장 높은 멤버", () => {
    const result = analyzeGroup(
      [
        { mbti: "ENFP", name: "철수" },
        { mbti: "INTJ", name: "영희" },
        { mbti: "ENFJ", name: "민수" },
      ],
      pairScores,
    );
    // 영희: (80+60)/2 = 70, 철수: (80+40)/2 = 60, 민수: (40+60)/2 = 50
    expect(result.popularMember).toBe("영희");
  });

  it("uniqueMember → avgScore 가장 낮은 멤버", () => {
    const result = analyzeGroup(
      [
        { mbti: "ENFP", name: "철수" },
        { mbti: "INTJ", name: "영희" },
        { mbti: "ENFJ", name: "민수" },
      ],
      pairScores,
    );
    expect(result.uniqueMember).toBe("민수");
  });

  it("이름 없는 멤버는 memberStats에 포함되지 않음", () => {
    const result = analyzeGroup(
      [
        { mbti: "ENFP", name: "철수" },
        { mbti: "INTJ" }, // 이름 없음
      ],
      [{ a: "철수", b: "영희", score: 70 }],
    );
    expect(result.memberStats).toBeUndefined(); // 이름 있는 멤버가 1명뿐 → 2명 미만
  });
});

describe("care+mypace, leader+mypace 밈 규칙", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("care+mypace 조합 → care+mypace 밈 매칭", () => {
    // ENFP(energy=1) + ISFJ(care=1) + INFP(mypace=1): 각 33%로 비율 규칙 미해당
    // energy+mypace 규칙(energy+mypace>=3 조건 미충족) 이후 care+mypace 규칙 매칭
    const result = analyzeGroup([
      { mbti: "ENFP" },
      { mbti: "ISFJ" },
      { mbti: "INFP" },
    ]);
    expect(result.meme).toBe("챙겨주려는데 상대가 혼자 있고 싶어함 🫶🌙");
  });

  it("leader+mypace 조합 → leader+mypace 밈 매칭", () => {
    // ENTJ(leader=1) + ENFP(energy=1) + ISFP(mypace=1): 각 33%로 비율 규칙 미해당
    // energy+mypace(energy+mypace=2<3 미충족), energy+analyst(analyst=0 미충족) 이후 leader+mypace 매칭
    const result = analyzeGroup([
      { mbti: "ENTJ" },
      { mbti: "ENFP" },
      { mbti: "ISFP" },
    ]);
    expect(result.meme).toBe("리더가 이끄는데 따르는 사람이 사라짐 🎯👻");
  });
});
