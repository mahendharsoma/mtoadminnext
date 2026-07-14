import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateDdMmYyyy(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const value = typeof date === "string" ? date.split("T")[0] : date.toISOString().split("T")[0];
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "—";
  return `${day}-${month}-${year}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCurrentDateTimeForDb(): string {
  const now = new Date();
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${ist.getFullYear()}-${pad(ist.getMonth() + 1)}-${pad(ist.getDate())} ${pad(ist.getHours())}:${pad(ist.getMinutes())}:${pad(ist.getSeconds())}`;
}

export function encodeId(id: number | string): string {
  const data = JSON.stringify({ id });
  const compressed = Buffer.from(data).toString("base64url");
  return compressed;
}

export function decodeId(encoded: string): number | null {
  try {
    const data = Buffer.from(encoded, "base64url").toString("utf-8");
    const parsed = JSON.parse(data) as { id: number };
    return parsed.id ?? null;
  } catch {
    const num = parseInt(encoded, 10);
    return isNaN(num) ? null : num;
  }
}
