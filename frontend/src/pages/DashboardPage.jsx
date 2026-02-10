import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { useAssessment } from "../state/AssessmentContext.jsx";
import { createAssessment } from "../api/client.jsx";

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

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { setAssessmentResult } = useAssessment();
  const navigate = useNavigate();
  const [symptomText, setSymptomText] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [durationDays, setDurationDays] = useState(1);
  const [severity, setSeverity] = useState(5);
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || "adult");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const formData = {
        symptomText,
        selectedSymptoms,
        durationDays: Number(durationDays),
        severity: Number(severity),
        ageGroup
      };
      setAssessmentResult(res, formData);
      navigate("/ai-assessment", { state: { assessmentResult: res, formData } });
    } catch (err) {
      setError(err.message || "Failed to assess risk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard">
      <div className="dashboard-single">
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
      </div>
    </section>
  );
}
