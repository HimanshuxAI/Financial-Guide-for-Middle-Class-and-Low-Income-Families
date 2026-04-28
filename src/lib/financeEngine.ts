export type FinancialData = {
  income: number;
  fixedExpenses: number;
  variableExpenses: number;
  loans: number;
  savings: number;
  familySize: number;
};

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export class ValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function asObject(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(`${name} must be an object.`);
  }

  return value as Record<string, unknown>;
}

export function parseNumber(value: unknown, name: string, options: { min?: number; max?: number } = {}) {
  const numberValue = typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  if (typeof numberValue !== "number" || !Number.isFinite(numberValue)) {
    throw new ValidationError(`${name} must be a valid number.`);
  }

  if (options.min !== undefined && numberValue < options.min) {
    throw new ValidationError(`${name} must be at least ${options.min}.`);
  }

  if (options.max !== undefined && numberValue > options.max) {
    throw new ValidationError(`${name} must be at most ${options.max}.`);
  }

  return numberValue;
}

export function normalizeFinancialData(input: unknown): FinancialData {
  const raw = asObject(input, "financialData");
  const income = parseNumber(raw.income, "Monthly income", { min: 1, max: 100_000_000 });
  const fixedExpenses = parseNumber(raw.fixedExpenses, "Fixed expenses", { min: 0, max: 100_000_000 });
  const variableExpenses = parseNumber(raw.variableExpenses, "Variable expenses", { min: 0, max: 100_000_000 });
  const loans = parseNumber(raw.loans, "Current EMIs", { min: 0, max: 100_000_000 });
  const savings = parseNumber(raw.savings, "Savings", { min: 0, max: 1_000_000_000 });
  const familySize = raw.familySize === undefined ? 1 : parseNumber(raw.familySize, "Family size", { min: 1, max: 20 });

  return {
    income,
    fixedExpenses,
    variableExpenses,
    loans,
    savings,
    familySize: Math.round(familySize),
  };
}

export function getMetrics(data: FinancialData) {
  const totalOutflow = data.fixedExpenses + data.variableExpenses + data.loans;
  const disposableIncome = data.income - data.fixedExpenses - data.loans;
  const freeCash = data.income - totalOutflow;
  const savingsBufferMonths = totalOutflow > 0 ? data.savings / totalOutflow : 99;
  const debtToIncome = data.loans / data.income;
  const expenseRatio = (data.fixedExpenses + data.variableExpenses) / data.income;
  const savingsRate = freeCash / data.income;
  const perPersonSpend = data.familySize > 0 ? totalOutflow / data.familySize : totalOutflow;
  const emergencyFundTarget = totalOutflow * 6;
  const runwayGap = Math.max(0, emergencyFundTarget - data.savings);
  const recommendedInvestment = Math.max(0, freeCash * 0.45);
  const safeEmiRoom = Math.max(0, data.income * 0.4 - data.loans);
  const purchasePower = Math.max(0, Math.min(data.savings * 0.5, freeCash * 6));

  return {
    totalOutflow,
    disposableIncome,
    freeCash,
    savingsBufferMonths,
    debtToIncome,
    expenseRatio,
    savingsRate,
    perPersonSpend,
    emergencyFundTarget,
    runwayGap,
    recommendedInvestment,
    safeEmiRoom,
    purchasePower,
  };
}

function status(label: string, color: string) {
  return { label, color };
}

function scoreBreakdown(data: FinancialData) {
  const metrics = getMetrics(data);
  const cashflow = clamp(100 + metrics.savingsRate * 180, 0, 100);
  const debt = clamp(100 - metrics.debtToIncome * 210, 0, 100);
  const liquidity = clamp((metrics.savingsBufferMonths / 6) * 100, 0, 100);
  const efficiency = clamp(100 - Math.max(0, metrics.expenseRatio - 0.45) * 150, 0, 100);

  return {
    cashflow: Math.round(cashflow),
    debt: Math.round(debt),
    liquidity: Math.round(liquidity),
    efficiency: Math.round(efficiency),
  };
}

