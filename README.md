# FinSight DecisionOS

Premium personal finance decision engine for affordability, loan risk, goals, stress testing, debt payoff, budget planning, and wealth projection.

## What It Does

- Scores a user's financial health with strict, explainable guardrails.
- Checks whether a major purchase is affordable through full-pay or EMI paths.
- Analyzes loan pressure with total EMI burden and interest impact.
- Builds a boardroom-style executive brief for demos.
- Runs six advanced strategy modules: budget blueprint, stress test, goal planner, debt payoff, wealth projection, and prioritized action plan.

## Run Locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm test
npm run build
```

The backend rule engine has regression coverage in `src/lib/financeEngine.test.ts`.
