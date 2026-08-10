import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {BurstMark, WorkflowShell, WORKFLOW} from "./WorkflowShell";

export const ValidationPromiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="03 / CONTROL">
      <Interactive.Div
        name="Validation promise"
        style={{
          position: "absolute",
          left: 260,
          top: 365,
          maxWidth: 1420,
          opacity: interpolate(
            frame,
            [0.35 * fps, 1.05 * fps, 3.2 * fps, 3.85 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          translate: interpolate(
            frame,
            [0.35 * fps, 1.05 * fps, 3.85 * fps],
            ["0px 42px", "0px 0px", "0px -30px"],
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
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 76,
            lineHeight: 1.18,
            letterSpacing: "-0.035em",
          }}
        >
          I’ll validate the numbers
          <br />
          <em style={{color: WORKFLOW.orange}}>before I write the story.</em>
        </div>
        <div style={{marginTop: 40}}>
          <BurstMark size={88} />
        </div>
      </Interactive.Div>
    </WorkflowShell>
  );
};
