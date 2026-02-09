# SafeHealth Triage – Explainable Symptom Risk Assistant

SafeHealth Triage is a small full‑stack web app that helps users understand how urgent their symptoms might be and what safe next steps could be (monitor at home, see a doctor, or seek emergency care).

It is designed for **hackathon demos** and **education**, not for real medical use.

---

## 1. High‑level architecture

- **Frontend**: React (Vite) single‑page app in `frontend/`
  - Pages: landing, login, signup, dashboard
  - Dashboard lets the user enter symptoms and view AI risk estimates
- **Backend**: Node.js + Express + MongoDB in `backend/`
  - JWT‑based auth, user + assessment models
  - `/api/assessment` endpoint runs the AI triage engine
  - `/api/alerts/mock` simulates an email/SMS alert for high‑risk cases
- **AI logic**: `backend/src/ai/triageEngine.js`
  - Fully rule‑based and intentionally **simple + explainable**
  - No black‑box model, no disease diagnosis

---

## 2. Responsible AI design

### What the AI does

- Classifies **risk level**: `LOW`, `MEDIUM`, or `HIGH`.
- Detects specific **danger patterns**, for example:
  - Chest pain combined with shortness of breath
  - Very high fever combined with seizures/confusion
  - Severe difficulty breathing
- Outputs:
  - `riskLevel`
  - `possibleConditions` → broad **categories only** (e.g. “Respiratory”, “Cardiac/circulation”)
  - `recommendedAction` → home care / doctor visit / emergency guidance
  - `explanation[]` → plain‑language reasons for the decision
  - `rulesMatched[]` → internal rule IDs that were triggered

### What the AI explicitly does NOT do

- It **does not diagnose diseases**.
- It **does not prescribe medication** or detailed treatments.
- It **does not claim certainty** or safety.
- It is not trained on patient data; it only uses handcrafted rules.

The UI reinforces this with clear disclaimers on the landing page and next to every assessment result.

---

## 3. Explainable triage engine (AI logic)

The core AI logic lives in:

- `backend/src/ai/triageEngine.js`

Key ideas:

- **Rule‑based scoring** instead of a black‑box ML model.
- Every rule that fires adds:
  - A numeric contribution to the risk score.
  - A human‑readable explanation string.
  - A `rulesMatched` identifier for debugging / audits.

### 3.1 Danger pattern rules

The engine first checks for **“hard” danger patterns** such as:

- Chest pain + shortness of breath with severity ≥ 6
- High fever + seizures/confusion with severity ≥ 7
- Very severe difficulty breathing with severity ≥ 7

Each pattern has:

- `id`: e.g. `chest_pain_breathlessness`
- `description`: free‑text description
- `symptomKeywords` + `coSymptoms`: keywords to match in text and selected symptoms
- `minSeverity`: severity threshold
- `riskLevel` and `actionType`: typically `HIGH` + `EMERGENCY`
- A clear, user‑facing **explanation** string.

If any of these patterns are detected, they **override** the base risk score and elevate the case to **HIGH** risk and **EMERGENCY** action.

### 3.2 Base score rules

If no hard emergency pattern forces a high‑risk decision, the engine computes a **base score** from:

1. **Severity (1–10)**  
   - Mild (1–4) → small score, explanation about mild severity  
   - Moderate (5–7) → moderate score  
   - Very high (8–10) → large score, explicit explanation

2. **Duration (days)**  
   - &lt; 3 days → explanation that symptoms are very recent  
   - 3–6 days → small additional risk  
   - 7–13 days → moderate additional risk  
   - ≥ 14 days → large additional risk, explanation about prolonged symptoms

3. **Age group**  
   - `child` or `senior` → higher score, explanation that these groups can be more vulnerable  
   - `adult` → neutral explanation

The total score is then mapped to a risk level:

- `LOW` → score &lt; 4
- `MEDIUM` → 4 ≤ score &lt; 8
- `HIGH` → score ≥ 8

This mapping is intentionally simple and tuneable.

### 3.3 Condition categories (non‑diagnostic)

The engine also matches text against several **broad categories**:

- Respiratory (cough, wheeze, shortness of breath…)
- Cardiac / circulation (chest pain, palpitations…)
- Possible infection (fever, chills, sore throat, body aches…)
- Neurological (seizure, confusion, weakness, numbness…)
- Digestive (abdominal pain, nausea, vomiting, diarrhoea…)

For any category that matches, its label is added to the `possibleConditions` list and rendered with the disclaimer **“not a diagnosis”**.

### 3.4 Recommended action selection

Finally, the engine chooses an **action type**:

- `EMERGENCY`  
  - If a danger pattern matched **or** final `riskLevel` is `HIGH`.
- `DOCTOR`  
  - If `riskLevel` is `MEDIUM` without hard emergency patterns.
