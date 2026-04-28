import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Activity, ArrowRight, BriefcaseBusiness, Calculator, Landmark, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/common/Button";

const services = [
  {
    title: "Affordability Guardrails",
    text: "Hard yes, caution, and no-go decisions for major purchases with liquidity impact.",
    icon: Calculator,
  },
  {
    title: "Loan Risk Engine",
    text: "EMI pressure, total interest, and debt-to-income checks with conservative boundaries.",
    icon: ShieldCheck,
  },
  {
    title: "Capital Command Room",
    text: "Goals, stress tests, payoff plans, budget lanes, and wealth projection in one suite.",
    icon: Sparkles,
  },
  {
    title: "Executive Brief",
    text: "A boardroom-ready narrative that turns raw numbers into next-best-action logic.",
    icon: BriefcaseBusiness,
  },
];

const proofMetrics = [
  { label: "Rule Modules", value: "10+" },
  { label: "Decision Paths", value: "6" },
  { label: "Data Sold", value: "0" },
  { label: "Demo Time", value: "<60s" },
];

const decisionPillars = [
  { label: "Risk", icon: ShieldCheck },
  { label: "Goals", icon: Target },
  { label: "Growth", icon: TrendingUp },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen bg-[#f7f5ef] text-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="absolute left-0 right-0 top-0 z-20 px-5 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-zinc-950">F</span>
            <span className="text-sm font-semibold uppercase tracking-[0.22em]">FinSight</span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-white/85 md:flex">
            <button onClick={() => navigate("/onboarding")} className="hover:text-white">Analyzer</button>
            <button onClick={() => navigate("/dashboard")} className="hover:text-white">Dashboard</button>
            <button onClick={() => navigate("/strategy")} className="hover:text-white">Strategy</button>
          </nav>
          <Button onClick={() => navigate("/onboarding")} className="hidden bg-white text-zinc-950 hover:bg-emerald-100 md:inline-flex">
            Start
          </Button>
        </div>
      </header>

      <section
        className="relative flex min-h-[90vh] items-end overflow-hidden px-5 pb-10 pt-28 text-white md:pb-14"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(3,7,18,0.92) 0%, rgba(7,22,19,0.78) 48%, rgba(3,7,18,0.28) 100%), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto grid w-full max-w-7xl items-end gap-10 lg:grid-cols-[1fr_460px]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
              <BriefcaseBusiness className="h-4 w-4 text-emerald-200" />
              Private Capital Intelligence for 2026
            </div>
            <h1 className="text-5xl font-semibold leading-[0.96] tracking-tight md:text-7xl lg:text-8xl">
              FinSight DecisionOS
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-200 md:text-xl">
              A premium finance command system that converts income, EMIs, savings, and spending into elite decision guardrails.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate("/onboarding")} className="gap-2 bg-emerald-300 text-zinc-950 shadow-[0_18px_50px_rgba(110,231,183,0.22)] hover:bg-emerald-200">
                Run My Analysis <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/strategy")} className="border-white/30 bg-white/10 text-white hover:bg-white/15">
                View Strategy Suite
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
              {proofMetrics.map((metric) => (
                <div key={metric.label} className="border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-2 rounded-[2rem] border border-white/20 bg-white/12 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Live Decision Brief</p>
                <p className="mt-1 text-sm text-zinc-300">Expert presentation snapshot</p>
              </div>
              <Activity className="h-7 w-7 text-emerald-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Score", "86"],
                ["Runway", "6.4 mo"],
                ["Safe EMI", "₹18k"],
                ["Risk", "Low"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-zinc-950/35 p-4">
                  <p className="text-xs text-zinc-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-emerald-300 p-4 text-zinc-950">
              <p className="text-sm font-semibold">Next best move</p>
              <p className="mt-1 text-sm leading-5">Automate surplus after securing emergency runway.</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {decisionPillars.map((pillar) => (
                <div key={pillar.label} className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-2 py-3 text-center">
                  <pillar.icon className="h-4 w-4 text-emerald-200" />
                  <p className="mt-1 text-xs font-semibold text-zinc-200">{pillar.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Built to outclass generic finance apps</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Less pie-chart noise. More capital discipline.</h2>
            <p className="mt-5 text-sm leading-7 text-zinc-600">
              The product is designed for a live expert demo: fast onboarding, explainable math, instant visual proof, and a clear action path.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="border border-zinc-900/10 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                <service.icon className="h-7 w-7 text-emerald-700" />
                <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-5 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Demo sequence</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">A premium flow judges can understand instantly.</h2>
          </div>
          <div className="grid gap-3">
            {[
              ["01", "Capture the financial profile", "Income, fixed costs, variable spend, EMIs, savings, and household size."],
              ["02", "Compile risk boundaries", "Debt load, runway, surplus, safe EMI room, and purchase power are calculated."],
              ["03", "Run advanced modules", "Stress test, goal planner, debt payoff, budget lanes, and compounding projection."],
              ["04", "Present the decision brief", "A clean executive narrative explains what to do and why."],
            ].map(([step, title, text]) => (
              <div key={step} className="grid gap-4 border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[64px_1fr]">
                <p className="text-2xl font-semibold text-emerald-300">{step}</p>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900/10 bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="h-6 w-6 text-emerald-700" />
            <p className="font-semibold">Built for serious finance conversations, not casual budget tracking.</p>
          </div>
          <Button onClick={() => navigate("/onboarding")} className="gap-2">
            Start Analysis <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </motion.div>
  );
}
