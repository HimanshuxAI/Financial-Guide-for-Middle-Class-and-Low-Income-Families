import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BadgeIndianRupee,
  BriefcaseBusiness,
  Calculator,
  ClipboardCheck,
  Gauge,
  Landmark,
  PiggyBank,
  ShieldCheck,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { useFinancial } from "@/context/FinancialContext";

type TabId = "brief" | "budget" | "stress" | "goal" | "debt" | "wealth";

const tabs: Array<{ id: TabId; label: string; icon: typeof ClipboardCheck }> = [
  { id: "brief", label: "Executive Brief", icon: ClipboardCheck },
  { id: "budget", label: "Budget Blueprint", icon: Calculator },
  { id: "stress", label: "Stress Test", icon: ShieldAlert },
  { id: "goal", label: "Goal Planner", icon: Target },
  { id: "debt", label: "Debt Payoff", icon: BadgeIndianRupee },
  { id: "wealth", label: "Wealth Projection", icon: TrendingUp },
];

const commandSignals = [
  { label: "Guardrail Stack", value: "40% EMI cap", icon: ShieldCheck },
  { label: "Runway Doctrine", value: "6-month buffer", icon: PiggyBank },
  { label: "Capital Lens", value: "Surplus-first", icon: Landmark },
  { label: "Decision Latency", value: "Instant", icon: Activity },
];

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

function riskClass(risk?: string) {
  if (risk === "HIGH") return "text-red-700 bg-red-50 border-red-100";
  if (risk === "MEDIUM") return "text-amber-700 bg-amber-50 border-amber-100";
  return "text-emerald-700 bg-emerald-50 border-emerald-100";
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div className="min-w-0">
      <Input
        label={label}
        type="number"
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        min="0"
      />
      {suffix && <p className="mt-1 text-xs font-medium text-zinc-500">{suffix}</p>}
    </div>
  );
}

