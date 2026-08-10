import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {
  BigCursor,
  WindowCard,
  WorkflowShell,
  WORKFLOW,
} from "./WorkflowShell";

const quickTasks = [
  ["▦", "Build management pack"],
  ["✓", "Reconcile every row"],
  ["↗", "Surface management actions"],
];

export const TaskBriefScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="02 / HANDOFF">
      <Interactive.Div
        name="Task brief camera"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(
            frame,
            [0, 1.1 * fps, 5.3 * fps, 6.95 * fps],
            [1.7, 1, 1, 1.58],
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
            [0, 1.1 * fps, 5.3 * fps, 6.95 * fps],
            ["250px 210px", "0px 0px", "0px 0px", "-520px -260px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <WindowCard
          title="FP&A automation brief"
          style={{left: 286, top: 142, width: 1348, height: 770}}
        >
          <div style={{padding: "42px 46px"}}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 18,
              }}
            >
              {quickTasks.map(([icon, text], index) => (
                <div
                  key={text}
                  style={{
                    height: 114,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    borderRadius: 16,
                    border: `1px solid ${WORKFLOW.line}`,
                    backgroundColor: index === 0 ? "#f0ede2" : "#fffdf8",
                  }}
                >
                  <span
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${WORKFLOW.line}`,
                      color: WORKFLOW.navy,
                      fontSize: 28,
                      fontWeight: 800,
                    }}
                  >
                    {icon}
                  </span>
                  <span style={{fontSize: 21, fontWeight: 600}}>{text}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 24,
                minHeight: 314,
                padding: "34px 36px",
                borderRadius: 22,
                border: `1px solid ${WORKFLOW.line}`,
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  maxWidth: 1110,
                  fontFamily: displayFont,
                  fontSize: 42,
                  lineHeight: 1.22,
                  letterSpacing: "-0.035em",
                  fontWeight: 600,
                }}
              >
                Turn June raw data into a management-ready report.
                <br />
                Validate every row. Explain what changed.
              </div>
              <div
                style={{
                  marginTop: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderRadius: 14,
                    border: `1px solid ${WORKFLOW.line}`,
                    backgroundColor: "#f7f5ee",
                  }}
                >
                  <span style={{fontSize: 28}}>▦</span>
                  <div>
                    <div style={{fontSize: 19, fontWeight: 700}}>
                      data-raw.xlsx
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        color: WORKFLOW.muted,
                        fontFamily: monoFont,
                        fontSize: 13,
                      }}
                    >
                      360 rows · fictional June 2026 data
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    minWidth: 230,
                    padding: "18px 24px",
                    borderRadius: 15,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 15,
                    backgroundColor: WORKFLOW.orange,
                    color: "#ffffff",
                    fontSize: 21,
                    fontWeight: 800,
                    boxShadow: "0 14px 32px rgba(200,91,60,0.25)",
                  }}
                >
                  Run automation <span style={{fontSize: 28}}>→</span>
                </div>
              </div>
            </div>
          </div>
        </WindowCard>
      </Interactive.Div>
      <BigCursor
        from={[650, 700]}
        to={[1394, 745]}
        moveFrames={[70, 145]}
        clickFrame={154}
        scale={0.9}
      />
    </WorkflowShell>
  );
};
