import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { BarChart3, ChevronLeft, LayoutDashboard, Menu, PenLine, Sparkles } from "lucide-react";
import { useState } from "react";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDashboard = location.pathname === "/dashboard";
  const titleMap: Record<string, string> = {
    "/onboarding": "Your Finances",
    "/dashboard": "Dashboard",
    "/affordability": "Can I buy this?",
    "/loan-analyzer": "Loan Analyzer",
    "/decision": "Decision Simulator",
    "/recommendations": "Recommendations",
    "/strategy": "Strategy Center",
  };
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Strategy", path: "/strategy", icon: Sparkles },
    { label: "Decisions", path: "/decision", icon: BarChart3 },
  ];

  const currentTitle = titleMap[location.pathname] || "Finance App";

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f5ef] w-full">
      <header className="sticky top-0 px-4 py-3 flex items-center justify-center z-20 bg-[#f7f5ef]/90 backdrop-blur-xl border-b border-zinc-900/10">
        <div className="w-full max-w-6xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {!isDashboard && location.pathname !== "/onboarding" ? (
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-zinc-900/5 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-zinc-900" />
              </button>
            ) : (
               <button
                 onClick={() => navigate("/")}
                 className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white"
               >
                 F
               </button>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">FinSight DecisionOS</p>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{currentTitle}</h1>
            </div>
          </div>

          <nav className="hidden items-center rounded-full border border-zinc-900/10 bg-white/70 p-1 shadow-sm md:flex">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  location.pathname === item.path ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {(isDashboard || location.pathname === "/strategy") && (
             <button 
               onClick={() => setMenuOpen(!menuOpen)}
               className="p-2 -mr-2 rounded-full hover:bg-zinc-900/5 transition-colors relative"
              >
               <Menu className="w-6 h-6 text-zinc-900" />
             </button>
          )}
        </div>
      </header>

      {/* Main view with page transition */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex-1 w-full max-w-6xl mx-auto mt-6"
      >
        <Outlet />
      </motion.main>

      {/* Bottom Nav / Menu overlay */}
      {menuOpen && (isDashboard || location.pathname === "/strategy") && (
         <div className="absolute top-16 right-[max(1rem,calc(50vw-36rem))] w-56 bg-white rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.14)] border border-zinc-200 p-2 z-50">
           <button onClick={() => { navigate("/onboarding"); setMenuOpen(false); }} className="flex w-full items-center gap-3 text-left px-4 py-3 rounded-xl hover:bg-zinc-100 text-sm font-semibold">
             <PenLine className="h-4 w-4 text-zinc-500" />
             Edit Financial Data
           </button>
           <button onClick={() => { navigate("/recommendations"); setMenuOpen(false); }} className="flex w-full items-center gap-3 text-left px-4 py-3 rounded-xl hover:bg-zinc-100 text-sm font-semibold">
             <Sparkles className="h-4 w-4 text-emerald-600" />
             Action Plan
           </button>
         </div>
      )}
    </div>
  );
}
