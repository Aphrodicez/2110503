import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value?: number | string | null, currency = "THB") {
  const numericValue =
    typeof value === "string"
      ? Number(value)
      : typeof value === "number"
      ? value
      : undefined;

  if (typeof numericValue !== "number" || Number.isNaN(numericValue)) {
    return undefined;
  }

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}
