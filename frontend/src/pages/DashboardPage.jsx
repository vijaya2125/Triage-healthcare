import { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import {
  createAssessment,
  getAssessmentHistory,
  triggerMockAlert
} from "../api/client.jsx";

const COMMON_SYMPTOMS = [
  "chest pain",
  "shortness of breath",
  "high fever",
  "seizures",
  "dizziness",
  "abdominal pain",
  "nausea",
  "vomiting",
  "diarrhea",
  "sore throat",
  "cough",
  "wheezing",
  "confusion",
  "palpitations",
  "body ache"
];

function RiskBadge({ riskLevel }) {
  if (!riskLevel) return null;
  return <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>{riskLevel}</span>;
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [symptomText, setSymptomText] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [durationDays, setDurationDays] = useState(1);
  const [severity, setSeverity] = useState(5);
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || "adult");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getAssessmentHistory(token);
        setHistory(res.history || []);
      } catch {
        // history is optional; ignore errors for UX simplicity
      }
    };
    loadHistory();
  }, [token]);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAlertSent(false);
    setResult(null);
    if (!symptomText.trim()) {
      setError("Please describe your symptoms in your own words.");
      return;
    }
    setLoading(true);
    try {
      const res = await createAssessment(
        {
          symptomText,
          selectedSymptoms,
          durationDays: Number(durationDays),
          severity: Number(severity),
          ageGroup
        },
        token
      );
      setResult(res);
      setHistory((prev) => [
        {
          _id: res.id,
          riskLevel: res.riskLevel,
          createdAt: new Date().toISOString(),
          symptomText
        },
        ...prev
      ]);
    } catch (err) {
      setError(err.message || "Failed to assess risk");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!result || result.actionType !== "EMERGENCY") return;
    try {
      setAlertSent(false);
      await triggerMockAlert(
        {
          riskLevel: result.riskLevel,
          message:
            alertMessage ||
            "User triggered an emergency alert after a high-risk assessment."
        },
        token
      );
      setAlertSent(true);
    } catch {
      setAlertSent(false);
    }
  };

  return (
    <section className="dashboard">
      <div className="dashboard-grid">
        <div className="panel">
          <h1>Symptom check-in</h1>
          <p className="panel-subtitle">
            Describe what you are feeling right now. The AI will estimate risk,
            explain the reasoning in plain language, and suggest safe next steps.
          </p>
          <form onSubmit={handleSubmit} className="assessment-form">
            <label>
              Describe your symptoms (in your own words)
              <textarea
                rows={4}
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder="Example: Sudden tight chest pain on the left side, shortness of breath when walking..."
                required
              />
            </label>

            <label>
              Select matching symptoms (optional)
              <div className="chips-grid">
                {COMMON_SYMPTOMS.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    className={
                      selectedSymptoms.includes(sym)
                        ? "chip chip-selected"
                        : "chip"
                    }
                    onClick={() => toggleSymptom(sym)}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </label>

            <div className="form-row">
              <label>
                Duration (days)
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  required
                />
              </label>
              <label className="severity-label">
                Severity (1 = very mild, 10 = worst imaginable)
                <div className="severity-row">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  />
                  <span className="severity-value">{severity}</span>
                </div>
              </label>
            </div>

            <label>
              Age group (used only for risk estimation)
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              >
                <option value="child">Child</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </label>

            {error && <p className="error-text">{error}</p>}

            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? "Assessing..." : "Assess risk"}
            </button>

            <p className="disclaimer-inline">
              This tool is not a diagnosis and cannot guarantee safety. If you
              feel very unwell or unsafe, seek emergency care regardless of the
              suggested risk level.
            </p>
          </form>
        </div>

        <div className="panel">
          <h2>AI assessment</h2>
          {!result && (
            <p className="muted">
              Run an assessment to see risk level, reasoning, and recommended
              actions here.
            </p>
          )}
          {result && (
            <div
              className={
                result.actionType === "EMERGENCY"
                  ? "result-card result-high"
                  : "result-card"
              }
            >
              <div className="result-header">
                <span>Estimated risk level</span>
                <RiskBadge riskLevel={result.riskLevel} />
              </div>
              <p className="result-primary">
                Recommended next step: <strong>{result.recommendedAction}</strong>
              </p>
              {result.possibleConditions?.length > 0 && (
                <div className="result-section">
                  <h3>Possible condition categories (not a diagnosis)</h3>
                  <ul>
                    {result.possibleConditions.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.explanation?.length > 0 && (
                <div className="result-section">
                  <h3>Why this risk level?</h3>
                  <ul>
                    {result.explanation.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="disclaimer-strong">
                This is not a medical diagnostic tool and may be wrong. It does
                not replace a consultation with a qualified clinician. If in
                doubt, seek in-person care.
              </p>

              {result.actionType === "EMERGENCY" && (
                <div className="emergency-box">
                  <h3>Emergency guidance</h3>
                  <p>
                    If your symptoms are sudden, severe, or worsening, do not
                    delay. Contact local emergency services or go to the nearest
                    emergency department immediately.
                  </p>
                  <label>
                    Optional note for alert (mock)
                    <input
                      type="text"
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      placeholder="Short note about your situation"
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-danger full-width"
                    onClick={handleSendAlert}
                  >
                    Trigger mock emergency alert
                  </button>
                  {alertSent && (
                    <p className="success-text">
                      Mock alert sent (no real SMS/email was sent). In a real
                      deployment this would notify your emergency contact or a
                      healthcare service.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="history-section">
            <h2>Recent assessments</h2>
            {history.length === 0 && (
              <p className="muted">No previous assessments yet.</p>
            )}
            {history.length > 0 && (
              <ul className="history-list">
                {history.map((item) => (
                  <li key={item._id || item.id}>
                    <div className="history-main">
                      <RiskBadge riskLevel={item.riskLevel} />
                      <span className="history-text">
                        {item.symptomText?.slice(0, 80) || "Symptom summary"}
                        {item.symptomText?.length > 80 ? "…" : ""}
                      </span>
                    </div>
                    <span className="history-date">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

