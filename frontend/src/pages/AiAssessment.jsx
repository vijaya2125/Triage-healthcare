import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAssessment } from "../state/AssessmentContext.jsx";
import IconCard from "../components/IconCard.jsx";
import {
  MdSick,
  MdScience,
  MdLocalHospital,
  MdRestaurant,
  MdDescription
} from "react-icons/md";

function RiskBadge({ riskLevel }) {
  if (!riskLevel) return null;
  return (
    <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
      {riskLevel}
    </span>
  );
}

export default function AiAssessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessment, setAssessmentResult } = useAssessment();
  const state = location.state;
  const result = state?.assessmentResult ?? assessment?.result;
  const formData = state?.formData ?? assessment?.formData;

  useEffect(() => {
    if (state?.assessmentResult && state?.formData) {
      setAssessmentResult(state.assessmentResult, state.formData);
    }
  }, [state?.assessmentResult, state?.formData, setAssessmentResult]);

  useEffect(() => {
    if (!result || !formData) {
      navigate("/dashboard", { replace: true });
    }
  }, [result, formData, navigate]);

  if (!result || !formData) return null;

  const linkState = { assessmentResult: result, formData };

  return (
    <section className="ai-assessment">
      <div
        className={
          result.actionType === "EMERGENCY"
            ? "panel ai-assessment-panel result-card result-high"
            : "panel ai-assessment-panel result-card"
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
          This is not a medical diagnostic tool and may be wrong. It does not
          replace a consultation with a qualified clinician. If in doubt, seek
          in-person care.
        </p>
        {result.actionType === "EMERGENCY" && (
          <div className="emergency-box">
            <h3>Emergency guidance</h3>
            <p>
              If your symptoms are sudden, severe, or worsening, do not delay.
              Contact local emergency services or go to the nearest emergency
              department immediately.
            </p>
          </div>
        )}

        <div className="icon-cards-grid">
          <IconCard
            to="/ai-assessment/home-remedies"
            state={linkState}
            icon={MdSick}
            title="Home Remedies"
          />
          <IconCard
            to="/ai-assessment/lab-tests"
            state={linkState}
            icon={MdScience}
            title="Lab Tests"
          />
          <IconCard
            to="/ai-assessment/doctors"
            state={linkState}
            icon={MdLocalHospital}
            title="Doctors"
          />
          <IconCard
            to="/ai-assessment/diet"
            state={linkState}
            icon={MdRestaurant}
            title="Diet"
          />
          <IconCard
            to="/ai-assessment/final-report"
            state={linkState}
            icon={MdDescription}
            title="Final Report"
          />
        </div>
      </div>
    </section>
  );
}
