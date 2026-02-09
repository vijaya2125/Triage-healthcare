/**
 * Explainable rule-based triage engine.
 *
 * This module does NOT diagnose diseases or prescribe treatment.
 * It only estimates a coarse risk level (LOW / MEDIUM / HIGH)
 * based on simple rules, highlights possible condition CATEGORIES,
 * and suggests conservative next steps.
 */

const DANGER_PATTERNS = [
  {
    id: "chest_pain_breathlessness",
    description: "Chest pain combined with shortness of breath",
    symptomKeywords: ["chest pain", "pressure in chest"],
    coSymptoms: ["shortness of breath", "breathlessness"],
    minSeverity: 6,
    actionType: "EMERGENCY",
    riskLevel: "HIGH",
    possibleConditions: ["Possible cardiac or serious respiratory issue"],
    explanation:
      "Chest pain together with shortness of breath can indicate a serious cardiac or respiratory emergency."
  },
  {
    id: "high_fever_seizure",
    description: "Very high fever with seizures or confusion",
    symptomKeywords: ["fever", "high fever"],
    coSymptoms: ["seizure", "seizures", "convulsion", "confusion"],
    minSeverity: 7,
    actionType: "EMERGENCY",
    riskLevel: "HIGH",
    possibleConditions: ["Possible severe infection or neurological emergency"],
    explanation:
      "Very high fever with seizures or confusion can indicate a severe infection or neurological emergency."
  },
  {
    id: "difficulty_breathing",
    description: "Severe difficulty in breathing",
    symptomKeywords: ["shortness of breath", "trouble breathing", "wheezing"],
    coSymptoms: [],
    minSeverity: 7,
    actionType: "EMERGENCY",
    riskLevel: "HIGH",
    possibleConditions: ["Possible severe asthma or respiratory distress"],
    explanation:
      "Severe difficulty in breathing can rapidly worsen and requires urgent assessment."
  }
];

const CONDITION_CATEGORIES = [
  {
    id: "respiratory",
    label: "Respiratory (lungs and breathing)",
    keywords: ["cough", "wheezing", "shortness of breath", "chest tightness"]
  },
  {
    id: "cardiac",
    label: "Cardiac / circulation",
    keywords: ["chest pain", "palpitations", "pressure in chest"]
  },
  {
    id: "infection",
    label: "Possible infection",
    keywords: ["fever", "chills", "sore throat", "body ache"]
  },
  {
    id: "neurological",
    label: "Neurological",
    keywords: ["seizure", "seizures", "confusion", "weakness", "numbness"]
  },
  {
    id: "digestive",
    label: "Digestive",
    keywords: ["abdominal pain", "nausea", "vomiting", "diarrhea"]
  }
];

function normalize(text) {
  return (text || "").toLowerCase();
}

function matchDangerPatterns({ allText, selectedSymptoms, severity }) {
  const matches = [];
  const text = normalize(allText);
  const normalizedSelected = selectedSymptoms.map(normalize);

  for (const pattern of DANGER_PATTERNS) {
    if (severity < pattern.minSeverity) continue;

    const hasMain = pattern.symptomKeywords.some(
      (kw) => text.includes(kw) || normalizedSelected.includes(kw)
    );
    if (!hasMain) continue;

    const hasCo =
      pattern.coSymptoms.length === 0 ||
      pattern.coSymptoms.some(
        (kw) => text.includes(kw) || normalizedSelected.includes(kw)
      );

    if (hasCo) {
      matches.push(pattern);
    }
  }

  return matches;
}

function inferConditionCategories({ allText, selectedSymptoms }) {
  const text = normalize(allText);
  const normalizedSelected = selectedSymptoms.map(normalize);
  const found = new Set();

  for (const category of CONDITION_CATEGORIES) {
    const hit = category.keywords.some(
      (kw) => text.includes(kw) || normalizedSelected.includes(kw)
    );
    if (hit) {
      found.add(category.label);
    }
  }

  return Array.from(found);
}

/**
 * Base scoring tries to stay simple and explainable.
 */
