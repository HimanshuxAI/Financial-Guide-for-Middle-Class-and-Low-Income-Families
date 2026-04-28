import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useFinancial } from "@/context/FinancialContext";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { ShoppingBag, Landmark, ArrowRight, Activity, TrendingDown, Target, Sparkles, WalletCards } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isDataComplete } = useFinancial();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setError(null);
      axios.post('/api/analyze-profile', { financialData: data })
        .then(res => setProfile(res.data))
        .catch(err => {
          console.error(err);
          setError("Failed to load dashboard. Please try again.");
        });
    }
  }, [data]);

  if (!isDataComplete || !data) {
    return <Navigate to="/onboarding" replace />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400 mt-20">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-400 animate-spin mb-4" />
        <span className="text-sm font-medium">Analyzing your profile...</span>
      </div>
    );
  }

  const { score, grade, debtRisk, savingsStatus, expensePressure, metrics, alerts, strengths, narrative } = profile;

  const getScoreColor = () => {
    if (score < 50) return "text-red-500";
    if (score < 80) return "text-amber-500";
    return "text-green-600";
  };

  return (
    <div className="flex flex-col gap-6 w-full px-4 lg:max-w-6xl lg:mx-auto mt-2 pb-16">
      
      {/* Central Score Card */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="border-none bg-zinc-950 text-white shadow-[0_24px_90px_rgba(15,23,42,0.18)]">
          <CardContent className="grid gap-8 p-6 md:grid-cols-[0.8fr_1.2fr] md:p-8">
            <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 text-center">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Financial Health</p>
              
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                  <circle 
                    cx="88" cy="88" r="76" 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 76} 
                    strokeDashoffset={2 * Math.PI * 76 * (1 - score / 100)}
                    className={`${getScoreColor()} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-5xl font-bold tracking-tight ${getScoreColor()}`}>{Math.max(0, score)}</span>
                  <span className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">Grade {grade}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">Decision Readiness</p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">{narrative}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Free Cash", metrics.formatted.freeCash],
                  ["Runway", `${metrics.savingsBufferMonths.toFixed(1)} mo`],
                  ["Safe EMI", metrics.formatted.safeEmiRoom],
                  ["Purchase Power", metrics.formatted.purchasePower],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-xs font-medium text-zinc-400">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3 Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-zinc-200 shadow-sm flex flex-col items-center justify-center p-6 text-center">
          <Activity className="w-6 h-6 text-zinc-400 mb-3" />
          <span className="text-xs text-zinc-500 mb-1 font-medium">Debt Risk</span>
          <span className={`font-semibold text-base ${debtRisk.color}`}>{debtRisk.label}</span>
        </Card>
        <Card className="bg-white border-zinc-200 shadow-sm flex flex-col items-center justify-center p-6 text-center">
          <Target className="w-6 h-6 text-zinc-400 mb-3" />
          <span className="text-xs text-zinc-500 mb-1 font-medium">Savings Status</span>
          <span className={`font-semibold text-base ${savingsStatus.color}`}>{savingsStatus.label}</span>
        </Card>
        <Card className="bg-white border-zinc-200 shadow-sm flex flex-col items-center justify-center p-6 text-center">
          <TrendingDown className="w-6 h-6 text-zinc-400 mb-3" />
          <span className="text-xs text-zinc-500 mb-1 font-medium">Expense Pressure</span>
          <span className={`font-semibold text-base ${expensePressure.color}`}>{expensePressure.label}</span>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <WalletCards className="h-5 w-5 text-emerald-700" />
            <h3 className="font-semibold text-zinc-950">Strengths</h3>
          </div>
          <div className="mt-4 space-y-2">
            {(strengths.length ? strengths : ["Profile has enough data for precise guardrails"]).map((item: string) => (
              <p key={item} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{item}</p>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-amber-700" />
            <h3 className="font-semibold text-zinc-950">Watchlist</h3>
          </div>
          <div className="mt-4 space-y-2">
            {(alerts.length ? alerts : ["No critical warnings right now"]).map((item: string) => (
              <p key={item} className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{item}</p>
            ))}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest pl-1">Actions</h3>
        
        <button
          onClick={() => navigate('/strategy')}
          className="group flex items-center justify-between bg-zinc-950 text-white border border-zinc-800 hover:border-emerald-300 rounded-2xl p-5 transition-all text-left shadow-sm hover:shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-300 flex items-center justify-center border border-emerald-200">
              <Sparkles className="w-6 h-6 text-zinc-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg">Open Strategy Center</span>
              <span className="text-sm text-zinc-300 mt-0.5">Goals, stress test, budget, debt payoff, wealth projection</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/affordability')}
            className="group flex items-center justify-between bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 transition-all text-left shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-900 text-lg group-hover:text-blue-600 transition-colors">Check Purchase</span>
                <span className="text-sm text-zinc-500 mt-0.5">Can I afford this item?</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/loan-analyzer')}
            className="group flex items-center justify-between bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 transition-all text-left shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <Landmark className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-900 text-lg group-hover:text-blue-600 transition-colors">Loan Analyzer</span>
                <span className="text-sm text-zinc-500 mt-0.5">Check EMI impact</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/decision')}
            className="group flex items-center justify-between bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 transition-all text-left shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-900 text-lg group-hover:text-indigo-600 transition-colors">Decision Simulator</span>
                <span className="text-sm text-zinc-500 mt-0.5">Test future scenarios</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/recommendations')}
            className="group flex items-center justify-between bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 transition-all text-left shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-900 text-lg group-hover:text-emerald-600 transition-colors">Action Plan</span>
                <span className="text-sm text-zinc-500 mt-0.5">Prioritized actions</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
          </button>
        </div>
      </div>

    </div>
  );
}
