import { AppShell } from "@/components/app-shell";
import { SavedTripResult } from "@/components/saved-trip-result";
export default function TripResultsPage() {
  return (
    <AppShell title="Trip result" eyebrow="Recommendation detail">
      <SavedTripResult />
    </AppShell>
  );
}
