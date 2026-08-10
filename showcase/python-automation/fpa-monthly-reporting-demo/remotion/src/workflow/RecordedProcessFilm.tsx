import {Audio, Video} from "@remotion/media";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {displayFont, interFont, monoFont} from "../fonts";
import {EndCardScene} from "./EndCardScene";
import {ReviewWorkspaceScene} from "./ReviewWorkspaceScene";
import {WORKFLOW} from "./WorkflowShell";

const FPS = 30;
const SOURCE = "recorded-process-source.mp4";
const TRANSITION = 8;

const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);

type RecordedClipProps = {
  chapter: string;
  detail: string;
  durationInFrames: number;
  endSeconds: number;
  focus: [number, number];
  headline: string | ((frame: number) => string);
  pan?: [number, number];
  startSeconds: number;
  zoom?: [number, number];
};

const RecordedClip: React.FC<RecordedClipProps> = ({
  chapter,
  detail,
  durationInFrames,
  endSeconds,
  focus,
  headline,
  pan = [0, 0],
  startSeconds,
  zoom = [1, 1.1],
}) => {
  const frame = useCurrentFrame();
  const sourceFrames = secondsToFrames(endSeconds - startSeconds);
  const playbackRate = sourceFrames / durationInFrames;
  const resolvedHeadline =
    typeof headline === "function" ? headline(frame) : headline;
  const cameraFrame = Math.max(1, durationInFrames - 1);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#07111f",
        color: "#ffffff",
        fontFamily: interFont,
      }}
    >
      <div style={{position: "absolute", inset: 0, overflow: "hidden"}}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            scale: interpolate(
              frame,
              [0, cameraFrame * 0.62, cameraFrame],
              [zoom[0], zoom[1], zoom[1] * 0.992],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                output: "perceptual-scale",
              },
            ),
            translate: interpolate(
              frame,
              [0, cameraFrame * 0.62, cameraFrame],
              [
                "0px 0px",
                `${pan[0]}px ${pan[1]}px`,
                `${pan[0] * 0.94}px ${pan[1] * 0.94}px`,
              ],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
            transformOrigin: `${focus[0]}% ${focus[1]}%`,
          }}
        >
          <Video
            src={staticFile(SOURCE)}
            trimBefore={secondsToFrames(startSeconds)}
            trimAfter={secondsToFrames(endSeconds)}
            playbackRate={playbackRate}
            muted
            premountFor={30}
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 45%, transparent 48%, rgba(3,10,20,0.28) 100%), linear-gradient(180deg, rgba(4,12,22,0.22), transparent 25%, transparent 65%, rgba(3,9,18,0.82) 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 42,
          top: 34,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 999,
          backgroundColor: "rgba(5,14,26,0.76)",
          boxShadow: "0 14px 34px rgba(0,0,0,0.22)",
          backdropFilter: "blur(14px)",
          fontFamily: monoFont,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            backgroundColor: WORKFLOW.orange,
            boxShadow: `0 0 18px ${WORKFLOW.orange}`,
          }}
        />
        {chapter}
      </div>

      <div
        style={{
          position: "absolute",
          right: 42,
          top: 34,
          padding: "10px 14px",
          borderRadius: 999,
          backgroundColor: "rgba(5,14,26,0.76)",
          color: "#d7e3ef",
          fontFamily: monoFont,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Synthetic data / Public-safe capture
      </div>

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          bottom: 48,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 50,
        }}
      >
        <div>
          <div
            style={{
              maxWidth: 1120,
              fontFamily: displayFont,
              fontSize: 48,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              textShadow: "0 8px 30px rgba(0,0,0,0.55)",
            }}
          >
            {resolvedHeadline}
          </div>
          <div
            style={{
              marginTop: 10,
              color: "#cad6e2",
              fontSize: 18,
              lineHeight: 1.35,
              textShadow: "0 4px 18px rgba(0,0,0,0.7)",
            }}
          >
            {detail}
          </div>
        </div>
        <div
          style={{
            flex: "0 0 auto",
            color: "#d7e3ef",
            fontFamily: monoFont,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          REAL WORKFLOW FOOTAGE
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: `${interpolate(frame, [0, cameraFrame], [0, 100], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}%`,
          height: 5,
          background: `linear-gradient(90deg, ${WORKFLOW.orange}, #f3b08d)`,
          boxShadow: `0 0 22px ${WORKFLOW.orange}`,
        }}
      />
    </AbsoluteFill>
  );
};

