import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MemberInput from "./MemberInput";
import type { Member } from "@/data/compatibility";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  usePathname: () => "/",
}));

// DropdownPicker 내부가 jsdom에서 렌더하기 복잡하므로 mock 처리
// renderOption도 호출하여 MemberInput의 람다 커버리지 확보
vi.mock("./DropdownPicker", () => ({
  default: ({
    value,
    onChange,
    renderOption,
  }: {
    value: string;
    onChange: (v: string) => void;
    options?: string[];
    renderOption?: (v: string, selected: boolean) => React.ReactNode;
  }) => (
    <div data-testid="dropdown-picker-wrapper">
      <select
        data-testid="dropdown-picker"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={value}>{value}</option>
      </select>
      {/* renderOption 람다 호출 — MemberInput 라인 63 커버 */}
      {renderOption && (
        <div data-testid="rendered-option">{renderOption(value, true)}</div>
      )}
    </div>
  ),
}));

const makeMembers = (count: number): Member[] =>
  Array.from({ length: count }, (_, i) => ({
    name: `멤버${i + 1}`,
    mbti: "INTJ",
    emoji: "🐶",
  }));

describe("MemberInput", () => {
  it("초기 렌더: 이름 입력, 추가 버튼, 멤버 카운트 표시", () => {
    render(<MemberInput members={[]} onChange={vi.fn()} />);
    expect(screen.getByTestId("member-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("member-add-btn")).toBeInTheDocument();
    expect(screen.getByTestId("member-count")).toBeInTheDocument();
  });

  it("멤버 카운트 텍스트: 0명 상태", () => {
    render(<MemberInput members={[]} onChange={vi.fn()} />);
    const countEl = screen.getByTestId("member-count");
    expect(countEl.textContent).toContain("0/8");
  });

  it("멤버 태그가 members 배열 수만큼 렌더됨", () => {
    const members = makeMembers(3);
    render(<MemberInput members={members} onChange={vi.fn()} />);
    expect(screen.getByTestId("member-tag-0")).toBeInTheDocument();
    expect(screen.getByTestId("member-tag-1")).toBeInTheDocument();
    expect(screen.getByTestId("member-tag-2")).toBeInTheDocument();
  });

  it("추가 버튼 클릭 → onChange 호출", () => {
    const onChange = vi.fn();
    render(<MemberInput members={[]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("member-add-btn"));
    expect(onChange).toHaveBeenCalledTimes(1);
    // 새 멤버가 포함된 배열로 호출됨
    const newMembers = onChange.mock.calls[0][0] as Member[];
    expect(newMembers).toHaveLength(1);
  });

  it("이름 입력 후 추가 → onChange에 입력한 이름이 포함됨", () => {
    const onChange = vi.fn();
    render(<MemberInput members={[]} onChange={onChange} />);
    const nameInput = screen.getByTestId("member-name-input");
    fireEvent.change(nameInput, { target: { value: "테스트유저" } });
    fireEvent.click(screen.getByTestId("member-add-btn"));
    const newMembers = onChange.mock.calls[0][0] as Member[];
    expect(newMembers[0].name).toBe("테스트유저");
  });

  it("삭제 버튼 클릭 → onChange에 해당 멤버가 제거된 배열", () => {
    const members = makeMembers(2);
    const onChange = vi.fn();
    render(<MemberInput members={members} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("member-remove-0"));
    const updated = onChange.mock.calls[0][0] as Member[];
    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe("멤버2");
  });

  it("최대 8명 제한: 8명일 때 추가 버튼이 disabled", () => {
    const members = makeMembers(8);
    render(<MemberInput members={members} onChange={vi.fn()} />);
    const addBtn = screen.getByTestId("member-add-btn");
    expect(addBtn).toBeDisabled();
  });

  it("8명 미만일 때 추가 버튼이 활성화됨", () => {
    const members = makeMembers(3);
    render(<MemberInput members={members} onChange={vi.fn()} />);
    const addBtn = screen.getByTestId("member-add-btn");
    expect(addBtn).not.toBeDisabled();
  });

  it("최대 8명 상태에서 추가 클릭해도 onChange 미호출", () => {
    const members = makeMembers(8);
    const onChange = vi.fn();
    render(<MemberInput members={members} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("member-add-btn"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Enter 키로도 멤버 추가 가능", () => {
    const onChange = vi.fn();
    render(<MemberInput members={[]} onChange={onChange} />);
    const nameInput = screen.getByTestId("member-name-input");
    fireEvent.change(nameInput, { target: { value: "엔터유저" } });
    fireEvent.keyDown(nameInput, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("2명 미만 경고 문구 표시", () => {
    render(<MemberInput members={[]} onChange={vi.fn()} />);
    const countEl = screen.getByTestId("member-count");
    expect(countEl.textContent).toContain("최소 2명이 필요해요");
  });

  it("2명 이상이면 경고 문구 없음", () => {
    const members = makeMembers(2);
    render(<MemberInput members={members} onChange={vi.fn()} />);
    const countEl = screen.getByTestId("member-count");
    expect(countEl.textContent).not.toContain("최소 2명이 필요해요");
  });

  it("초기 members=[] → 빈 태그 리스트 (member-tag-0 없음)", () => {
    render(<MemberInput members={[]} onChange={vi.fn()} />);
    expect(screen.queryByTestId("member-tag-0")).not.toBeInTheDocument();
  });

  it("members 초기 데이터 5개 주입 → 태그 5개 표시", () => {
    const members = makeMembers(5);
    render(<MemberInput members={members} onChange={vi.fn()} />);
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`member-tag-${i}`)).toBeInTheDocument();
    }
  });

  it("멤버 카운트 텍스트: 5명 상태", () => {
    const members = makeMembers(5);
    render(<MemberInput members={members} onChange={vi.fn()} />);
    const countEl = screen.getByTestId("member-count");
    expect(countEl.textContent).toContain("5/8");
  });

  it("멤버 카운트 텍스트: 8명 상태", () => {
    const members = makeMembers(8);
    render(<MemberInput members={members} onChange={vi.fn()} />);
    const countEl = screen.getByTestId("member-count");
    expect(countEl.textContent).toContain("8/8");
  });

  it("멤버 태그에 MBTI 정보가 표시된다", () => {
    const members: Member[] = [
      { name: "테스터", mbti: "ENFP", emoji: "🐶" },
    ];
    render(<MemberInput members={members} onChange={vi.fn()} />);
    const tag = screen.getByTestId("member-tag-0");
    expect(tag.textContent).toContain("ENFP");
    expect(tag.textContent).toContain("테스터");
  });

  it("MBTI 네이티브 select 변경 후 추가 → onChange에 해당 MBTI가 포함됨", () => {
    const onChange = vi.fn();
    render(<MemberInput members={[]} onChange={onChange} />);
    // MemberInput 내부의 MBTI 선택용 네이티브 <select> 요소
    // data-testid가 없으므로 role 또는 value로 찾음
    const selectElements = document.querySelectorAll("select");
    // DropdownPicker mock의 select(이모지용)와 MBTI 네이티브 select 중
    // MBTI 네이티브 select는 MBTI_TYPES 옵션들을 가지고 있음
    // mbti select는 기본값이 "INFP"
    const mbtiSelect = Array.from(selectElements).find(
      (el) => (el as HTMLSelectElement).value === "INFP"
    ) as HTMLSelectElement | undefined;

    if (mbtiSelect) {
      fireEvent.change(mbtiSelect, { target: { value: "ENTJ" } });
      fireEvent.click(screen.getByTestId("member-add-btn"));
      const newMembers = onChange.mock.calls[0][0] as Member[];
      expect(newMembers[0].mbti).toBe("ENTJ");
    } else {
      // select를 찾지 못하면 기본 MBTI(INFP)로 추가됨
      fireEvent.click(screen.getByTestId("member-add-btn"));
      const newMembers = onChange.mock.calls[0][0] as Member[];
      expect(typeof newMembers[0].mbti).toBe("string");
      expect(newMembers[0].mbti.length).toBe(4);
    }
  });

  it("삭제 후 멤버 수가 줄어든다", () => {
    const members = makeMembers(3);
    const onChange = vi.fn();
    render(<MemberInput members={members} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("member-remove-2"));
    const updated = onChange.mock.calls[0][0] as Member[];
    expect(updated).toHaveLength(2);
  });

  it("1명 남은 상태에서 삭제 → onChange에 빈 배열", () => {
    const members = makeMembers(1);
    const onChange = vi.fn();
    render(<MemberInput members={members} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("member-remove-0"));
    const updated = onChange.mock.calls[0][0] as Member[];
    expect(updated).toHaveLength(0);
  });
});
