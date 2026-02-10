import { Link } from "react-router-dom";
import { useSymptomPageState } from "../../hooks/useSymptomPageState.js";

export default function DoctorsPage() {
  const { formData, state, data } = useSymptomPageState();
  if (!formData) return null;

  const items = data.doctors ?? [];

  return (
    <section className="symptom-subpage">
      <div className="panel">
        <Link to="/ai-assessment" state={state} className="back-link">
          ← Back to assessment
        </Link>
        <h1>Doctors</h1>
        <p className="panel-subtitle">
          Types of providers that may be relevant to your reported symptoms only.
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