export function analyzeProfile(financialData: FinancialData) {
  const metrics = getMetrics(financialData);
  const breakdown = scoreBreakdown(financialData);
  let score = Math.round(
    breakdown.cashflow * 0.32 +
      breakdown.debt * 0.24 +
      breakdown.liquidity * 0.28 +
      breakdown.efficiency * 0.16
  );

  if (metrics.freeCash < 0) score -= 18;
  if (metrics.savingsBufferMonths < 1) score -= 10;
  score = clamp(score, 0, 100);

  const debtRisk =
    metrics.debtToIncome > 0.4
      ? status("Critical", "text-red-600")
      : metrics.debtToIncome > 0.3
        ? status("High", "text-amber-600")
        : metrics.debtToIncome > 0
          ? status("Moderate", "text-zinc-700")
          : status("Clean", "text-emerald-700");

  const savingsStatus =
    metrics.savingsBufferMonths < 1
      ? status("Critical", "text-red-600")
      : metrics.savingsBufferMonths < 3
        ? status("Low", "text-amber-600")
        : metrics.savingsBufferMonths < 6
          ? status("Building", "text-blue-700")
          : status("Strong", "text-emerald-700");

  const expensePressure =
    metrics.expenseRatio > 0.7
      ? status("High", "text-red-600")
      : metrics.expenseRatio > 0.55
        ? status("Medium", "text-amber-600")
        : status("Efficient", "text-emerald-700");

  const grade = score >= 86 ? "A" : score >= 72 ? "B" : score >= 56 ? "C" : score >= 40 ? "D" : "E";
  const riskLevel: RiskLevel = score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH";

  const strengths: string[] = [];
  const alerts: string[] = [];

  if (metrics.freeCash > financialData.income * 0.2) strengths.push("Healthy monthly surplus");
  if (metrics.savingsBufferMonths >= 6) strengths.push("Emergency fund covers 6+ months");
  if (metrics.debtToIncome <= 0.15) strengths.push("Debt load is controlled");
  if (metrics.freeCash < 0) alerts.push("Monthly expenses exceed income");
  if (metrics.savingsBufferMonths < 3) alerts.push("Emergency runway is under 3 months");
  if (metrics.debtToIncome > 0.3) alerts.push("EMI burden is above the 30% warning line");
  if (financialData.variableExpenses > financialData.income * 0.35) alerts.push("Variable spending is crowding out goals");

  return {
    score,
    grade,
    riskLevel,
    debtRisk,
    savingsStatus,
    expensePressure,
    freeCash: metrics.freeCash,
    metrics: {
      ...metrics,
      formatted: {
        freeCash: formatCurrency(metrics.freeCash),
        totalOutflow: formatCurrency(metrics.totalOutflow),
        emergencyFundTarget: formatCurrency(metrics.emergencyFundTarget),
        runwayGap: formatCurrency(metrics.runwayGap),
        recommendedInvestment: formatCurrency(metrics.recommendedInvestment),
        safeEmiRoom: formatCurrency(metrics.safeEmiRoom),
        purchasePower: formatCurrency(metrics.purchasePower),
      },
    },
    scoreBreakdown: breakdown,
    strengths,
    alerts,
    narrative:
      riskLevel === "LOW"
        ? "You have enough margin to make measured decisions and still protect your runway."
        : riskLevel === "MEDIUM"
          ? "Your finances can work, but one poorly timed decision could tighten cash flow quickly."
          : "Your current profile needs protection before adding new commitments.",
  };
}

