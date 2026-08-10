import {WORKFLOW} from "./WorkflowShell";
import {interFont, monoFont} from "../fonts";

const metrics = [
  ["Revenue", "108.4B", "100.6B", "+7.8%", WORKFLOW.green],
  ["Gross Margin", "28.7%", "30.0%", "-1.3pp", WORKFLOW.red],
  ["OPEX", "19.2B", "18.4B", "+4.3%", WORKFLOW.red],
  ["EBITDA", "11.9B", "11.8B", "+1.2%", WORKFLOW.green],
];

const actions = [
  ["1", "Review discount leakage; set approval thresholds.", "Commercial Finance", "1 week"],
  ["2", "Reconcile OPEX overruns; freeze low-ROI spend.", "FP&A + Regional Finance", "Immediate"],
  ["3", "Build a Central EBITDA recovery plan.", "Central GM", "Before next close"],
];

export const ManagementReport: React.FC<{compact?: boolean}> = ({
  compact = false,
}) => {
  const ratio = compact ? 0.78 : 1;
  return (
    <div
      style={{
        width: 1040 * ratio,
        minHeight: 1320 * ratio,
        borderRadius: 12 * ratio,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        color: "#24292f",
        boxShadow: "0 30px 90px rgba(32, 36, 44, 0.2)",
        fontFamily: interFont,
      }}
    >
      <div
        style={{
          height: 164 * ratio,
          padding: `${38 * ratio}px ${54 * ratio}px`,
          color: "#ffffff",
          backgroundColor: WORKFLOW.navy,
        }}
      >
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 15 * ratio,
            letterSpacing: "0.08em",
            opacity: 0.72,
          }}
        >
          FP&amp;A PERFORMANCE REVIEW
        </div>
        <div
          style={{
            marginTop: 10 * ratio,
            fontSize: 42 * ratio,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "-0.035em",
          }}
        >
          MONTHLY MANAGEMENT REPORT
        </div>
        <div
          style={{
            marginTop: 12 * ratio,
            color: "#d9e5f2",
            fontSize: 17 * ratio,
          }}
        >
          June 2026&nbsp;&nbsp;|&nbsp;&nbsp;Actual vs Budget&nbsp;&nbsp;|&nbsp;&nbsp;VND
        </div>
      </div>

      <div style={{padding: `${38 * ratio}px ${54 * ratio}px ${50 * ratio}px`}}>
        <div
          style={{
            padding: `${22 * ratio}px ${26 * ratio}px`,
            borderLeft: `${6 * ratio}px solid ${WORKFLOW.orange}`,
            borderRadius: 8 * ratio,
            backgroundColor: "#f4f7fa",
            fontSize: 19 * ratio,
            lineHeight: 1.45,
            fontWeight: 600,
          }}
        >
          Revenue finished 7.8% above budget; gross margin was 1.3pp below
          plan; OPEX was 4.3% unfavorable; and EBITDA was 1.2% above budget.
        </div>

        <div
          style={{
            marginTop: 34 * ratio,
            color: WORKFLOW.navy,
            fontFamily: monoFont,
            fontSize: 17 * ratio,
            fontWeight: 600,
            letterSpacing: "0.055em",
          }}
        >
          1&nbsp;&nbsp;|&nbsp;&nbsp;PERFORMANCE AT A GLANCE
        </div>
        <div
          style={{
            marginTop: 16 * ratio,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12 * ratio,
          }}
        >
          {metrics.map(([label, actual, budget, variance, color]) => (
            <div
              key={label}
              style={{
                padding: `${20 * ratio}px ${16 * ratio}px`,
                border: `1px solid #dce3ea`,
                borderRadius: 10 * ratio,
                backgroundColor: "#fbfcfd",
              }}
            >
              <div
                style={{
                  color: "#68727e",
                  fontSize: 13 * ratio,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 9 * ratio,
                  fontSize: 31 * ratio,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                }}
              >
                {actual}
              </div>
              <div
                style={{
                  marginTop: 4 * ratio,
                  color: "#7b8490",
                  fontSize: 12 * ratio,
                }}
              >
                Budget {budget}
              </div>
              <div
                style={{
                  marginTop: 8 * ratio,
                  color,
                  fontSize: 18 * ratio,
                  fontWeight: 800,
                }}
              >
                {variance}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 34 * ratio,
            color: WORKFLOW.navy,
            fontFamily: monoFont,
            fontSize: 17 * ratio,
            fontWeight: 600,
            letterSpacing: "0.055em",
          }}
        >
          3&nbsp;&nbsp;|&nbsp;&nbsp;MANAGEMENT FOCUS
        </div>
        <div
          style={{
            marginTop: 15 * ratio,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12 * ratio,
          }}
        >
          {[
            ["Protect growth", "Tighten discount governance by product and channel."],
            ["Recover margin", "Target at least 100bps in the next forecast."],
            ["Own the bridge", "Central EBITDA actions before the July lock."],
          ].map(([title, body]) => (
            <div
              key={title}
              style={{
                minHeight: 134 * ratio,
                padding: `${20 * ratio}px`,
                borderRadius: 10 * ratio,
                backgroundColor: "#eef4f9",
              }}
            >
              <div
                style={{
                  color: WORKFLOW.navy,
                  fontSize: 18 * ratio,
                  fontWeight: 800,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  marginTop: 9 * ratio,
                  color: "#5d6874",
                  fontSize: 14 * ratio,
                  lineHeight: 1.4,
                }}
              >
                {body}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 34 * ratio,
            color: WORKFLOW.navy,
            fontFamily: monoFont,
            fontSize: 17 * ratio,
            fontWeight: 600,
            letterSpacing: "0.055em",
          }}
        >
          4&nbsp;&nbsp;|&nbsp;&nbsp;RISKS AND RECOMMENDED ACTIONS
        </div>
        <div
          style={{
            marginTop: 14 * ratio,
            border: "1px solid #dce3ea",
            borderRadius: 10 * ratio,
            overflow: "hidden",
          }}
        >
          {actions.map(([priority, action, owner, timing], index) => (
            <div
              key={priority}
              style={{
                minHeight: 74 * ratio,
                display: "grid",
                gridTemplateColumns: "55px 1fr 230px",
                alignItems: "center",
                gap: 14 * ratio,
                padding: `${12 * ratio}px ${18 * ratio}px`,
                borderTop: index === 0 ? "none" : "1px solid #e6ebef",
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                fontSize: 14 * ratio,
              }}
            >
              <div
                style={{
                  width: 32 * ratio,
                  height: 32 * ratio,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: WORKFLOW.orange,
                  color: "#ffffff",
                  fontWeight: 800,
                }}
              >
                {priority}
              </div>
              <div style={{fontWeight: 600}}>{action}</div>
              <div>
                <div style={{color: WORKFLOW.navy, fontWeight: 800}}>{owner}</div>
                <div style={{marginTop: 3 * ratio, color: "#78818b"}}>{timing}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28 * ratio,
            display: "flex",
            justifyContent: "space-between",
            color: "#858d96",
            fontFamily: monoFont,
            fontSize: 12 * ratio,
          }}
        >
          <span>360 / 360 rows processed</span>
          <span>Prepared by Python · Finance review required</span>
        </div>
      </div>
    </div>
  );
};
