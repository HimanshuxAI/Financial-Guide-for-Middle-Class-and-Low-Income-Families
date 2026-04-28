import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useFinancial } from "@/context/FinancialContext";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

export default function AffordabilityPage() {
  const { data, isDataComplete } = useFinancial();
  const [costStr, setCostStr] = useState("");
  const [paymentType, setPaymentType] = useState<"full" | "emi">("full");
  const [emiMonthsStr, setEmiMonthsStr] = useState("12");
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cost = Number(costStr);
    const emiMonths = Number(emiMonthsStr) || 1;

    if (cost > 0 && data) {
      setLoading(true);
      setError(null);
      const timer = setTimeout(() => {
        axios.post('/api/check-affordability', {
          cost, paymentType, emiMonths, financialData: data
        }).then(res => {
          setResult(res.data);
          setLoading(false);
        }).catch(err => {
          console.error(err);
          setError("Failed to analyze affordability. Please try again.");
          setResult(null);
          setLoading(false);
        });
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setResult(null);
      setError(null);
    }
  }, [costStr, paymentType, emiMonthsStr, data]);

  if (!isDataComplete || !data) return <Navigate to="/onboarding" replace />;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-6 pb-20 w-full lg:max-w-4xl lg:mx-auto">
      
      <div className="flex flex-col gap-6">
        <Input 
          label="Item Cost (₹)" 
          type="number"
          min="0"
          placeholder="e.g. 80000"
          value={costStr}
          onChange={(e) => setCostStr(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-zinc-600 mb-2 block">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentType("full")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all shadow-sm ${paymentType === "full" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
            >
              <span className="font-semibold">Full Pay</span>
            </button>
            <button
              onClick={() => setPaymentType("emi")}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all shadow-sm ${paymentType === "emi" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}
            >
              <span className="font-semibold">EMI (0%)</span>
            </button>
          </div>
        </div>

        {paymentType === "emi" && (
           <Input 
             label="EMI Duration (Months)" 
             type="number"
             placeholder="12"
             value={emiMonthsStr}
             onChange={(e) => setEmiMonthsStr(e.target.value)}
             min="1"
           />
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`mt-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
          >
            <Card className={`border-2 shadow-sm ${
              result.riskLevel === 'HIGH' ? 'border-red-300' : 
              result.riskLevel === 'MEDIUM' ? 'border-amber-300' : 'border-green-300'
            }`}>
              <div className={`p-6 flex flex-col items-center text-center ${
                result.riskLevel === 'HIGH' ? 'bg-red-50' : 
                result.riskLevel === 'MEDIUM' ? 'bg-amber-50' : 'bg-green-50'
              }`}>
                {result.decision === 'AFFORDABLE' ? (
                  <CheckCircle2 className="w-16 h-16 mb-2 text-green-600" />
                ) : result.decision === 'CAUTION' ? (
                  <AlertTriangle className="w-16 h-16 mb-2 text-amber-500" />
                ) : (
                  <XCircle className="w-16 h-16 mb-2 text-red-500" />
                )}
                
                <h2 className="text-2xl font-bold mb-1 mt-2 text-zinc-900 tracking-tight">
                  {result.decision === 'AFFORDABLE' ? "Affordable" : result.decision === 'CAUTION' ? "Proceed with Caution" : "Not Affordable"}
                </h2>

                <div className="w-full h-px bg-zinc-200 my-4"></div>
                
                <div className="w-full text-left space-y-5">
                  <div>
                    <span className="text-zinc-500 text-sm block mb-1 font-medium">Impact Reason</span>
                    <p className={`font-medium text-[17px] leading-snug ${result.riskLevel === 'HIGH' ? 'text-red-700' : 'text-zinc-900'}`}>
                      {result.reason}
                    </p>
                  </div>

                  <div>
                     <span className="text-zinc-500 text-sm block mb-1 font-medium">State After Purchase</span>
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
