import { BatteryCharging, Car, Gauge, Plus, PlugZap, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, Pill, SafeIcon } from "@/components/ui";

export default function VehiclesPage() {
  return (
    <AppShell title="My vehicles" eyebrow="Garage">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="max-w-xl text-sm leading-6 text-[#6d8177]">
            Saved vehicles make planning faster and apply the correct battery,
            efficiency, connector, and charging limits.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add vehicle
        </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between bg-[#0b1d16] p-5 text-white">
            <div>
              <Pill tone="lime">PRIMARY EV</Pill>
              <h2 className="mt-3 text-2xl font-bold tracking-[-.04em]">
                My Nexon
              </h2>
              <p className="mt-1 text-sm text-[#a7bbb1]">
                Tata Nexon EV · Empowered LR
              </p>
            </div>
            <Car className="size-12 text-[#b7f34a]" />
          </div>
          <div className="grid grid-cols-2 gap-px bg-[#e1e8e4] sm:grid-cols-4">
            {[
              [BatteryCharging, "40.5 kWh", "Battery"],
              [Gauge, "465 km", "Rated range"],
              [Zap, "50 kW", "Max DC"],
              [PlugZap, "CCS2", "Connector"],
            ].map(([Icon, value, label]) => (
              <div key={String(label)} className="bg-white p-4">
                <SafeIcon icon={Icon} className="size-4 text-[#39765a]" />
                <p className="metric-number mt-3 font-bold">
                  {value as string}
                </p>
                <p className="text-xs text-[#75887f]">{label as string}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-4 text-sm">
            <span className="text-[#75887f]">Registration</span>
            <strong>DL01EV2026</strong>
          </div>
        </Card>
        <button className="grid min-h-64 place-items-center rounded-2xl border-2 border-dashed border-[#cbd9d2] bg-white/50 text-center transition hover:border-[#7ba28f] hover:bg-white">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e8f2ed] text-[#39765a]">
              <Plus />
            </span>
            <p className="mt-3 font-bold">Add another EV</p>
            <p className="mt-1 text-sm text-[#75887f]">
              Choose from 12 seeded models
            </p>
          </div>
        </button>
      </div>
    </AppShell>
  );
}
