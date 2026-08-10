import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {ManagementReport} from "./ManagementReport";
import {
  BigCursor,
  CheckIcon,
  WindowCard,
  WorkflowShell,
  WORKFLOW,
} from "./WorkflowShell";

export const ReviewWorkspaceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="07 / REVIEW">
      <Interactive.Div
        name="Complete workspace pullback"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(
            frame,
            [0, 1.4 * fps, 7.5 * fps, 9.95 * fps],
            [1.9, 1, 0.96, 1.08],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.linear,
                Easing.bezier(0.7, 0, 0.84, 0),
              ],
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(
            frame,
            [0, 1.4 * fps, 9.95 * fps],
            ["-180px 280px", "0px 0px", "80px -20px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <WindowCard
          title="Executive readout"
          style={{left: 48, top: 116, width: 470, height: 820}}
        >
          <div style={{padding: "28px 26px"}}>
            <div
              style={{
                color: WORKFLOW.navy,
                fontFamily: displayFont,
                fontSize: 31,
                lineHeight: 1.15,
                fontWeight: 700,
              }}
            >
              Revenue grew.
              <br />
              Margin did not follow.
            </div>
            <div
              style={{
                marginTop: 22,
                padding: "20px",
                borderRadius: 16,
                backgroundColor: "#f2eee2",
                fontSize: 18,
                lineHeight: 1.48,
              }}
            >
              Protect North and South momentum while tightening discount
              governance.
            </div>
            <div
              style={{
                marginTop: 24,
                color: WORKFLOW.orange,
                fontFamily: monoFont,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              NEXT ACTIONS
            </div>
            {[
              ["Pricing", "Commercial Finance", "1 week"],
              ["Cost", "FP&A + Regional Finance", "Immediate"],
              ["Recovery", "Central GM", "Before next close"],
            ].map(([label, owner, timing]) => (
              <div
                key={label}
                style={{
                  marginTop: 12,
                  padding: "16px",
                  borderRadius: 14,
                  border: `1px solid ${WORKFLOW.line}`,
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    color: WORKFLOW.orange,
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
                <div style={{marginTop: 5, fontSize: 17, fontWeight: 700}}>
                  {owner}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: WORKFLOW.muted,
                    fontSize: 14,
                  }}
                >
                  {timing}
                </div>
              </div>
            ))}
          </div>
        </WindowCard>

        <WindowCard
          title="monthly-report.docx"
          style={{left: 548, top: 86, width: 790, height: 900}}
        >
          <div
            style={{
              position: "absolute",
              left: 108,
              top: 28,
              scale: 0.54,
              transformOrigin: "top left",
            }}
          >
            <ManagementReport />
          </div>
        </WindowCard>

        <WindowCard
          title="Automation evidence"
          style={{left: 1370, top: 116, width: 500, height: 820}}
        >
          <div style={{padding: "26px 24px"}}>
            <div
              style={{
                fontFamily: displayFont,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              Progress
            </div>
            {[
              "360 rows processed",
              "Revenue reconciled",
              "Budget reconciled",
              "No unmapped products",
            ].map((label) => (
              <div
                key={label}
                style={{
                  marginTop: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <CheckIcon active />
                <span style={{fontSize: 18, fontWeight: 600}}>{label}</span>
              </div>
            ))}
            <div
              style={{
                marginTop: 34,
                paddingTop: 24,
                borderTop: `1px solid ${WORKFLOW.line}`,
                color: WORKFLOW.orange,
                fontFamily: monoFont,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ARTIFACTS
            </div>
            {[
              "clean-data.xlsx",
              "variance-analysis.xlsx",
              "monthly-report.docx",
            ].map((file, index) => (
              <div
                key={file}
                style={{
                  marginTop: 12,
                  padding: "15px 16px",
                  borderRadius: 13,
                  border: `1px solid ${WORKFLOW.line}`,
                  backgroundColor:
                    index === 2 ? "#f2eee2" : WORKFLOW.paperStrong,
                  fontSize: 16,
                  fontWeight: index === 2 ? 800 : 600,
                }}
              >
                {index === 2 ? "▤" : "▦"}&nbsp;&nbsp;{file}
              </div>
            ))}
            <div
              style={{
                marginTop: 26,
                padding: "18px",
                borderRadius: 14,
                backgroundColor: WORKFLOW.navy,
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  color: "#a9c1dc",
                  fontFamily: monoFont,
                  fontSize: 12,
                }}
              >
                REVIEW BOUNDARY
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 17,
                  lineHeight: 1.4,
                  fontWeight: 700,
                }}
              >
                Finance approves the narrative before distribution.
              </div>
            </div>
          </div>
        </WindowCard>
      </Interactive.Div>
      <BigCursor
        from={[1545, 365]}
        to={[1590, 724]}
        moveFrames={[92, 160]}
        clickFrame={170}
        scale={0.7}
      />
    </WorkflowShell>
  );
};
