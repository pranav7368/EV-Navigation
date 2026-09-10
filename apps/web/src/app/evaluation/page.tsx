import {
  ArrowDown,
  CheckCircle2,
  Clock3,
  FlaskConical,
  IndianRupee,
  MapPin,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Pill, SafeIcon } from "@/components/ui";

const metrics = [
  ["Detour", "2.4 km", "3.2 km", "0.8 km lower", MapPin],
  ["Charge estimate", "46 min", "35 min", "11 min longer", Clock3],
  ["Charging cost", "₹485", "₹634", "₹149 lower", IndianRupee],
  ["Total journey", "5h 17m", "5h 03m", "14 min longer", Clock3],
];
export default function EvaluationPage() {
  return (
    <AppShell
      title="Recommendation evaluation"
      eyebrow="Smart algorithm vs baseline"
    >
      <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9e5] p-5 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="size-5 text-[#39765a]" />
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#648171]">
                  Scenario 03
                </p>
              </div>
              <h2 className="mt-2 text-xl font-bold">
                Delhi → Jaipur · BALANCED · 34% SOC
              </h2>
            </div>
            <Pill tone="neutral">Deterministic demo</Pill>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[#f4f7f5] text-xs uppercase tracking-wider text-[#6f8379]">
                <tr>
                  <th className="p-4 sm:pl-6">Metric</th>
                  <th className="p-4">SmartEV</th>
                  <th className="p-4">Nearest reachable</th>
                  <th className="p-4">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4ebe7]">
                {metrics.map(([metric, smart, baseline, difference, Icon]) => (
                  <tr key={metric as string}>
                    <td className="p-4 font-semibold sm:pl-6">
                      <SafeIcon
                        icon={Icon}
                        className="mr-2 inline size-4 text-[#57806c]"
                      />
                      {metric as string}
                    </td>
                    <td className="p-4 font-bold text-[#1f6a49]">
                      {smart as string}
                    </td>
                    <td className="p-4">{baseline as string}</td>
                    <td className="p-4 text-[#6f8379]">
                      {difference as string}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="border-0 bg-[#0b1d16] p-6 text-white">
          <span className="grid size-11 place-items-center rounded-xl bg-[#b7f34a] text-[#07130f]">
            <Trophy className="size-5" />
          </span>
          <p className="mt-5 text-xs font-bold tracking-[.16em] text-[#8fa69b]">
            EVALUATION RESULT
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">
            The balanced choice saves 24% on charging.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#a5b8ae]">
            It accepts a modest 14-minute journey-time trade-off to reduce cost
            and route detour.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-white/[.06] p-3 text-sm">
            <CheckCircle2 className="size-4 text-[#b7f34a]" />
            Reserve and connector constraints satisfied
          </div>
        </Card>
      </div>
      <Card className="p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#648171]">
          Method
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            [
              "1",
              "Filter",
              "Remove incompatible, unreachable, off-corridor, and unavailable chargers.",
            ],
            [
              "2",
              "Normalize",
              "Scale time, cost, detour, and distance to a comparable 0–1 range.",
            ],
            [
              "3",
              "Weight",
              "Apply strategy weights from configuration. Lower total score is better.",
            ],
            [
              "4",
              "Explain",
              "Generate a deterministic reason against the next-ranked feasible option.",
            ],
          ].map(([step, title, text], index) => (
            <div key={step} className="relative rounded-xl bg-[#f1f5f3] p-4">
              <span className="grid size-7 place-items-center rounded-lg bg-[#173e2f] text-xs font-bold text-[#b7f34a]">
                {step}
              </span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#6c8176]">{text}</p>
              {index < 3 && (
                <ArrowDown className="absolute -bottom-4 left-1/2 z-10 size-4 text-[#8ba196] md:-right-3 md:bottom-auto md:left-auto md:top-1/2 md:-rotate-90" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
