import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {ManagementReport} from "./ManagementReport";
import {BigCursor, WorkflowShell, WORKFLOW} from "./WorkflowShell";

export const ReportRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="06 / FINAL REPORT">
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 148,
          width: 600,
          zIndex: 16,
          opacity: interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.8 * fps, 1.5 * fps],
            ["0px 32px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            color: WORKFLOW.orange,
            fontFamily: monoFont,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.07em",
          }}
        >
          GENERATED FROM THE CONTROLLED OUTPUT
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: displayFont,
            fontSize: 70,
            lineHeight: 1.02,
            fontWeight: 700,
            letterSpacing: "-0.055em",
          }}
        >
          The numbers become a management call.
        </div>
        <div
          style={{
            marginTop: 26,
            color: WORKFLOW.muted,
            fontSize: 23,
            lineHeight: 1.45,
          }}
        >
          Risks, actions, owners and timing—prepared automatically, approved
          by Finance.
        </div>
      </div>

      <Interactive.Div
        name="Report page camera"
        style={{
          position: "absolute",
          left: 850,
          top: 110,
          scale: interpolate(
            frame,
            [0, 1.1 * fps, 5.2 * fps, 8.1 * fps, 9.95 * fps],
            [2.1, 0.66, 0.78, 0.66, 1.42],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.7, 0, 0.84, 0),
              ],
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(
            frame,
            [0, 1.1 * fps, 5.2 * fps, 8.1 * fps, 9.95 * fps],
            ["-190px -120px", "0px 0px", "-60px -250px", "0px 0px", "-190px -520px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <ManagementReport />
      </Interactive.Div>
      <BigCursor
        from={[1530, 760]}
        to={[1390, 650]}
        moveFrames={[140, 210]}
        clickFrame={220}
        scale={0.78}
      />
    </WorkflowShell>
  );
};
