import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="landing">
      <div className="hero">
        <h1>Early symptom check, safer decisions.</h1>
        <p className="hero-subtitle">
          SafeHealth Triage uses an explainable, rule-based AI assistant to
          estimate urgency levels for your symptoms, highlight concerning
          patterns, and suggest safe next steps.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn-primary">
            Get started
          </Link>
          <Link to="/login" className="btn-ghost">
            I already have an account
          </Link>
        </div>
      </div>

      <div className="cards-grid">
        <div className="info-card">
          <h2>What this tool does</h2>
          <ul>
            <li>Classifies risk as Low / Medium / High.</li>
            <li>
              Explains <strong>why</strong> a risk level was assigned.
            </li>
            <li>
              Detects danger patterns like chest pain plus breathlessness or high
              fever with seizures.
            </li>
            <li>Recommends whether to monitor, see a doctor, or seek urgent help.</li>
          </ul>
        </div>

        <div className="info-card">
          <h2>What this tool does NOT do</h2>
          <ul>
            <li>It does not diagnose diseases.</li>
            <li>It does not prescribe medicines or treatments.</li>
            <li>It cannot guarantee that symptoms are safe.</li>
            <li>
              It is <strong>not</strong> a substitute for a qualified clinician or
              emergency services.
            </li>
          </ul>
        </div>

        <div className="info-card disclaimer">
          <h2>Safety disclaimer</h2>
          <p>
            This application is for educational and informational support only.
            It uses simple rules, not a medical-grade model. Do not ignore
            professional medical advice because of anything you see here. If you
            feel very unwell, unsafe, or unsure, contact a doctor or local
            emergency services immediately.
          </p>
        </div>
      </div>
    </section>
  );
}

