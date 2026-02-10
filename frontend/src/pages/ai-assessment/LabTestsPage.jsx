import { Link } from "react-router-dom";
import { useSymptomPageState } from "../../hooks/useSymptomPageState.js";

export default function LabTestsPage() {
  const { formData, state, data } = useSymptomPageState();
  if (!formData) return null;

  const items = data.labTests ?? [];

  return (
    <section className="symptom-subpage">
      <div className="panel">
        <Link to="/ai-assessment" state={state} className="back-link">
          ← Back to assessment
        </Link>
        <h1>Lab tests</h1>
        <p className="panel-subtitle">
          Possible tests relevant to your reported symptoms only. Discuss with a healthcare provider.
        </p>
        <ul className="content-list">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
