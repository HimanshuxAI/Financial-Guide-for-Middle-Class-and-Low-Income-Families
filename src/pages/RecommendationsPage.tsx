import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useFinancial } from "@/context/FinancialContext";
import { Card } from "@/components/common/Card";
import { AlertTriangle, TrendingUp, Scissors, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";

export default function RecommendationsPage() {
  const { data, isDataComplete } = useFinancial();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setError(null);
      axios.post('/api/get-recommendations', { financialData: data })
        .then(res => {
          setRecommendations(res.data.recommendations);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Failed to load recommendations. Please try again.");
          setLoading(false);
        });
    }
  }, [data]);

  if (!isDataComplete || !data) return <Navigate to="/onboarding" replace />;

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400 mt-20">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-400 animate-spin mb-4" />
        <span className="text-sm font-medium">Generating recommendations...</span>
      </div>
    );
  }

  const getIcon = (id: string, priority: string) => {
    if (id === 'rec_debt') return <AlertTriangle className="w-6 h-6 text-red-500" />;
    if (id === 'rec_cash' && priority === 'HIGH') return <AlertTriangle className="w-6 h-6 text-red-500" />;
    if (id === 'rec_cash' && priority === 'MEDIUM') return <TrendingUp className="w-6 h-6 text-amber-500" />;
    if (id === 'rec_expenses') return <Scissors className="w-6 h-6 text-blue-600" />;
    return <CheckCircle className="w-6 h-6 text-green-600" />;
  };

  const getColors = (priority: string, id: string) => {
    if (priority === 'HIGH') return { bg: "bg-red-50", border: "border-red-200" };
    if (priority === 'MEDIUM' && id === 'rec_expenses') return { bg: "bg-blue-50", border: "border-blue-200" };
    if (priority === 'MEDIUM') return { bg: "bg-amber-50", border: "border-amber-200" };
    return { bg: "bg-green-50", border: "border-green-200" };
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto px-6 py-6 pb-20 w-full lg:max-w-4xl lg:mx-auto">
      {recommendations.map((rec, i) => {
        const colors = getColors(rec.priority, rec.id);

        return (
          <motion.div
             key={rec.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
          >
            <Card className={`p-6 flex flex-col gap-4 bg-white border ${colors.border} shadow-sm transition-all hover:shadow-md`}>
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${colors.bg}`}>
                   {getIcon(rec.id, rec.priority)}
                </div>
                <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1.5 rounded-full ${
                  rec.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : 
                  (rec.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100')
                }`}>
                  {rec.priority}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-zinc-900 mb-2 tracking-tight">{rec.title}</h3>
                <p className="text-[15px] text-zinc-600 leading-relaxed font-medium">
                  {rec.description}
                </p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
