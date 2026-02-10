/**
 * Symptom-based content mapping. Content shown is strictly for the given symptom only.
 * Keys must match getSymptomKey() output (e.g. cold, fever, chest_pain, default).
 */
export const symptomData = {
  cold: {
    homeRemedies: [
      "Rest and adequate sleep",
      "Warm fluids (broth, herbal tea, honey and lemon)",
      "Saline nasal rinse or steam inhalation",
      "Gargling with warm salt water for sore throat",
      "Humidifier or steam to ease congestion"
    ],
    labTests: [
      "Usually none required for uncomplicated cold; consider throat swab only if bacterial infection suspected"
    ],
    doctors: [
      "General Physician (for persistent or worsening symptoms)",
      "ENT (if ear or sinus involvement)"
    ],
    diet: [
      "Warm soups and broths",
      "Vitamin C–rich foods (citrus, bell peppers)",
      "Stay hydrated with water and warm drinks",
      "Avoid very cold or sugary drinks"
    ],
    finalReport: "Summary: Common cold—typically viral, self-limiting. Focus on rest, fluids, and symptom relief. Seek care if high fever, severe sore throat, or symptoms last beyond 10 days."
  },
  fever: {
    homeRemedies: [
      "Rest and light clothing",
      "Stay hydrated (water, oral rehydration if needed)",
      "Sponge bath or cool compress if very uncomfortable",
      "Over-the-counter fever reducers as directed (e.g. paracetamol)"
    ],
    labTests: [
      "Complete blood count (CBC) if fever prolonged or high",
      "Blood culture if sepsis suspected",
      "Urine culture if urinary symptoms"
    ],
    doctors: [
      "General Physician (first point of contact)",
      "Infectious disease or paediatrician if indicated"
    ],
    diet: [
      "Light, easy-to-digest foods",
      "Plenty of fluids and electrolytes",
      "Avoid heavy or spicy meals"
    ],
    finalReport: "Summary: Fever is a sign of immune response. Management depends on cause and severity. Seek care for very high fever, prolonged fever, or if you feel very unwell."
  },
  chest_pain: {
    homeRemedies: [
      "Rest and avoid exertion until assessed",
      "Do not self-treat with home remedies; seek medical evaluation for chest pain"
    ],
    labTests: [
      "ECG (electrocardiogram)",
      "Troponin (cardiac markers) if cardiac cause suspected",
      "Chest X-ray if respiratory cause suspected"
    ],
    doctors: [
      "Emergency care or General Physician for urgent evaluation",
      "Cardiologist if cardiac cause confirmed or suspected",
      "Pulmonologist if respiratory cause"
    ],
    diet: [
      "Light meals until evaluated; avoid large or heavy meals",
      "Limit caffeine and stimulants if palpitations present"
    ],
    finalReport: "Summary: Chest pain requires medical evaluation to rule out serious causes. Do not delay seeking care for sudden, severe, or persistent chest pain."
  },
  default: {
    homeRemedies: [
      "Rest and adequate sleep",
      "Stay hydrated",
      "Over-the-counter symptom relief as appropriate and as directed"
    ],
    labTests: [
      "As advised by a healthcare provider based on your specific symptoms"
    ],
    doctors: [
      "General Physician for initial assessment"
    ],
    diet: [
      "Balanced, light meals as tolerated",
      "Adequate fluids"
    ],
    finalReport: "Summary: Follow the risk level and recommended next steps from your assessment. This is not a diagnosis; see a healthcare provider for evaluation."
  }
};

const SYMPTOM_KEY_MAP = [
  { keys: ["cold", "runny nose", "congestion", "sore throat", "cough"], value: "cold" },
  { keys: ["fever", "high fever", "chills"], value: "fever" },
  { keys: ["chest pain", "chest pain", "pressure in chest", "palpitations"], value: "chest_pain" }
];

/**
 * Derives a symptom key from form data for use in symptomData lookup.
 * Uses selectedSymptoms first, then symptomText; falls back to "default".
 */
export function getSymptomKey(symptomText, selectedSymptoms = []) {
  const combined = [
    ...selectedSymptoms.map((s) => (s || "").toLowerCase().trim()),
    (symptomText || "").toLowerCase().trim()
  ].filter(Boolean);

  for (const part of combined) {
    for (const { keys, value } of SYMPTOM_KEY_MAP) {
      if (keys.some((k) => part.includes(k) || k.includes(part))) return value;
    }
  }
  return "default";
}
