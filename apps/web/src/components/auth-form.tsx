"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { Brand } from "./app-shell";
import { Button, Input } from "./ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("Demo Driver");
  const [email, setEmail] = useState("demo@smartev.local");
  const [password, setPassword] = useState("Demo@1234");
  useEffect(() => setHydrated(true), []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await apiRequest<{
        accessToken: string;
        user: { name: string };
      }>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({
          ...(mode === "register" ? { name } : {}),
          email,
          password,
        }),
      });
      localStorage.setItem("smartev_token", result.accessToken);
      toast.success(`Welcome, ${result.user.name}`);
      router.push("/dashboard");
    } catch (error) {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        localStorage.setItem("smartev_token", "demo-offline-token");
        toast.info("Demo session started", {
          description:
            "The database API is offline; planning will use deterministic fallback data.",
        });
        router.push("/dashboard");
      } else
        toast.error(
          error instanceof Error ? error.message : "Authentication failed",
        );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid min-h-screen bg-[#07130f] lg:grid-cols-[1fr_1.05fr]">
      <section className="hidden map-grid flex-col justify-between p-10 lg:flex">
        <Brand />
        <div className="max-w-lg">
          <p className="text-xs font-bold tracking-[.18em] text-[#b7f34a]">
            ACADEMIC FULL-STACK PROJECT
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-[-.055em] text-white">
            Every charging decision, calculated and explained.
          </h1>
          <p className="mt-6 text-base leading-7 text-[#9db1a7]">
            SmartEV combines road geometry, battery physics, charger
            compatibility, and transparent weighted scoring.
          </p>
        </div>
        <p className="text-xs text-[#647c70]">
          SmartEV Navigator · Delhi NCR demonstration corridor
        </p>
      </section>
      <section className="flex items-center justify-center bg-[#f4f7f3] p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand dark={false} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#62806f]">
            {mode === "login" ? "Welcome back" : "Create account"}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-.045em]">
            {mode === "login"
              ? "Sign in to your garage"
              : "Start planning smarter"}
          </h2>
          <p className="mt-2 text-sm text-[#6d8177]">
            {mode === "login"
              ? "The seeded demo credentials are ready below."
              : "Your password is securely hashed before storage."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Name</span>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-3.5 size-4 text-[#698074]" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 size-4 text-[#698074]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-3.5 size-4 text-[#698074]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
            </label>
          <Button className="mt-2 w-full" disabled={loading || !hydrated}>
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[#71857b]">
            {mode === "login" ? "New to SmartEV?" : "Already have an account?"}{" "}
            <Link
              className="font-bold text-[#236b4c] hover:underline"
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </Link>
          </p>
          <div className="mt-8 rounded-xl border border-[#d7e2dc] bg-white p-3 text-xs leading-5 text-[#64786e]">
            <strong>Demo:</strong> demo@smartev.local · Demo@1234
          </div>
        </div>
      </section>
    </main>
  );
}