export function checkAffordability(args: {
  cost: number;
  paymentType: "full" | "emi";
  emiMonths?: number;
  financialData: FinancialData;
}) {
  const cost = parseNumber(args.cost, "Item cost", { min: 1, max: 1_000_000_000 });
  const paymentType = args.paymentType === "emi" ? "emi" : "full";
  const emiMonths = paymentType === "emi" ? Math.round(parseNumber(args.emiMonths ?? 1, "EMI duration", { min: 1, max: 360 })) : 1;
  const metrics = getMetrics(args.financialData);

  let isAffordable = false;
  let impactPercent = 0;
  let remainingSavings = args.financialData.savings;
  let emiAmount = 0;

  if (paymentType === "full") {
    isAffordable = args.financialData.savings >= cost;
    remainingSavings = args.financialData.savings - cost;
    impactPercent = args.financialData.savings > 0 ? (cost / args.financialData.savings) * 100 : 100;
  } else {
    emiAmount = cost / emiMonths;
    isAffordable = metrics.freeCash >= emiAmount;
    impactPercent = metrics.freeCash > 0 ? (emiAmount / metrics.freeCash) * 100 : 100;
  }

  const isDanger = (paymentType === "full" && impactPercent > 50) || (paymentType === "emi" && impactPercent > 40);
  const decision = !isAffordable ? "NOT_AFFORDABLE" : isDanger ? "CAUTION" : "AFFORDABLE";
  const riskLevel: RiskLevel = !isAffordable ? "HIGH" : isDanger ? "MEDIUM" : "LOW";
  const reason =
    paymentType === "full"
      ? `Consumes ${Math.round(impactPercent)}% of your total savings`
      : `EMI uses ${Math.round(impactPercent)}% of your free monthly cash`;
  const impact =
    paymentType === "full"
      ? `Savings drop to ${formatCurrency(Math.max(0, remainingSavings))}`
      : `Monthly free cash drops to ${formatCurrency(Math.max(0, metrics.freeCash - emiAmount))}`;

  const guardrail =
    riskLevel === "LOW"
      ? "The purchase stays inside your safety boundaries."
      : riskLevel === "MEDIUM"
        ? "You can do this, but it meaningfully reduces flexibility."
        : "This decision breaks a core safety boundary.";

  return {
    decision,
    reason,
    impact,
    riskLevel,
    guardrail,
    details: {
      isAffordable,
      emiAmount,
      impactPercent,
      remainingSavings,
      freeIncome: metrics.freeCash,
      purchasePower: metrics.purchasePower,
      bufferAfterPurchase: paymentType === "full" ? Math.max(0, remainingSavings) / Math.max(1, metrics.totalOutflow) : metrics.savingsBufferMonths,
    },
  };
}

export function checkLoan(args: {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  financialData: FinancialData;
}) {
  const principal = parseNumber(args.loanAmount, "Loan amount", { min: 1, max: 1_000_000_000 });
  const annualRate = parseNumber(args.interestRate, "Interest rate", { min: 0, max: 60 });
  const years = parseNumber(args.tenureYears, "Tenure", { min: 0.1, max: 40 });
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 12 / 100;
  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

  const metrics = getMetrics(args.financialData);
  const totalEmiAfterLoan = args.financialData.loans + emi;
  const totalDebtRatio = totalEmiAfterLoan / args.financialData.income;
  const emiRiskPercent = (emi / args.financialData.income) * 100;
  const totalInterest = emi * months - principal;

  let riskLevel: RiskLevel = "LOW";
  let decision = "SAFE";
  let reason = "EMI is inside the conservative borrowing line";
  let impact = `Leaves ${formatCurrency(metrics.freeCash - emi)} monthly free cash`;

  if (emi > metrics.freeCash || totalDebtRatio > 0.4) {
    riskLevel = "HIGH";
    decision = "NOT_RECOMMENDED";
    reason = emi > metrics.freeCash ? "New EMI exceeds current free cash" : "Total EMI burden crosses 40% of income";
    impact = emi > metrics.freeCash ? `Creates a monthly deficit of ${formatCurrency(emi - metrics.freeCash)}` : "Restricts flexibility beyond the hard guardrail";
  } else if (emiRiskPercent > 20 || totalDebtRatio > 0.3) {
    riskLevel = "MEDIUM";
    decision = "PROCEED_WITH_CAUTION";
    reason = emiRiskPercent > 20 ? "New EMI consumes over 20% of income" : "Total EMIs move above the 30% warning line";
  }

  return {
    decision,
    riskLevel,
    reason,
    impact,
    details: {
      emi,
      currentFreeCash: metrics.freeCash,
      emiRiskPercent,
      totalDebtRatio,
      totalInterest,
      payoffMonths: months,
      totalPayable: emi * months,
    },
  };
}

