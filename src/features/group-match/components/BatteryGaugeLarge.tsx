/**
 * BatteryGaugeLarge — 세그먼트 분할형 배터리 게이지 (Large 변형)
 *
 * 그룹 궁합 평균 점수를 세그먼트로 시각화.
 * - 점수 구간별 테마 자동 전환 (danger/medium/good)
 * - 구간 내 연속 밝기 보간 → %마다 셀 색이 달라짐
 * - glowPower(기본 58%→최대 100%) → 낮은 %도 기본 네온 유지
 * - cubic ease-out 애니메이션
 */
"use client";

import { useState, useEffect } from "react";

interface Theme {
  /** 셀 HSL hue */
  h: number;
  /** 셀 HSL saturation */
  s: number;
  /** 구간 최저 lightness (pct=구간 시작) */
  lBase: number;
  /** 구간 최고 lightness (pct=구간 끝) */
  lTop: number;
  /** rgba 글로우용 "R,G,B" */
  glowRgb: string;
  /** 테두리·팁 hex */
  borderHex: string;
  /** 하이라이트 hex */
  accentHex: string;
}

const THEMES: Record<"good" | "medium" | "danger", Theme> = {
  good: {
    h: 192,
    s: 100,
    lBase: 52,
    lTop: 72,
    glowRgb: "0,195,255",
    borderHex: "#33d6ff",
    accentHex: "#aaf0ff",
  },
  medium: {
    h: 205,
    s: 90,
    lBase: 36,
    lTop: 52,
    glowRgb: "0,130,210",
    borderHex: "#22aadd",
    accentHex: "#99ddff",
  },
  danger: {
    h: 3,
    s: 88,
    lBase: 36,
    lTop: 52,
    glowRgb: "230,60,60",
    borderHex: "#ff6666",
    accentHex: "#ffbbbb",
  },
};

const getTheme = (pct: number): Theme => {
  if (pct <= 20) return THEMES.danger;
  if (pct <= 50) return THEMES.medium;
  return THEMES.good;
};

/** 구간 내 0→1 보간값 */
const zoneT = (pct: number): number => {
  if (pct <= 20) return pct / 20;
  if (pct <= 50) return (pct - 20) / 30;
  return (pct - 50) / 50;
};

type Props = {
  value?: number;
  maxValue?: number;
  width?: number;
  height?: number;
  segments?: number;
  animated?: boolean;
  showPercent?: boolean;
  /** 하단 라벨 (예: "💀 같이 있으면 계속 소모됨") */
  label?: string;
};

