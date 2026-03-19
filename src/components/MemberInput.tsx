"use client";

import { useState } from "react";
import { MBTI_TYPES, MbtiType, Member } from "@/data/compatibility";
import { EMOJI_AVATARS, EMOJI_NAMES } from "@/data/avatars";

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
            className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-2xl hover:border-purple-400 transition-colors flex items-center justify-center"
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
                  className="w-11 h-11 rounded-lg text-xl hover:bg-white/10 transition-colors flex items-center justify-center"
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
          className="px-4 h-12 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-colors"
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
              className="text-white/40 hover:text-red-400 transition-colors ml-1"
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
