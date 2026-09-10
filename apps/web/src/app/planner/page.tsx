import { AppShell } from "@/components/app-shell";
import { TripPlanner } from "@/components/trip-planner";
export default function PlannerPage() {
  return (
    <AppShell title="Trip planner" eyebrow="Route · energy · recommendation">
      <TripPlanner />
    </AppShell>
  );
}
