import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76e5b1]",
        variant === "primary" &&
          "bg-[#b7f34a] text-[#07130f] shadow-[0_8px_30px_rgba(183,243,74,.18)] hover:bg-[#c8fb68]",
        variant === "secondary" &&
          "border border-[#d7e1db] bg-white text-[#163126] hover:bg-[#f2f7f4]",
        variant === "ghost" && "text-[#5d7268] hover:bg-[#e8efeb]",
        className,
      )}
      {...props}
    />
  );
}
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#dae4de] bg-white shadow-[0_10px_40px_rgba(20,48,37,.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-xl border border-[#cfdbd4] bg-white px-3.5 text-[15px] text-[#102119] outline-none transition placeholder:text-[#8b9f95] focus:border-[#4b8e70] focus:ring-4 focus:ring-[#76e5b1]/15",
        props.className,
      )}
    />
  );
}
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "warning" | "lime";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-[#eef3f0] text-[#52675d]",
        tone === "positive" && "bg-[#dff8eb] text-[#17633e]",
        tone === "warning" && "bg-[#fff2d3] text-[#8a5a00]",
        tone === "lime" && "bg-[#b7f34a] text-[#183021]",
      )}
    >
      {children}
    </span>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-[#e7eeea]", className)} />
  );
}

export function SafeIcon({ icon, ...props }: { icon: unknown } & LucideProps) {
  const Icon = icon as LucideIcon;
  return <Icon {...props} />;
}
