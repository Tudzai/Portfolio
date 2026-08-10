import type {ReactNode} from "react";
import {Easing, Interactive, interpolate, useCurrentFrame} from "remotion";
import {interFont, monoFont} from "../fonts";

export const WORKFLOW = {
  paper: "#f6f3ea",
  paperStrong: "#fffdf8",
  ink: "#242522",
  muted: "#77776f",
  line: "#d9d4c8",
  orange: "#c85b3c",
  navy: "#17365d",
  blue: "#2f75b5",
  green: "#1f7a4d",
  red: "#b42318",
};

export const WorkflowShell: React.FC<{
  children: ReactNode;
  chapter: string;
}> = ({children, chapter}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: WORKFLOW.paper,
        color: WORKFLOW.ink,
        fontFamily: interFont,
        backgroundImage: `
          linear-gradient(${WORKFLOW.line}5e 1px, transparent 1px),
          linear-gradient(90deg, ${WORKFLOW.line}5e 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.86), rgba(246,243,234,0.2) 56%, rgba(220,213,199,0.2) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 38,
          zIndex: 40,
          color: "#4f504a",
          fontFamily: monoFont,
          fontSize: 16,
          letterSpacing: "0.105em",
          textTransform: "uppercase",
        }}
      >
        SYNTHETIC DEMO&nbsp;&nbsp;/&nbsp;&nbsp;JUNE 2026&nbsp;&nbsp;/&nbsp;&nbsp;PUBLIC-SAFE
      </div>
      <div
        style={{
          position: "absolute",
          right: 54,
          top: 38,
          zIndex: 40,
          color: WORKFLOW.orange,
          fontFamily: monoFont,
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.105em",
          textTransform: "uppercase",
        }}
      >
        {chapter}
      </div>
      {children}
    </div>
  );
};

export const WindowCard: React.FC<{
  children: ReactNode;
  title: string;
  style?: React.CSSProperties;
}> = ({children, title, style}) => {
  return (
    <div
      style={{
        position: "absolute",
        overflow: "hidden",
        border: `1px solid ${WORKFLOW.line}`,
        borderRadius: 28,
        backgroundColor: WORKFLOW.paperStrong,
        boxShadow: "0 28px 80px rgba(64, 54, 38, 0.16)",
        ...style,
      }}
    >
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 22px",
          borderBottom: `1px solid ${WORKFLOW.line}`,
          backgroundColor: "#f0ede4",
        }}
      >
        {["#d87058", "#e8b04f", "#6aa57f"].map((color) => (
          <span
            key={color}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 10,
            color: "#66675f",
            fontFamily: monoFont,
            fontSize: 14,
            letterSpacing: "0.025em",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{position: "absolute", inset: "54px 0 0"}}>{children}</div>
    </div>
  );
};

export const BurstMark: React.FC<{
  size?: number;
  color?: string;
}> = ({size = 70, color = WORKFLOW.orange}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {Array.from({length: 12}).map((_, index) => (
        <line
          key={index}
          x1="50"
          y1="13"
          x2="50"
          y2="40"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          transform={`rotate(${index * 30} 50 50)`}
        />
      ))}
    </svg>
  );
};

export const BigCursor: React.FC<{
  from: [number, number];
  to: [number, number];
  moveFrames: [number, number];
  clickFrame?: number;
  scale?: number;
}> = ({from, to, moveFrames, clickFrame, scale = 1}) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Guided cursor"
      style={{
        position: "absolute",
        zIndex: 50,
        left: 0,
        top: 0,
        width: 106,
        height: 128,
        translate: interpolate(
          frame,
          moveFrames,
          [`${from[0]}px ${from[1]}px`, `${to[0]}px ${to[1]}px`],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
        scale:
          clickFrame === undefined
            ? scale
            : interpolate(
                frame,
                [clickFrame - 3, clickFrame, clickFrame + 5],
                [scale, scale * 0.82, scale],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  output: "perceptual-scale",
                },
              ),
        filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.24))",
      }}
    >
      <svg width="106" height="128" viewBox="0 0 106 128" aria-hidden="true">
        <path
          d="M9 5L91 78L57 83L76 119L53 125L35 88L10 111Z"
          fill="#ffffff"
          stroke="#171814"
          strokeWidth="8"
          strokeLinejoin="round"
        />
      </svg>
      {clickFrame === undefined ? null : (
        <span
          style={{
            position: "absolute",
            left: 28,
            top: 38,
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: `4px solid ${WORKFLOW.orange}`,
            opacity: interpolate(
              frame,
              [clickFrame - 1, clickFrame + 2, clickFrame + 14],
              [0, 0.8, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            scale: interpolate(
              frame,
              [clickFrame - 1, clickFrame + 14],
              [0.3, 1.6],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              },
            ),
          }}
        />
      )}
    </Interactive.Div>
  );
};

export const CheckIcon: React.FC<{active: boolean; progress?: number}> = ({
  active,
  progress = 1,
}) => {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        flex: "0 0 auto",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${active ? WORKFLOW.blue : WORKFLOW.line}`,
        backgroundColor: active ? WORKFLOW.blue : "#fffdf8",
        color: "#ffffff",
        fontSize: 24,
        fontWeight: 700,
        scale: active ? progress : 1,
      }}
    >
      {active ? "✓" : ""}
    </div>
  );
};
