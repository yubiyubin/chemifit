/**
 * @file GroupGrid.tsx
 * @description 그룹 궁합 네트워크 시각화 + 분석 컴포넌트
 *
 * 2~8명 멤버 간 모든 쌍(pair)의 MBTI 궁합 점수를 시각적으로 표시한다.
 * Canvas 렌더링·애니메이션·마우스 이벤트는 NetworkGraph에 위임하고,
 * 이 컴포넌트는 노드 배치·스타일·요약 카드·팝업을 관리한다.
 *
 * 주요 기능:
 * - 중앙 노드(나) + 주변 노드(다른 멤버)의 원형 레이아웃
 * - 궁합 점수에 따라 선 두께·색상·노드 크기가 동적으로 변함
 * - 평균/최고/최저 궁합 하이라이트 요약 카드
 * - 노드 추가/제거 시 부드러운 보간(interpolation) 애니메이션
 */
"use client";

import { useState, useCallback, useMemo, useRef } from "react";

import { useRouter } from "next/navigation";
import {
  Member,
  getScore,
  type MbtiType,
} from "@/data/compatibility";
import CompatCard from "@/components/CompatCard";
import ScoreBar from "@/components/ScoreBar";
import { getCoupleTier } from "@/data/labels";
import { TITLE1, titleProps } from "@/styles/titles";
import {
  analyzeGroup,
  type PairScore,
} from "@/features/group-match/utils/group-roles";
import { hslToRgb } from "@/data/colors";
import { computeGroupLayout } from "@/lib/layout";
import BatteryGaugeLarge from "./BatteryGaugeLarge";
import NetworkGraph, { type GraphNode } from "@/components/NetworkGraph";
import { applyNodeHover } from "@/lib/node-styles";
import ScoreDetailPopup from "@/components/ScoreDetailPopup";
import {
  DUMMY_CENTER,
  DUMMY_NODES,
  DUMMY_BEST,
  DUMMY_WORST,
  DUMMY_AVG,
} from "@/features/group-match/consts/dummy-preview";
import { GROUP, EMOJIS, CTA_TEXTS, MBTI_MAP } from "@/data/ui-text";
import CtaButton from "@/components/CtaButton";
import { SYMBOLS } from "@/data/symbols";
import { VARIANT_CONFIG, CYAN_RGB, PURPLE_RGB } from "@/styles/card-themes";
import SharePanel from "@/components/SharePanel";
import GroupShareImage from "@/components/GroupShareImage";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import MbtiProfileModal from "@/components/MbtiProfileModal";
import NeonCard from "@/components/NeonCard";
import { useShareImageCapture } from "@/hooks/useShareImageCapture";
import { OFFSCREEN_CAPTURE_STYLE } from "@/styles/capture";

/** 컴포넌트 Props: 그룹에 포함된 멤버 배열 (첫 번째 멤버가 '나') */
type Props = { members: Member[] };


/** 팝업에 표시할 궁합 상세 데이터 */
type PopupData = { mA: Member; mB: Member; score: number } | null;

// ─────────────────────────────────────────────
// 상수: 점수 구간별 이모지·라벨 매핑 테이블
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────

