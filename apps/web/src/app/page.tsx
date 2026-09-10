import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  CircleGauge,
  GitCompareArrows,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Brand } from "@/components/app-shell";
import { SafeIcon } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07130f] text-white">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-[#bdcec5] hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-[#b7f34a] px-4 py-2.5 text-sm font-bold text-[#07130f]"
          >
            Open demo
          </Link>
        </div>
      </nav>
      <section className="map-grid relative border-y border-white/10">
        <div className="absolute left-[55%] top-0 h-full w-px bg-gradient-to-b from-transparent via-[#b7f34a]/30 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-32">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b7f34a]/25 bg-[#b7f34a]/10 px-3 py-1.5 text-xs font-bold text-[#b7f34a]">
              <Sparkles className="size-3.5" /> EXPLAINABLE EV ROUTING
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">
              Plan farther.
              <br />
              <span className="text-[#b7f34a]">Charge smarter.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#a8bbb1] sm:text-lg">
              A reserve-aware journey planner that finds compatible chargers,
              proves they are reachable, and explains why one stop is better for
              your time, budget, or both.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/planner"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#b7f34a] px-5 font-bold text-[#07130f] transition hover:bg-[#cbff6c]"
              >
                Plan a journey <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/evaluation"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[.05] px-5 font-semibold text-white hover:bg-white/10"
              >
                <GitCompareArrows className="size-4" /> View evaluation
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#81998d]">
              {[
                "10% reserve protected",
                "Compatible chargers only",
                "Deterministic scoring",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#76e5b1]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[#76e5b1]/10 blur-3xl" />
            <div className="relative rotate-1 rounded-[28px] border border-white/12 bg-[#10271e] p-4 shadow-2xl sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[.15em] text-[#799186]">
                    RECOMMENDED STOP
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    Manesar HyperCharge Hub
                  </h2>
                </div>
                <span className="rounded-full bg-[#b7f34a] px-3 py-1 text-xs font-bold text-[#07130f]">
                  BEST MATCH
                </span>
              </div>
              <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1812]">
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 600 260"
                  aria-hidden="true"
                >
                  <path
                    d="M20 218 C110 220, 112 143, 210 155 S340 62, 428 91 S515 30, 585 28"
                    fill="none"
                    stroke="#224737"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 218 C110 220, 112 143, 210 155 S340 62, 428 91 S515 30, 585 28"
                    fill="none"
                    stroke="#b7f34a"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="8 10"
                  />
                  <circle
                    cx="210"
                    cy="155"
                    r="14"
                    fill="#b7f34a"
                    stroke="#07130f"
                    strokeWidth="6"
                  />
                  <circle cx="20" cy="218" r="8" fill="#76e5b1" />
                  <circle cx="585" cy="28" r="8" fill="white" />
                </svg>
                <div className="absolute bottom-3 left-3 rounded-lg bg-[#07130f]/90 px-3 py-2 text-xs">
                  <span className="text-[#82988d]">Arrival</span>{" "}
                  <strong className="ml-2">15% SOC</strong>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  [Zap, "120 kW", "DC power"],
                  [BatteryCharging, "35 min", "Charge est."],
                  [Route, "3.2 km", "Detour"],
                ].map(([Icon, value, label]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl border border-white/10 bg-white/[.04] p-3"
                  >
                    <SafeIcon icon={Icon} className="size-4 text-[#b7f34a]" />
                    <p className="metric-number mt-3 text-lg font-bold">
                      {value as string}
                    </p>
                    <p className="text-[11px] text-[#7f978b]">
                      {label as string}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-[#b7f34a]/10 p-3 text-xs leading-5 text-[#c5d9cf]">
                <strong className="text-[#b7f34a]">Why this stop?</strong> It
                cuts 24 minutes versus the nearest compatible alternative while
                protecting your arrival reserve.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {[
          [
            MapPinned,
            "Route-aware",
            "Stations are measured against the actual route corridor.",
          ],
          [
            ShieldCheck,
            "Reserve-safe",
            "Every arrival must retain the configured minimum SOC.",
          ],
          [
            CircleGauge,
            "Strategy-led",
            "Choose fastest, cheapest, or a balanced recommendation.",
          ],
          [
            GitCompareArrows,
            "Evaluated",
            "Compare the smart result against a nearest-station baseline.",
          ],
        ].map(([Icon, title, text]) => (
          <div key={String(title)} className="border-l border-white/10 pl-5">
            <SafeIcon icon={Icon} className="size-5 text-[#b7f34a]" />
            <h3 className="mt-4 font-bold">{title as string}</h3>
            <p className="mt-2 text-sm leading-6 text-[#849a8f]">
              {text as string}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
