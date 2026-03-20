/**
 * 그룹 궁합 멤버 입력/관리 컴포넌트
 *
 * 역할:
 * - 이모지 아바타 선택 (8종 동물)
 * - MBTI 드롭다운 선택
 * - 멤버 추가 (2~8명 제한)
 * - 추가된 멤버를 태그 형태로 표시, 클릭 시 삭제
 *
 * 이모지 선택 시 해당 동물의 랜덤 이름이 자동 생성됨 (avatars.ts 참조).
 * 같은 이모지를 여러 번 선택하면 이름 풀에서 순차적으로 다른 이름이 나옴.
 */
"use client";

import { useState } from "react";
import { MBTI_TYPES, MbtiType, Member } from "@/data/compatibility";
import { EMOJI_AVATARS, EMOJI_NAMES } from "@/data/avatars";

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

const MAX_MEMBERS = 8;
const MIN_MEMBERS = 2;

export default function MemberInput({ members, onChange }: Props) {
  const [name, setName] = useState("");
  const [mbti, setMbti] = useState<MbtiType>("INFP");
  const [emoji, setEmoji] = useState("🐶");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
      <div className="flex flex-wrap gap-2 items-center w-full max-w-full overflow-hidden">
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="neon-btn w-12 h-12 rounded-xl text-2xl flex items-center justify-center"
            style={{ "--neon": "168,85,247" } as React.CSSProperties}
          >
            {emoji}
            <span className="text-[10px] text-white/40 ml-0.5">▼</span>
          </button>
          {showEmojiPicker && (
            <div
              className="absolute top-14 left-0 z-30 p-3 rounded-xl bg-gray-900 border border-white/20 grid grid-cols-4 gap-2"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                minWidth: "200px",
              }}
            >
              {EMOJI_AVATARS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEmoji(e);
                    setShowEmojiPicker(false);
                  }}
                  className="neon-btn w-11 h-11 rounded-lg text-xl flex items-center justify-center"
                  style={{ "--neon": "168,85,247" } as React.CSSProperties}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="이름 입력 (비우면 랜덤)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          maxLength={10}
          className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-purple-400 h-12"
        />

        <select
          value={mbti}
          onChange={(e) => setMbti(e.target.value as MbtiType)}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-purple-400 h-12"
        >
          {MBTI_TYPES.map((type) => (
            <option key={type} value={type} className="bg-gray-900">
              {type}
            </option>
          ))}
        </select>

        <button
          onClick={handleAdd}
          disabled={members.length >= MAX_MEMBERS}
          className="neon-btn-active px-4 h-12 rounded-lg text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ "--neon": "168,85,247" } as React.CSSProperties}
        >
          추가
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map((member, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm"
            style={{
              background:
                i === 0 ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.1)",
              border:
                i === 0
                  ? "1px solid rgba(168,85,247,0.4)"
                  : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span>{member.emoji}</span>
            <span>{member.name}</span>
            <span className="text-purple-400 font-bold">{member.mbti}</span>
            <button
              onClick={() => handleRemove(i)}
              className="neon-ghost text-white/40 hover:text-red-400 ml-1 border-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <p className="text-white/40 text-sm">
        {members.length}/{MAX_MEMBERS}명 입력됨
        {members.length < MIN_MEMBERS && " — 최소 2명이 필요해요"}
      </p>
    </div>
  );
}
