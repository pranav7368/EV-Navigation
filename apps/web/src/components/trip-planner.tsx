"use client";

import dynamic from "next/dynamic";
import {
  ArrowRight,
  BatteryMedium,
  CircleAlert,
  LocateFixed,
  Route,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { EVSpecification, Preference } from "@smartev/shared";
import { apiRequest } from "@/lib/api";
import { demoEvs, makeDemoPlan, type DemoPlan } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { Button, Card, Input, Skeleton } from "./ui";
import { TripResults } from "./trip-results";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-full rounded-none" />,
});
type EV = EVSpecification & { id: string };

export function TripPlanner({ compact = false }: { compact?: boolean }) {
  const [evs, setEvs] = useState<EV[]>(demoEvs);
  const [evId, setEvId] = useState(demoEvs[0]!.id);
  const [source, setSource] = useState("New Delhi Railway Station");
  const [destination, setDestination] = useState("Jaipur, Rajasthan");
  const [soc, setSoc] = useState(34);
  const [preference, setPreference] = useState<Preference>("BALANCED");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [plan, setPlan] = useState<DemoPlan | null>(null);
  useEffect(() => {
    setHydrated(true);
    apiRequest<EV[]>("/ev-models")
      .then((models) => {
        if (models.length) {
          setEvs(models);
          setEvId(models[0]!.id);
        }
      })
      .catch(() => undefined);
  }, []);
  const selectedEv = useMemo(
    () => evs.find((ev) => ev.id === evId) ?? evs[0]!,
    [evId, evs],
  );
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setPlan(null);
    try {
      const token = localStorage.getItem("smartev_token");
      let result: DemoPlan;
      if (token && !evId.startsWith("demo-"))
        result = await apiRequest<DemoPlan>("/trips/plan", {
          method: "POST",
          body: JSON.stringify({
            evModelId: evId,
            source,
            destination,
            startingSoc: soc,
            preference,
          }),
        });
      else {
        await new Promise((resolve) => setTimeout(resolve, 850));
        result = makeDemoPlan(preference, soc, source, destination, selectedEv);
        toast.info("Using the deterministic demo provider", {
          description:
            "Sign in with the seeded account and run PostgreSQL for persisted API plans.",
        });
      }
      setPlan(result);
      localStorage.setItem("smartev_last_plan", JSON.stringify(result));
      document
        .getElementById("planner-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      const fallback = makeDemoPlan(
        preference,
        soc,
        source,
        destination,
        selectedEv,
      );
      setPlan(fallback);
      toast.warning(
        "The live API was unavailable, so the resilient demo provider completed the plan.",
        { description: error instanceof Error ? error.message : undefined },
      );
    } finally {
      setLoading(false);
    }
  }
  const preview = makeDemoPlan(
    preference,
    soc,
    source,
    destination,
    selectedEv,
  );
  return (
    <div className="space-y-5">
      <div className={cn("grid gap-5", !compact && "xl:grid-cols-[430px_1fr]")}>
        <Card className="overflow-hidden">
          <div className="border-b border-[#e0e8e3] bg-[#fbfcfb] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-[#0e2a1f] text-[#b7f34a]">
                <Route className="size-4" />
              </span>
              <div>
                <h2 className="font-bold tracking-[-.02em]">Journey inputs</h2>
                <p className="text-xs text-[#72867c]">
                  Reserve protected at 10%
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-5 p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Your EV</span>
              <select
                value={evId}
                onChange={(e) => setEvId(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#cfdbd4] bg-white px-3.5 text-[15px] outline-none focus:border-[#4b8e70]"
              >
                {evs.map((ev) => (
                  <option value={ev.id} key={ev.id}>
                    {ev.manufacturer} {ev.model} · {ev.variant}
                  </option>
                ))}
              </select>
              <span className="mt-2 flex items-center gap-1.5 text-xs text-[#71857b]">
                <BatteryMedium className="size-3.5" />
                {selectedEv.batteryCapacityKwh} kWh · {selectedEv.ratedRangeKm}{" "}
                km rated
              </span>
            </label>
            <div className="relative space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">From</span>
                <div className="relative">
                  <LocateFixed className="absolute left-3.5 top-3.5 size-4 text-[#557669]" />
                  <Input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </label>
              <div className="absolute left-[19px] top-[67px] h-4 border-l border-dashed border-[#91a79c]" />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">To</span>
                <div className="relative">
                  <span className="absolute left-[15px] top-[17px] size-3 rounded-full border-[3px] border-[#327357]" />
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </label>
            </div>
            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Current battery</span>
                <span className="metric-number rounded-lg bg-[#e7f8ee] px-2.5 py-1 text-sm font-bold text-[#17633e]">
                  {soc}%
                </span>
              </div>
              <input
                aria-label="Current battery state of charge"
                type="range"
                min="10"
                max="100"
                value={soc}
                onChange={(e) => setSoc(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[#247552]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-[#899a92]">
                <span>10%</span>
                <span>100%</span>
              </div>
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">
                Optimize for
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {(["FASTEST", "CHEAPEST", "BALANCED"] as Preference[]).map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setPreference(item)}
                      className={cn(
                        "min-h-11 rounded-xl border px-2 text-[11px] font-bold tracking-wide transition sm:text-xs",
                        preference === item
                          ? "border-[#173f2f] bg-[#173f2f] text-white"
                          : "border-[#d4dfd9] bg-white text-[#5b7066] hover:border-[#7ca08f]",
                      )}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </fieldset>
          <Button className="w-full" disabled={loading || !hydrated}>
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-[#0b2118]/25 border-t-[#0b2118]" />
                  Calculating route…
                </>
              ) : (
                <>
                  Plan my trip <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <div className="flex items-start gap-2 rounded-xl bg-[#f2f6f4] p-3 text-xs leading-5 text-[#63786d]">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              Live provider failures automatically fall back to deterministic
              demo data.
            </div>
          </form>
        </Card>
        {!compact && (
          <Card className="relative min-h-[480px] overflow-hidden">
            <MapView
              route={(plan ?? preview).route.coordinates}
              stations={(plan ?? preview).candidateStations}
              recommendedId={(plan ?? preview).recommendedStation?.id}
            />
            <div className="absolute left-4 top-4 z-[500] rounded-xl border border-white/30 bg-[#07130f]/90 p-3 text-white shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b7f34a]">
                <Zap className="size-4" fill="currentColor" /> ROUTE PREVIEW
              </div>
              <p className="mt-1 text-xs text-[#b3c6bc]">
                Delhi NCR → Rajasthan corridor
              </p>
            </div>
            <div className="absolute bottom-4 right-4 z-[500] rounded-xl bg-white p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#39765a]" />
                <span className="text-xs font-bold">Explainable scoring</span>
              </div>
              <p className="mt-1 text-[11px] text-[#70847a]">
                Time · cost · detour · distance
              </p>
            </div>
          </Card>
        )}
      </div>
      {loading && (
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </Card>
      )}
      <div id="planner-result" className="scroll-mt-24">
        {plan && <TripResults plan={plan} />}
      </div>
    </div>
  );
}
