import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import InputPage from "./pages/InputPage";
import DashboardPage from "./pages/DashboardPage";
import AffordabilityPage from "./pages/AffordabilityPage";
import LoanAnalyzerPage from "./pages/LoanAnalyzerPage";
import DecisionSimulatorPage from "./pages/DecisionSimulatorPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import StrategyCenterPage from "./pages/StrategyCenterPage";
import AppLayout from "./components/layout/AppLayout";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    document.title = "FinSight DecisionOS";
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        
        {/* Pages with layout */}
        <Route element={<AppLayout />}>
          <Route path="/onboarding" element={<InputPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/affordability" element={<AffordabilityPage />} />
          <Route path="/loan-analyzer" element={<LoanAnalyzerPage />} />
          <Route path="/decision" element={<DecisionSimulatorPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/strategy" element={<StrategyCenterPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
