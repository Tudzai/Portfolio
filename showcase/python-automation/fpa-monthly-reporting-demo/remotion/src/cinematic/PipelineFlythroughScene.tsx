import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {CinematicPill, CinematicShell} from "./CinematicShell";

const stages = [
  ["01", "READ", "Load 360 synthetic rows", "#64e3ff"],
  ["02", "VALIDATE", "Stop invalid fields + mappings", "#64e3ff"],
  ["03", "TRANSFORM", "Calculate FP&A measures", "#7b8cff"],
  ["04", "ANALYZE", "Build variance + tie-outs", "#ffb55e"],
  ["05", "REPORT", "Draft actions + owners", "#4de1a1"],
];

export const PipelineFlythroughScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <CinematicShell chapter="03 / ORCHESTRATE" accent="#7b8cff">
      <div
        style={{
          position: "absolute",
          inset: "116px 74px 74px",
          overflow: "hidden",
          perspective: 1400,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 70,
            zIndex: 20,
          }}
        >
          <Interactive.Div
            name="Pipeline label"
            style={{
              opacity: interpolate(frame, [0, 0.45 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <CinematicPill accent="#7b8cff">
              One continuous workflow
            </CinematicPill>
          </Interactive.Div>
          <Interactive.Div
            name="Pipeline heading"
            style={{
              marginTop: 24,
              fontFamily: displayFont,
              fontSize: 68,
              lineHeight: 0.95,
              letterSpacing: "-0.055em",
              fontWeight: 700,
              opacity: interpolate(
                frame,
                [0.2 * fps, 0.8 * fps, 6.7 * fps, 7.35 * fps],
                [0, 1, 1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            FLY THROUGH
            <br />
            <span style={{color: "#7b8cff"}}>THE CLOSE.</span>
          </Interactive.Div>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            width: 4,
            height: 900,
            translate: "-2px -450px",
            background:
              "linear-gradient(180deg, transparent, #64e3ff 28%, #7b8cff 60%, transparent)",
            opacity: 0.24,
            boxShadow: "0 0 24px rgba(123,140,255,0.62)",
          }}
        />
        {[-1, 1].map((side) => (
          <div
            key={side}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 3,
              height: 1100,
              backgroundColor: "rgba(100,227,255,0.16)",
              transformOrigin: "center top",
              transform: `perspective(900px) rotateZ(${side * 34}deg)`,
              translate: `${side * 430}px -280px`,
            }}
          />
        ))}

        {Array.from({length: 30}).map((_, index) => {
          const progress = ((frame * 0.012 + index / 30) % 1 + 1) % 1;
          return (
            <span
              key={index}
              style={{
                position: "absolute",
                left: `${50 + Math.sin(index * 2.2) * 25}%`,
                top: `${12 + progress * 82}%`,
                width: 5 + progress * 10,
                height: 5 + progress * 10,
                borderRadius: "50%",
                backgroundColor:
                  index % 3 === 0
                    ? "#4de1a1"
                    : index % 2 === 0
                      ? "#7b8cff"
                      : "#64e3ff",
                opacity: 0.1 + progress * 0.75,
                filter: `blur(${Math.max(0, progress * 2 - 1)}px)`,
                boxShadow: "0 0 16px currentColor",
              }}
            />
          );
        })}

        {stages.map(([number, title, detail, color], index) => {
          const center = 48 + index * 38;
          const local = frame - center;
          return (
            <div
              key={title}
              style={{
                position: "absolute",
                left: "50%",
                top: "54%",
                width: 660,
                minHeight: 280,
                marginLeft: -330,
                marginTop: -140,
                padding: "38px 42px",
                borderRadius: 34,
                background:
                  "linear-gradient(145deg, rgba(16,35,56,0.97), rgba(4,15,26,0.97))",
                border: `1px solid ${color}88`,
                boxShadow: `0 45px 140px rgba(0,0,0,0.52), 0 0 90px ${color}2a`,
                scale: interpolate(local, [-34, 0, 34], [0.24, 1, 2.55], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                  output: "perceptual-scale",
                }),
                translate: interpolate(
                  local,
                  [-34, 0, 34],
                  ["0px 260px", "0px 0px", "0px -220px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  },
                ),
                opacity: interpolate(
                  local,
                  [-34, -24, 16, 34],
                  [0, 1, 1, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                ),
                filter: `blur(${interpolate(
                  Math.abs(local),
                  [0, 28, 34],
                  [0, 0, 9],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )}px)`,
                zIndex: 12 - Math.abs(Math.round(local / 10)),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 19,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: color,
                    color: "#031019",
                    fontFamily: monoFont,
                    fontSize: 20,
                    fontWeight: 700,
                    boxShadow: `0 0 34px ${color}66`,
                  }}
                >
                  {number}
                </span>
                <span
                  style={{
                    color,
                    fontFamily: monoFont,
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  STAGE {number} / 05
                </span>
              </div>
              <div
                style={{
                  marginTop: 30,
                  fontFamily: displayFont,
                  fontSize: 66,
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  fontWeight: 700,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  marginTop: 12,
                  color: "#a9bec9",
                  fontSize: 25,
                }}
              >
                {detail}
              </div>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            right: 36,
            bottom: 64,
            padding: "15px 19px",
            borderRadius: 16,
            backgroundColor: "rgba(3,10,18,0.72)",
            border: "1px solid rgba(123,140,255,0.3)",
            color: "#aab6ff",
            fontFamily: monoFont,
            fontSize: 15,
            opacity: interpolate(
              frame,
              [5.8 * fps, 6.4 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          run_fpa_automation.py / complete
        </div>
      </div>
    </CinematicShell>
  );
};
