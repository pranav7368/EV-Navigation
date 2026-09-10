"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DemoPlan } from "@/lib/demo-data";
import { TripResults } from "./trip-results";
import { Card } from "./ui";
export function SavedTripResult() {
  const [plan, setPlan] = useState<DemoPlan | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem("smartev_last_plan");
    if (raw) setPlan(JSON.parse(raw) as DemoPlan);
  }, []);
  return plan ? (
    <TripResults plan={plan} />
  ) : (
    <Card className="p-8 text-center">
      <h2 className="text-xl font-bold">No result selected</h2>
      <p className="mt-2 text-sm text-[#71857b]">
        Complete a trip calculation to see its full recommendation.
      </p>
      <Link
        href="/planner"
        className="mt-4 inline-block font-bold text-[#286f50]"
      >
        Open planner →
      </Link>
    </Card>
  );
}
