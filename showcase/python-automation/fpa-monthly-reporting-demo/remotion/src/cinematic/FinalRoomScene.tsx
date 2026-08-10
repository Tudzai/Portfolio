import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {CinematicPill, CinematicShell} from "./CinematicShell";

const miniPanels = [
  ["360", "ROWS", "#64e3ff", -620, -250, -4],
  ["3", "OUTPUTS", "#4de1a1", 610, -245, 4],
  ["+7.8%", "REVENUE", "#4de1a1", -650, 260, 3],
  ["−1.3pp", "MARGIN", "#ff766c", 625, 270, -3],
];

export const FinalRoomScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <CinematicShell chapter="07 / DECISION ROOM" accent="#64e3ff">
      <Interactive.Div
        name="Final camera pullback"
        style={{
          position: "absolute",
          inset: "112px 72px 72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          scale: interpolate(
            frame,
            [0, 1.2 * fps, 4.5 * fps, 6.45 * fps],
            [2.15, 1, 0.96, 0.9],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.linear,
                Easing.bezier(0.16, 1, 0.3, 1),
              ],
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(
            frame,
            [0, 1.2 * fps, 6.45 * fps],
            ["0px 240px", "0px 0px", "0px -20px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
          filter: `blur(${interpolate(
            frame,
            [0, 0.3 * fps, 1.05 * fps, 1.35 * fps],
            [8, 0, 0, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )}px)`,
        }}
      >
        {miniPanels.map(([value, label, color, x, y, rotation], index) => (
          <div
            key={String(label)}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 270,
              height: 150,
              marginLeft: -135,
              marginTop: -75,
              translate: `${x}px ${y}px`,
              rotate: `${rotation}deg`,
              padding: "24px 26px",
              borderRadius: 24,
              background:
                "linear-gradient(145deg, rgba(15,34,52,0.92), rgba(4,15,26,0.9))",
              border: `1px solid ${color}48`,
              boxShadow: `0 28px 80px rgba(0,0,0,0.35), 0 0 45px ${color}14`,
              opacity: interpolate(
                frame,
                [0.75 * fps + index * 6, 1.45 * fps + index * 6],
                [0, 0.72],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            <div
              style={{
                color: String(color),
                fontFamily: displayFont,
                fontSize: 52,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                fontWeight: 700,
              }}
            >
              {value}
            </div>
            <div
              style={{
                marginTop: 10,
                color: "#8da4b1",
                fontFamily: monoFont,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              {label}
            </div>
          </div>
        ))}

        <Interactive.Div
          name="Finale label"
          style={{
            opacity: interpolate(
              frame,
              [0.85 * fps, 1.45 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <CinematicPill>Decision first. Tool second.</CinematicPill>
        </Interactive.Div>
        <Interactive.Div
          name="Finale headline"
          style={{
            marginTop: 34,
            fontFamily: displayFont,
            fontSize: 116,
            lineHeight: 0.9,
            letterSpacing: "-0.065em",
            fontWeight: 700,
            opacity: interpolate(
              frame,
              [1.05 * fps, 1.8 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          FROM RAW DATA
          <br />
          TO A <span style={{color: "#64e3ff"}}>DECISION ROOM.</span>
        </Interactive.Div>
        <Interactive.Div
          name="Finale promise"
          style={{
            marginTop: 30,
            color: "#adbec7",
            fontSize: 31,
            lineHeight: 1.35,
            opacity: interpolate(
              frame,
              [1.75 * fps, 2.35 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          One Python run accelerates preparation.
          <strong style={{color: "#ffffff"}}> Finance keeps the judgment.</strong>
        </Interactive.Div>
        <div
          style={{
            marginTop: 42,
            display: "flex",
            gap: 14,
            opacity: interpolate(
              frame,
              [2.35 * fps, 2.95 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          {["360 ROWS", "3 OUTPUTS", "4/4 CONTROLS", "HUMAN APPROVAL"].map(
            (label, index) => (
              <span
                key={label}
                style={{
                  padding: "13px 18px",
                  borderRadius: 999,
                  backgroundColor:
                    index === 3
                      ? "rgba(123,140,255,0.17)"
                      : "rgba(100,227,255,0.09)",
                  border:
                    index === 3
                      ? "1px solid rgba(123,140,255,0.42)"
                      : "1px solid rgba(100,227,255,0.28)",
                  color: index === 3 ? "#bbc2ff" : "#a8efff",
                  fontFamily: monoFont,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                {label}
              </span>
            ),
          )}
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: interpolate(
              frame,
              [3.05 * fps, 3.7 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 19,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #64e3ff, #7b8cff)",
              color: "#031019",
              fontFamily: displayFont,
              fontSize: 24,
              fontWeight: 700,
              boxShadow: "0 0 44px rgba(100,227,255,0.3)",
            }}
          >
            AT
          </div>
          <div style={{textAlign: "left"}}>
            <div
              style={{
                fontFamily: displayFont,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Truong Dinh Anh Tu
            </div>
            <div
              style={{
                marginTop: 3,
                color: "#8299a7",
                fontFamily: monoFont,
                fontSize: 13,
                letterSpacing: "0.06em",
              }}
            >
              COMMERCIAL FP&amp;A / FINANCE AUTOMATION
            </div>
          </div>
        </div>
      </Interactive.Div>
    </CinematicShell>
  );
};
