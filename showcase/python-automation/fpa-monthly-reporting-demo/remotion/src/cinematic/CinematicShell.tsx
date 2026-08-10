import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {interFont, monoFont} from "../fonts";

export const CinematicShell: React.FC<{
  children: React.ReactNode;
  accent: string;
  chapter: string;
  light?: boolean;
}> = ({children, accent, chapter, light = false}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill
      name={chapter}
      style={{
        overflow: "hidden",
        backgroundColor: light ? "#eef2f2" : "#030a12",
        color: light ? "#06111d" : "#f7fbff",
        fontFamily: interFont,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: light ? 0.28 : 0.5,
          backgroundImage: light
            ? "linear-gradient(rgba(6,17,29,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6,17,29,0.08) 1px, transparent 1px)"
            : "linear-gradient(rgba(100,227,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(100,227,255,0.055) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          translate: interpolate(
            frame,
            [0, durationInFrames - 1],
            ["0px 0px", "-80px -40px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.linear,
            },
          ),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 980,
          height: 980,
          left: -430,
          top: -520,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}38 0%, ${accent}10 45%, transparent 72%)`,
          filter: "blur(24px)",
          scale: interpolate(frame, [0, durationInFrames - 1], [0.82, 1.18], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          right: -340,
          bottom: -390,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}2f 0%, transparent 70%)`,
          filter: "blur(30px)",
          opacity: interpolate(
            frame,
            [0, durationInFrames * 0.55, durationInFrames - 1],
            [0.25, 0.75, 0.35],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 86,
          right: 86,
          top: 56,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 50,
          fontFamily: monoFont,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: light ? "#47606c" : "#8399a7",
          textTransform: "uppercase",
        }}
      >
        <span>TDAT / FP&amp;A CINEMATIC DEMO</span>
        <span style={{display: "flex", alignItems: "center", gap: 12}}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: accent,
              boxShadow: `0 0 18px ${accent}`,
            }}
          />
          {chapter}
        </span>
      </div>
      {children}
    </AbsoluteFill>
  );
};

export const CinematicPill: React.FC<{
  children: React.ReactNode;
  accent?: string;
  dark?: boolean;
}> = ({children, accent = "#64e3ff", dark = false}) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 16px",
        borderRadius: 999,
        backgroundColor: dark ? "rgba(3,10,18,0.74)" : `${accent}18`,
        border: `1px solid ${accent}66`,
        color: accent,
        fontFamily: monoFont,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        boxShadow: `0 0 28px ${accent}14`,
      }}
    >
      {children}
    </span>
  );
};

export const PassMark: React.FC<{size?: number; color?: string}> = ({
  size = 34,
  color = "#4de1a1",
}) => {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color,
        color: "#031017",
        fontSize: size * 0.58,
        fontWeight: 900,
        boxShadow: `0 0 ${size * 1.2}px ${color}55`,
      }}
    >
      ✓
    </span>
  );
};

export const GlassPanel: React.FC<{
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
}> = ({children, accent = "#64e3ff", style}) => {
  return (
    <div
      style={{
        borderRadius: 28,
        background:
          "linear-gradient(145deg, rgba(14,31,49,0.92), rgba(5,16,27,0.88))",
        border: `1px solid ${accent}42`,
        boxShadow: `0 35px 110px rgba(0,0,0,0.42), 0 0 60px ${accent}12`,
        backdropFilter: "blur(20px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CinematicOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{pointerEvents: "none", zIndex: 200}}>
      <AbsoluteFill
        style={{
          opacity: 0.1,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 4px)",
          translate: `0px ${frame % 4}px`,
          mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.16) 72%, rgba(0,0,0,0.62) 120%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 34,
          backgroundColor: "#000000",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 34,
          backgroundColor: "#000000",
        }}
      />
      {[
        ["left", "top"],
        ["right", "top"],
        ["left", "bottom"],
        ["right", "bottom"],
      ].map(([horizontal, vertical]) => (
        <span
          key={`${horizontal}-${vertical}`}
          style={{
            position: "absolute",
            [horizontal]: 36,
            [vertical]: 48,
            width: 42,
            height: 42,
            borderTop:
              vertical === "top" ? "1px solid rgba(255,255,255,0.22)" : "none",
            borderBottom:
              vertical === "bottom"
                ? "1px solid rgba(255,255,255,0.22)"
                : "none",
            borderLeft:
              horizontal === "left"
                ? "1px solid rgba(255,255,255,0.22)"
                : "none",
            borderRight:
              horizontal === "right"
                ? "1px solid rgba(255,255,255,0.22)"
                : "none",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
