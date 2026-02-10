import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { symptomData, getSymptomKey } from "../data/symptomData.js";
import { useAssessment } from "../state/AssessmentContext.jsx";

export function useSymptomPageState() {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessment } = useAssessment();
  const state = location.state ?? (assessment ? { assessmentResult: assessment.result, formData: assessment.formData } : null);
  const formData = state?.formData ?? null;

  useEffect(() => {
    if (!formData) navigate("/dashboard", { replace: true });
  }, [formData, navigate]);

  const key = formData ? getSymptomKey(formData.symptomText, formData.selectedSymptoms) : "default";
  const data = symptomData[key] ?? symptomData.default;
  return { formData, state, key, data };
}