const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#07111f",
        color: "#ffffff",
        fontFamily: interFont,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(frame, [0, 89], [1.18, 1.02], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
          filter: "saturate(0.5) contrast(1.1)",
        }}
      >
        <Video
          src={staticFile(SOURCE)}
          trimBefore={0}
          trimAfter={210}
          muted
          premountFor={30}
          objectFit="cover"
          style={{width: "100%", height: "100%"}}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(3,10,20,0.96) 0%, rgba(3,10,20,0.86) 42%, rgba(3,10,20,0.28) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 120,
          opacity: interpolate(frame, [4, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [4, 26], ["0px 28px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div
          style={{
            color: "#f3b08d",
            fontFamily: monoFont,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Recorded end-to-end / actual automation process
        </div>
        <div
          style={{
            marginTop: 26,
            maxWidth: 1010,
            fontFamily: displayFont,
            fontSize: 112,
            lineHeight: 0.88,
            fontWeight: 700,
            letterSpacing: "-0.065em",
          }}
        >
          RAW DATA
          <br />
          <span style={{color: WORKFLOW.orange}}>TO MANAGEMENT REPORT.</span>
        </div>
        <div
          style={{
            marginTop: 30,
            maxWidth: 820,
            color: "#c8d5e1",
            fontSize: 25,
            lineHeight: 1.4,
          }}
        >
          Excel input, one controlled Python run, reconciled outputs and a
          decision-ready FP&amp;A narrative.
        </div>
        <div
          style={{
            marginTop: 38,
            display: "flex",
            gap: 12,
          }}
        >
          {["360 ROWS", "3 OUTPUTS", "4 CONTROLS", "FINANCE REVIEW"].map(
            (label, index) => (
              <div
                key={label}
                style={{
                  padding: "11px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  fontFamily: monoFont,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  opacity: interpolate(
                    frame,
                    [30 + index * 7, 44 + index * 7],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  ),
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const runHeadline = (frame: number) => {
  if (frame < 64) return "1 / Validate the source rows";
  if (frame < 132) return "2 / Publish the standardized dataset";
  if (frame < 214) return "3 / Calculate management variances";
  return "4 / Generate the management report";
};

const fadeTransition = () => (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({durationInFrames: TRANSITION})}
  />
);

export const RecordedProcessFilm: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence name="01 - Opening" durationInFrames={90}>
          <OpeningScene />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="02 - Raw input" durationInFrames={210}>
          <RecordedClip
            chapter="01 / RAW INPUT"
            detail="Transaction, date, region, product, actual and budget fields are visible before transformation."
            durationInFrames={210}
            startSeconds={0}
            endSeconds={7}
            focus={[42, 55]}
            headline="360 fictional source rows enter the close."
            pan={[-44, 24]}
            zoom={[1, 1.1]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="03 - Launch" durationInFrames={120}>
          <RecordedClip
            chapter="02 / CONTROLLED RUN"
            detail="The public-safe runner executes the repository's real Python workflow."
            durationInFrames={120}
            startSeconds={7}
            endSeconds={11}
            focus={[82, 82]}
            headline="One button starts the controlled monthly close."
            pan={[-56, -28]}
            zoom={[1, 1.12]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="04 - Setup ramp" durationInFrames={90}>
          <RecordedClip
            chapter="02 / CONTROLLED RUN"
            detail="Prior outputs are cleared while the raw workbook remains preserved."
            durationInFrames={90}
            startSeconds={11}
            endSeconds={21.5}
            focus={[66, 48]}
            headline="Reset. Validate. Then publish."
            pan={[-42, 16]}
            zoom={[1.02, 1.13]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="05 - Live run" durationInFrames={300}>
          <RecordedClip
            chapter="03 / LIVE AUTOMATION"
            detail="Each step stays visible in the run log, including the headline management signals."
            durationInFrames={300}
            startSeconds={21.5}
            endSeconds={31.5}
            focus={[55, 49]}
            headline={runHeadline}
            pan={[-18, 8]}
            zoom={[1, 1.08]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="06 - Clean data" durationInFrames={150}>
          <RecordedClip
            chapter="04 / CLEAN DATA"
            detail="Dates, regions and products are standardized; FP&A measures are added."
            durationInFrames={150}
            startSeconds={31.5}
            endSeconds={35.9}
            focus={[55, 43]}
            headline="The raw rows become a governed analysis layer."
            pan={[-34, 18]}
            zoom={[1, 1.13]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="07 - Variance analysis" durationInFrames={300}>
          <RecordedClip
            chapter="05 / VARIANCE CALL"
            detail="Regional detail makes favorable growth and unfavorable margin pressure explicit."
            durationInFrames={300}
            startSeconds={35.9}
            endSeconds={45.9}
            focus={[50, 44]}
            headline="Revenue +7.8% / GM -1.3pp / EBITDA +1.2%"
            pan={[0, 10]}
            zoom={[1, 1.1]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="08 - Controls" durationInFrames={210}>
          <RecordedClip
            chapter="06 / RECONCILIATION"
            detail="Row count, revenue, budget and product mapping all reconcile to zero difference."
            durationInFrames={210}
            startSeconds={45.9}
            endSeconds={52.9}
            focus={[28, 36]}
            headline="Four controls. Four PASS results."
            pan={[48, 28]}
            zoom={[1.03, 1.2]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="09 - Report click" durationInFrames={45}>
          <RecordedClip
            chapter="07 / FINAL REPORT"
            detail="The controlled analysis is handed into the management narrative."
            durationInFrames={45}
            startSeconds={52.9}
            endSeconds={54.4}
            focus={[86, 76]}
            headline="Analysis becomes a management report."
            pan={[-68, -34]}
            zoom={[1.04, 1.16]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="10 - Word report" durationInFrames={375}>
          <RecordedClip
            chapter="07 / FINAL REPORT"
            detail="The executive readout connects performance, signal and regional variance."
            durationInFrames={375}
            startSeconds={54.4}
            endSeconds={66.9}
            focus={[50, 53]}
            headline="Decision-ready: performance, risks and priorities."
            pan={[0, -10]}
            zoom={[1, 1.08]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence
          name="11 - Actions and evidence"
          durationInFrames={300}
        >
          <ReviewWorkspaceScene />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence name="12 - Completion" durationInFrames={150}>
          <RecordedClip
            chapter="08 / COMPLETE"
            detail="Clean data, variance analysis and the final report are ready for management review."
            durationInFrames={150}
            startSeconds={66.9}
            endSeconds={71.9}
            focus={[61, 55]}
            headline="3 outputs ready. Finance keeps the judgment."
            pan={[-24, 10]}
            zoom={[1, 1.09]}
          />
        </TransitionSeries.Sequence>
        {fadeTransition()}
        <TransitionSeries.Sequence
          name="13 - Decision boundary"
          durationInFrames={210}
        >
          <EndCardScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio
        name="Cinematic process score"
        src={staticFile("remotion-sfx/process-score.wav")}
        volume={0.7}
      />
      {[82, 284, 478, 770, 912, 1204, 1443, 1810, 2102, 2244].map(
        (from, index) => (
          <Audio
            key={`whoosh-${from}`}
            name={`Cinematic transition ${index + 1}`}
            from={from}
            src={staticFile("remotion-sfx/whoosh.wav")}
            volume={0.2}
          />
        ),
      )}
      {[350, 1418].map((from, index) => (
        <Audio
          key={`click-${from}`}
          name={`Recorded click ${index + 1}`}
          from={from}
          src={staticFile("remotion-sfx/mouse-click.wav")}
          volume={0.22}
        />
      ))}
      {[538, 598, 658, 718, 1280].map((from, index) => (
        <Audio
          key={`pass-${from}`}
          name={`Control confirmation ${index + 1}`}
          from={from}
          src={staticFile("remotion-sfx/ding.wav")}
          volume={0.14}
        />
      ))}
    </AbsoluteFill>
  );
};
