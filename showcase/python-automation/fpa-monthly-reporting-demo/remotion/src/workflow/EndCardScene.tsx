import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {BurstMark, WorkflowShell, WORKFLOW} from "./WorkflowShell";

export const EndCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="08 / DECISION READY">
      <Interactive.Div
        name="Final message"
        style={{
          position: "absolute",
          inset: "104px 110px 70px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          scale: interpolate(
            frame,
            [0, 1.1 * fps, 5.5 * fps, 7.3 * fps],
            [1.8, 1, 0.98, 0.94],
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
            [0, 1.1 * fps, 7.3 * fps],
            ["0px 180px", "0px 0px", "0px -14px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <BurstMark size={88} />
        <div
          style={{
            marginTop: 28,
            color: WORKFLOW.orange,
            fontFamily: monoFont,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          DECISION FIRST · TOOL SECOND
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: displayFont,
            fontSize: 126,
            lineHeight: 0.9,
            fontWeight: 700,
            letterSpacing: "-0.07em",
          }}
        >
          RAW DATA IN.
          <br />
          <span style={{color: WORKFLOW.orange}}>MANAGEMENT REPORT OUT.</span>
        </div>
        <div
          style={{
            marginTop: 34,
            color: WORKFLOW.muted,
            fontSize: 29,
            lineHeight: 1.4,
          }}
        >
          Automation accelerates preparation.
          <strong style={{color: WORKFLOW.ink}}>
            &nbsp;Finance keeps the judgment.
          </strong>
        </div>
        <div
          style={{
            marginTop: 42,
            display: "flex",
            gap: 14,
          }}
        >
          {["360 ROWS", "3 OUTPUTS", "4 / 4 CONTROLS", "HUMAN APPROVAL"].map(
            (label, index) => (
              <span
                key={label}
                style={{
                  padding: "13px 18px",
                  borderRadius: 999,
                  border: `1px solid ${index === 3 ? WORKFLOW.orange : WORKFLOW.line}`,
                  backgroundColor:
                    index === 3 ? "#f2e6df" : WORKFLOW.paperStrong,
                  color: index === 3 ? WORKFLOW.orange : "#5c5e57",
                  fontFamily: monoFont,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.045em",
                  opacity: interpolate(
                    frame,
                    [54 + index * 8, 72 + index * 8],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  ),
                  translate: interpolate(
                    frame,
                    [54 + index * 8, 72 + index * 8],
                    ["0px 18px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.spring({damping: 180}),
                    },
                  ),
                }}
              >
                {label}
              </span>
            ),
          )}
        </div>
        <div
          style={{
            marginTop: 50,
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          Truong Dinh Anh Tu
          <div
            style={{
              marginTop: 7,
              color: WORKFLOW.muted,
              fontFamily: monoFont,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.07em",
            }}
          >
            COMMERCIAL FP&amp;A · FINANCE AUTOMATION
          </div>
        </div>
      </Interactive.Div>
    </WorkflowShell>
  );
};
