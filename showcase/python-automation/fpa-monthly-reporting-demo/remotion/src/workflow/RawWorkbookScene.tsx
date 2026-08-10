import {Video} from "@remotion/media";
import {
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont} from "../fonts";
import {
  BigCursor,
  WindowCard,
  WorkflowShell,
  WORKFLOW,
} from "./WorkflowShell";

export const RawWorkbookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="01 / RAW DATA">
      <Interactive.Div
        name="Workbook camera"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(
            frame,
            [0, 1.2 * fps, 4.8 * fps, 5.95 * fps],
            [1.55, 1, 1.04, 1.42],
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
            [0, 1.2 * fps, 5.95 * fps],
            ["-430px 120px", "0px 0px", "350px -120px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <WindowCard
          title="data-raw.xlsx · 360 fictional transaction rows"
          style={{left: 116, top: 112, width: 1688, height: 850}}
        >
          <Video
            name="Public-safe raw workbook capture"
            src={staticFile("fpa-automation-highlight.mp4")}
            trimBefore={0}
            durationInFrames={180}
            volume={0}
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </WindowCard>
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 92,
          bottom: 78,
          zIndex: 25,
          padding: "20px 28px",
          borderRadius: 18,
          backgroundColor: "rgba(255,253,248,0.95)",
          border: `1px solid ${WORKFLOW.line}`,
          boxShadow: "0 18px 50px rgba(64,54,38,0.14)",
          opacity: interpolate(frame, [0.7 * fps, 1.3 * fps, 4.8 * fps, 5.4 * fps], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            color: WORKFLOW.orange,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          The starting point
        </div>
        <div
          style={{
            marginTop: 7,
            fontFamily: displayFont,
            fontSize: 43,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          Dates, regions and product codes need control.
        </div>
      </div>
      <BigCursor
        from={[1580, 760]}
        to={[940, 500]}
        moveFrames={[35, 98]}
        clickFrame={106}
        scale={0.92}
      />
    </WorkflowShell>
  );
};
