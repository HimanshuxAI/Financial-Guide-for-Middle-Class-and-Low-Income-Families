import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useFinancial } from "@/context/FinancialContext";
import { Card } from "@/components/common/Card";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

export default function DecisionSimulatorPage() {
  const { data, isDataComplete } = useFinancial();
  const [scenario, setScenario] = useState<"none" | "loan" | "buy" | "income-drop">("none");
  const [simulation, setSimulation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setError(null);
      axios.post('/api/simulate-decision', { scenario, financialData: data })
        .then(res => setSimulation(res.data))
        .catch(err => {
          console.error(err);
          setError("Failed to run simulation. Please try again.");
        });
    }
  }, [scenario, data]);

  if (!isDataComplete || !data) return <Navigate to="/onboarding" replace />;

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  }

  if (!simulation) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400 mt-20">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-400 animate-spin mb-4" />
        <span className="text-sm font-medium">Running simulation...</span>
      </div>
    );
  }

  const { chartData, stabilityDrop } = simulation;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-6 pb-20 w-full lg:max-w-4xl lg:mx-auto">
      
      <p className="text-zinc-500 mb-6 text-sm">Select a major decision to see how it impacts your trajectory over the next 12 months.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setScenario(scenario === "loan" ? "none" : "loan")}
          className={`p-5 rounded-xl border flex flex-col items-start gap-2 transition-all shadow-sm ${scenario === "loan" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"}`}
        >
          <span className="font-semibold text-lg">Take a Loan</span>
          <span className={`text-sm ${scenario === "loan" ? "text-blue-600" : "text-zinc-500"}`}>Added ₹15k EMI</span>
        </button>
        <button
          onClick={() => setScenario(scenario === "buy" ? "none" : "buy")}
          className={`p-5 rounded-xl border flex flex-col items-start gap-2 transition-all shadow-sm ${scenario === "buy" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"}`}
        >
          <span className="font-semibold text-lg">Major Purchase</span>
          <span className={`text-sm ${scenario === "buy" ? "text-blue-600" : "text-zinc-500"}`}>- ₹200k Savings</span>
        </button>
        <button
          onClick={() => setScenario(scenario === "income-drop" ? "none" : "income-drop")}
          className={`p-5 rounded-xl border flex flex-col items-start gap-2 transition-all shadow-sm ${scenario === "income-drop" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"}`}
        >
          <span className="font-semibold text-lg">Income Shock</span>
          <span className={`text-sm ${scenario === "income-drop" ? "text-blue-600" : "text-zinc-500"}`}>-20% income path</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={scenario}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
        >
          <Card className="p-6 bg-white border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
             <h3 className="text-sm font-semibold mb-6 flex items-center justify-between text-zinc-900">
                Savings Projection
                {scenario !== "none" && (
                  <span className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-600 font-medium">vs Current Path</span>
                )}
             </h3>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                   <XAxis dataKey="month" stroke="#e4e4e7" tick={{ fill: '#71717a', fontSize: 10 }} />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ color: '#18181b' }}
                   />
                   <Line type="monotone" dataKey="Current" stroke="#e4e4e7" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                   {scenario !== "none" && (
                     <Line type="monotone" dataKey="Simulated" stroke="#2563eb" strokeWidth={3.5} dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }} />
                   )}
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </Card>

          {scenario !== "none" && (
            <div className="mt-6 space-y-3">
              <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-1">
                <span className="text-sm text-zinc-500 font-medium">Stability Drop</span>
                <span className={`text-xl font-bold ${scenario === "loan" ? "text-amber-500" : "text-amber-600"}`}>
                  {stabilityDrop}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