export default function BatteryGaugeLarge({
  value = 72,
  maxValue = 100,
  width = 300,
  height = 72,
  segments = 4,
  animated = true,
  showPercent = true,
  label,
}: Props) {
  const [prevValue, setPrevValue] = useState(value);
  const [prevAnimated, setPrevAnimated] = useState(animated);
  const [display, setDisplay] = useState<number>(animated ? 0 : value);

  if (value !== prevValue || animated !== prevAnimated) {
    setPrevValue(value);
    setPrevAnimated(animated);
    setDisplay(animated ? 0 : value);
  }

  useEffect(() => {
    if (!animated) return;

    let frameId: number;
    const start = performance.now();
    const duration = 2200;
    
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out quart — 시작이 부드럽고 끝에서 천천히 안착
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(eased * value));
      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };
    
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [value, animated]);

  const pct = Math.min(100, Math.max(0, (display / maxValue) * 100));
  /** 최종 목표값 기준 테마 — 애니메이션 중 빨간색 깜빡임 방지 */
  const targetPct = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const theme = getTheme(targetPct);
  const filled = Math.round((pct / 100) * segments);
  const tipW = 14;
  const bodyW = width - tipW;

  // 구간 내 연속 보간 — 최종 목표값 기준으로 고정 (애니메이션 중 색상 일관성)
  const t = zoneT(targetPct);
  const cellL = Math.round(theme.lBase + t * (theme.lTop - theme.lBase));
  const cellH = theme.h - Math.round(t * 4); // 미세 hue shift
  const cellColor = `hsl(${cellH} ${theme.s}% ${cellL}%)`;

  // 기본 58% 강도, pct 100%에서 최대 — 낮은 %도 강한 기본 네온 유지
  const gr = theme.glowRgb;
  const gp = 0.58 + (pct / 100) * 0.42;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width,
          height,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* 본체 */}
        <div
          style={{
            position: "relative",
            width: bodyW,
            height: "100%",
            background: "rgba(10, 4, 20, 0.55)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            border: `2px solid ${theme.borderHex}`,
            overflow: "hidden",
            boxShadow: [
              `0 0 12px rgba(${gr},${(0.8 * gp).toFixed(2)})`,
              `0 0 32px rgba(${gr},${(0.6 * gp).toFixed(2)})`,
              `0 0 72px rgba(${gr},${(0.4 * gp).toFixed(2)})`,
              `0 0 130px rgba(${gr},${(0.2 * gp).toFixed(2)})`,
              `inset 0 0 22px rgba(${gr},${(0.18 * gp).toFixed(2)})`,
            ].join(", "),
            transition: "box-shadow 0.5s, border-color 0.5s",
          }}
        >
          {/* 셀 컨테이너 */}
          <div
            style={{
              position: "absolute",
              inset: "6px 8px",
              display: "flex",
              flexDirection: "row",
              gap: 7,
            }}
          >
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  position: "relative",
                  overflow: "hidden",
                  background:
                    i < filled
                      ? `linear-gradient(160deg, ${cellColor} 0%, hsl(${cellH} ${theme.s}% ${cellL - 8}%) 60%, hsl(${cellH} ${theme.s}% ${cellL - 16}%) 100%)`
                      : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${i < filled ? theme.borderHex : "rgba(255,255,255,0.10)"}`,
                  boxShadow:
                    i < filled
                      ? [
                          `0 0 16px rgba(${gr},${(0.92 * gp).toFixed(2)})`,
                          `0 0 38px rgba(${gr},${(0.78 * gp).toFixed(2)})`,
                          `0 0 80px rgba(${gr},${(0.58 * gp).toFixed(2)})`,
                          `0 0 140px rgba(${gr},${(0.35 * gp).toFixed(2)})`,
                          `inset 0 0 20px rgba(${gr},${(0.55 * gp).toFixed(2)})`,
                        ].join(", ")
                      : "inset 0 0 6px rgba(255,255,255,0.04)",
                  transition: "all 0.35s ease",
                }}
              >
                {/* 상단 하이라이트 라인 */}
                {i < filled && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      right: "15%",
                      height: 1.5,
                      background: `linear-gradient(to right, transparent, ${theme.accentHex}cc, transparent)`,
                      borderRadius: 1,
                    }}
                  />
                )}
                {/* 좌측 수직 하이라이트 */}
                {i < filled && (
                  <div
                    style={{
                      position: "absolute",
                      top: "15%",
                      bottom: "15%",
                      left: 0,
                      width: 1.5,
                      background: `linear-gradient(to bottom, transparent, ${theme.accentHex}88, transparent)`,
                      borderRadius: 1,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 퍼센트 텍스트 */}
          {showPercent && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: "#ffffff",
                pointerEvents: "none",
                textShadow: [
                  "0 0 3px #fff",
                  "0 0 8px #fff",
                  `0 0 18px ${cellColor}`,
                  `0 0 40px rgba(${gr},${(0.9 * gp).toFixed(2)})`,
                  `0 0 85px rgba(${gr},${(0.7 * gp).toFixed(2)})`,
                  `0 0 150px rgba(${gr},${(0.45 * gp).toFixed(2)})`,
                ].join(", "),
                transition: "text-shadow 0.5s",
              }}
            >
              {Math.round(pct)}%
            </div>
          )}

          {/* 바닥 반사광 */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "10%",
              right: "10%",
              height: "35%",
              background: `linear-gradient(to top, rgba(${gr},0.28), rgba(${gr},0.10), transparent)`,
              pointerEvents: "none",
            }}
          />
          {/* 상단 하이라이트 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: 2,
              background: `linear-gradient(to right, transparent, ${theme.accentHex}cc, transparent)`,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* 팁 */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: tipW,
            height: height * 0.38,
            borderRadius: "0 6px 6px 0",
            background: `linear-gradient(to right, ${theme.borderHex}88, ${theme.borderHex}33)`,
            borderTop: `1.5px solid ${theme.borderHex}cc`,
            borderRight: `1.5px solid ${theme.borderHex}cc`,
            borderBottom: `1.5px solid ${theme.borderHex}cc`,
            borderLeft: "none",
            backdropFilter: "blur(4px)",
            boxShadow: `3px 0 18px rgba(${gr},${(0.75 * gp).toFixed(2)}), 5px 0 40px rgba(${gr},${(0.5 * gp).toFixed(2)}), 0 0 60px rgba(${gr},${(0.3 * gp).toFixed(2)})`,
            transition: "all 0.5s",
          }}
        />
      </div>
      {label && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            color: `rgba(${gr},0.75)`,
            textShadow: `0 0 8px rgba(${gr},0.4)`,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
