import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Slider } from "@/components/common/Input";
import { useFinancial } from "@/context/FinancialContext";
import { motion } from "motion/react";

const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

export default function InputPage() {
  const navigate = useNavigate();
  const { data, setData } = useFinancial();

  const [income, setIncome] = useState(data?.income || 50000);
  const [fixedExpenses, setFixedExpenses] = useState(data?.fixedExpenses || 15000);
  const [variableExpenses, setVariableExpenses] = useState(data?.variableExpenses || 10000);
  const [loans, setLoans] = useState(data?.loans || 0);
  const [savings, setSavings] = useState(data?.savings || 100000);
  const [familySize, setFamilySize] = useState(data?.familySize || 1);
  const availableForVariable = Math.max(0, income - fixedExpenses);

  const handleSave = () => {
    setData({
      income,
      fixedExpenses,
      variableExpenses,
      loans,
      savings,
      familySize,
    });
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-6 pb-32 flex flex-col gap-6">
        
        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm"
        >
          <div>
            <h2 className="font-semibold text-lg text-zinc-900">Need sample data?</h2>
            <p className="text-sm text-zinc-500">Quickly fill realistic numbers for a demo.</p>
          </div>
          <Button variant="secondary" onClick={() => {
            setIncome(50000);
            setFixedExpenses(15000);
            setVariableExpenses(10000);
            setLoans(5000);
            setSavings(80000);
            setFamilySize(2);
          }}>
            Load Demo Profile
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm"
        >
          <Slider
            label="Monthly Income"
            min={10000} max={500000} step={5000}
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            valueDisplay={formatCurrency(income)}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm"
        >
          <Slider
            label="Fixed Expenses (Rent, Bills)"
            min={0} max={income} step={1000}
            value={fixedExpenses}
            onChange={(e) => setFixedExpenses(Number(e.target.value))}
            valueDisplay={formatCurrency(fixedExpenses)}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm"
        >
          <Slider
            label="Variable Expenses (Food, Leisure)"
            min={0} max={availableForVariable} step={1000}
            value={Math.min(variableExpenses, availableForVariable)}
            onChange={(e) => setVariableExpenses(Number(e.target.value))}
            valueDisplay={formatCurrency(variableExpenses)}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm"
        >
          <Slider
            label="Current EMIs / Loans"
            min={0} max={income} step={1000}
            value={loans}
            onChange={(e) => setLoans(Number(e.target.value))}
            valueDisplay={formatCurrency(loans)}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm"
        >
          <Slider
            label="Total Saved (Bank/Investments)"
            min={0} max={5000000} step={10000}
            value={savings}
            onChange={(e) => setSavings(Number(e.target.value))}
            valueDisplay={formatCurrency(savings)}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm"
        >
          <Slider
            label="Household Size"
            min={1} max={8} step={1}
            value={familySize}
            onChange={(e) => setFamilySize(Number(e.target.value))}
            valueDisplay={`${familySize} ${familySize === 1 ? "person" : "people"}`}
          />
        </motion.div>

        {income - (fixedExpenses + variableExpenses + loans) < 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium text-center"
          >
            Warning: Your total expenses and loans exceed your monthly income. You are in a deficit.
          </motion.div>
        )}

      </div>

      {/* Sticky footer for safe button reach on mobile/desktop */}
      <div className="fixed bottom-0 w-full p-6 bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent pt-12 pb-8 pointer-events-none z-20 flex justify-center">
        <div className="w-full max-w-2xl">
          <Button onClick={handleSave} size="lg" fullWidth className="pointer-events-auto h-14 text-base">
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
