import {Video} from "@remotion/media";
import {
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {monoFont} from "../fonts";
import {
  BigCursor,
  WindowCard,
  WorkflowShell,
  WORKFLOW,
} from "./WorkflowShell";

const artifacts = [
  ["▦", "clean-data.xlsx", "360 standardized rows"],
  ["▥", "variance-analysis.xlsx", "KPIs + 4 control checks"],
  ["▤", "monthly-report.docx", "Risks + actions + owners"],
];

export const OutputsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="05 / OUTPUTS">
      <Interactive.Div
        name="Output camera"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(
            frame,
            [0, 1.1 * fps, 5.3 * fps, 7.95 * fps],
            [1.62, 1, 1.12, 1.48],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.7, 0, 0.84, 0),
              ],
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(
            frame,
            [0, 1.1 * fps, 5.3 * fps, 7.95 * fps],
            ["-420px 170px", "0px 0px", "80px -40px", "-430px -160px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <WindowCard
          title="variance-analysis.xlsx · generated output"
          style={{left: 80, top: 116, width: 1260, height: 840}}
        >
          <Video
            name="Public-safe variance and control capture"
            src={staticFile("fpa-automation-highlight.mp4")}
            trimBefore={18 * fps}
            durationInFrames={240}
            volume={0}
            objectFit="cover"
            style={{width: "100%", height: "100%"}}
          />
        </WindowCard>

        <WindowCard
          title="Artifacts"
          style={{left: 1380, top: 180, width: 440, height: 600}}
        >
          <div style={{padding: "28px 26px"}}>
            {artifacts.map(([icon, file, detail], index) => (
              <div
                key={file}
                style={{
                  marginTop: index === 0 ? 0 : 16,
                  minHeight: 132,
                  padding: "20px",
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  borderRadius: 17,
                  border: `1px solid ${WORKFLOW.line}`,
                  backgroundColor:
                    index === 2 ? "#f2eee2" : WORKFLOW.paperStrong,
                  opacity: interpolate(
                    frame,
                    [22 + index * 28, 40 + index * 28],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  ),
                  translate: interpolate(
                    frame,
                    [22 + index * 28, 40 + index * 28],
                    ["28px 0px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.spring({damping: 170}),
                    },
                  ),
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 58,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    backgroundColor: index === 2 ? WORKFLOW.orange : "#e8eef5",
                    color: index === 2 ? "#ffffff" : WORKFLOW.navy,
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div style={{fontSize: 18, fontWeight: 800}}>{file}</div>
                  <div
                    style={{
                      marginTop: 7,
                      color: WORKFLOW.muted,
                      fontFamily: monoFont,
                      fontSize: 12,
                      lineHeight: 1.35,
                    }}
                  >
                    {detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WindowCard>
      </Interactive.Div>
      <BigCursor
        from={[1500, 220]}
        to={[1530, 642]}
        moveFrames={[92, 154]}
        clickFrame={164}
        scale={0.76}
      />
    </WorkflowShell>
  );
};
