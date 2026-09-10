import { AppShell } from "@/components/app-shell";
import { TripHistory } from "@/components/trip-history";
export default function TripsPage() {
  return (
    <AppShell title="Trip history" eyebrow="Completed calculations">
      <TripHistory />
    </AppShell>
  );
}