export function getRecommendations(financialData: FinancialData) {
  const profile = analyzeProfile(financialData);
  const metrics = getMetrics(financialData);
  const recommendations: Array<{
    id: string;
    priority: Priority;
    title: string;
    description: string;
    action: string;
    estimatedImpact: string;
  }> = [];

  if (metrics.freeCash < 0) {
    recommendations.push({
      id: "rec_cash_deficit",
      priority: "HIGH",
      title: "Stop Monthly Cash Leakage",
      description: "Your outflow is higher than income, so every month weakens your position.",
      action: `Reduce expenses or EMIs by at least ${formatCurrency(Math.abs(metrics.freeCash))} this month.`,
      estimatedImpact: "Moves the profile from deficit to break-even.",
    });
  }

  if (metrics.debtToIncome > 0.3) {
    recommendations.push({
      id: "rec_debt",
      priority: metrics.debtToIncome > 0.4 ? "HIGH" : "MEDIUM",
      title: "Debt Boundary Breach",
      description: `Current EMIs are ${Math.round(metrics.debtToIncome * 100)}% of income.`,
      action: "Freeze new borrowing and redirect surplus to the highest-interest debt.",
      estimatedImpact: "Improves cash-flow safety and future borrowing capacity.",
    });
  }

  if (metrics.savingsBufferMonths < 6) {
    recommendations.push({
      id: "rec_runway",
      priority: metrics.savingsBufferMonths < 3 ? "HIGH" : "MEDIUM",
      title: "Build a Six-Month Runway",
      description: `You currently have ${metrics.savingsBufferMonths.toFixed(1)} months of expense cover.`,
      action: `Create a runway gap target of ${formatCurrency(metrics.runwayGap)}.`,
      estimatedImpact: "Protects against job loss, medical shocks, and delayed income.",
    });
  }

  if (financialData.variableExpenses > financialData.income * 0.3) {
    const trimTarget = financialData.variableExpenses - financialData.income * 0.3;
    recommendations.push({
      id: "rec_expenses",
      priority: "MEDIUM",
      title: "Lifestyle Spend Is Too Heavy",
      description: "Variable expenses are above the 30% operating lane.",
      action: `Trim around ${formatCurrency(trimTarget)} from flexible categories.`,
      estimatedImpact: "Creates immediate monthly surplus without changing income.",
    });
  }

  if (metrics.freeCash > 0 && metrics.savingsBufferMonths >= 3) {
    recommendations.push({
      id: "rec_invest",
      priority: "LOW",
      title: "Deploy Surplus With Discipline",
      description: "You have positive cash flow and a basic safety buffer.",
      action: `Consider automating up to ${formatCurrency(metrics.recommendedInvestment)} monthly into long-term goals.`,
      estimatedImpact: "Converts idle surplus into compounding wealth.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec_good",
      priority: "LOW",
      title: "Keep the System Running",
      description: "Your financial indicators are balanced right now.",
      action: "Review this profile monthly and test major decisions before committing.",
      estimatedImpact: "Maintains a strong decision loop.",
    });
  }

  return {
    recommendations,
    profile,
  };
}

