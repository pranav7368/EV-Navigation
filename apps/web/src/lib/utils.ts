import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
export const formatMinutes = (minutes: number): string =>
  `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
