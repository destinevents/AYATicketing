import { type ClassValue, clsx } from "clsx";
import type { EventTicketRecord } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Formatting ──

export function formatCurrency(amount: number): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...opts,
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function getMonthAbbrev(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", { month: "short" }).format(d).toUpperCase();
}

export function getDay(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", { day: "numeric" }).format(d);
}

// ── Ticket availability ──

export interface TicketAvailability {
  remaining: number | null; // null = unlimited
  isUnlimited: boolean;
  isSoldOut: boolean;
  isOnSale: boolean;
  isUpcoming: boolean;
  isClosed: boolean;
  statusLabel: string;
}

export function getTicketAvailability(ticket: EventTicketRecord): TicketAvailability {
  const now = new Date();
  const salesStart = ticket.sales_start ? new Date(ticket.sales_start) : null;
  const salesEnd = ticket.sales_end ? new Date(ticket.sales_end) : null;

  const isUnlimited = ticket.capacity === 0;
  const remaining = isUnlimited ? null : Math.max(ticket.capacity - ticket.sold, 0);
  const isSoldOut =
    ticket.status === "sold_out" || (!isUnlimited && remaining !== null && remaining <= 0);

  const isUpcoming = !!salesStart && now < salesStart;
  const isClosed =
    ticket.status === "closed" || (!!salesEnd && now > salesEnd) || ticket.status === "hidden";

  const isOnSale =
    !isSoldOut && !isUpcoming && !isClosed && ticket.status === "available";

  let statusLabel = "Available";
  if (ticket.status === "hidden") statusLabel = "Hidden";
  else if (isSoldOut) statusLabel = "Sold Out";
  else if (isUpcoming) statusLabel = `Opens ${formatDate(salesStart!, { month: "short", day: "numeric" })}`;
  else if (isClosed) statusLabel = "Sales Closed";
  else if (isOnSale) statusLabel = "On Sale";

  return { remaining, isUnlimited, isSoldOut, isOnSale, isUpcoming, isClosed, statusLabel };
}

// ── QR Code token generation ──

export function generateQrToken(prefix = "AYA"): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ── Misc ──

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isEventUpcoming(startDate: string): boolean {
  return new Date(startDate) >= new Date();
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const str = val === null || val === undefined ? "" : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}