export function createBudgetPlan(financialData: FinancialData) {
  const metrics = getMetrics(financialData);
  const needsActual = financialData.fixedExpenses + financialData.loans;
  const wantsActual = financialData.variableExpenses;
  const surplusActual = metrics.freeCash;

  const lanes = [
    {
      id: "needs",
      label: "Needs + EMIs",
      target: financialData.income * 0.5,
      actual: needsActual,
      status: needsActual <= financialData.income * 0.5 ? "ON_TRACK" : "OVER",
    },
    {
      id: "wants",
      label: "Lifestyle",
      target: financialData.income * 0.3,
      actual: wantsActual,
      status: wantsActual <= financialData.income * 0.3 ? "ON_TRACK" : "OVER",
    },
    {
      id: "surplus",
      label: "Savings / Investing",
      target: financialData.income * 0.2,
      actual: surplusActual,
      status: surplusActual >= financialData.income * 0.2 ? "ON_TRACK" : "UNDER",
    },
  ];

  const corrections = lanes
    .filter((lane) => lane.status !== "ON_TRACK")
    .map((lane) => ({
      lane: lane.label,
      delta: lane.status === "UNDER" ? lane.target - lane.actual : lane.actual - lane.target,
      message:
        lane.status === "UNDER"
          ? `Increase ${lane.label.toLowerCase()} by ${formatCurrency(lane.target - lane.actual)}.`
          : `Reduce ${lane.label.toLowerCase()} by ${formatCurrency(lane.actual - lane.target)}.`,
    }));

  return {
    model: metrics.freeCash < 0 ? "Recovery Mode" : metrics.savingsBufferMonths < 3 ? "Stability Mode" : "Growth Mode",
    lanes,
    corrections,
    summary:
      metrics.freeCash < 0
        ? "The budget must first stop the deficit."
        : metrics.savingsBufferMonths < 3
          ? "The budget should prioritize emergency runway."
          : "The budget can balance protection with compounding.",
  };
}

export function runStressTest(args: {
  financialData: FinancialData;
  incomeDropPercent?: number;
  months?: number;
  emergencyExpense?: number;
  expenseCutPercent?: number;
}) {
  const financialData = args.financialData;
  const incomeDropPercent = parseNumber(args.incomeDropPercent ?? 100, "Income drop percent", { min: 0, max: 100 });
  const months = Math.round(parseNumber(args.months ?? 12, "Stress duration", { min: 1, max: 60 }));
  const emergencyExpense = parseNumber(args.emergencyExpense ?? 0, "Emergency expense", { min: 0, max: 1_000_000_000 });
  const expenseCutPercent = parseNumber(args.expenseCutPercent ?? 15, "Expense cut percent", { min: 0, max: 90 });
  const stressedIncome = financialData.income * (1 - incomeDropPercent / 100);
  const stressedOutflow =
    financialData.fixedExpenses + financialData.loans + financialData.variableExpenses * (1 - expenseCutPercent / 100);
  const monthlyBurn = Math.max(0, stressedOutflow - stressedIncome);
  const startingSavings = Math.max(0, financialData.savings - emergencyExpense);
  const survivalMonths = monthlyBurn === 0 ? months : Math.floor(startingSavings / monthlyBurn);
  const riskLevel: RiskLevel = survivalMonths >= 6 ? "LOW" : survivalMonths >= 3 ? "MEDIUM" : "HIGH";

  const chartData = Array.from({ length: months + 1 }, (_, index) => ({
    month: index === 0 ? "Now" : `M${index}`,
    Savings: Math.max(0, startingSavings - monthlyBurn * index),
  }));

  return {
    riskLevel,
    survivalMonths,
    monthlyBurn,
    stressedIncome,
    stressedOutflow,
    depletionMonth: monthlyBurn === 0 || survivalMonths >= months ? null : survivalMonths + 1,
    chartData,
    summary:
      riskLevel === "LOW"
        ? "The profile survives a serious shock with useful runway."
        : riskLevel === "MEDIUM"
          ? "The profile survives short disruption but needs a larger buffer."
          : "The profile needs urgent runway protection before taking major risk.",
  };
}

