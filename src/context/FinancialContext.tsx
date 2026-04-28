import { createContext, useContext, useState, ReactNode } from "react";
import type { FinancialData } from "@/lib/financeEngine";

export type { FinancialData };

type FinancialContextType = {
  data: FinancialData | null;
  setData: (data: FinancialData) => void;
  isDataComplete: boolean;
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<FinancialData | null>(() => {
    try {
      const saved = localStorage.getItem("financialData");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { familySize: 1, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load generic financial data", e);
    }
    return null;
  });

  const setData = (newData: FinancialData) => {
    setDataState(newData);
    localStorage.setItem("financialData", JSON.stringify(newData));
  };

  const isDataComplete = !!data;

  return (
    <FinancialContext.Provider value={{ data, setData, isDataComplete }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
