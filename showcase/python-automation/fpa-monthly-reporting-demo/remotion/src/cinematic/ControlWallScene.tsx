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
  PassMark,
} from "./CinematicShell";

const controls = [
  ["Clean rows equal raw rows", "360 / 360"],
  ["Revenue totals reconcile", "0 difference"],
  ["Budget totals reconcile", "0 difference"],
  ["No unmapped products", "0 exceptions"],
];

export const ControlWallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <CinematicShell chapter="06 / GOVERN" accent="#4de1a1">
      <div
        style={{
          position: "absolute",
          inset: "116px 74px 74px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 92,
            width: 620,
            zIndex: 25,
          }}
        >
          <Interactive.Div
            name="Governance label"
            style={{
              opacity: interpolate(frame, [0, 0.45 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <CinematicPill accent="#4de1a1">
              Trust before speed
            </CinematicPill>
          </Interactive.Div>
          <Interactive.Div
            name="Governance heading"
            style={{
              marginTop: 25,
              fontFamily: displayFont,
              fontSize: 82,
              lineHeight: 0.94,
              letterSpacing: "-0.06em",
              fontWeight: 700,
              opacity: interpolate(
                frame,
                [0.2 * fps, 0.85 * fps],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            AUTOMATION
            <br />
            THAT CAN
            <br />
            <span style={{color: "#4de1a1"}}>DEFEND ITSELF.</span>
          </Interactive.Div>
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              opacity: interpolate(
                frame,
                [4.6 * fps, 5.2 * fps],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            <span
              style={{
                color: "#4de1a1",
                fontFamily: displayFont,
                fontSize: 96,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                fontWeight: 700,
              }}
            >
              4/4
            </span>
            <span style={{color: "#a7bac4", fontSize: 22, lineHeight: 1.25}}>
              automated controls
              <br />
              passed
            </span>
          </div>
        </div>

        <Interactive.Div
          name="Control wall camera"
          style={{
            position: "absolute",
            right: 28,
            top: 86,
            width: 960,
            scale: interpolate(
              frame,
              [0, 0.8 * fps, 3.9 * fps, 5.2 * fps, 6.95 * fps],
              [1.55, 1.35, 1.35, 0.88, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: [
                  Easing.bezier(0.16, 1, 0.3, 1),
                  Easing.linear,
                  Easing.bezier(0.16, 1, 0.3, 1),
                  Easing.linear,
                ],
                output: "perceptual-scale",
              },
            ),
            translate: interpolate(
              frame,
              [0, 0.8 * fps, 1.8 * fps, 2.8 * fps, 3.8 * fps, 5.2 * fps],
              [
                "120px 180px",
                "60px 150px",
                "60px -10px",
                "60px -170px",
                "60px -330px",
                "0px 0px",
              ],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: [
                  Easing.bezier(0.16, 1, 0.3, 1),
                  Easing.bezier(0.16, 1, 0.3, 1),
                  Easing.bezier(0.16, 1, 0.3, 1),
                  Easing.bezier(0.16, 1, 0.3, 1),
                  Easing.bezier(0.16, 1, 0.3, 1),
                ],
              },
            ),
          }}
        >
          <div style={{display: "grid", gap: 18}}>
            {controls.map(([label, value], index) => (
              <div
                key={label}
                style={{
                  minHeight: 126,
                  display: "grid",
                  gridTemplateColumns: "62px 1fr 170px 94px",
                  gap: 18,
                  alignItems: "center",
                  padding: "22px 24px",
                  borderRadius: 24,
                  background:
                    "linear-gradient(145deg, rgba(14,34,51,0.96), rgba(4,15,26,0.96))",
                  border: "1px solid rgba(77,225,161,0.28)",
                  boxShadow: "0 22px 70px rgba(0,0,0,0.34)",
                  opacity: interpolate(
                    frame,
                    [0.45 * fps + index * 30, 0.95 * fps + index * 30],
                    [0.18, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  ),
                }}
              >
                <PassMark size={42} />
                <span
                  style={{
                    color: "#f2f9fb",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    color: "#92a9b5",
                    fontFamily: monoFont,
                    fontSize: 15,
                    textAlign: "right",
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    padding: "9px 12px",
                    borderRadius: 999,
                    backgroundColor: "rgba(77,225,161,0.13)",
                    border: "1px solid rgba(77,225,161,0.4)",
                    color: "#75efb9",
                    fontFamily: monoFont,
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  PASS
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 22,
              minHeight: 120,
              padding: "22px 26px",
              display: "flex",
              alignItems: "center",
              gap: 22,
              borderRadius: 24,
              background:
                "linear-gradient(90deg, rgba(123,140,255,0.2), rgba(100,227,255,0.1))",
              border: "1px solid rgba(123,140,255,0.4)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
              opacity: interpolate(
                frame,
                [4.55 * fps, 5.2 * fps],
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
                width: 70,
                height: 70,
                borderRadius: 21,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#7b8cff",
                color: "#031019",
                fontSize: 36,
                fontWeight: 900,
                boxShadow: "0 0 48px rgba(123,140,255,0.44)",
              }}
            >
              ◎
            </div>
            <div>
              <div
                style={{
                  color: "#f1f4ff",
                  fontSize: 25,
                  fontWeight: 700,
                }}
              >
                Finance owner approval remains required.
              </div>
              <div
                style={{
                  marginTop: 5,
                  color: "#9cacc0",
                  fontSize: 17,
                }}
              >
                Review unusual drivers, actions, and distribution.
              </div>
            </div>
          </div>
        </Interactive.Div>
      </div>
    </CinematicShell>
  );
};