- `HOME`  
  - If `riskLevel` is `LOW`.

Each action type has a conservative, pre‑written **recommendedAction** message, e.g.:

- EMERGENCY → go to an emergency department / call local emergency services.
- DOCTOR → arrange a non‑urgent visit in 24–72 hours, earlier if worsening.
- HOME → monitor at home with clear advice to seek care if things worsen.

The engine always adds a final **disclaimer line** into `explanation[]` reminding the user that this is not a diagnosis.

---

## 4. Frontend UX (Vite + React)

The React app lives in `frontend/`.

Pages / main components:

- `LandingPage`  
  - Explains purpose, benefits, and **clear medical disclaimer**.  
  - High‑level bullet points on what the tool can and cannot do.

- `LoginPage` and `SignupPage`  
  - Basic email + password auth with optional name and age group.  
  - On success, the JWT is stored in localStorage and the user is redirected to `/dashboard`.

- `DashboardPage`  
  - Symptom input form:
    - Free‑text symptom description.
    - Clickable chips for common symptoms (e.g. chest pain, shortness of breath, high fever, seizures).
    - Duration in days.
    - Severity slider (1–10).
    - Age group dropdown.
  - On submit:
    - Calls `POST /api/assessment` with the form data and the JWT.
    - Renders the AI output:
      - **Big risk badge** (Low/Medium/High).
      - Recommended action text.
      - Possible condition **categories**.
      - Bullet list of explanations returned by the engine.
      - Strong, red disclaimer paragraph.
    - If the AI recommends `EMERGENCY`:
      - Card switches to red‑accented UI.
      - Shows explicit emergency guidance.
      - Offers a button to trigger a **mock emergency alert** via `/api/alerts/mock`.
  - Also shows a small **history** list with your last assessments.

Styling is defined in `frontend/src/styles.css` with a clean, modern card UI and special red styling for high‑risk emergency results.

---

## 5. Backend APIs

Base URL (default):  
`http://localhost:4000/api`

### 5.1 Auth

- `POST /api/auth/signup`
  - Body: `{ name?, email, password, ageGroup: "child" | "adult" | "senior" }`
  - Response: `{ token, user }`

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ token, user }`

JWTs are signed with `JWT_SECRET` and include `sub` (user ID) and `email` and expire after 7 days.

### 5.2 Assessment

- `POST /api/assessment` (authenticated)
  - Body:
    ```jsonc
    {
      "symptomText": "string",
      "selectedSymptoms": ["optional", "keywords"],
      "durationDays": 3,
      "severity": 7,
      "ageGroup": "adult"
    }
    ```
  - Response:
    ```jsonc
    {
      "id": "assessmentId",
      "riskLevel": "LOW | MEDIUM | HIGH",
      "explanation": ["..."],
      "possibleConditions": ["Respiratory (lungs and breathing)", "..."],
      "recommendedAction": "string",
      "actionType": "HOME | DOCTOR | EMERGENCY",
      "disclaimer": "This is NOT a diagnostic tool..."
    }
    ```

- `GET /api/assessment/history` (authenticated)
  - Returns up to the last 20 assessments for the logged‑in user.

### 5.3 Alerts (mock)

- `POST /api/alerts/mock` (authenticated)
  - Body: `{ riskLevel, message }`
  - Currently just logs a message on the server to simulate e.g. SMS/email.

---

## 6. Running the project locally

### 6.1 Requirements

- Node.js 18+
- MongoDB running locally (default URI `mongodb://127.0.0.1:27017/health_triage`)

### 6.2 Backend

```bash
cd backend
npm install

# Optionally create a .env file:
# PORT=4000
# MONGO_URI=mongodb://127.0.0.1:27017/health_triage
# JWT_SECRET=your_strong_secret_here
# CLIENT_ORIGIN=http://localhost:5173

npm run dev
```

Server will start on `http://localhost:4000`.

### 6.3 Frontend

```bash
cd frontend
npm install

# Optionally configure the backend base URL:
# Create .env and set:
# VITE_API_BASE_URL=http://localhost:4000/api

npm run dev
```

Open `http://localhost:5173` in the browser.

---

## 7. Safety and limitations (for judges)

- The triage engine is **hand‑coded** and designed to be **auditable and explainable**.
- All decisions are traceable to simple rules based on:
  - Symptom severity
  - Duration
  - Age group
  - Presence of a few high‑risk symptom combinations
- We **intentionally avoid**:
  - Fine‑grained diagnoses
  - Treatment suggestions
  - Overly confident language
- The UI repeats the disclaimer and recommends real doctors and emergency services when risk is high or the user feels unsafe.

This makes the project suitable for hackathons focused on **responsible AI in healthcare**, emphasising transparency, real‑world usefulness, and ethical boundaries over model complexity.

