import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {CinematicPill, CinematicShell} from "./CinematicShell";

const actions = [
  ["PRICING", "Commercial Finance", "Set discount guardrails"],
  ["COST", "FP&A + Regional Finance", "Reconcile OPEX overruns"],
  ["RECOVERY", "Central GM", "Build EBITDA recovery bridge"],
];

export const DecisionZoomScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <CinematicShell
      chapter="05 / DECIDE"
      accent="#ff5e55"
      light
    >
      <Interactive.Div
        name="Decision camera"
        style={{
          position: "absolute",
          inset: "116px 74px 74px",
          scale: interpolate(
            frame,
            [0, 1.55 * fps, 3.2 * fps, 4.65 * fps, 8.45 * fps],
            [2.5, 1, 1.62, 0.9, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.7, 0, 0.84, 0),
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.linear,
              ],
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(
            frame,
            [0, 1.55 * fps, 3.2 * fps, 4.65 * fps, 8.45 * fps],
            ["610px 190px", "0px 0px", "-430px 120px", "0px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.7, 0, 0.84, 0),
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.linear,
              ],
            },
          ),
          filter: `blur(${interpolate(
            frame,
            [0, 0.25 * fps, 1.35 * fps, 1.65 * fps, 2.95 * fps, 3.3 * fps],
            [7, 0, 0, 1.5, 0, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 68,
          }}
        >
          <CinematicPill accent="#d9473d">The decision signal</CinematicPill>
          <div
            style={{
              marginTop: 24,
              fontFamily: displayFont,
              fontSize: 74,
              lineHeight: 0.95,
              letterSpacing: "-0.055em",
              fontWeight: 700,
              color: "#06111d",
            }}
          >
            REVENUE GREW.
            <br />
            <span style={{color: "#d9473d"}}>MARGIN DIDN’T FOLLOW.</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 36,
            top: 78,
            padding: "16px 20px",
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(6,17,29,0.13)",
            color: "#4f6875",
            fontFamily: monoFont,
            fontSize: 14,
            lineHeight: 1.45,
            textAlign: "right",
          }}
        >
          SYNTHETIC JUNE 2026
          <br />
          illustrative — not measured impact
        </div>

        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            top: 300,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.72fr",
            gap: 24,
          }}
        >
          {[
            {
              label: "REVENUE VS BUDGET",
              value: "+7.8%",
              detail: "108.4B / 100.6B",
              color: "#07865d",
              bg: "#e2f6ed",
            },
            {
              label: "GROSS MARGIN VS PLAN",
              value: "−1.3pp",
              detail: "28.7% / 30.0%",
              color: "#d9473d",
              bg: "#ffebe8",
            },
            {
              label: "EBITDA VS BUDGET",
              value: "+1.2%",
              detail: "11.9B / 11.8B",
              color: "#375dcc",
              bg: "#e9edff",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                minHeight: 210,
                padding: "28px 30px",
                borderRadius: 28,
                backgroundColor: metric.bg,
                border: `1px solid ${metric.color}28`,
                boxShadow: "0 28px 70px rgba(20,44,60,0.09)",
              }}
            >
              <div
                style={{
                  color: "#566e7a",
                  fontFamily: monoFont,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  marginTop: 18,
                  color: metric.color,
                  fontFamily: displayFont,
                  fontSize: 82,
                  lineHeight: 0.9,
                  letterSpacing: "-0.06em",
                  fontWeight: 700,
                }}
              >
                {metric.value}
              </div>
              <div
                style={{
                  marginTop: 12,
                  color: "#5b727e",
                  fontSize: 17,
                }}
              >
                {metric.detail}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            bottom: 36,
            display: "grid",
            gridTemplateColumns: "0.86fr 1.14fr",
            gap: 24,
            opacity: interpolate(
              frame,
              [3.9 * fps, 4.6 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [3.9 * fps, 4.6 * fps],
              ["0px 64px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({damping: 175}),
              },
            ),
          }}
        >
          <div
            style={{
              padding: "28px 30px",
              borderRadius: 26,
              backgroundColor: "#06111d",
              color: "#f7fbff",
              boxShadow: "0 30px 85px rgba(6,17,29,0.2)",
            }}
          >
            <div
              style={{
                color: "#ff8078",
                fontFamily: monoFont,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              MANAGEMENT QUESTION
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: displayFont,
                fontSize: 35,
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                fontWeight: 600,
              }}
            >
              Where did growth fail to convert into margin?
            </div>
            <div style={{display: "flex", gap: 10, marginTop: 20}}>
              {["PRICING", "FREIGHT", "PRODUCT MIX"].map((driver) => (
                <span
                  key={driver}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 999,
                    backgroundColor: "rgba(255,94,85,0.13)",
                    border: "1px solid rgba(255,94,85,0.36)",
                    color: "#ff8f88",
                    fontFamily: monoFont,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {driver}
                </span>
              ))}
            </div>
          </div>
          <div style={{display: "grid", gap: 10}}>
            {actions.map(([label, owner, action], index) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 1.15fr",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 19px",
                  borderRadius: 17,
                  backgroundColor: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(6,17,29,0.12)",
                  boxShadow: "0 14px 34px rgba(20,44,60,0.06)",
                  opacity: interpolate(
                    frame,
                    [4.4 * fps + index * 8, 4.9 * fps + index * 8],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  ),
                  translate: interpolate(
                    frame,
                    [4.4 * fps + index * 8, 4.9 * fps + index * 8],
                    ["50px 0px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.spring({damping: 180}),
                    },
                  ),
                }}
              >
                <span
                  style={{
                    color: "#d9473d",
                    fontFamily: monoFont,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    color: "#15364a",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {owner}
                </span>
                <span style={{color: "#58717d", fontSize: 16}}>
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Interactive.Div>
    </CinematicShell>
  );
};
