import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {displayFont, monoFont} from "../fonts";
import {CinematicPill, CinematicShell} from "./CinematicShell";

export const ColdOpenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <CinematicShell
      chapter="01 / THE DEADLINE"
      accent="#ff766c"
    >
      <Interactive.Div
        name="Spreadsheet camera"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(
            frame,
            [0, 1.5 * fps, 3.2 * fps, 4.95 * fps],
            [3.2, 2.45, 1.02, 1.52],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.7, 0, 0.84, 0),
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.7, 0, 0.84, 0),
              ],
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(
            frame,
            [0, 1.5 * fps, 3.2 * fps, 4.95 * fps],
            ["-780px 300px", "-580px 210px", "0px 0px", "390px -170px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.7, 0, 0.84, 0),
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.7, 0, 0.84, 0),
              ],
            },
          ),
          rotate: interpolate(
            frame,
            [0, 3.2 * fps, 4.95 * fps],
            ["0.9deg", "0deg", "-1deg"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          filter: `blur(${interpolate(
            frame,
            [0, 0.32 * fps, 1.3 * fps, 1.7 * fps, 4.55 * fps, 4.95 * fps],
            [6, 0, 0, 1.5, 0, 7],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )}px)`,
        }}
      >
        <Img
          name="Authentic variance workbook"
          src={staticFile("fpa-automation-highlight-poster.jpg")}
          style={{
            width: 1920,
            height: 1080,
            objectFit: "cover",
          }}
        />
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(3,10,18,0.9) 0%, rgba(3,10,18,0.54) 45%, rgba(3,10,18,0.12) 100%)",
          opacity: interpolate(
            frame,
            [0, 1.5 * fps, 2.25 * fps, 4.45 * fps],
            [0.08, 0.12, 0.7, 0.76],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 94,
          top: 190,
          zIndex: 12,
          maxWidth: 950,
        }}
      >
        <Interactive.Div
          name="Deadline label"
          style={{
            opacity: interpolate(
              frame,
              [1.75 * fps, 2.2 * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
            translate: interpolate(
              frame,
              [1.75 * fps, 2.2 * fps],
              ["0px 24px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({damping: 180}),
              },
            ),
          }}
        >
          <CinematicPill accent="#ff766c" dark>
            Month-end / June 2026
          </CinematicPill>
        </Interactive.Div>
        <Interactive.Div
          name="Cold open title"
          style={{
            marginTop: 32,
            fontFamily: displayFont,
            fontSize: 124,
            lineHeight: 0.9,
            letterSpacing: "-0.065em",
            fontWeight: 700,
            opacity: interpolate(
              frame,
              [2.05 * fps, 2.7 * fps, 4.35 * fps, 4.78 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: [
                  Easing.bezier(0.16, 1, 0.3, 1),
                  Easing.linear,
                  Easing.bezier(0.7, 0, 0.84, 0),
                ],
              },
            ),
            translate: interpolate(
              frame,
              [2.05 * fps, 2.7 * fps],
              ["0px 72px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({damping: 165}),
              },
            ),
          }}
        >
          360 ROWS.
          <br />
          <span style={{color: "#ff766c"}}>ONE RUN.</span>
        </Interactive.Div>
        <div
          style={{
            marginTop: 30,
            color: "#c7d3da",
            fontSize: 31,
            lineHeight: 1.3,
            opacity: interpolate(
              frame,
              [2.65 * fps, 3.15 * fps, 4.15 * fps, 4.55 * fps],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          The reporting pack is due.
          <br />
          <strong style={{color: "#ffffff"}}>
            The controls cannot disappear.
          </strong>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 210,
          bottom: 172,
          width: 178,
          height: 178,
          borderRadius: "50%",
          border: "2px solid rgba(255,118,108,0.74)",
          boxShadow:
            "0 0 0 18px rgba(255,118,108,0.08), 0 0 90px rgba(255,118,108,0.48)",
          scale: interpolate(
            frame,
            [3.35 * fps, 3.75 * fps, 4.95 * fps],
            [0, 1, 2.8],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            },
          ),
          opacity: interpolate(
            frame,
            [3.25 * fps, 3.65 * fps, 4.7 * fps, 4.95 * fps],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: monoFont,
          color: "#ffffff",
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        360
      </div>
    </CinematicShell>
  );
};
