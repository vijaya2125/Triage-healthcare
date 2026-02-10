import { Link } from "react-router-dom";
import { useSymptomPageState } from "../../hooks/useSymptomPageState.js";

export default function FinalReportPage() {
  const { formData, state, data } = useSymptomPageState();
  if (!formData) return null;

  const summary = data.finalReport ?? "";

  return (
    <section className="symptom-subpage">
      <div className="panel">
        <Link to="/ai-assessment" state={state} className="back-link">
          ← Back to assessment
        </Link>
        <h1>Final report</h1>
        <p className="panel-subtitle">
          Summary for your reported symptoms only. Not a diagnosis.
        </p>
        <p className="content-summary">{summary}</p>
      </div>
    </section>
  );
}
