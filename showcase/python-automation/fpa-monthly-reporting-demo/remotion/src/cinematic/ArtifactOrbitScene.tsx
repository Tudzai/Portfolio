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
  GlassPanel,
  PassMark,
} from "./CinematicShell";

const artifacts = [
  {
    file: "clean-data.xlsx",
    title: "CLEAN DATA",
    detail: "Standardized dimensions and calculated FP&A measures",
    color: "#64e3ff",
    type: "table",
  },
  {
    file: "monthly-report.docx",
    title: "MANAGEMENT REPORT",
    detail: "Executive readout, actions, owners, and timing",
    color: "#4de1a1",
    type: "report",
  },
  {
    file: "variance-analysis.xlsx",
    title: "VARIANCE ANALYSIS",
    detail: "KPI signals, regional bridge, and control checks",
    color: "#7b8cff",
    type: "chart",
  },
];

const ArtifactPreview: React.FC<{type: string; color: string}> = ({
  type,
  color,
}) => {
  if (type === "table") {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
          gap: 8,
          padding: 22,
          borderRadius: 18,
          backgroundColor: "#f3f7f9",
        }}
      >
        {Array.from({length: 24}).map((_, index) => (
          <span
            key={index}
            style={{
              height: index < 4 ? 14 : 10,
              borderRadius: 5,
              backgroundColor: index < 4 ? "#17365d" : "#c3d1d9",
              opacity: index > 3 && index % 5 === 0 ? 0.52 : 1,
            }}
          />
        ))}
      </div>
    );
  }
  if (type === "chart") {
    return (
      <div
        style={{
          height: 188,
          display: "flex",
          alignItems: "flex-end",
          gap: 20,
          padding: "26px 30px",
          borderRadius: 18,
          backgroundColor: "#f3f7f9",
        }}
      >
        {[80, 128, 68, 112, 54].map((height, index) => (
          <span
            key={index}
            style={{
              flex: 1,
              height,
              borderRadius: "10px 10px 3px 3px",
              backgroundColor: index % 2 === 0 ? color : "#b4c3cc",
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        height: 188,
        padding: 24,
        borderRadius: 18,
        backgroundColor: "#f3f7f9",
      }}
    >
      <div
        style={{
          width: "58%",
          height: 15,
          borderRadius: 8,
          backgroundColor: "#17365d",
        }}
      />
      {[92, 84, 96, 68].map((width, index) => (
        <div
          key={index}
          style={{
            marginTop: 14,
            width: `${width}%`,
            height: 10,
            borderRadius: 6,
            backgroundColor: "#c2d0d8",
          }}
        />
      ))}
      <div style={{display: "flex", gap: 10, marginTop: 22}}>
        <span
          style={{
            width: 86,
            height: 30,
            borderRadius: 10,
            backgroundColor: "#d9f4e7",
          }}
        />
        <span
          style={{
            width: 110,
            height: 30,
            borderRadius: 10,
            backgroundColor: "#dfe7ff",
          }}
        />
      </div>
    </div>
  );
};

export const ArtifactOrbitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const carousel = interpolate(
    frame,
    [0, 1.65 * fps, 3.5 * fps, 5.35 * fps, 7.45 * fps],
    [-0.75, 0, 1, 2, 2.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: [
        Easing.bezier(0.16, 1, 0.3, 1),
        Easing.bezier(0.16, 1, 0.3, 1),
        Easing.bezier(0.16, 1, 0.3, 1),
        Easing.bezier(0.7, 0, 0.84, 0),
      ],
    },
  );

  return (
    <CinematicShell chapter="04 / PUBLISH" accent="#4de1a1">
      <div
        style={{
          position: "absolute",
          inset: "116px 74px 74px",
          overflow: "hidden",
          perspective: 1400,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 42,
            top: 70,
            zIndex: 30,
          }}
        >
          <Interactive.Div
            name="Artifacts label"
            style={{
              opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <CinematicPill accent="#4de1a1">
              Atomic output publishing
            </CinematicPill>
          </Interactive.Div>
          <Interactive.Div
            name="Artifacts heading"
            style={{
              marginTop: 24,
              fontFamily: displayFont,
              fontSize: 70,
              lineHeight: 0.96,
              letterSpacing: "-0.055em",
              fontWeight: 700,
              opacity: interpolate(
                frame,
                [0.22 * fps, 0.85 * fps],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            ONE RUN.
            <br />
            <span style={{color: "#4de1a1"}}>THREE DELIVERABLES.</span>
          </Interactive.Div>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "56%",
            width: 1220,
            height: 580,
            translate: "-610px -290px",
          }}
        >
          {artifacts.map((artifact, index) => {
            const delta = index - carousel;
            const absoluteDelta = Math.abs(delta);
            return (
              <GlassPanel
                key={artifact.file}
                accent={artifact.color}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 660,
                  minHeight: 430,
                  marginLeft: -330,
                  marginTop: -215,
                  padding: "30px 32px 32px",
                  translate: `${delta * 610}px ${absoluteDelta * 72}px`,
                  scale:
                    (1 / (1 + absoluteDelta * 0.48)) *
                    (index === 2
                      ? interpolate(
                          frame,
                          [6.65 * fps, 7.45 * fps],
                          [1, 2.1],
                          {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                            easing: Easing.bezier(0.7, 0, 0.84, 0),
                            output: "perceptual-scale",
                          },
                        )
                      : 1),
                  rotate: `${delta * -5}deg`,
                  opacity: Math.max(0.08, 1 - absoluteDelta * 0.44),
                  filter: `blur(${Math.max(0, absoluteDelta - 0.8) * 3}px)`,
                  zIndex: 20 - Math.round(absoluteDelta * 4),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: artifact.color,
                      fontFamily: monoFont,
                      fontSize: 15,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                    }}
                  >
                    OUTPUT 0{index + 1}
                  </span>
                  <PassMark size={30} color={artifact.color} />
                </div>
                <div
                  style={{
                    marginTop: 22,
                    fontFamily: displayFont,
                    fontSize: 48,
                    lineHeight: 1,
                    letterSpacing: "-0.045em",
                    fontWeight: 700,
                  }}
                >
                  {artifact.title}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    color: "#8aa1af",
                    fontFamily: monoFont,
                    fontSize: 14,
                  }}
                >
                  {artifact.file}
                </div>
                <div style={{marginTop: 24}}>
                  <ArtifactPreview
                    type={artifact.type}
                    color={artifact.color}
                  />
                </div>
                <div
                  style={{
                    marginTop: 20,
                    color: "#aec0c9",
                    fontSize: 20,
                    lineHeight: 1.4,
                  }}
                >
                  {artifact.detail}
                </div>
              </GlassPanel>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            right: 42,
            bottom: 58,
            display: "flex",
            gap: 9,
          }}
        >
          {artifacts.map((artifact, index) => (
            <span
              key={artifact.file}
              style={{
                width: index === Math.round(carousel) ? 38 : 10,
                height: 10,
                borderRadius: 99,
                backgroundColor:
                  index === Math.round(carousel)
                    ? artifact.color
                    : "rgba(255,255,255,0.16)",
                boxShadow:
                  index === Math.round(carousel)
                    ? `0 0 18px ${artifact.color}`
                    : "none",
              }}
            />
          ))}
        </div>
      </div>
    </CinematicShell>
  );
};
