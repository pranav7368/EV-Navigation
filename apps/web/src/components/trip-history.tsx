"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Route } from "lucide-react";
import { useEffect, useState } from "react";
import type { DemoPlan } from "@/lib/demo-data";
import { Card, Pill } from "./ui";
import { formatCurrency, formatMinutes } from "@/lib/utils";

export function TripHistory() {
  const [last, setLast] = useState<DemoPlan | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem("smartev_last_plan");
    if (raw) setLast(JSON.parse(raw) as DemoPlan);
  }, []);
  const rows = last ? [last] : [];
  return (
    <>
      {rows.length === 0 ? (
        <Card className="grid min-h-80 place-items-center p-8 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e7f4ed] text-[#39765a]">
              <Route />
            </span>
            <h2 className="mt-4 text-xl font-bold">No completed trips yet</h2>
            <p className="mt-2 text-sm text-[#71857b]">
              Your next completed calculation will be saved here.
            </p>
            <Link
              href="/planner"
              className="mt-5 inline-flex items-center gap-2 font-bold text-[#286f50]"
            >
              Plan a trip <ArrowRight className="size-4" />
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((trip) => (
            <Card key={trip.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone="positive">COMPLETED</Pill>
                    <span className="text-xs text-[#7b8e85]">{trip.id}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold tracking-[-.03em]">
                    {trip.tripSummary.source}{" "}
                    <ArrowRight className="mx-1 inline size-4" />{" "}
                    {trip.tripSummary.destination}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#70847a]">
                    <CalendarDays className="size-4" />
                    Today · {trip.vehicle.manufacturer} {trip.vehicle.model}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-5 text-right text-sm">
                  <div>
                    <strong>{trip.route.distanceKm.toFixed(0)} km</strong>
                    <p className="text-xs text-[#7b8e85]">Distance</p>
                  </div>
                  <div>
                    <strong>
                      {formatMinutes(trip.tripSummary.estimatedTotalMinutes)}
                    </strong>
                    <p className="text-xs text-[#7b8e85]">Total time</p>
                  </div>
                  <div>
                    <strong>{formatCurrency(trip.estimatedCost)}</strong>
                    <p className="text-xs text-[#7b8e85]">Charge</p>
                  </div>
                </div>
              </div>
              {trip.recommendedStation && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f0f6f2] p-3 text-sm">
                  <MapPin className="size-4 text-[#39765a]" />
                  <strong>{trip.recommendedStation.name}</strong>
                  <span className="text-[#73877d]">
                    · {trip.tripSummary.preference} strategy
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
