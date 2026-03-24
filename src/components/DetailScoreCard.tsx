/**
 * 세부 궁합 카드 — 테마 카드 컨테이너 + 바 게이지
 *
 * 두 가지 모드로 사용 가능:
 * 1. **categories 모드** — CategoryItem 배열을 ScoreBar로 자동 렌더링
 * 2. **children 모드** — 카드 컨테이너만 제공하고 내부 콘텐츠는 외부에서 주입
 *
 * 궁합 맵(MbtiGrid)의 순위 리스트, 연인 궁합(CoupleResult)의 세부 점수 등에서 공유한다.
 */
"use client";

import { ReactNode } from "react";
import ScoreBar from "./ScoreBar";
import { TITLE3, titleProps } from "@/styles/titles";
import { COUPLE } from "@/data/ui-text";

export type CategoryItem = {
  label: string;
  emoji: string;
  score: number;
  comment: string;
};

type Props = {
  /** ScoreBar로 자동 렌더링할 카테고리 배열 (children과 택일) */
  categories?: CategoryItem[];
  /** 카드 내부에 직접 삽입할 콘텐츠 (categories와 택일) */
  children?: ReactNode;
  /** 카드 테마 RGB (기본: 핑크 "236,72,153") */
  themeRgb?: string;
  /** 타이틀 (기본: "💞 세부 궁합") */
  title?: string;
};

export default function DetailScoreCard({
  categories,
  children,
  themeRgb = "236,72,153",
  title = COUPLE.detailScoreTitle,
}: Props) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: `rgba(${themeRgb},0.04)`,
        border: `1px solid rgba(${themeRgb},0.12)`,
      }}
    >
      <p {...titleProps(TITLE3, `rgba(${themeRgb},0.85)`, themeRgb)}>
        {title}
      </p>
      {categories
        ? categories.map((cat, i) => (
            <ScoreBar
              key={cat.label}
              emoji={cat.emoji}
              label={cat.label}
              score={cat.score}
              comment={cat.comment}
              animationDelay={0.3 + i * 0.2}
            />
          ))
        : children}
    </div>
  );
}
