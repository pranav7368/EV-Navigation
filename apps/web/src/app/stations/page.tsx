"use client";
import dynamic from "next/dynamic";
import { Filter, MapPin, Search, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Input, Pill } from "@/components/ui";
import { makeDemoPlan } from "@/lib/demo-data";
const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });
export default function StationsPage() {
  const plan = makeDemoPlan("BALANCED", 34, "Delhi", "Jaipur");
  return (
    <AppShell title="Station explorer" eyebrow="32 demo hubs · Delhi–Jaipur">
      <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-[#e0e8e3] p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 size-4 text-[#70857b]" />
              <Input
                placeholder="Search station or operator"
                className="pl-10 pr-10"
              />
              <Filter className="absolute right-3.5 top-3.5 size-4 text-[#70857b]" />
            </div>
          </div>
          <div className="scrollbar-none max-h-[650px] divide-y divide-[#e5ebe8] overflow-y-auto">
            {plan.candidateStations.map((station, index) => (
              <div key={station.id} className="p-4 hover:bg-[#f7faf8]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{station.name}</h3>
                      {index === 0 && <Pill tone="lime">Top match</Pill>}
                    </div>
                    <p className="mt-1 text-xs text-[#72867c]">
                      {station.operator} · NH48 corridor
                    </p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7f6ed] text-[#327357]">
                    <Zap className="size-4" />
                  </span>
                </div>
                <div className="mt-4 flex gap-5 text-xs">
                  <span>
                    <strong>{station.charger.powerKw} kW</strong>
                    <br />
                    <span className="text-[#7b8e85]">CCS2 DC</span>
                  </span>
                  <span>
                    <strong>₹{station.charger.pricePerKwh}/kWh</strong>
                    <br />
                    <span className="text-[#7b8e85]">Demo tariff</span>
                  </span>
                  <span>
                    <strong>{station.detourKm.toFixed(1)} km</strong>
                    <br />
                    <span className="text-[#7b8e85]">Route detour</span>
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#99700c]">
                  <MapPin className="size-3" />
                  Availability is simulated demo data
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="min-h-[620px] overflow-hidden">
          <MapView
            route={plan.route.coordinates}
            stations={plan.candidateStations}
            recommendedId={plan.recommendedStation?.id}
          />
        </Card>
      </div>
    </AppShell>
  );
}
