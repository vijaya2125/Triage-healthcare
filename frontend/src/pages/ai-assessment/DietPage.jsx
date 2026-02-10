import { Link } from "react-router-dom";
import { useSymptomPageState } from "../../hooks/useSymptomPageState.js";

export default function DietPage() {
  const { formData, state, data } = useSymptomPageState();
  if (!formData) return null;

  const items = data.diet ?? [];

  return (
    <section className="symptom-subpage">
      <div className="panel">
        <Link to="/ai-assessment" state={state} className="back-link">
          ← Back to assessment
        </Link>
        <h1>Diet</h1>
        <p className="panel-subtitle">
          Diet tips for your reported symptoms only. This is not medical advice.
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