export function planGoal(args: {
  targetAmount: number;
  currentAmount?: number;
  months: number;
  financialData: FinancialData;
}) {
  const targetAmount = parseNumber(args.targetAmount, "Goal target", { min: 1, max: 1_000_000_000 });
  const currentAmount = parseNumber(args.currentAmount ?? 0, "Current goal savings", { min: 0, max: targetAmount });
  const months = Math.round(parseNumber(args.months, "Goal timeline", { min: 1, max: 600 }));
  const metrics = getMetrics(args.financialData);
  const remaining = Math.max(0, targetAmount - currentAmount);
  const monthlyRequired = remaining / months;
  const comfortLimit = Math.max(0, metrics.freeCash * 0.7);
  const feasibility: RiskLevel = monthlyRequired <= comfortLimit ? "LOW" : monthlyRequired <= metrics.freeCash ? "MEDIUM" : "HIGH";

  const chartData = Array.from({ length: Math.min(months, 24) + 1 }, (_, index) => ({
    month: index,
    Planned: Math.min(targetAmount, currentAmount + monthlyRequired * index),
    Comfortable: Math.min(targetAmount, currentAmount + comfortLimit * index),
  }));

  return {
    targetAmount,
    currentAmount,
    remaining,
    months,
    monthlyRequired,
    comfortLimit,
    feasibility,
    chartData,
    summary:
      feasibility === "LOW"
        ? "This goal fits comfortably inside your current surplus."
        : feasibility === "MEDIUM"
          ? "This goal is possible, but it will use most of your surplus."
          : "This target needs a longer timeline, lower cost, or higher income.",
  };
}

function simulatePayoff(balance: number, annualRate: number, monthlyPayment: number, extraPayment: number) {
  const monthlyRate = annualRate / 12 / 100;
  let remaining = balance;
  let months = 0;
  let totalInterest = 0;
  const chartData: Array<{ month: number; Balance: number }> = [{ month: 0, Balance: Math.round(balance) }];

  while (remaining > 0.5 && months < 600) {
    const interest = remaining * monthlyRate;
    const payment = Math.min(remaining + interest, monthlyPayment + extraPayment);
    const principal = payment - interest;

    if (principal <= 0) {
      throw new ValidationError("Monthly payment is too low to reduce this debt.");
    }

    remaining -= principal;
    totalInterest += interest;
    months += 1;

    if (months <= 24 || months % 12 === 0 || remaining <= 0.5) {
      chartData.push({ month: months, Balance: Math.max(0, Math.round(remaining)) });
    }
  }

  return {
    months,
    totalInterest,
    chartData,
  };
}

export function planDebtPayoff(args: {
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  extraPayment?: number;
}) {
  const balance = parseNumber(args.balance, "Debt balance", { min: 1, max: 1_000_000_000 });
  const annualRate = parseNumber(args.annualRate, "Debt interest rate", { min: 0, max: 80 });
  const monthlyPayment = parseNumber(args.monthlyPayment, "Monthly payment", { min: 1, max: 100_000_000 });
  const extraPayment = parseNumber(args.extraPayment ?? 0, "Extra payment", { min: 0, max: 100_000_000 });
  const baseline = simulatePayoff(balance, annualRate, monthlyPayment, 0);
  const accelerated = simulatePayoff(balance, annualRate, monthlyPayment, extraPayment);

  return {
    baselineMonths: baseline.months,
    acceleratedMonths: accelerated.months,
    monthsSaved: Math.max(0, baseline.months - accelerated.months),
    interestSaved: Math.max(0, baseline.totalInterest - accelerated.totalInterest),
    totalInterest: accelerated.totalInterest,
    chartData: accelerated.chartData,
    summary:
      extraPayment > 0
        ? `Extra payments save ${Math.max(0, baseline.months - accelerated.months)} months and ${formatCurrency(Math.max(0, baseline.totalInterest - accelerated.totalInterest))} interest.`
        : "Add an extra payment to see how quickly payoff accelerates.",
  };
}

