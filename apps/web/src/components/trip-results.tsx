"use client";

import dynamic from "next/dynamic";
import {
  BatteryCharging,
  Check,
  Clock3,
  Gauge,
  IndianRupee,
  MapPin,
  PlugZap,
  Route,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react";
import type { DemoPlan } from "@/lib/demo-data";
import { formatCurrency, formatMinutes } from "@/lib/utils";
import { Card, Pill, SafeIcon } from "./ui";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse bg-[#dfe9e3]" />,
});
const n = (value: number, digits = 0) => value.toFixed(digits);

export function TripResults({ plan }: { plan: DemoPlan }) {
  const station = plan.recommendedStation;
  return (
    <div className="animate-enter space-y-5" data-testid="trip-results">
      <Card className="overflow-hidden border-0 bg-[#0b1c15] text-white">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Pill tone="lime">PLAN COMPLETE</Pill>
              {plan.route.isFallback && (
                <Pill tone="warning">Demo route fallback</Pill>
              )}
              <span className="text-xs text-[#93aa9f]">
                ID {plan.id.slice(-8).toUpperCase()}
              </span>
            </div>
            <h2 className="max-w-xl text-2xl font-bold tracking-[-.04em] sm:text-3xl">
              {plan.directJourneyPossible
                ? "You can arrive without charging."
                : `${station?.name} is your best charging stop.`}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#b4c5bc]">
              {plan.recommendationExplanation}
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Distance", `${n(plan.route.distanceKm, 1)} km`, Route],
                [
                  "Drive time",
                  formatMinutes(plan.route.durationMinutes),
                  Clock3,
                ],
                ["Final SOC", `${n(plan.estimatedFinalSoc)}%`, Gauge],
                [
                  "Total time",
                  formatMinutes(plan.tripSummary.estimatedTotalMinutes),
                  TimerReset,
                ],
              ].map(([label, value, Icon]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-white/10 bg-white/[.05] p-3"
                >
                  <SafeIcon
                    icon={Icon}
                    className="mb-3 size-4 text-[#b7f34a]"
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#82998e]">
                    {label as string}
                  </p>
                  <p className="metric-number mt-1 text-lg font-bold">
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[320px] border-t border-white/10 lg:border-l lg:border-t-0">
            <MapView
              route={plan.route.coordinates}
              stations={plan.candidateStations}
              recommendedId={station?.id}
            />
            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg bg-[#07130f]/90 px-3 py-2 text-[11px] text-white backdrop-blur">
              <span className="mr-1.5 inline-block size-2 rounded-full bg-[#b7f34a]" />
              Recommended stop
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_.9fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#638071]">
                Battery journey
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-[-.03em]">
                Reserve-aware SOC plan
              </h3>
            </div>
            <ShieldCheck className="size-6 text-[#347e5d]" />
          </div>
          <div className="mt-7 flex items-center">
            <div className="size-3 rounded-full bg-[#0c6744]" />
            <div className="h-1 flex-1 bg-[#76e5b1]" />
            <div className="size-3 rounded-full bg-[#b7f34a] ring-4 ring-[#e9f9c9]" />
            <div className="h-1 flex-1 bg-[#d7e3dc]" />
            <div className="size-3 rounded-full bg-[#102119]" />
          </div>
          <div className="mt-3 grid grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-[#73877d]">Start</p>
              <p className="font-bold">
                {n(plan.batteryAnalysis.startingSoc)}% SOC
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#73877d]">
                {station ? "Charge stop" : "No stop"}
              </p>
              <p className="font-bold">
                {station
                  ? `${n(station.arrivalSoc)}% → ${n(station.targetSoc)}%`
                  : "Direct"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#73877d]">Destination</p>
              <p className="font-bold">{n(plan.estimatedFinalSoc)}% SOC</p>
            </div>
          </div>
          {station && (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [
                  BatteryCharging,
                  "Energy",
                  `${n(station.energyRequiredKwh, 1)} kWh`,
                ],
                [
                  PlugZap,
                  "Charger",
                  `${station.charger.powerKw} kW ${station.charger.currentType}`,
                ],
                [
                  Clock3,
                  "Charge estimate",
                  `${n(station.chargingMinutes)} min`,
                ],
                [
                  IndianRupee,
                  "Est. cost",
                  formatCurrency(station.chargingCost),
                ],
              ].map(([Icon, label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-xl bg-[#f0f5f2] p-3"
                >
                  <SafeIcon icon={Icon} className="size-4 text-[#39765a]" />
                  <p className="mt-3 text-xs text-[#72867c]">
                    {label as string}
                  </p>
                  <p className="mt-1 font-bold">{value as string}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-[#6f8379]">
            Charging time is an estimate using effective charger power and 90%
            efficiency. Real charging curves taper near high SOC.
          </p>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#638071]">
            Vehicle analysis
          </p>
          <h3 className="mt-1 text-xl font-bold tracking-[-.03em]">
            {plan.vehicle.manufacturer} {plan.vehicle.model}
          </h3>
          <div className="mt-5 space-y-4">
            {[
              [
                "Usable energy",
                `${n(plan.batteryAnalysis.usableEnergyKwh, 1)} kWh`,
              ],
              [
                "Estimated range now",
                `${n(plan.batteryAnalysis.estimatedRangeKm)} km`,
              ],
              [
                "Journey energy",
                `${n(plan.batteryAnalysis.energyNeededKwh, 1)} kWh`,
              ],
              [
                "Protected reserve",
                `${plan.batteryAnalysis.minimumReserveSoc}%`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-end justify-between border-b border-[#e2e9e5] pb-3"
              >
                <span className="text-sm text-[#6d8177]">{label}</span>
                <span className="metric-number font-bold">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#e7f8ee] p-3.5 text-sm text-[#23583f]">
            <Check className="mt-0.5 size-4 shrink-0" />
            <span>
              Arrival remains above the configured{" "}
              {plan.batteryAnalysis.minimumReserveSoc}% safety reserve.
            </span>
          </div>
        </Card>
      </div>

      {station && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e1e8e4] p-5 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#638071]">
                Ranked alternatives
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-[-.03em]">
                Compatible & reachable only
              </h3>
            </div>
            <Sparkles className="size-5 text-[#39765a]" />
          </div>
          <div className="divide-y divide-[#e5ebe8]">
            {plan.candidateStations.map((candidate, index) => (
              <div
                key={candidate.id}
                className="grid gap-3 p-4 sm:grid-cols-[42px_1.4fr_repeat(4,.7fr)] sm:items-center sm:px-6"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-[#edf3ef] text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{candidate.name}</p>
                    {index === 0 && <Pill tone="lime">Recommended</Pill>}
                  </div>
                  <p className="mt-1 text-xs text-[#71857b]">
                    {candidate.operator} · {candidate.demoAvailability}
                  </p>
                </div>
                {[
                  [Zap, `${candidate.charger.powerKw} kW`, "DC power"],
                  [
                    Clock3,
                    `${n(candidate.chargingMinutes)} min`,
                    "Charge est.",
                  ],
                  [
                    IndianRupee,
                    formatCurrency(candidate.chargingCost),
                    "Charge cost",
                  ],
                  [MapPin, `${n(candidate.detourKm, 1)} km`, "Detour"],
                ].map(([Icon, value, label]) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-2 sm:block"
                  >
                    <SafeIcon
                      icon={Icon}
                      className="size-4 text-[#5c806e] sm:mb-1"
                    />
                    <div>
                      <p className="text-sm font-bold">{value as string}</p>
                      <p className="text-[11px] text-[#7b8e85]">
                        {label as string}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
