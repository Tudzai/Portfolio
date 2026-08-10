import {Video} from "@remotion/media";
import {
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {
  CheckIcon,
  WindowCard,
  WorkflowShell,
  WORKFLOW,
} from "./WorkflowShell";

const steps = [
  ["Load + validate raw data", "360 rows received"],
  ["Standardize dimensions", "Dates · regions · products"],
  ["Calculate FP&A measures", "Revenue · GM · OPEX · EBITDA"],
  ["Reconcile + publish", "3 controlled outputs"],
];

export const AutomationRunScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <WorkflowShell chapter="04 / PROCESS">
      <Interactive.Div
        name="Automation workspace camera"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(
            frame,
            [0, 1.25 * fps, 5.2 * fps, 8.2 * fps, 9.95 * fps],
            [1.45, 1, 1.17, 1, 1.42],
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
            [0, 1.25 * fps, 5.2 * fps, 8.2 * fps, 9.95 * fps],
            ["360px 110px", "0px 0px", "-300px 20px", "0px 0px", "370px -110px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <WindowCard
          title="run_fpa_automation.py"
          style={{left: 84, top: 122, width: 1050, height: 824}}
        >
          <Video
            name="Public-safe Python source capture"
            src={staticFile("fpa-automation-highlight.mp4")}
            trimBefore={5 * fps}
            durationInFrames={300}
            volume={0}
            objectFit="cover"
            style={{width: "100%", height: "100%"}}
          />
        </WindowCard>

        <WindowCard
          title="Automation progress"
          style={{left: 1170, top: 122, width: 664, height: 824}}
        >
          <div style={{padding: "34px 36px"}}>
            <div
              style={{
                fontFamily: displayFont,
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.035em",
              }}
            >
              Build the monthly pack
            </div>
            <div
              style={{
                marginTop: 9,
                color: WORKFLOW.muted,
                fontFamily: monoFont,
                fontSize: 14,
              }}
            >
              RAW DATA → CONTROLLED REPORT
            </div>

            <div style={{marginTop: 34}}>
              {steps.map(([title, subtitle], index) => {
                const threshold = 38 + index * 58;
                const active = frame >= threshold;
                return (
                  <div
                    key={title}
                    style={{
                      minHeight: 100,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 18,
                      opacity: active ? 1 : 0.36,
                    }}
                  >
                    <CheckIcon
                      active={active}
                      progress={interpolate(
                        frame,
                        [threshold, threshold + 10],
                        [0.55, 1],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                          easing: Easing.spring({damping: 180}),
                        },
                      )}
                    />
                    <div style={{paddingTop: 2}}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          textDecoration:
                            active && index < 3 ? "line-through" : "none",
                          textDecorationColor: "#9a9b94",
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          color: WORKFLOW.muted,
                          fontSize: 16,
                        }}
                      >
                        {subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 12,
                padding: "20px 22px",
                borderRadius: 15,
                backgroundColor: "#242723",
                color: "#e9eee9",
                fontFamily: monoFont,
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              <div style={{color: "#8cc8a2"}}>✓ rows: 360 / 360</div>
              <div style={{color: "#8cc8a2"}}>✓ revenue difference: 0</div>
              <div style={{color: "#8cc8a2"}}>✓ budget difference: 0</div>
              <div style={{color: "#8cc8a2"}}>✓ unmapped products: 0</div>
            </div>
          </div>
        </WindowCard>
      </Interactive.Div>
    </WorkflowShell>
  );
};