export function projectWealth(args: {
  monthlyInvestment: number;
  annualReturn: number;
  years: number;
  startingAmount?: number;
  financialData: FinancialData;
}) {
  const metrics = getMetrics(args.financialData);
  const monthlyInvestment = parseNumber(args.monthlyInvestment, "Monthly investment", { min: 0, max: 100_000_000 });
  const annualReturn = parseNumber(args.annualReturn, "Expected annual return", { min: 0, max: 40 });
  const years = parseNumber(args.years, "Projection years", { min: 1, max: 60 });
  const startingAmount = parseNumber(args.startingAmount ?? 0, "Starting amount", { min: 0, max: 1_000_000_000 });
  const monthlyRate = annualReturn / 12 / 100;
  const months = Math.round(years * 12);
  let balance = startingAmount;
  let totalInvested = startingAmount;
  const chartData: Array<{ year: number; Value: number; Invested: number }> = [
    { year: 0, Value: Math.round(balance), Invested: Math.round(totalInvested) },
  ];

  for (let month = 1; month <= months; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyInvestment;
    totalInvested += monthlyInvestment;

    if (month % 12 === 0 || month === months) {
      chartData.push({
        year: Math.round(month / 12),
        Value: Math.round(balance),
        Invested: Math.round(totalInvested),
      });
    }
  }

  const feasibility: RiskLevel =
    monthlyInvestment <= metrics.freeCash * 0.45 ? "LOW" : monthlyInvestment <= metrics.freeCash ? "MEDIUM" : "HIGH";

  return {
    projectedValue: balance,
    totalInvested,
    growth: balance - totalInvested,
    feasibility,
    chartData,
    summary:
      feasibility === "LOW"
        ? "This investment amount is aligned with the current surplus."
        : feasibility === "MEDIUM"
          ? "This is possible but uses a large share of surplus."
          : "This contribution exceeds safe surplus and may create pressure.",
  };
}

export function simulateDecision(args: {
  scenario: "none" | "loan" | "buy" | "income-drop";
  financialData: FinancialData;
}) {
  const metrics = getMetrics(args.financialData);
  const currentFreeCash = Math.max(0, metrics.freeCash);
  let changeFreeCash = currentFreeCash;
  let initialSavings = args.financialData.savings;
  let stabilityDrop = "None";

  if (args.scenario === "loan") {
    changeFreeCash = Math.max(0, currentFreeCash - 15_000);
    stabilityDrop = "Moderate cash-flow hit";
  } else if (args.scenario === "buy") {
    initialSavings = Math.max(0, args.financialData.savings - 200_000);
    stabilityDrop = "High liquidity shock";
  } else if (args.scenario === "income-drop") {
    changeFreeCash = Math.max(0, currentFreeCash - args.financialData.income * 0.2);
    stabilityDrop = "Income resilience test";
  }

  const chartData = MONTHS.map((month, index) => {
    const isStart = index === 0;
    return {
      month,
      Current: args.financialData.savings + currentFreeCash * index,
      Simulated: args.scenario === "buy" && isStart ? initialSavings : initialSavings + changeFreeCash * index,
    };
  });

  return { chartData, stabilityDrop };
}

export function createExecutiveBrief(financialData: FinancialData) {
  const profile = analyzeProfile(financialData);
  const recommendations = getRecommendations(financialData).recommendations.slice(0, 3);
  const budget = createBudgetPlan(financialData);
  const stress = runStressTest({ financialData, incomeDropPercent: 100, months: 12, expenseCutPercent: 20 });

  return {
    headline: `Grade ${profile.grade} financial decision profile`,
    summary: profile.narrative,
    kpis: [
      { label: "Health Score", value: `${profile.score}/100` },
      { label: "Monthly Free Cash", value: formatCurrency(profile.metrics.freeCash) },
      { label: "Emergency Runway", value: `${profile.metrics.savingsBufferMonths.toFixed(1)} months` },
      { label: "Debt-to-Income", value: `${Math.round(profile.metrics.debtToIncome * 100)}%` },
      { label: "Safe EMI Room", value: formatCurrency(profile.metrics.safeEmiRoom) },
      { label: "Stress Survival", value: `${stress.survivalMonths}+ months` },
    ],
    recommendations,
    budgetMode: budget.model,
    talkingPoints: [
      `The engine uses strict guardrails, not vague tips: 40% EMI cap, 6-month runway target, and surplus-based affordability.`,
      `Current maximum disciplined purchase power is ${formatCurrency(profile.metrics.purchasePower)}.`,
      `Best next move: ${recommendations[0]?.action ?? "Keep reviewing major decisions before committing."}`,
    ],
    generatedAt: new Date().toISOString(),
    formattedIncome: `₹${INR_FORMATTER.format(financialData.income)}`,
  };
}
