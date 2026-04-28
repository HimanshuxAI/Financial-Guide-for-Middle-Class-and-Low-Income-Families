import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import {
  ValidationError,
  analyzeProfile,
  checkAffordability,
  checkLoan,
  createBudgetPlan,
  createExecutiveBrief,
  getRecommendations,
  normalizeFinancialData,
  parseNumber,
  planDebtPayoff,
  planGoal,
  projectWealth,
  runStressTest,
  simulateDecision,
} from "./src/lib/financeEngine";

type ApiHandler = (req: Request, res: Response) => unknown | Promise<unknown>;

function asyncRoute(handler: ApiHandler) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      const status = error instanceof ValidationError ? error.statusCode : 500;
      const message = error instanceof Error ? error.message : "Unexpected server error.";

      if (status === 500) {
        console.error(error);
      }

      res.status(status).json({
        error: {
          message: status === 500 ? "Unexpected server error." : message,
          status,
        },
      });
    }
  };
}

function getFinancialData(req: Request) {
  return normalizeFinancialData(req.body.financialData);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  const openai = new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY,
  });

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "finance-decision-engine",
      version: "2.0.0",
    });
  });

  app.post(
    "/api/analyze-profile",
    asyncRoute((req, res) => {
      res.json(analyzeProfile(getFinancialData(req)));
    })
  );

  app.post(
    "/api/check-affordability",
    asyncRoute((req, res) => {
      const financialData = getFinancialData(req);
      const paymentType = req.body.paymentType === "emi" ? "emi" : "full";

      res.json(
        checkAffordability({
          cost: parseNumber(req.body.cost, "Item cost", { min: 1 }),
          paymentType,
          emiMonths: req.body.emiMonths,
          financialData,
        })
      );
    })
  );

  app.post(
    "/api/check-loan",
    asyncRoute((req, res) => {
      const financialData = getFinancialData(req);

      res.json(
        checkLoan({
          loanAmount: parseNumber(req.body.loanAmount, "Loan amount", { min: 1 }),
          interestRate: parseNumber(req.body.interestRate, "Interest rate", { min: 0 }),
          tenureYears: parseNumber(req.body.tenureYears, "Tenure", { min: 0.1 }),
          financialData,
        })
      );
    })
  );

  app.post(
    "/api/get-recommendations",
    asyncRoute((req, res) => {
      res.json(getRecommendations(getFinancialData(req)));
    })
  );

  app.post(
    "/api/simulate-decision",
    asyncRoute((req, res) => {
      const scenario = ["none", "loan", "buy", "income-drop"].includes(req.body.scenario) ? req.body.scenario : "none";
      res.json(simulateDecision({ scenario, financialData: getFinancialData(req) }));
    })
  );

  app.post(
    "/api/budget-plan",
    asyncRoute((req, res) => {
      res.json(createBudgetPlan(getFinancialData(req)));
    })
  );

  app.post(
    "/api/stress-test",
    asyncRoute((req, res) => {
      res.json(
        runStressTest({
          financialData: getFinancialData(req),
          incomeDropPercent: req.body.incomeDropPercent,
          months: req.body.months,
          emergencyExpense: req.body.emergencyExpense,
          expenseCutPercent: req.body.expenseCutPercent,
        })
      );
    })
  );

  app.post(
    "/api/goal-plan",
    asyncRoute((req, res) => {
      res.json(
        planGoal({
          targetAmount: req.body.targetAmount,
          currentAmount: req.body.currentAmount,
          months: req.body.months,
          financialData: getFinancialData(req),
        })
      );
    })
  );

  app.post(
    "/api/debt-payoff",
    asyncRoute((req, res) => {
      res.json(
        planDebtPayoff({
          balance: req.body.balance,
          annualRate: req.body.annualRate,
          monthlyPayment: req.body.monthlyPayment,
          extraPayment: req.body.extraPayment,
        })
      );
    })
  );

  app.post(
    "/api/wealth-projection",
    asyncRoute((req, res) => {
      res.json(
        projectWealth({
          monthlyInvestment: req.body.monthlyInvestment,
          annualReturn: req.body.annualReturn,
          years: req.body.years,
          startingAmount: req.body.startingAmount,
          financialData: getFinancialData(req),
        })
      );
    })
  );

  app.post(
    "/api/executive-brief",
    asyncRoute((req, res) => {
      res.json(createExecutiveBrief(getFinancialData(req)));
    })
  );

  app.post(
    "/api/chat",
    asyncRoute(async (req, res) => {
      res.setHeader("Content-Type", "text/plain");

      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: req.body.messages || [{ role: "user", content: "" }],
        temperature: 1,
        top_p: 1,
        max_tokens: 4096,
        stream: true,
      });

      for await (const chunk of completion) {
        if (!chunk.choices) continue;
        
        // @ts-expect-error accessing non-standard reasoning_content
        const reasoning = chunk.choices[0].delta?.reasoning_content;
        if (reasoning) {
          res.write(reasoning);
        }

        const content = chunk.choices[0].delta?.content;
        if (content !== null && content !== undefined) {
          res.write(content);
        }
      }
      
      res.end();
    })
  );

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
