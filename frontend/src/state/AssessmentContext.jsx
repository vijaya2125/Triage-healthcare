import React, { createContext, useContext, useState } from "react";

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  const [assessment, setAssessment] = useState(null);

  const setAssessmentResult = (result, formData) => {
    setAssessment({ result, formData });
  };

  const clearAssessment = () => {
    setAssessment(null);
  };

  return (
    <AssessmentContext.Provider
      value={{ assessment, setAssessmentResult, clearAssessment }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) {
    throw new Error("useAssessment must be used inside AssessmentProvider");
  }
  return ctx;
}
