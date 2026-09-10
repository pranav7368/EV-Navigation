import {
  BatteryCharging,
  Clock3,
  IndianRupee,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Pill, SafeIcon } from "@/components/ui";

const months = [
  ["Apr", 44],
  ["May", 68],
  ["Jun", 53],
  ["Jul", 82],
  ["Aug", 61],
  ["Sep", 92],
];
export default function AnalyticsPage() {
  return (
    <AppShell title="Journey analytics" eyebrow="Last 6 months · demo dataset">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [BatteryCharging, "184 kWh", "Charging energy", "+12%"],
          [IndianRupee, "₹3,860", "Charging spend", "−8%"],
          [Clock3, "6.4 h", "Charging time", "−14%"],
          [Leaf, "126 kg", "CO₂ avoided", "estimate"],
        ].map(([Icon, value, label, delta]) => (
          <Card key={String(label)} className="p-5">
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e7f6ed] text-[#327357]">
                <SafeIcon icon={Icon} className="size-5" />
              </span>
              <Pill
                tone={String(delta).startsWith("−") ? "positive" : "neutral"}
              >
                {delta as string}
              </Pill>
            </div>
            <p className="metric-number mt-5 text-3xl font-bold">
              {value as string}
            </p>
            <p className="mt-1 text-sm text-[#6f8379]">{label as string}</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#648171]">
                Monthly distance
              </p>
              <h2 className="mt-1 text-xl font-bold">
                Electric kilometres planned
              </h2>
            </div>
            <TrendingUp className="size-5 text-[#327357]" />
          </div>
          <div className="mt-8 flex h-64 items-end gap-3 border-b border-[#dce5e0]">
            {months.map(([month, value]) => (
              <div
                key={month}
                className="flex h-full flex-1 flex-col justify-end gap-2 text-center"
              >
                <div
                  className="relative mx-auto w-full max-w-12 rounded-t-lg bg-[#183e2f]"
                  style={{ height: `${value}%` }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">
                    {Number(value) * 9}
                  </span>
                </div>
                <span className="pb-2 text-xs text-[#73877d]">{month}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#648171]">
            Strategy usage
          </p>
          <h2 className="mt-1 text-xl font-bold">How you optimize</h2>
          <div className="mt-7 space-y-5">
            {[
              ["BALANCED", 58, "#39765a"],
              ["FASTEST", 29, "#b7f34a"],
              ["CHEAPEST", 13, "#76e5b1"],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <div className="mb-2 flex justify-between text-sm">
                  <strong>{label as string}</strong>
                  <span>{value as number}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e4ebe7]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, background: String(color) }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-xl bg-[#f0f5f2] p-3 text-xs leading-5 text-[#6c8176]">
            Analytics are derived from completed trip calculations, not vehicle
            telemetry.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
