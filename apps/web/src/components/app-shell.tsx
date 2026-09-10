"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BatteryCharging,
  Car,
  ChartNoAxesCombined,
  Gauge,
  History,
  MapPinned,
  Menu,
  Route,
  Settings2,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/planner", label: "Plan a trip", icon: Route },
  { href: "/vehicles", label: "My vehicles", icon: Car },
  { href: "/stations", label: "Station explorer", icon: MapPinned },
  { href: "/trips", label: "Trip history", icon: History },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/evaluation", label: "Evaluation", icon: Activity },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Brand({ dark = true }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 font-bold tracking-[-.03em]",
        dark ? "text-white" : "text-[#0a1c15]",
      )}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-[#b7f34a] text-[#07130f]">
        <Zap className="size-5" fill="currentColor" />
      </span>
      <span>
        SmartEV <span className="font-medium opacity-65">Navigator</span>
      </span>
    </Link>
  );
}

export function AppShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const sidebar = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Brand />
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden"
          aria-label="Close navigation"
        >
          <X />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const active =
            path === item.href ||
            (item.href === "/planner" && path === "/trip-results");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                active
                  ? "bg-[#b7f34a] text-[#07130f]"
                  : "text-[#b8c9c0] hover:bg-white/6 hover:text-white",
              )}
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-2xl border border-white/10 bg-white/[.04] p-3.5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#b7f34a]">
          <BatteryCharging className="size-4" /> DEMO READY
        </div>
        <p className="text-xs leading-5 text-[#94a99f]">
          Delhi–Jaipur corridor
          <br />
          32 seeded charging hubs
        </p>
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-[#27513f] text-sm font-semibold text-[#b7f34a]">
            PD
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Pranav Driver
            </div>
            <div className="text-xs text-[#80968b]">Demo account</div>
          </div>
          <Settings2 className="ml-auto size-4 text-[#80968b]" />
        </div>
      </div>
    </>
  );
  return (
    <div className="min-h-screen bg-[#f4f7f3] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-[#07130f] lg:flex">
        {sidebar}
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-[1000] bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="flex h-full w-[280px] flex-col bg-[#07130f]"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebar}
          </aside>
        </div>
      )}
      <main className="min-w-0">
        <header className="sticky top-0 z-[900] flex h-20 items-center border-b border-[#dce5e0] bg-[#f4f7f3]/90 px-4 backdrop-blur-xl sm:px-7">
          <button
            onClick={() => setOpen(true)}
            className="mr-3 grid size-10 place-items-center rounded-xl border border-[#d5e0da] lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#719083]">
              {eyebrow ?? "SmartEV workspace"}
            </p>
            <h1 className="text-xl font-bold tracking-[-.03em] text-[#0a1c15] sm:text-2xl">
              {title}
            </h1>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-[#d6e2dc] bg-white px-3 py-2 text-xs font-semibold text-[#39765a] sm:flex">
            <span className="size-2 rounded-full bg-[#33c778]" />
            API + demo fallback
          </div>
        </header>
        <div className="p-4 sm:p-7">{children}</div>
      </main>
    </div>
  );
}