export default function StrategyCenterPage() {
  const { data, isDataComplete } = useFinancial();
  const [activeTab, setActiveTab] = useState<TabId>("brief");
  const [brief, setBrief] = useState<any>(null);
  const [budget, setBudget] = useState<any>(null);
  const [stress, setStress] = useState<any>(null);
  const [goal, setGoal] = useState<any>(null);
  const [debt, setDebt] = useState<any>(null);
  const [wealth, setWealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [stressInputs, setStressInputs] = useState({
    incomeDropPercent: 100,
    months: 12,
    emergencyExpense: 0,
    expenseCutPercent: 20,
  });
  const [goalInputs, setGoalInputs] = useState({
    targetAmount: 500000,
    currentAmount: 50000,
    months: 24,
  });
  const [debtInputs, setDebtInputs] = useState({
    balance: 300000,
    annualRate: 18,
    monthlyPayment: 12000,
    extraPayment: 3000,
  });
  const [wealthInputs, setWealthInputs] = useState({
    monthlyInvestment: 10000,
    annualReturn: 12,
    years: 10,
    startingAmount: 0,
  });

  const payload = useMemo(() => ({ financialData: data }), [data]);

  const briefText = useMemo(() => {
    if (!brief) return "";
    const kpis = brief.kpis.map((kpi: any) => `${kpi.label}: ${kpi.value}`).join("\n");
    const actions = brief.recommendations.map((rec: any, index: number) => `${index + 1}. ${rec.title}: ${rec.action}`).join("\n");
    return `${brief.headline}\n${brief.summary}\n\nKPIs\n${kpis}\n\nPriority Actions\n${actions}`;
  }, [brief]);

  const loadCore = async () => {
    if (!data) return;
    setLoading(true);
    setError(null);

    try {
      const [briefRes, budgetRes, stressRes, goalRes, debtRes, wealthRes] = await Promise.all([
        axios.post("/api/executive-brief", payload),
        axios.post("/api/budget-plan", payload),
        axios.post("/api/stress-test", { ...payload, ...stressInputs }),
        axios.post("/api/goal-plan", { ...payload, ...goalInputs }),
        axios.post("/api/debt-payoff", debtInputs),
        axios.post("/api/wealth-projection", { ...payload, ...wealthInputs }),
      ]);

      setBrief(briefRes.data);
      setBudget(budgetRes.data);
      setStress(stressRes.data);
      setGoal(goalRes.data);
      setDebt(debtRes.data);
      setWealth(wealthRes.data);
    } catch (err) {
      console.error(err);
      setError("Strategy Center could not complete the analysis. Check inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!isDataComplete || !data) return <Navigate to="/onboarding" replace />;

  const copyBrief = async () => {
    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="w-full px-4 pb-16 md:px-6">
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-zinc-800 bg-[linear-gradient(135deg,#050505_0%,#111827_48%,#17352b_100%)] text-white shadow-[0_28px_100px_rgba(15,23,42,0.28)]">
        <div className="grid gap-8 p-6 md:grid-cols-[1.12fr_0.88fr] md:p-8">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Capital Command Layer
              </div>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">Strategy Center</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">
                An institutional-grade command room for risk, liquidity, debt velocity, goal feasibility, and compounding decisions.
              </p>
            </div>

            {brief && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {brief.kpis.slice(0, 6).map((kpi: any) => (
                  <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <p className="text-xs font-medium text-zinc-400">{kpi.label}</p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-white">{kpi.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Engine Status</p>
                <p className="mt-1 text-sm text-zinc-300">Six decision modules live with explainable guardrails</p>
              </div>
              <Gauge className="h-8 w-8 text-emerald-300" />
            </div>
            <div className="space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    activeTab === tab.id
                      ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                      : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </span>
                  {activeTab === tab.id && <span className="text-[10px] font-black uppercase tracking-[0.18em]">Live</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid border-t border-white/10 bg-black/20 md:grid-cols-4">
          {commandSignals.map((signal) => (
            <div key={signal.label} className="flex items-center gap-3 border-white/10 px-6 py-4 md:border-r">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-200">
                <signal.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">{signal.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{signal.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-zinc-200 bg-white p-12 text-zinc-500">
          <div className="mr-3 h-6 w-6 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-700" />
          Running advanced analysis...
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "brief" && brief && (
              <Card className="p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Boardroom Summary</p>
                    <h3 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">{brief.headline}</h3>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">{brief.summary}</p>
                  </div>
                  <Button variant="outline" onClick={copyBrief}>{copied ? "Copied" : "Copy Brief"}</Button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {brief.recommendations.map((rec: any) => (
                    <div key={rec.id} className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest ${riskClass(rec.priority)}`}>
                        {rec.priority}
                      </span>
                      <h4 className="mt-4 text-lg font-semibold text-zinc-950">{rec.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{rec.action}</p>
                      <p className="mt-4 border-t border-zinc-200 pt-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{rec.estimatedImpact}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] bg-zinc-950 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Presentation Talking Points</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {brief.talkingPoints.map((point: string) => (
                        <p key={point} className="text-sm leading-6 text-zinc-300">{point}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Investor-Grade Narrative</p>
                    <div className="mt-5 space-y-4">
                      {[
                        "Clear rule engine beats vague dashboards.",
                        "Every output explains the constraint that created it.",
                        "The product demo moves from diagnosis to action in under one minute.",
                      ].map((item) => (
                        <div key={item} className="flex gap-3">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-700" />
                          <p className="text-sm font-medium leading-6 text-emerald-950">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "budget" && budget && (
              <Card className="p-6 md:p-8">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">{budget.model}</p>
                  <h3 className="text-3xl font-semibold tracking-tight text-zinc-950">Budget Blueprint</h3>
                  <p className="text-sm leading-6 text-zinc-600">{budget.summary}</p>
                </div>
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {budget.lanes.map((lane: any) => (
                    <div key={lane.id} className="rounded-2xl border border-zinc-200 p-5">
                      <p className="text-sm font-semibold text-zinc-950">{lane.label}</p>
                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={`h-full rounded-full ${lane.status === "ON_TRACK" ? "bg-emerald-500" : "bg-amber-500"}`}
                          style={{ width: `${Math.min(100, (lane.actual / Math.max(1, lane.target)) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-4 text-sm text-zinc-600">Actual {formatCurrency(lane.actual)}</p>
                      <p className="text-sm text-zinc-500">Target {formatCurrency(lane.target)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 grid gap-3">
                  {budget.corrections.length === 0 ? (
                    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">All budget lanes are inside target.</p>
                  ) : (
                    budget.corrections.map((item: any) => (
                      <p key={item.lane} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">{item.message}</p>
                    ))
                  )}
                </div>
              </Card>
            )}

            {activeTab === "stress" && stress && (
              <Card className="p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Shock Resilience</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{stress.survivalMonths}+ months runway</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{stress.summary}</p>
                    <div className="mt-6 grid gap-4">
                      <Field label="Income Drop %" value={stressInputs.incomeDropPercent} onChange={(value) => setStressInputs({ ...stressInputs, incomeDropPercent: value })} />
                      <Field label="Emergency Expense" value={stressInputs.emergencyExpense} onChange={(value) => setStressInputs({ ...stressInputs, emergencyExpense: value })} />
                      <Field label="Expense Cut %" value={stressInputs.expenseCutPercent} onChange={(value) => setStressInputs({ ...stressInputs, expenseCutPercent: value })} />
                      <Button onClick={loadCore}>Run Stress Test</Button>
                    </div>
                  </div>
                  <div className="h-[360px] rounded-2xl border border-zinc-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stress.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} />
                        <YAxis hide />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area dataKey="Savings" stroke="#047857" fill="#d1fae5" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "goal" && goal && (
              <Card className="p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Goal Feasibility</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{formatCurrency(goal.monthlyRequired)} / month</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{goal.summary}</p>
                    <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${riskClass(goal.feasibility)}`}>{goal.feasibility} PRESSURE</span>
                    <div className="mt-6 grid gap-4">
                      <Field label="Goal Target" value={goalInputs.targetAmount} onChange={(value) => setGoalInputs({ ...goalInputs, targetAmount: value })} />
                      <Field label="Already Saved" value={goalInputs.currentAmount} onChange={(value) => setGoalInputs({ ...goalInputs, currentAmount: value })} />
                      <Field label="Timeline Months" value={goalInputs.months} onChange={(value) => setGoalInputs({ ...goalInputs, months: value })} />
                      <Button onClick={loadCore}>Recalculate Goal</Button>
                    </div>
                  </div>
                  <div className="h-[360px] rounded-2xl border border-zinc-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={goal.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} />
                        <YAxis hide />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Line dataKey="Planned" stroke="#111827" strokeWidth={3} dot={false} />
                        <Line dataKey="Comfortable" stroke="#10b981" strokeWidth={3} dot={false} strokeDasharray="6 6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "debt" && debt && (
              <Card className="p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Debt Acceleration</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{debt.monthsSaved} months saved</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{debt.summary}</p>
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-medium text-emerald-800">Interest saved: {formatCurrency(debt.interestSaved)}</p>
                    </div>
                    <div className="mt-6 grid gap-4">
                      <Field label="Debt Balance" value={debtInputs.balance} onChange={(value) => setDebtInputs({ ...debtInputs, balance: value })} />
                      <Field label="Annual Rate %" value={debtInputs.annualRate} onChange={(value) => setDebtInputs({ ...debtInputs, annualRate: value })} />
                      <Field label="Monthly Payment" value={debtInputs.monthlyPayment} onChange={(value) => setDebtInputs({ ...debtInputs, monthlyPayment: value })} />
                      <Field label="Extra Payment" value={debtInputs.extraPayment} onChange={(value) => setDebtInputs({ ...debtInputs, extraPayment: value })} />
                      <Button onClick={loadCore}>Optimize Payoff</Button>
                    </div>
                  </div>
                  <div className="h-[360px] rounded-2xl border border-zinc-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={debt.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} />
                        <YAxis hide />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Area dataKey="Balance" stroke="#b45309" fill="#fef3c7" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "wealth" && wealth && (
              <Card className="p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Compounding Projection</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{formatCurrency(wealth.projectedValue)}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{wealth.summary}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500">Invested</p>
                        <p className="mt-1 text-lg font-semibold text-zinc-950">{formatCurrency(wealth.totalInvested)}</p>
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-xs text-emerald-700">Growth</p>
                        <p className="mt-1 text-lg font-semibold text-emerald-900">{formatCurrency(wealth.growth)}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4">
                      <Field label="Monthly Investment" value={wealthInputs.monthlyInvestment} onChange={(value) => setWealthInputs({ ...wealthInputs, monthlyInvestment: value })} />
                      <Field label="Annual Return %" value={wealthInputs.annualReturn} onChange={(value) => setWealthInputs({ ...wealthInputs, annualReturn: value })} />
                      <Field label="Years" value={wealthInputs.years} onChange={(value) => setWealthInputs({ ...wealthInputs, years: value })} />
                      <Button onClick={loadCore}>Project Wealth</Button>
                    </div>
                  </div>
                  <div className="h-[360px] rounded-2xl border border-zinc-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={wealth.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#71717a" }} />
                        <YAxis hide />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="Invested" fill="#d4d4d8" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Value" fill="#059669" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
