# Decision Engine Specification & System Architecture

## 1. Decision Engine Specification (Formal Rule System)

The core value of this application is not in data visualization, but in applying rigid, objective financial rules to assess the user's situation and prevent bad decisions.

**Core Metrics Definition:**
*   **Total Outflow** = `Fixed Expenses` + `Variable Expenses` + `Loans (EMI)`
*   **Disposable Income** = `Income` - `Fixed Expenses` - `Loans (EMI)`
*   **Free Cash** = `Income` - `Total Outflow`
*   **Savings Buffer Ratio** = `Savings` / `Total Outflow`

**Core Rules Engine:**

**A. Profile Health Rules:**
1.  **CRITICAL:** IF `Free Cash` < 0 → "High Risk. Monthly deficit detected."
2.  **UNSAFE SAVINGS:** IF `Savings Buffer Ratio` < 3 → "Savings cover less than 3 months of expenses. Buffer needed."
3.  **HIGH DEBT:** IF `Loans` > (0.30 * `Income`) → "Debt exceeds 30% of income. Hard boundary."

**B. Affordability Rules (Major Purchase):**
1.  **Full Pay Rule 1:** IF `Cost` > `Savings` → NOT AFFORDABLE.
2.  **Full Pay Rule 2:** IF `Cost` consumes > 50% of `Savings` → PROCEED WITH CAUTION (Medium Risk).
3.  **EMI Rule 1:** IF EMI amount > `Free Cash` → NOT AFFORDABLE (Deficit triggering).
4.  **EMI Rule 2:** IF EMI amount > 40% of `Free Cash` → PROCEED WITH CAUTION.

**C. Loan Analyzer Rules:**
1.  **Rule 1:** IF New EMI + Existing EMI > 40% of `Income` → HIGH RISK.
2.  **Rule 2:** IF New EMI > `Free Cash` → NOT RECOMMENDED (Math fails).
3.  **Rule 3:** IF New EMI consumes > 20% of `Income` → PROCEED WITH CAUTION.

---

## 2. Backend Design

**Modules:**
*   **Input Processing (`/api/analyze-profile`)**: Normalizes the frontend financial state.
*   **Decision Engine (`/api/check-affordability`, `/api/check-loan`)**: Applies the strict mathematical boundaries defined above.
*   **Recommendation Engine (`/api/get-recommendations`)**: Matches user limits against best-practice markers and generates prioritized tips.
*   **Simulator Module (`/api/simulate-decision`)**: Extrapolates current monthly savings over 12 months, subtracting out impacts from theoretical user decisions (like adding a loan).

**Flow:**
`Frontend Form` → JSON Object → `Express Backend` → Apply specific rule module → Return standardized `{ decision, reason, impact, riskLevel }` → `Frontend UI renders alert`.

---

## 3. Data Model

**User Financial Profile (`FinancialData`):**
```json
{
  "income": "number (Monthly total)",
  "fixedExpenses": "number (Rent, util, minimum payments)",
  "variableExpenses": "number (Food, leisure)",
  "loans": "number (Existing monthly EMIs)",
  "savings": "number (Total liquid cash)"
}
```

*Note: In the current version, this state is held in React context and persisted via localStorage across sessions for a friction-less experience. User data is not saved to an external database.*

---

## 4. API Contract

**POST `/api/check-affordability`**
*Request:*
```json
{
  "cost": 50000,
  "paymentType": "full",
  "emiMonths": 12,
  "financialData": { "income": 50000, "fixedExpenses": 15000, "variableExpenses": 10000, "loans": 0, "savings": 100000 }
}
```
*Response:*
```json
{
  "decision": "CAUTION",
  "reason": "Consumes 50% of your total savings",
  "impact": "Savings drop to ₹50,000",
  "riskLevel": "MEDIUM",
  "details": { ... }
}
```

**POST `/api/simulate-decision`**
*Request:*
```json
{
  "scenario": "loan",
  "financialData": { ... }
}
```
*Response:*
```json
{
  "chartData": [
    { "month": "Jan", "Current": 100000, "Simulated": 85000 }
  ],
  "stabilityDrop": "Moderate (Cashflow hit)"
}
```

---

## 5. System Architecture

**Client-Side SPA (React, Vite, Tailwind CSS)**
UI that strictly delegates mathematical reasoning to the backend. Simple, focused components that only display `decision` JSON.

↓ HTTPS/AJAX

**API Layer (Express middlewares)**
Routes incoming checks to specific modules.

↓

**Node Backend (Rule Engine)**
Functional evaluation scripts containing the objective rule-based limits. Computes logic, formats decision object, returns to client.

---

## 6. Test Cases

| Scenario | Input | Expected Output Decision |
| :--- | :--- | :--- |
| **High Expense + Afford EMI** | FreeCash: ₹2,000, Cost: ₹50k, EMI: ₹5,000 | `NOT_AFFORDABLE` (EMI > Free Cash) |
| **Healthy + Afford EMI** | FreeCash: ₹20,000, Cost: ₹50k, EMI: ₹5,000 | `AFFORDABLE` |
| **Massive Loan** | Income: 50k, Existing EMI: 10k, New: 15k | `HIGH RISK` (Total > 40%) |
| **Low Savings + Full Pay** | Cost: 80k, Savings: 100k | `CAUTION` (> 50% savings consumed) |
| **Insufficient Savings** | Cost: 50k, Savings: 10k | `NOT_AFFORDABLE` |

---

## 7. Demo Script

1.  **The Problem (30 sec):** Most apps show pie charts. People don't know what to do with a pie chart. They want to know "Can I afford this phone?".
2.  **Our Approach:** A strict Rule Engine that acts as an emotionless financial advisor. Let's input a typical profile (Income 50k, Expenses 30k, Savings 50k).
3.  **Live Demo Case (Affordability):** Let's try to buy an iPhone for 80,000.
    *   *Try Full Pay:* Immediately rejected. Explain Reason: Not enough savings.
    *   *Try EMI:* Immediate rejection. Explain Reason: EMI wipes out free cash, putting user in deficit.
4.  **Conclusion:** The app prevented a terrible financial decision in 15 seconds without the user doing any math.

---

## 8. Risk + Limitations

*   **Rule-Based Only:** This system uses static mathematical limits (e.g., 20% savings buffer rule). It does not use AI or ML to predict personalized spending patterns.
*   **Not Financial Advice:** Decisions are strictly analytical guardrails. Market conditions and nuanced personal liabilities are absent.
*   **No Bank Integration:** Data heavily relies entirely on user input accuracy. Garbage in = Garbage out.
