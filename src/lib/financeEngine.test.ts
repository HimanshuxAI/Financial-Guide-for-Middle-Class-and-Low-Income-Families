import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeProfile,
  checkAffordability,
  checkLoan,
  normalizeFinancialData,
  planDebtPayoff,
  planGoal,
  projectWealth,
  runStressTest,
} from "./financeEngine";

const healthyProfile = normalizeFinancialData({
  income: 100000,
  fixedExpenses: 30000,
  variableExpenses: 18000,
  loans: 10000,
  savings: 500000,
  familySize: 3,
});

test("profile analysis produces strong score and runway metrics", () => {
  const result = analyzeProfile(healthyProfile);

  assert.equal(result.riskLevel, "LOW");
  assert.ok(result.score >= 75);
  assert.ok(result.metrics.savingsBufferMonths > 6);
});

test("affordability rejects EMI that exceeds free cash", () => {
  const stretched = normalizeFinancialData({
    income: 50000,
    fixedExpenses: 20000,
    variableExpenses: 20000,
    loans: 5000,
    savings: 60000,
    familySize: 1,
  });

  const result = checkAffordability({
    cost: 120000,
    paymentType: "emi",
    emiMonths: 12,
    financialData: stretched,
  });

  assert.equal(result.decision, "NOT_AFFORDABLE");
  assert.equal(result.riskLevel, "HIGH");
});

test("loan analyzer includes existing EMIs in debt ratio", () => {
  const result = checkLoan({
    loanAmount: 900000,
    interestRate: 11,
    tenureYears: 4,
    financialData: healthyProfile,
  });

  assert.ok(result.details.totalDebtRatio > 0.1);
  assert.ok(Number.isFinite(result.details.emi));
});

test("stress test reports high risk for thin savings", () => {
  const thinProfile = normalizeFinancialData({
    income: 60000,
    fixedExpenses: 25000,
    variableExpenses: 20000,
    loans: 8000,
    savings: 20000,
    familySize: 2,
  });

  const result = runStressTest({ financialData: thinProfile, incomeDropPercent: 100, months: 12 });

  assert.equal(result.riskLevel, "HIGH");
  assert.ok(result.survivalMonths < 3);
});

test("goal planner flags impossible monthly targets", () => {
  const result = planGoal({
    targetAmount: 1000000,
    currentAmount: 0,
    months: 6,
    financialData: healthyProfile,
  });

  assert.equal(result.feasibility, "HIGH");
});

test("extra debt payments reduce payoff time", () => {
  const result = planDebtPayoff({
    balance: 300000,
    annualRate: 18,
    monthlyPayment: 12000,
    extraPayment: 3000,
  });

  assert.ok(result.monthsSaved > 0);
  assert.ok(result.interestSaved > 0);
});

test("wealth projection compounds above invested principal", () => {
  const result = projectWealth({
    monthlyInvestment: 10000,
    annualReturn: 12,
    years: 10,
    startingAmount: 0,
    financialData: healthyProfile,
  });

  assert.ok(result.projectedValue > result.totalInvested);
});
