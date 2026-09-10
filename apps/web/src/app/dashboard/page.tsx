import { BatteryCharging, Clock3, IndianRupee, Route } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TripPlanner } from "@/components/trip-planner";
import { SafeIcon } from "@/components/ui";

export default function DashboardPage() {
  return (
    <AppShell title="Good afternoon, Pranav" eyebrow="Thursday · Delhi NCR">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [Route, "12", "Trips planned", "+3 this month"],
          [BatteryCharging, "184 kWh", "Energy planned", "Across 8 stops"],
          [IndianRupee, "₹1,420", "Cost avoided", "vs nearest baseline"],
          [Clock3, "2h 18m", "Time saved", "Strategy optimized"],
        ].map(([Icon, value, label, meta]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-[#dbe5df] bg-white p-4 shadow-[0_8px_30px_rgba(20,48,37,.04)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-number text-2xl font-bold tracking-[-.04em]">
                  {value as string}
                </p>
                <p className="mt-1 text-sm font-medium text-[#64796e]">
                  {label as string}
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-[#e7f6ed] text-[#327357]">
                <SafeIcon icon={Icon} className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#8a9b93]">
              {meta as string}
            </p>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[.17em] text-[#648171]">
          Quick planner
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">
          Where are you driving?
        </h2>
      </div>
      <TripPlanner />
    </AppShell>
  );
}
