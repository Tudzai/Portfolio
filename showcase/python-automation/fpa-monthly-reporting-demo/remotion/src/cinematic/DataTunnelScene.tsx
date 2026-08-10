import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {
  CinematicPill,
  CinematicShell,
  GlassPanel,
} from "./CinematicShell";

export const DataTunnelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <CinematicShell chapter="02 / INGEST" accent="#64e3ff">
      <div
        style={{
          position: "absolute",
          inset: "116px 70px 74px",
          perspective: 1200,
          overflow: "hidden",
        }}
      >
        {Array.from({length: 22}).map((_, index) => {
          const start = index * 7 - 48;
          const progress = interpolate(
            frame,
            [start, start + 145],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            },
          );
          const lane = index % 2 === 0 ? -1 : 1;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: 960 + lane * (270 + (index % 5) * 58),
                top: 470 + ((index * 83) % 420) - 210,
                width: 330,
                height: 72,
                padding: "16px 20px",
                borderRadius: 14,
                backgroundColor: "rgba(8,25,40,0.9)",
                border: "1px solid rgba(100,227,255,0.24)",
                boxShadow: "0 20px 55px rgba(0,0,0,0.35)",
                scale: 0.08 + progress * 2.25,
                translate: `${lane * (1 - progress) * 460}px ${Math.sin(
                  index * 2.1,
                ) * (1 - progress) * 130}px`,
                opacity:
                  progress < 0.08
                    ? 0
                    : progress > 0.83
                      ? (1 - progress) / 0.17
                      : 0.8,
                filter: `blur(${Math.max(0, (progress - 0.78) * 20)}px)`,
                fontFamily: monoFont,
                color: "#c7f5ff",
                fontSize: 15,
                display: "grid",
                gridTemplateColumns: "44px 1fr 92px",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{color: "#64e3ff", fontWeight: 700}}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  height: 7,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.18)",
                }}
              />
              <span style={{textAlign: "right"}}>
                {18 + index * 2}.4M
              </span>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 390,
              height: 390,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle, rgba(100,227,255,0.2), rgba(7,28,44,0.92) 60%, #03101a 100%)",
              border: "2px solid rgba(100,227,255,0.74)",
              boxShadow:
                "0 0 0 26px rgba(100,227,255,0.05), 0 0 130px rgba(100,227,255,0.34)",
              scale: interpolate(
                frame,
                [0, 0.7 * fps, 4.7 * fps, 6.45 * fps],
                [1.8, 1, 1, 2.65],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: [
                    Easing.spring({damping: 180}),
                    Easing.linear,
                    Easing.bezier(0.7, 0, 0.84, 0),
                  ],
                  output: "perceptual-scale",
                },
              ),
              opacity: interpolate(
                frame,
                [0, 0.38 * fps, 5.85 * fps, 6.45 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            <div style={{textAlign: "center"}}>
              <div
                style={{
                  fontFamily: monoFont,
                  color: "#64e3ff",
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                }}
              >
                PYTHON CORE
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: displayFont,
                  fontSize: 74,
                  lineHeight: 1,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                }}
              >
                360
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "#9eb5c1",
                  fontSize: 18,
                }}
              >
                rows ingested
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 24,
            top: 86,
            zIndex: 12,
          }}
        >
          <Interactive.Div
            name="Ingest label"
            style={{
              opacity: interpolate(
                frame,
                [0.65 * fps, 1.1 * fps],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            <CinematicPill>Source preserved</CinematicPill>
          </Interactive.Div>
          <Interactive.Div
            name="Ingest title"
            style={{
              marginTop: 24,
              fontFamily: displayFont,
              fontSize: 74,
              lineHeight: 0.96,
              letterSpacing: "-0.055em",
              fontWeight: 700,
              opacity: interpolate(
                frame,
                [0.85 * fps, 1.45 * fps],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
              translate: interpolate(
                frame,
                [0.85 * fps, 1.45 * fps],
                ["0px 44px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({damping: 180}),
                },
              ),
            }}
          >
            RAW DATA
            <br />
            <span style={{color: "#64e3ff"}}>ENTERS THE FLOW.</span>
          </Interactive.Div>
        </div>

        <GlassPanel
          accent="#64e3ff"
          style={{
            position: "absolute",
            right: 30,
            bottom: 72,
            width: 470,
            padding: "24px 26px",
            opacity: interpolate(
              frame,
              [2.4 * fps, 3.05 * fps, 5.45 * fps, 6 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          {[
            "✓ Required columns",
            "✓ Dates / regions / products",
            "✓ 0 company records",
          ].map((line, index) => (
            <div
              key={line}
              style={{
                padding: "9px 0",
                color: index === 2 ? "#4de1a1" : "#d5e7ed",
                fontFamily: monoFont,
                fontSize: 17,
                borderBottom:
                  index < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              {line}
            </div>
          ))}
        </GlassPanel>
      </div>
    </CinematicShell>
  );
};
