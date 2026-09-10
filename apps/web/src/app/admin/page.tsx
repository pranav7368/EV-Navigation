import { AlertTriangle, Database, Plus, ShieldCheck, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, Pill } from "@/components/ui";

const chargers = [
  ["Manesar HyperCharge Hub", "CCS2 DC", "120 kW", "₹24/kWh", "Operational"],
  ["Neemrana ValueCharge Plaza", "CCS2 DC", "30 kW", "₹11/kWh", "Operational"],
  ["Kotputli EZ Charge", "CCS2 DC", "60 kW", "₹18/kWh", "Operational"],
  ["NH48 EV Hub 21", "Type 2 AC", "7.2 kW", "₹14/kWh", "Out of service"],
];
export default function AdminPage() {
  return (
    <AppShell title="Administration" eyebrow="Role-protected inventory">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3 rounded-xl border border-[#d7e4dc] bg-[#eaf7ef] p-3 text-sm text-[#2d684b]">
          <ShieldCheck className="size-5" />
          <div>
            <strong>Administrator access</strong>
            <p className="text-xs">Tariffs and status changes are auditable.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Database className="size-4" />
            Import stations
          </Button>
          <Button>
            <Plus className="size-4" />
            Add charger
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e2e9e5] p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#648171]">
              Charger inventory
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Tariffs & operational status
            </h2>
          </div>
          <Pill tone="warning">DEMO STATUS</Pill>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f3f6f4] text-xs uppercase tracking-wider text-[#70847a]">
              <tr>
                {["Station", "Connector", "Power", "Tariff", "Status", ""].map(
                  (heading) => (
                    <th key={heading} className="p-4 first:pl-6">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3eae6]">
              {chargers.map((row) => (
                <tr key={row[0]} className="hover:bg-[#fafcfb]">
                  <td className="p-4 pl-6 font-bold">{row[0]}</td>
                  <td className="p-4">{row[1]}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5">
                      <Zap className="size-4 text-[#4b8067]" />
                      {row[2]}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{row[3]}</td>
                  <td className="p-4">
                    <Pill
                      tone={row[4] === "Operational" ? "positive" : "warning"}
                    >
                      {row[4]}
                    </Pill>
                  </td>
                  <td className="p-4 text-right font-bold text-[#2b6c4d]">
                    Edit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f0ddb0] bg-[#fff8e8] p-4 text-sm text-[#75551b]">
        <AlertTriangle className="size-5 shrink-0" />
        <p>
          <strong>No fake real-time claims.</strong> Seeded operational statuses
          are clearly marked as simulated. A production deployment should
          connect a provider that supplies timestamped availability.
        </p>
      </div>
    </AppShell>
  );
}
