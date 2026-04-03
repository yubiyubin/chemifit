/**
 * 그룹 궁합 멤버 입력/관리 컴포넌트
 *
 * 역할:
 * - 이모지 아바타 선택 (DropdownPicker)
 * - MBTI 드롭다운 선택 (DropdownPicker)
 * - 멤버 추가 (2~8명 제한)
 * - 추가된 멤버를 태그 형태로 표시, 클릭 시 삭제
 *
 * 이모지 선택 시 해당 동물의 랜덤 이름이 자동 생성됨 (avatars.ts 참조).
 * 같은 이모지를 여러 번 선택하면 이름 풀에서 순차적으로 다른 이름이 나옴.
 */
"use client";

import { useState } from "react";
import { MBTI_TYPES, MbtiType, Member } from "@/data/compatibility";
import { EMOJI_AVATARS, EMOJI_NAMES } from "@/features/group-match/consts/avatars";
import DropdownPicker from "./DropdownPicker";
import { MEMBER_INPUT } from "@/data/ui-text";
import { SYMBOLS } from "@/data/symbols";
import { CYAN_RGB } from "@/styles/card-themes";

/** 같은 이모지의 멤버가 여러 명일 때 이름 풀에서 다음 이름 선택 */
function getNextName(emoji: string, members: Member[]): string {
  const names = EMOJI_NAMES[emoji] ?? ["이름없음"];
  const usedCount = members.filter((m) => m.emoji === emoji).length;
  return names[usedCount % names.length];
}

type Props = {
  members: Member[];
  onChange: (members: Member[]) => void;
};

const MAX_MEMBERS = MEMBER_INPUT.maxMembers;
const MIN_MEMBERS = MEMBER_INPUT.minMembers;

export default function MemberInput({ members, onChange }: Props) {
  const [name, setName] = useState("");
  const [mbti, setMbti] = useState<MbtiType>("INFP");
  const [emoji, setEmoji] = useState("🐶");

  function handleAdd() {
    if (members.length >= MAX_MEMBERS) return;
    const finalName = name.trim() || getNextName(emoji, members);
    onChange([...members, { name: finalName, mbti, emoji }]);
    setName("");
    setEmoji(EMOJI_AVATARS[members.length + 1] ?? "🐶");
  }

  function handleRemove(index: number) {
    onChange(members.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center w-full max-w-full">
        {/* 이모지 선택 */}
        <DropdownPicker
          value={emoji}
          options={EMOJI_AVATARS}
          onChange={setEmoji}
          columns={4}
          renderOption={(e) => <span className="text-xl">{e}</span>}
        />

        {/* 이름 입력 */}
        <input
          data-testid="member-name-input"
          type="text"
          placeholder={MEMBER_INPUT.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          maxLength={10}
          className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-blue-400 h-12 text-sm md:text-base"
        />

        {/* MBTI 선택 — 네이티브 select, 외형만 neon-btn 통일 */}
        <div className="relative">
          <select
            value={mbti}
            onChange={(e) => setMbti(e.target.value as MbtiType)}
            className="neon-btn h-12 w-[76px] rounded-xl text-sm font-bold text-center ml-3 appearance-none cursor-pointer px-4"
            style={{ "--neon": CYAN_RGB, borderColor: "rgba(0,203,255,0.45)", textAlignLast: "center" } as React.CSSProperties}
          >
            {MBTI_TYPES.map((type) => (
              <option
                key={type}
                value={type}
                className="bg-gray-900 text-white"
              >
                {type}
              </option>
            ))}
          </select>
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40 pointer-events-none">
            {SYMBOLS.dropdown}
          </span>
        </div>

        {/* 추가 버튼 */}
        <button
          data-testid="member-add-btn"
          onClick={handleAdd}
          disabled={members.length >= MAX_MEMBERS}
          className="neon-btn-active px-4 h-12 rounded-lg text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ "--neon": CYAN_RGB } as React.CSSProperties}
        >
          {MEMBER_INPUT.addButton}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map((member, i) => (
          <div
            key={i}
            data-testid={`member-tag-${i}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm"
            style={{
              background:
                i === 0 ? "rgba(0,203,255,0.15)" : "rgba(255,255,255,0.1)",
              border:
                i === 0
                  ? "1px solid rgba(0,203,255,0.45)"
                  : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span>{member.emoji}</span>
            <span>{member.name}</span>
            <span className="text-cyan-300 font-bold">{member.mbti}</span>
            <button
              data-testid={`member-remove-${i}`}
              onClick={() => handleRemove(i)}
              className="text-white/40 hover:text-red-400 ml-1 border-none bg-transparent transition-colors duration-200"
            >
              {SYMBOLS.close}
            </button>
          </div>
        ))}
      </div>

      <p data-testid="member-count" className="text-white/40 text-sm">
        {members.length}/{MAX_MEMBERS}{MEMBER_INPUT.countSuffix}
        {members.length < MIN_MEMBERS && ` — ${MEMBER_INPUT.minWarning}`}
      </p>
    </div>
  );
}
