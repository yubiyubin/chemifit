/**
 * CoupleResult / StaticCoupleResult 공용 하위 컴포넌트
 *
 * InfoLine: MBTI 뱃지 패턴 파싱 + 텍스트 렌더링
 * InfoCard: 싸움 패턴 / 해결 핵심 테마 카드
 * decorateBullets: detail 본문의 `•` 불릿을 이모지로 치환
 */

import { TITLE3, titleProps } from "@/styles/titles";
import type { CardTheme } from "@/styles/card-themes";
import { SECTION_EMOJIS, LINE_EMOJIS, DEFAULT_BULLET_EMOJI } from "@/features/mbti-love/consts/detail-emojis";

// ─────────────────────────────────────────────
// InfoLine
// ─────────────────────────────────────────────

type InfoLineProps = {
  line: string;
  themeRgb: string;
  /** MBTI 텍스트 및 → 줄에 적용할 색상 (미지정 시 rgba(themeRgb,0.9)) */
  titleColor?: string;
  myMbti?: string;
  partnerMbti?: string;
  /** MBTI 텍스트 뒤에 붙일 접미사 (예: "에게") */
  mbtiSuffix?: string;
};

/**
 * "ENFP: 텍스트" 형식의 줄을 뱃지 + 텍스트로 파싱.
 * "→ 요약" 형식은 화살표 요약 라인으로 처리.
 * myMbti/partnerMbti가 주어지면 해당 뱃지 색상을 히어로 카드와 일치시킨다.
 */
export function InfoLine({
  line,
  themeRgb,
  titleColor,
  myMbti,
  partnerMbti,
  mbtiSuffix,
}: InfoLineProps) {
  const mbtiMatch = line.match(/^([A-Z]{4}):\s*(.+)$/);
  if (mbtiMatch) {
    const [, mbti, text] = mbtiMatch;
    const isMyMbti = mbti === myMbti;
    const mbtiColor = isMyMbti
      ? (titleColor ?? `rgba(${themeRgb},0.95)`)
      : mbti === partnerMbti
        ? `color-mix(in srgb, rgb(${themeRgb}) 62%, white)`
        : (titleColor ?? `rgba(${themeRgb},0.95)`);
    const mbtiGlow = isMyMbti
      ? `0 0 8px rgba(${themeRgb},0.7)`
      : `0 0 8px rgba(${themeRgb},0.35)`;
    return (
      <p className="text-sm sm:text-base leading-relaxed">
        <span className="font-black mr-2" style={{ color: mbtiColor, textShadow: mbtiGlow }}>{mbti}{mbtiSuffix}</span>
        <span className="font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>{text}</span>
      </p>
    );
  }
  if (line.startsWith("→")) {
    const arrowColor = titleColor ?? `rgba(${themeRgb},0.9)`;
    return (
      <div className="flex flex-col gap-2 pt-1">
        <div style={{ height: 1, background: `rgba(${themeRgb},0.15)` }} />
        <p {...titleProps(TITLE3, arrowColor, themeRgb)}>{line}</p>
      </div>
    );
  }
  return (
    <p className="text-sm sm:text-base leading-relaxed font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>
      {line}
    </p>
  );
}

// ─────────────────────────────────────────────
// InfoCard
// ─────────────────────────────────────────────

type InfoCardProps = {
  theme: CardTheme;
  title: string;
  body: string;
  myMbti?: string;
  partnerMbti?: string;
  mbtiSuffix?: string;
};

/** 싸움 패턴 / 해결 핵심용 테마 카드 */
export function InfoCard({
  theme,
  title,
  body,
  myMbti,
  partnerMbti,
  mbtiSuffix,
}: InfoCardProps) {
  const lines = body.split("\n").filter((l) => l.trim());
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2.5"
      style={{
        background: `rgba(${theme.rgb},${theme.bgAlpha})`,
        border: `1px solid rgba(${theme.rgb},${theme.borderAlpha})`,
        boxShadow: `0 0 20px rgba(${theme.rgb},${theme.shadowAlpha})`,
      }}
    >
      <p {...titleProps(TITLE3, theme.title, theme.titleGlowRgb)}>{title}</p>
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <InfoLine
            key={i}
            line={line}
            themeRgb={theme.rgb}
            titleColor={theme.title}
            myMbti={myMbti}
            partnerMbti={partnerMbti}
            mbtiSuffix={mbtiSuffix}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// decorateBullets
// ─────────────────────────────────────────────

/**
 * detail 본문의 `•` 불릿을 섹션·키워드에 맞는 이모티콘으로 치환한다.
 */
export function decorateBullets(body: string, heading: string): string {
  const sectionEntry = SECTION_EMOJIS.find((s) => heading.includes(s.keyword));
  const sectionEmoji = sectionEntry?.emoji ?? DEFAULT_BULLET_EMOJI;

  return body.replace(/^• (.+)/gm, (_match, content: string) => {
    const line = content.trim();
    const lineEntry = LINE_EMOJIS.find((e) => e.pattern.test(line));
    const emoji = lineEntry?.emoji ?? sectionEmoji;
    return `${emoji} ${content}`;
  });
}
