import {Audio} from "@remotion/media";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {AbsoluteFill, Composition, Folder, staticFile} from "remotion";
import {AutomationRunScene} from "./workflow/AutomationRunScene";
import {EndCardScene} from "./workflow/EndCardScene";
import {OutputsScene} from "./workflow/OutputsScene";
import {RawWorkbookScene} from "./workflow/RawWorkbookScene";
import {ReportRevealScene} from "./workflow/ReportRevealScene";
import {RecordedProcessFilm} from "./workflow/RecordedProcessFilm";
import {ReviewWorkspaceScene} from "./workflow/ReviewWorkspaceScene";
import {TaskBriefScene} from "./workflow/TaskBriefScene";
import {ValidationPromiseScene} from "./workflow/ValidationPromiseScene";

export const LegacyFpaAutomationDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence name="01 — Raw workbook" durationInFrames={180}>
          <RawWorkbookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 10})}
        />
        <TransitionSeries.Sequence name="02 — Task handoff" durationInFrames={210}>
          <TaskBriefScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 10})}
        />
        <TransitionSeries.Sequence name="03 — Validation promise" durationInFrames={120}>
          <ValidationPromiseScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 10})}
        />
        <TransitionSeries.Sequence name="04 — Automation run" durationInFrames={300}>
          <AutomationRunScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 10})}
        />
        <TransitionSeries.Sequence name="05 — Controlled outputs" durationInFrames={240}>
          <OutputsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 10})}
        />
        <TransitionSeries.Sequence name="06 — Management report" durationInFrames={300}>
          <ReportRevealScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 10})}
        />
        <TransitionSeries.Sequence name="07 — Review workspace" durationInFrames={300}>
          <ReviewWorkspaceScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 10})}
        />
        <TransitionSeries.Sequence name="08 — Decision ready" durationInFrames={220}>
          <EndCardScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio
        name="Procedural workflow score"
        src={staticFile("remotion-sfx/process-score.wav")}
        volume={0.44}
      />
      {[174, 374, 484, 774, 1004, 1294, 1584].map((from, index) => (
        <Audio
          key={`whip-${from}`}
          name={`Workflow transition ${index + 1}`}
          from={from}
          src={staticFile("remotion-sfx/whoosh.wav")}
          volume={0.2}
        />
      ))}
      {[246, 644, 688, 732, 1084, 1504].map((from, index) => (
        <Audio
          key={`click-${from}`}
          name={`Interface click ${index + 1}`}
          from={from}
          src={staticFile("remotion-sfx/mouse-click.wav")}
          volume={0.22}
        />
      ))}
      {[538, 596, 654, 712].map((from, index) => (
        <Audio
          key={`pass-${from}`}
          name={`Control pass ${index + 1}`}
          from={from}
          src={staticFile("remotion-sfx/ding.wav")}
          volume={0.13}
        />
      ))}
    </AbsoluteFill>
  );
};

export const FpaAutomationDemo = RecordedProcessFilm;

export const DemoCompositions: React.FC = () => {
  return (
    <Folder name="FPA-Workflow-Film">
      <Composition
        id="FpaAutomationDemo"
        component={FpaAutomationDemo}
        durationInFrames={2454}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Workflow-Scenes">
        <Composition id="RawWorkbookScene" component={RawWorkbookScene} durationInFrames={180} fps={30} width={1920} height={1080} />
        <Composition id="TaskBriefScene" component={TaskBriefScene} durationInFrames={210} fps={30} width={1920} height={1080} />
        <Composition id="ValidationPromiseScene" component={ValidationPromiseScene} durationInFrames={120} fps={30} width={1920} height={1080} />
        <Composition id="AutomationRunScene" component={AutomationRunScene} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="OutputsScene" component={OutputsScene} durationInFrames={240} fps={30} width={1920} height={1080} />
        <Composition id="ReportRevealScene" component={ReportRevealScene} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="ReviewWorkspaceScene" component={ReviewWorkspaceScene} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="EndCardScene" component={EndCardScene} durationInFrames={220} fps={30} width={1920} height={1080} />
      </Folder>
    </Folder>
  );
};