export default function GroupGrid({ members }: Props) {
  const [popup, setPopup] = useState<PopupData>(null);
  const [profileType, setProfileType] = useState<MbtiType | null>(null); // 중앙 노드 클릭 시 프로필 모달
  const [showHint, setShowHint] = useState(false);
  const hintShownRef = useRef(false); // 힌트는 최초 1회만 표시
  const [roleOpen, setRoleOpen] = useState(false);
  const [allPairsOpen, setAllPairsOpen] = useState(false);
  const groupCardRef = useRef<HTMLDivElement>(null);

  const { handleSaveImage, previewOpen, previewUrl, handleClose } = useShareImageCapture(
    groupCardRef,
    { content: "group", member_count: String(members.length) },
  );

  const [summary, setSummary] = useState<{
    avg: number;
    best: { mA: Member; mB: Member; score: number };
    worst: { mA: Member; mB: Member; score: number };
    pairs: { mA: Member; mB: Member; score: number }[];
  } | null>(null);
  const router = useRouter();
  const popupTier = popup ? getCoupleTier(popup.score) : null;

  /** 모든 멤버 쌍의 궁합 점수 — members에서 직접 계산 (animation 불필요) */
  const pairScores = useMemo<PairScore[]>(() => {
    if (members.length < 2) return [];
    const result: PairScore[] = [];
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        result.push({
          a: members[i].name,
          b: members[j].name,
          score: getScore(members[i].mbti, members[j].mbti),
        });
      }
    }
    return result;
  }, [members]);

  const avgFromPairs = useMemo(() => {
    if (!pairScores.length) return undefined;
    return Math.round(pairScores.reduce((s, p) => s + p.score, 0) / pairScores.length);
  }, [pairScores]);

  const groupAnalysis = useMemo(
    () =>
      members.length >= 2
        ? analyzeGroup(members, pairScores, avgFromPairs)
        : null,
    [members, pairScores, avgFromPairs],
  );

  const myInfo = members[0] ?? null;

  // ─────────────────────────────────────────────
  // buildPositions: 중앙(나) + 주변(다른 멤버) 노드 위치 계산
  // ─────────────────────────────────────────────

  const buildPositions = useCallback(
    (W: number, H: number): GraphNode[] => {
      if (!myInfo) return [];
      const layoutNodes = computeGroupLayout(members, W, H);

      // 비중앙 노드들의 점수 계산 → best/worst 결정
      const nonCenterScores = layoutNodes
        .filter((ln) => !ln.isCenter)
        .map((ln) => ln.score);
      const maxScore = nonCenterScores.length ? Math.max(...nonCenterScores) : -1;
      const minScore = nonCenterScores.length ? Math.min(...nonCenterScores) : -1;

      return layoutNodes.map((ln) => {
        const highlightType: "best" | "worst" | null = ln.isCenter
          ? null
          : ln.score === maxScore
            ? "best"
            : ln.score === minScore
              ? "worst"
              : null;
        return {
          ...ln,
          isHighlight: highlightType !== null,
          highlightType,
          data: ln.isCenter
            ? myInfo
            : members.find((m) => `${m.name}_${m.mbti}_${m.emoji}` === ln.id),
        };
      });
    },
    [members, myInfo],
  );

  // ─────────────────────────────────────────────
  // applyNodeStyles: 노드 DOM에 색상·글로우·텍스트·이벤트 적용
  // ─────────────────────────────────────────────

  const applyNodeStyles = useCallback(
    (nodes: GraphNode[], els: HTMLDivElement[]) => {
      nodes.forEach((pos, idx) => {
        const el = els[idx];
        if (!el) return;
        const { r, isCenter, score, highlightType } = pos;
        const m = pos.data as Member;
        const isBest = highlightType === "best";
        const isWorst = highlightType === "worst";

        const color = isCenter
          ? "hsl(180,100%,65%)"
          : isBest
            ? "hsl(36,88%,56%)"
            : isWorst
              ? "hsl(340,75%,56%)"
              : `hsl(${Math.round(260 - (score / 100) * 80)},${Math.round(40 + (score / 100) * 60)}%,${Math.round(35 + (score / 100) * 33)}%)`;
        const rgb = hslToRgb(color);
        const glowSz = isCenter ? 26 : Math.max(r * 0.58, 7);
        const glowOp = isCenter ? 0.48 : 0.18 + (score / 100) * 0.17;
        const innerOp = isCenter ? 0.15 : 0.05 + (score / 100) * 0.07;

        el.style.border = `${isCenter ? "2.5px" : "1.5px"} solid rgba(${rgb},${isCenter ? 0.85 : 0.5 + (score / 100) * 0.3})`;
        el.style.boxShadow = `0 0 ${glowSz}px rgba(${rgb},${glowOp}),inset 0 0 ${glowSz * 0.45}px rgba(${rgb},${innerOp})`;
        el.style.background = `radial-gradient(circle at 35% 35%,rgba(${rgb},0.26) 0%,rgba(${rgb},0.07) 65%,transparent 100%),#07070f`;

        const ns = Math.max(r * 0.24, 5.5);
        const es = Math.max(r * 0.5, 9);
        const ms = Math.max(r * 0.27, 6);
        const badge = isBest ? EMOJIS.best : isWorst ? EMOJIS.worst : "";
        el.innerHTML = `
          ${badge ? `<span class="mbti-badge" style="font-size:${es}px;line-height:1;opacity:0;transition:opacity 2s ease;">${badge}</span>` : ""}
          <span style="font-size:${ns}px;font-weight:700;color:rgba(${rgb},0.85);text-shadow:0 0 6px rgba(${rgb},0.7);line-height:1.25;">${m.name}</span>
          <span style="font-size:${es}px;line-height:1;filter:drop-shadow(0 0 ${Math.max(r * 0.1, 2)}px rgba(${rgb},0.8));">${m.emoji}</span>
          <span style="font-size:${ms}px;font-weight:800;color:rgba(${rgb},1);letter-spacing:0.3px;text-shadow:0 0 8px rgba(${rgb},0.9);line-height:1.25;">${m.mbti}</span>
        `;

        if (isCenter) {
          applyNodeHover(
            el,
            rgb,
            r,
            { size: glowSz, opacity: glowOp, innerOpacity: innerOp },
            0.85,
          );
          el.onclick = (e) => {
            e.stopPropagation();
            setShowHint(false);
            setProfileType(m.mbti);
          };
        } else {
          applyNodeHover(
            el,
            rgb,
            r,
            { size: glowSz, opacity: glowOp, innerOpacity: innerOp },
            0.7 + (score / 100) * 0.3,
            { scale: 1.32, glowMult: 1.8 },
          );
          el.onclick = (e) => {
            e.stopPropagation();
            setShowHint(false);
            if (myInfo) setPopup({ mA: myInfo, mB: m, score });
          };

          // best/worst 노드 펄스
          if (isBest || isWorst) {
            el.style.animation = "mbti-pulse 2.5s ease-in-out infinite";
            const prevLeave = el.onmouseleave;
            el.onmouseleave = (e) => {
              prevLeave?.call(el, e as MouseEvent);
              el.style.transform = "";
            };
          } else {
            el.style.animation = "";
          }
        }
      });
    },
    [myInfo, setProfileType, setShowHint],
  );

  // ─────────────────────────────────────────────
  // 이벤트 콜백
  // ─────────────────────────────────────────────

  /** 선 색상 키 — 동일 쌍에 일관된 색상 보장 (MbtiGraph 기준 통일) */
  const getLineColorKey = useCallback(
    (a: GraphNode, b: GraphNode) =>
      a.isCenter ? b.mbti : `${a.mbti}${b.mbti}`,
    [],
  );

  /** 연결선 클릭 → 궁합 상세 팝업 */
  const onLineClick = useCallback(
    (a: GraphNode, b: GraphNode, score: number) => {
      setShowHint(false);
      setPopup({ mA: a.data as Member, mB: b.data as Member, score });
    },
    [],
  );

  /** 멤버 이름 → 이모지 조회용 맵 */
  const memberNameToEmoji = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.name, m.emoji));
    return map;
  }, [members]);

  /** 애니메이션 완료 후 요약(평균/최고/최저/전체쌍) 계산 + 배지 페이드인 + 힌트 표시 */
  const onAnimComplete = useCallback((nodes: GraphNode[], container: HTMLDivElement) => {
    // 배지 페이드인
    requestAnimationFrame(() => {
      container
        .querySelectorAll<HTMLElement>(".mbti-badge")
        .forEach((el) => { el.style.opacity = "1"; });
    });

    // 힌트 최초 1회 표시
    if (!hintShownRef.current) {
      hintShownRef.current = true;
      setShowHint(true);
    }

    const pairs: { mA: Member; mB: Member; score: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sc = getScore(nodes[i].mbti, nodes[j].mbti);
        pairs.push({
          mA: nodes[i].data as Member,
          mB: nodes[j].data as Member,
          score: sc,
        });
      }
    }
    if (!pairs.length) return;
    const sorted = [...pairs].sort((a, b) => b.score - a.score);
    const avg = Math.round(
      pairs.reduce((s, p) => s + p.score, 0) / pairs.length,
    );
    const best = pairs.reduce((a, b) => (a.score > b.score ? a : b));
    const worst = pairs.reduce((a, b) => (a.score < b.score ? a : b));
    setSummary({ avg, best, worst, pairs: sorted });
  }, []);

  // ─────────────────────────────────────────────
  // 멤버 0명: 더미 데이터 프리뷰 화면
  // ─────────────────────────────────────────────

  if (!myInfo) {
    const guideText = GROUP.previewGuide;
    const allNodes = [DUMMY_CENTER, ...DUMMY_NODES];
    return (
      <div className="relative">
        <div
          className="flex flex-col gap-6"
          style={{ opacity: 0.35, pointerEvents: "none" }}
        >
          {/* 그룹 평균 궁합 미리보기 카드 */}
          <div
            className="rounded-2xl p-5 sm:p-6 text-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% -20%, rgba(0,203,255,0.07) 0%, rgba(15,15,26,0.92) 75%)",
              border: "1.5px solid rgba(0,203,255,0.56)",
              boxShadow:
                "0 0 0 1px rgba(0,203,255,0.20), 0 0 20px rgba(0,203,255,0.50), 0 0 60px rgba(0,203,255,0.18)",
            }}
          >
            <p
              className="text-xs mb-1 font-bold"
              style={{ color: "rgba(0,203,255,1.0)" }}
            >
              {GROUP.avgCompatLabel}
            </p>
            <p
              className="text-3xl font-black mb-1"
              style={{
                color: "#00cbff",
                textShadow:
                  "0 0 16px rgba(0,203,255,1.0), 0 0 32px rgba(0,203,255,0.6)",
              }}
            >
              {DUMMY_AVG.score}%
            </p>
            <p
              className="text-sm font-bold mt-1"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {DUMMY_AVG.label}
            </p>
            <div
              className="h-1.5 rounded-full overflow-hidden mt-4"
              style={{
                background: "rgba(255,255,255,0.1)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="h-full rounded-full gauge-bar"
                style={{
                  width: `${DUMMY_AVG.score}%`,
                  background: "#00cbff",
                  boxShadow:
                    "0 0 14px rgba(0,203,255,1.0), 0 0 28px rgba(0,203,255,0.6)",
                }}
              />
            </div>
          </div>

          {/* SVG 기반 더미 네트워크 그래프 */}
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ background: "#07070f" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full"
              style={{ opacity: 0.45 }}
            >
              <defs>
                {allNodes.map((n, i) => (
                  <filter
                    key={`glow-${i}`}
                    id={`glow-${i}`}
                    x="-80%"
                    y="-80%"
                    width="260%"
                    height="260%"
                  >
                    <feGaussianBlur
                      stdDeviation={n === DUMMY_CENTER ? "2.5" : "1.8"}
                      result="blur1"
                    />
                    <feFlood
                      floodColor={n.color}
                      floodOpacity={n === DUMMY_CENTER ? "0.8" : "0.6"}
                    />
                    <feComposite in2="blur1" operator="in" result="glow1" />
                    <feGaussianBlur
                      in="SourceGraphic"
                      stdDeviation="0.6"
                      result="blur2"
                    />
                    <feFlood floodColor={n.color} floodOpacity="0.35" />
                    <feComposite in2="blur2" operator="in" result="glow2" />
                    <feMerge>
                      <feMergeNode in="glow1" />
                      <feMergeNode in="glow2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
                <filter
                  id="line-glow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {allNodes.map((n, i) => (
                  <radialGradient
                    key={`grad-${i}`}
                    id={`grad-${i}`}
                    cx="35%"
                    cy="35%"
                  >
                    <stop offset="0%" stopColor={n.color} stopOpacity="0.35" />
                    <stop offset="50%" stopColor={n.color} stopOpacity="0.1" />
                    <stop
                      offset="100%"
                      stopColor="transparent"
                      stopOpacity="0"
                    />
                  </radialGradient>
                ))}
              </defs>
              {allNodes.map((a, i) =>
                allNodes.slice(i + 1).map((b, j) => {
                  if (a === DUMMY_CENTER || b === DUMMY_CENTER) return null;
                  const score = Math.round((a.score + b.score) / 3);
                  return (
                    <g key={`line-${i}-${j}`} filter="url(#line-glow)">
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="#666"
                        strokeWidth="0.2"
                        opacity="0.3"
                      />
                      <text
                        x={(a.x + b.x) / 2 + (b.y - a.y) * 0.08}
                        y={(a.y + b.y) / 2 - (b.x - a.x) * 0.08}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="1.8"
                        fontWeight="700"
                        opacity="0.4"
                      >
                        {score}%
                      </text>
                    </g>
                  );
                }),
              )}
              {DUMMY_NODES.map((n, i) => {
                const midX = (DUMMY_CENTER.x + n.x) / 2;
                const midY = (DUMMY_CENTER.y + n.y) / 2;
                const dx = n.y - DUMMY_CENTER.y;
                const dy = -(n.x - DUMMY_CENTER.x);
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const offX = (dx / len) * 5;
                const offY = (dy / len) * 5;
                return (
                  <g key={`cline-${i}`}>
                    <line
                      x1={DUMMY_CENTER.x}
                      y1={DUMMY_CENTER.y}
                      x2={n.x}
                      y2={n.y}
                      stroke={n.color}
                      strokeWidth={0.3 + (n.score / 100) * 0.8}
                      opacity="0.6"
                      filter={`url(#glow-${i + 1})`}
                    />
                    <line
                      x1={DUMMY_CENTER.x}
                      y1={DUMMY_CENTER.y}
                      x2={n.x}
                      y2={n.y}
                      stroke={n.color}
                      strokeWidth={0.15 + (n.score / 100) * 0.3}
                      opacity="0.9"
                    />
                    <text
                      x={midX + offX * 0.6}
                      y={midY + offY * 0.6}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={n.color}
                      fontSize="2.5"
                      fontWeight="800"
                      opacity="0.85"
                      filter={`url(#glow-${i + 1})`}
                    >
                      {n.score}%
                    </text>
                  </g>
                );
              })}
              {allNodes.map((n, i) => {
                const isCenter = n === DUMMY_CENTER;
                return (
                  <g key={`node-${i}`} filter={`url(#glow-${i})`}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r + 1.5}
                      fill="transparent"
                      stroke={n.color}
                      strokeWidth="0.15"
                      opacity="0.25"
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r}
                      fill={`url(#grad-${i})`}
                      stroke={n.color}
                      strokeWidth={isCenter ? "0.7" : "0.4"}
                      opacity="0.9"
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r}
                      fill="#07070f"
                      opacity="0.7"
                    />
                    <text
                      x={n.x}
                      y={n.y - (isCenter ? 1.5 : 0.5)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={n.color}
                      fontSize={isCenter ? "4" : Math.max(n.r * 0.45, 2.5)}
                      fontWeight="700"
                      opacity="0.95"
                    >
                      {n.emoji}
                    </text>
                    <text
                      x={n.x}
                      y={n.y + (isCenter ? 3.5 : n.r * 0.55)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={n.color}
                      fontSize={isCenter ? "3" : Math.max(n.r * 0.38, 2)}
                      fontWeight="800"
                      opacity="0.8"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 미리보기 카드들 (최고/최악 궁합 더미) */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-4 text-center"
                style={{
                  backgroundColor: "rgba(229,165,10,0.05)",
                  border: "0.5px solid rgba(229,165,10,0.15)",
                }}
              >
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "rgba(229,165,10,0.5)" }}
                >
                  {EMOJIS.best} {VARIANT_CONFIG.best.title}
                </p>
                <div className="text-3xl mb-1">✨</div>
                <div
                  className="text-xl font-bold mb-1"
                  style={{ color: "rgba(229,165,10,0.5)" }}
                >
                  {DUMMY_BEST.score}%
                </div>
                <div className="text-xs text-white/30 mb-3">
                  {DUMMY_BEST.label}
                </div>
                <p className="text-xs" style={{ color: "#ffffff50" }}>
                  {DUMMY_BEST.emoji1} × {DUMMY_BEST.emoji2}
                </p>
                <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full gauge-bar"
                    style={{
                      width: `${DUMMY_BEST.score}%`,
                      backgroundColor: "rgba(229,165,10,0.4)",
                      boxShadow: "0 0 6px rgba(229,165,10,0.5)",
                    }}
                  />
                </div>
              </div>
              <div
                className="rounded-2xl p-4 text-center"
                style={{
                  backgroundColor: "rgba(220,38,38,0.05)",
                  border: "0.5px solid rgba(220,38,38,0.15)",
                }}
              >
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "rgba(220,38,38,0.5)" }}
                >
                  {EMOJIS.worst} {VARIANT_CONFIG.worst.title}
                </p>
                <div className="text-3xl mb-1">🌧️</div>
                <div
                  className="text-xl font-bold mb-1"
                  style={{ color: "rgba(220,38,38,0.5)" }}
                >
                  {DUMMY_WORST.score}%
                </div>
                <div className="text-xs text-white/30 mb-3">
                  {DUMMY_WORST.label}
                </div>
                <p className="text-xs" style={{ color: "#ffffff50" }}>
                  {DUMMY_WORST.emoji1} × {DUMMY_WORST.emoji2}
                </p>
                <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full gauge-bar"
                    style={{
                      width: `${DUMMY_WORST.score}%`,
                      backgroundColor: "rgba(220,38,38,0.4)",
                      boxShadow: "0 0 6px rgba(220,38,38,0.5)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-start justify-center pt-6 pointer-events-none">
          <p
            className="text-white text-lg font-bold px-7 py-3.5 rounded-2xl"
            style={{
              background: "rgba(15,15,26,0.9)",
              border: "0.5px solid rgba(0,203,255,0.30)",
              boxShadow:
                "0 0 40px rgba(0,203,255,0.60), 0 0 80px rgba(0,203,255,0.25)",
              textShadow:
                "0 0 10px rgba(0,203,255,0.9), 0 0 22px rgba(0,203,255,0.45)",
            }}
          >
            {guideText}
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // 팝업 표시를 위한 색상/정보 사전 계산
  // ─────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* ── 결과 카드 — 세로 풀 레이아웃 ── */}
      {summary ? (
        <NeonCard
          rgb={CYAN_RGB}
          bgAlpha={0.07}
          className="flex flex-col gap-0 fade-in-up"
        >
          {/* 상단: 타이틀 + 멤버 뱃지 */}
          <div
            className="p-7 sm:p-8 flex flex-col items-center gap-5"
            style={{
              background:
                "radial-gradient(ellipse at 50% 80%, rgba(0,203,255,0.08) 0%, transparent 70%)",
            }}
          >
            {/* 밈 한 줄 — CoupleResult 한줄요약과 동일 형식 */}
            {groupAnalysis && (
              <div className="flex flex-col items-center gap-1 z-10 px-2">
                <span className="text-3xl z-10">👥</span>
                <p
                  {...titleProps(
                    TITLE1,
                    "#fff",
                    CYAN_RGB,
                    "text-center leading-snug",
                  )}
                >
                  &ldquo;{groupAnalysis.meme}&rdquo;
                </p>
                <p
                  className="text-sm font-medium text-center mt-1"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {groupAnalysis.summary}
                </p>
              </div>
            )}

            {/* 배터리 게이지 (그룹 평균) */}
            <div data-testid="group-avg-score">
              <BatteryGaugeLarge
                value={summary.avg}
              />
            </div>

            {/* 네트워크 그래프 (카드 안 히어로) */}
            <div className="w-full relative">
              <NetworkGraph
                buildPositions={buildPositions}
                applyNodeStyles={applyNodeStyles}
                onLineClick={onLineClick}
                onAnimComplete={onAnimComplete}
                getLineColorKey={getLineColorKey}
                drawNonCenterLines={true}
                animDuration={1000}
                resetOnDataChange={false}
                colorTheme="cyan"
              />
              {/* 클릭 유도 힌트 오버레이 — 최초 1회, 노드 탭할 때까지 유지 */}
              {showHint && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none"
                  style={{ animation: "hint-fade-in 0.4s ease forwards", zIndex: 10 }}
                >
                  <span
                    className="px-4 py-2 rounded-full font-bold"
                    style={{
                      fontSize: "15px",
                      background: "rgba(0,203,255,0.18)",
                      border: "1px solid rgba(0,203,255,0.45)",
                      color: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      textShadow: "0 0 8px rgba(0,203,255,0.6)",
                      animation: "hint-glow-cyan 2.5s ease-in-out infinite",
                    }}
                  >
                    {MBTI_MAP.graphTapHint}
                  </span>
                </div>
              )}
            </div>

            {/* 구분선 + 소제목 */}
            <div
              className="w-full flex items-center gap-3 mt-2"
              style={{ color: "rgba(0,203,255,0.90)" }}
            >
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(0,203,255,0.18)" }}
              />
              <span className="text-xs font-bold shrink-0">
                {GROUP.pairSectionTitle}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(0,203,255,0.18)" }}
              />
            </div>

            {/* 최고/최저 궁합 2열 */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <CompatCard
                score={summary.best.score}
                variant="best"
                muted
                onClick={() =>
                  setPopup({
                    mA: summary.best.mA,
                    mB: summary.best.mB,
                    score: summary.best.score,
                  })
                }
              >
                <p
                  className="text-xs leading-tight"
                  style={{ color: "#ffffffbb" }}
                >
                  {summary.best.mA.emoji}
                  {summary.best.mA.name} × {summary.best.mB.emoji}
                  {summary.best.mB.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#ffffff38" }}>
                  {summary.best.mA.mbti} + {summary.best.mB.mbti}
                </p>
              </CompatCard>

              <CompatCard
                score={summary.worst.score}
                variant="worst"
                muted
                onClick={() =>
                  setPopup({
                    mA: summary.worst.mA,
                    mB: summary.worst.mB,
                    score: summary.worst.score,
                  })
                }
              >
                <p
                  className="text-xs leading-tight"
                  style={{ color: "#ffffffbb" }}
                >
                  {summary.worst.mA.emoji}
                  {summary.worst.mA.name} × {summary.worst.mB.emoji}
                  {summary.worst.mB.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#ffffff38" }}>
                  {summary.worst.mA.mbti} + {summary.worst.mB.mbti}
                </p>
              </CompatCard>
            </div>

            {/* 전체 페어 랭킹 아코디언 */}
            {summary.pairs.length > 2 && (
              <div className="w-full">
                <button
                  onClick={() => setAllPairsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold"
                  style={{ color: "rgba(0,203,255,0.65)" }}
                >
                  <span>{allPairsOpen ? GROUP.pairRankClose : GROUP.pairRankOpen}</span>
                  <span
                    className="text-xs transition-transform duration-200"
                    style={{ transform: allPairsOpen ? "rotate(180deg)" : "rotate(0)" }}
                  >
                    {SYMBOLS.dropdown}
                  </span>
                </button>
                {allPairsOpen && (
                  <div className="flex flex-col gap-1.5 mt-1 fade-in-up">
                    {summary.pairs.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                        onClick={() => setPopup(p)}
                      >
                        <span
                          className="text-[11px] font-bold w-4 text-right shrink-0"
                          style={{ color: "rgba(0,203,255,0.4)" }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="text-xs shrink-0"
                          style={{ color: "rgba(255,255,255,0.65)", minWidth: 0, maxWidth: 120 }}
                        >
                          {p.mA.emoji}{p.mA.name} × {p.mB.emoji}{p.mB.name}
                        </span>
                        <div className="flex-1">
                          <ScoreBar score={p.score} height="h-1" />
                        </div>
                        <span
                          className="text-xs font-bold shrink-0"
                          style={{ color: "rgba(0,203,255,0.7)" }}
                        >
                          {p.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 그룹 역할 분석 아코디언 */}
          {groupAnalysis && (
            <div data-testid="group-roles">
              <button
                data-testid="role-accordion"
                onClick={() => setRoleOpen((prev) => !prev)}
                className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors"
                style={{
                  color: "rgba(0,203,255,0.90)",
                  borderTop: "1px solid rgba(0,203,255,0.20)",
                }}
              >
                <span>
                  {roleOpen
                    ? GROUP.roleAccordionClose
                    : GROUP.roleAccordionOpen}
                </span>
                <span
                  className="transition-transform duration-200 text-xs"
                  style={{
                    transform: roleOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  {SYMBOLS.dropdown}
                </span>
              </button>
              {roleOpen && (
                <div
                  className="px-7 pb-7 flex flex-col gap-3 fade-in-up"
                  style={{ borderTop: "1px solid rgba(0,203,255,0.07)" }}
                >
                  <div className="flex flex-col gap-2 mt-3">
                    {groupAnalysis.roles.map((role) => {
                      const roleMembers = groupAnalysis.membersByRole[role.id];
                      return (
                        <div
                          key={role.id}
                          className="flex flex-col gap-1 px-3 py-2.5 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {/* 첫째 줄: 역할 이모지 + 이름 + 인원수 | 멤버 뱃지들 */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base shrink-0">{role.emoji}</span>
                            <span className="text-sm font-bold text-white/70 shrink-0">
                              {role.name} {role.count}명
                            </span>
                            {roleMembers && roleMembers.length > 0 && (
                              <>
                                <span className="text-white/20 shrink-0 text-xs">|</span>
                                {roleMembers.map((name) => (
                                  <span
                                    key={name}
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      background: "rgba(0,203,255,0.08)",
                                      border: "1px solid rgba(0,203,255,0.18)",
                                      color: "rgba(0,203,255,0.75)",
                                    }}
                                  >
                                    {memberNameToEmoji.get(name) ?? ""} {name}
                                  </span>
                                ))}
                              </>
                            )}
                          </div>
                          {/* 둘째 줄: → effect 설명 */}
                          <p className="text-xs text-white/40">
                            → {role.effect}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {/* 역할 제안 (긍정적 문구) */}
                  {groupAnalysis.suggestions.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {groupAnalysis.suggestions.map((suggestion, i) => (
                        <p
                          key={i}
                          className="text-xs leading-relaxed"
                          style={{ color: "rgba(0,203,255,0.55)" }}
                        >
                          💡 {suggestion}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 공유 + CTA 버튼 */}
          <div className="mx-6 mb-6 flex flex-col gap-3">
            <SharePanel
              title={`${members.length}명 그룹 MBTI 궁합 분석`}
              description={`${members.map((m) => m.mbti).join(", ")} 그룹 케미를 확인하세요.`}
              path="/group-match"
              rgb={CYAN_RGB}
              contentType="group"
              onSaveImage={handleSaveImage}
            />
            <CtaButton
              title={CTA_TEXTS.group.toLove.title}
              subtitle={CTA_TEXTS.group.toLove.subtitle}
              rgb="236,72,153"
              onClick={() => router.push(`/mbti-love?my=${myInfo.mbti}`)}
            />
            <CtaButton
              title={CTA_TEXTS.group.toMap.title}
              subtitle={CTA_TEXTS.group.toMap.subtitle}
              rgb="168,85,247"
              onClick={() => router.push(`/mbti-map?mbti=${myInfo.mbti}`)}
            />
          </div>
        </NeonCard>
      ) : (
        /* 멤버 부족 시: 카드 형태 빈 상태 */
        <NeonCard
          rgb={CYAN_RGB}
          bgAlpha={0.07}
          className="flex flex-col items-center gap-5 p-7 sm:p-8"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">{GROUP.emptyEmoji}</span>
            <p
              className="text-base font-bold text-center"
              style={{
                color: "rgba(255,255,255,0.6)",
                textShadow:
                  "0 0 12px rgba(0,203,255,0.8), 0 0 24px rgba(0,203,255,0.35)",
              }}
            >
              {GROUP.emptyTitle}
            </p>
            <p className="text-sm text-white/30">{GROUP.emptySubtitle}</p>
          </div>
          <div className="relative w-full" style={{ opacity: 0.4 }}>
            <NetworkGraph
              buildPositions={buildPositions}
              applyNodeStyles={applyNodeStyles}
              onLineClick={onLineClick}
              onAnimComplete={onAnimComplete}
              getLineColorKey={getLineColorKey}
              drawNonCenterLines={true}
              animDuration={1500}
              resetOnDataChange={false}
              colorTheme="cyan"
            />
          </div>
        </NeonCard>
      )}

      {/* ── 궁합 상세 팝업 (모달) ── */}
      {popup && (
        <ScoreDetailPopup
          testId="group-score-popup"
          onClose={() => setPopup(null)}
          rgb={CYAN_RGB}
          score={popup.score}
          metaSlot={
            <>
              <div className="text-sm font-bold mb-1" style={{ color: "#ffffffcc" }}>
                {popup.mA.emoji} {popup.mA.name}({popup.mA.mbti}) ×{" "}
                {popup.mB.emoji} {popup.mB.name}({popup.mB.mbti})
              </div>
              {popupTier && (
                <div
                  className="text-xs px-3 py-1 rounded-full inline-block mb-1"
                  style={{
                    color: "#00cbff",
                    background: `rgba(${CYAN_RGB},0.1)`,
                    border: `0.5px solid rgba(${CYAN_RGB},0.35)`,
                  }}
                >
                  {popupTier.emoji} {popupTier.label}
                </div>
              )}
            </>
          }
          gauge={
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#ffffff0a" }}>
              <div
                className="h-full rounded-full gauge-bar"
                style={{
                  width: `${popup.score}%`,
                  background: "#00cbff",
                  boxShadow: `0 0 8px rgba(${CYAN_RGB},0.8)`,
                }}
              />
            </div>
          }
        >
          {/* 연애궁합 보기 CTA */}
          <CtaButton
            title={CTA_TEXTS.group.toLove.modal}
            rgb="236,72,153"
            onClick={() => {
              router.push(`/mbti-love?my=${popup.mA.mbti}&partner=${popup.mB.mbti}`);
              setPopup(null);
            }}
          />
          {/* 궁합맵 보기 CTA */}
          <CtaButton
            title={CTA_TEXTS.group.toMap.modal}
            rgb={PURPLE_RGB}
            className="mt-2"
            onClick={() => {
              router.push(`/mbti-map?mbti=${popup.mA.mbti}`);
              setPopup(null);
            }}
          />
        </ScoreDetailPopup>
      )}

      {/* ── 중앙 노드 클릭 시 MBTI 프로필 모달 ── */}
      <MbtiProfileModal
        mbtiType={profileType}
        rgb={CYAN_RGB}
        onClose={() => setProfileType(null)}
      />

      {/* off-screen 그룹 궁합 캡처 영역 */}
      {summary && groupAnalysis && (
        <div
          aria-hidden="true"
          style={OFFSCREEN_CAPTURE_STYLE}
        >
          <GroupShareImage
            data={{
              members,
              avg: summary.avg,
              best: summary.best,
              worst: summary.worst,
              pairs: summary.pairs,
              analysis: groupAnalysis,
            }}
            cardRef={groupCardRef}
          />
        </div>
      )}

      <ImagePreviewModal
        open={previewOpen}
        imageDataUrl={previewUrl}
        fileName={`chemifit-group-${members.length}members.png`}
        onClose={handleClose}
      />
    </div>
  );
}
