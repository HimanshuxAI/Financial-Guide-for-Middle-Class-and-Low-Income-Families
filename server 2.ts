import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // 1. Check Affordability
  app.post("/api/check-affordability", (req, res) => {
    const { cost, paymentType, emiMonths, financialData } = req.body;
    const { income, fixedExpenses, variableExpenses, loans, savings } = financialData;
    
    const totalOutflow = fixedExpenses + variableExpenses + loans;
    const freeIncome = income - totalOutflow;
    
    let isAffordable = false;
    let impactPercent = 0;
    let remainingSavings = savings;
    let emiAmount = 0;
    
    if (paymentType === "full") {
      isAffordable = savings >= cost;
      remainingSavings = savings - cost;
      impactPercent = savings > 0 ? (cost / savings) * 100 : 100;
    } else {
      emiAmount = cost / (emiMonths || 1);
      isAffordable = freeIncome >= emiAmount;
      impactPercent = freeIncome > 0 ? (emiAmount / freeIncome) * 100 : 100;
    }
    
    const isDanger = (paymentType === "full" && impactPercent > 50) || 
                     (paymentType === "emi" && impactPercent > 40);
                     
    let decision = "AFFORDABLE";
    let riskLevel = "LOW";
    if (!isAffordable) {
      decision = "NOT_AFFORDABLE";
      riskLevel = "HIGH";
    } else if (isDanger) {
      decision = "CAUTION";
      riskLevel = "MEDIUM";
    }
    
    let reason = "";
    if (paymentType === "full") {
      reason = `Consumes ${impactPercent.toFixed(0)}% of your total savings`;
    } else {
      reason = `EMI bounds ${impactPercent.toFixed(0)}% of your free income`;
    }
    
    let impact = "";
    if (paymentType === "full") {
      impact = `Savings drop to ₹${Math.max(0, remainingSavings).toLocaleString('en-IN')}`;
    } else {
      impact = `Monthly free cash drops to ₹${Math.max(0, freeIncome - emiAmount).toLocaleString('en-IN')}`;
    }
    
    res.json({
      decision,
      reason,
      impact,
      riskLevel,
      details: {
        isAffordable,
        emiAmount,
        impactPercent,
        remainingSavings,
        freeIncome
      }
    });
  });

  // 2. Check Loan
  app.post("/api/check-loan", (req, res) => {
    const { loanAmount, interestRate, tenureYears, financialData } = req.body;
    const { income, fixedExpenses, variableExpenses, loans, savings } = financialData;
    
    const P = Number(loanAmount);
    const R_annual = Number(interestRate);
    const N_years = Number(tenureYears);
    
    const r = R_annual / 12 / 100;
    const n = N_years * 12;
    const emi = P * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    const totalOutflow = fixedExpenses + variableExpenses + loans;
    const currentFreeCash = income - totalOutflow;
    
    const emiRiskPercent = (emi / income) * 100;
    
    let riskLevel = "LOW";
    let decision = "SAFE";
    let reason = "EMI is well within safe limits";
    let impact = `Leaves you with ₹${Math.round(currentFreeCash - emi).toLocaleString('en-IN')} monthly free cash`;
    
    if (emiRiskPercent > 40 || emi > currentFreeCash) {
      riskLevel = "HIGH";
      decision = "NOT_RECOMMENDED";
      reason = emi > currentFreeCash ? "EMI exceeds your current free cash" : "EMI consumes over 40% of your total income";
      impact = emi > currentFreeCash ? `Forces you into a monthly deficit of ₹${Math.round(emi - currentFreeCash).toLocaleString('en-IN')}` : `Severely restricts your financial flexibility`;
    } else if (emiRiskPercent > 20) {
      riskLevel = "MEDIUM";
      decision = "PROCEED_WITH_CAUTION";
      reason = "EMI takes a noticeable portion of income (over 20%)";
    }
    
    res.json({
      decision,
      riskLevel,
      reason,
      impact,
      details: {
        emi,
        currentFreeCash,
        emiRiskPercent
      }
    });
  });

  // 3. Analyze Profile
  app.post("/api/analyze-profile", (req, res) => {
    const { financialData } = req.body;
    const { income, fixedExpenses, variableExpenses, loans, savings } = financialData;
    
    // Safety boundaries
    const totalOutflow = fixedExpenses + variableExpenses + loans;
    const freeCash = income - totalOutflow;
    
    let score = 100;
    
    // Debt risk
    const debtRatio = loans / income;
    let debtRisk = { label: "Safe", color: "text-green-600" };
    if (debtRatio > 0.4) {
      score -= 30;
      debtRisk = { label: "Critical", color: "text-red-500" };
    } else if (debtRatio > 0.3) {
      score -= 15;
      debtRisk = { label: "High", color: "text-amber-500" };
    } else if (debtRatio > 0) {
      debtRisk = { label: "Moderate", color: "text-zinc-600" };
    }
    
    // Savings status
    const monthsOfSavings = totalOutflow > 0 ? (savings / totalOutflow) : 10;
    let savingsStatus = { label: "Healthy", color: "text-green-600" };
    if (monthsOfSavings < 1) {
      score -= 30;
      savingsStatus = { label: "Critical", color: "text-red-500" };
    } else if (monthsOfSavings < 3) {
      score -= 15;
      savingsStatus = { label: "Low", color: "text-amber-500" };
    }

    // Expense pressure
    const expenseRatio = (fixedExpenses + variableExpenses) / income;
    let expensePressure = { label: "Low", color: "text-green-600" };
    if (expenseRatio > 0.7) {
      score -= 20;
      expensePressure = { label: "High", color: "text-red-500" };
    } else if (expenseRatio > 0.5) {
      score -= 10;
      expensePressure = { label: "Medium", color: "text-amber-500" };
    }

    if (freeCash < 0) score -= 40;

    res.json({
      score: Math.max(0, score),
      debtRisk,
      savingsStatus,
      expensePressure,
      freeCash
    });
  });

  // 4. Get Recommendations
  app.post("/api/get-recommendations", (req, res) => {
    const { financialData } = req.body;
    const { income, fixedExpenses, variableExpenses, loans, savings } = financialData;

    const totalOutflow = fixedExpenses + variableExpenses + loans;
    const freeCash = income - totalOutflow;
    const debtRatio = income > 0 ? loans / income : 0;
    const targetSavings = (totalOutflow * 3) - savings; // 3 months buffer
    const safeVariables = income * 0.3; // 30% of income 
    const excessVariables = variableExpenses - safeVariables;

    const recommendations = [];

    // CRITICAL: Debt
    if (debtRatio > 0.4) {
      recommendations.push({
        id: "rec_debt",
        priority: "HIGH",
        title: "Dangerous Debt Levels",
        description: `Your EMI burden is ${(debtRatio * 100).toFixed(0)}% of your income. Avoid taking any new loans until existing ones are cleared.`,
      });
    }

    // HIGH: Deficit / Savings
    if (freeCash < 0 || targetSavings > 0) {
      recommendations.push({
        id: "rec_cash",
        priority: freeCash < 0 ? "HIGH" : "MEDIUM",
        title: freeCash < 0 ? "Negative Cash Flow" : "Low Safety Net",
        description: freeCash < 0 
          ? "You are burning cash every month. Cut variables immediately." 
          : `Try to increase your savings by roughly ₹${Math.max(0, targetSavings).toLocaleString('en-IN')} to hit a safe 3-month buffer.`,
      });
    }

    // MEDIUM: Expenses
    if (excessVariables > 0) {
       recommendations.push({
         id: "rec_expenses",
         priority: "MEDIUM",
         title: "High Expenses",
         description: `Try trimming ₹${Math.max(0, excessVariables).toLocaleString('en-IN')} from your variable lifestyle expenses to create more breathing room.`,
       });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: "rec_good",
        priority: "LOW",
        title: "You are doing great!",
        description: "Your financial indicators are strong. Keep maintaining your current ratios.",
      });
    }

    res.json({ recommendations });
  });

  // 5. Simulate Decision
  app.post("/api/simulate-decision", (req, res) => {
    const { scenario, financialData } = req.body;
    const { income, fixedExpenses, variableExpenses, loans, savings } = financialData;

    const currentFreeCash = Math.max(0, income - (fixedExpenses + variableExpenses + loans));
    let changeFreeCash = currentFreeCash;
    let initialSavings = savings;
    let stabilityDrop = "None";

    if (scenario === "loan") {
      changeFreeCash = Math.max(0, currentFreeCash - 15000); // Simulated 15k EMI
      stabilityDrop = "Moderate (Cashflow hit)";
    } else if (scenario === "buy") {
      initialSavings = Math.max(0, savings - 200000); // Simulated 200k purchase
      stabilityDrop = "High (Liquidity shock)";
    }

    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = labels.map((month, idx) => {
      const isStart = idx === 0;
      return {
        month,
        Current: savings + (currentFreeCash * idx),
        Simulated: scenario === "buy" && isStart ? initialSavings : initialSavings + (changeFreeCash * idx),
      };
    });

    res.json({ chartData, stabilityDrop });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