function computeBaseScore({ severity, durationDays, ageGroup }) {
  let score = 0;
  const reasons = [];
  const rules = [];

  // Severity weighting
  if (severity >= 8) {
    score += 4;
    reasons.push("Reported symptom severity is very high (8–10).");
    rules.push("severity_very_high");
  } else if (severity >= 5) {
    score += 2;
    reasons.push("Reported symptom severity is moderate to high (5–7).");
    rules.push("severity_moderate");
  } else {
    score += 1;
    reasons.push("Reported symptom severity is mild (1–4).");
    rules.push("severity_mild");
  }

  // Duration
  if (durationDays >= 14) {
    score += 3;
    reasons.push("Symptoms have lasted 2 weeks or more.");
    rules.push("duration_long");
  } else if (durationDays >= 7) {
    score += 2;
    reasons.push("Symptoms have lasted more than a week.");
    rules.push("duration_medium");
  } else if (durationDays >= 3) {
    score += 1;
    reasons.push("Symptoms have lasted a few days.");
    rules.push("duration_short");
  } else {
    reasons.push("Symptoms started recently (less than 3 days).");
    rules.push("duration_very_short");
  }

  // Age group
  if (ageGroup === "senior" || ageGroup === "child") {
    score += 2;
    reasons.push(
      "Age group (child/senior) can be more vulnerable to complications."
    );
    rules.push("age_vulnerable");
  } else {
    reasons.push("Adult age group with typically moderate baseline risk.");
    rules.push("age_adult");
  }

  return { score, reasons, rules };
}

function scoreToRiskLevel(score) {
  if (score >= 8) return "HIGH";
  if (score >= 4) return "MEDIUM";
  return "LOW";
}

function chooseAction(riskLevel, hasEmergencyPattern) {
  if (hasEmergencyPattern || riskLevel === "HIGH") {
    return {
      actionType: "EMERGENCY",
      recommendedAction:
        "This pattern may represent an emergency. If symptoms are sudden, severe, or rapidly worsening, seek immediate in-person emergency care or call local emergency services."
    };
  }

  if (riskLevel === "MEDIUM") {
    return {
      actionType: "DOCTOR",
      recommendedAction:
        "Consider arranging a non-urgent appointment with a qualified doctor (for example a general physician, pediatrician, or relevant specialist) within the next 24–72 hours, or sooner if symptoms worsen."
    };
  }

  return {
    actionType: "HOME",
    recommendedAction:
      "Symptoms currently appear lower risk. You may continue home care, rest, hydration, and monitor symptoms closely. If new warning signs appear or symptoms worsen, contact a doctor promptly."
  };
}

/**
 * Main entry point.
 *
 * @param {object} input
 * @param {string} input.symptomText
 * @param {string[]} input.selectedSymptoms
 * @param {number} input.durationDays
 * @param {number} input.severity
 * @param {"child"|"adult"|"senior"} input.ageGroup
 */
export function assessRisk(input) {
  const {
    symptomText = "",
    selectedSymptoms = [],
    durationDays,
    severity,
    ageGroup
  } = input;

  const explanation = [];
  const rulesMatched = [];

  const allText =
    symptomText +
    " " +
    (selectedSymptoms && selectedSymptoms.length
      ? selectedSymptoms.join(" ")
      : "");

  // 1. Check for explicit danger patterns first
  const dangerMatches = matchDangerPatterns({
    allText,
    selectedSymptoms,
    severity
  });

  let emergencyRiskLevel = null;
  let emergencyActionType = null;
  const emergencyCategories = new Set();

  if (dangerMatches.length > 0) {
    for (const match of dangerMatches) {
      explanation.push(match.explanation);
      rulesMatched.push(`danger_pattern_${match.id}`);
      emergencyCategories.add(...match.possibleConditions);
      if (match.riskLevel === "HIGH") {
        emergencyRiskLevel = "HIGH";
        emergencyActionType = match.actionType;
      }
    }
  }

  // 2. Compute base score (explainable)
  const { score, reasons, rules } = computeBaseScore({
    severity,
    durationDays,
    ageGroup
  });
  explanation.push(...reasons);
  rulesMatched.push(...rules);

  let baseRiskLevel = scoreToRiskLevel(score);

  // 3. If emergency patterns found, they override base risk
  let finalRiskLevel = emergencyRiskLevel || baseRiskLevel;

  const possibleConditions = inferConditionCategories({
    allText,
    selectedSymptoms
  });

  if (emergencyCategories.size > 0) {
    for (const c of emergencyCategories) {
      possibleConditions.push(c);
    }
  }

  // 4. Recommended action based on highest risk
  const { actionType, recommendedAction } = chooseAction(
    finalRiskLevel,
    !!emergencyRiskLevel
  );

  // 5. Add explicit disclaimer into explanation
  explanation.push(
    "This tool does NOT provide a medical diagnosis, does not replace a doctor, and may be inaccurate. It only offers a rough risk estimate and general next steps."
  );

  return {
    riskLevel: finalRiskLevel,
    explanation,
    possibleConditions: Array.from(new Set(possibleConditions)),
    actionType,
    recommendedAction,
    rulesMatched: Array.from(new Set(rulesMatched))
  };
}

