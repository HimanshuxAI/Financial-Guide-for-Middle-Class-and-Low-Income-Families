import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useFinancial } from "@/context/FinancialContext";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function LoanAnalyzerPage() {
  const { data, isDataComplete } = useFinancial();
  
  const [loanAmountStr, setLoanAmountStr] = useState("");
  const [interestRateStr, setInterestRateStr] = useState("");
  const [tenureYearsStr, setTenureYearsStr] = useState("");
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loanAmount = Number(loanAmountStr);
    const interestRate = Number(interestRateStr);
    const tenureYears = Number(tenureYearsStr);

    if (loanAmount > 0 && interestRate > 0 && tenureYears > 0 && data) {
      setLoading(true);
      setError(null);
      const timer = setTimeout(() => {
        axios.post('/api/check-loan', {
          loanAmount, interestRate, tenureYears, financialData: data
        }).then(res => {
          setResult(res.data);
          setLoading(false);
        }).catch(err => {
          console.error(err);
          setError("Failed to analyze loan. Please try again.");
          setResult(null);
          setLoading(false);
        });
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setResult(null);
      setError(null);
    }
  }, [loanAmountStr, interestRateStr, tenureYearsStr, data]);

  if (!isDataComplete || !data) return <Navigate to="/onboarding" replace />;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-6 pb-20 w-full lg:max-w-4xl lg:mx-auto">
      <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <Input 
          label="Loan Amount (₹)" 
          type="number"
          min="0"
          placeholder="e.g. 500000"
          value={loanAmountStr}
          onChange={(e) => setLoanAmountStr(e.target.value)}
        />
        <Input 
          label="Interest Rate (%)" 
          type="number"
          min="0"
          placeholder="e.g. 10.5"
          value={interestRateStr}
          onChange={(e) => setInterestRateStr(e.target.value)}
        />
        <Input 
          label="Tenure (Years)" 
          type="number"
          min="0"
          placeholder="e.g. 5"
          value={tenureYearsStr}
          onChange={(e) => setTenureYearsStr(e.target.value)}
        />
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className={`mt-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
          >
            <Card className={`border-2 shadow-sm ${
              result.riskLevel === "HIGH" ? "bg-red-50 border-red-300" :
              result.riskLevel === "MEDIUM" ? "bg-amber-50 border-amber-300" :
              "bg-green-50 border-green-300"
            }`}>
              <div className="p-6 flex flex-col items-center text-center">
                {result.riskLevel === "HIGH" ? (
                  <ShieldAlert className="w-12 h-12 mb-3 text-red-500" />
                ) : result.riskLevel === "MEDIUM" ? (
                  <AlertTriangle className="w-12 h-12 mb-3 text-amber-500" />
                ) : (
                  <ShieldCheck className="w-12 h-12 mb-3 text-green-600" />
                )}
                
                <h3 className={`text-xl font-bold uppercase tracking-widest ${
                  result.riskLevel === "HIGH" ? "text-red-600" :
                  result.riskLevel === "MEDIUM" ? "text-amber-600" :
                  "text-green-700"
                }`}>
                  {result.riskLevel} Risk
                </h3>

                <div className="my-6 text-center">
                  <span className="block text-sm text-zinc-500 mb-1 font-medium">Estimated EMI</span>
                  <span className="text-4xl font-bold text-zinc-900">₹{Math.round(result.details.emi).toLocaleString('en-IN')}</span>
                  <span className="text-sm font-medium text-zinc-500 ml-1">/ mo</span>
                </div>

                <div className="w-full text-left space-y-4">
                  <div>
                    <span className="text-zinc-500 text-sm block mb-1 font-medium">Reason</span>
                    <p className={`font-medium text-[17px] leading-snug ${result.riskLevel === 'HIGH' ? 'text-red-700' : 'text-zinc-900'}`}>
                      {result.reason}
                    </p>
                  </div>

                  <div>
                     <span className="text-zinc-500 text-sm block mb-1 font-medium">Impact</span>
                     <p className="font-medium text-[17px] leading-snug text-zinc-900">
                       {result.impact}
                     </p>
                  </div>
                </div>

              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
