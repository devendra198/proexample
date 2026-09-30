import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\+/g, " plus ")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatUrl(url: string | null | undefined): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = "https://" + trimmed;
  }
  return trimmed;
}

export function getTechBadgeColor(techName: string): { bg: string; text: string; border: string } {
  const lower = techName.toLowerCase();
  if (lower.includes("wordpress")) {
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
  }
  if (lower.includes("wix")) {
    return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
  }
  if (lower.includes("shopify")) {
    return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  }
  if (lower.includes("react native") || lower.includes("expo")) {
    return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
  }
  if (lower.includes("react") || lower.includes("vite") || lower.includes("next")) {
    return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
  }
  if (lower.includes("laravel") || lower.includes("php")) {
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
  }
  if (lower.includes("node") || lower.includes("mern")) {
    return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
  }
  if (lower.includes("capacitor") || lower.includes("flutter")) {
    return { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" };
  }
  return { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" };
}
