import { removeCookie, setCookie } from "@workspace/ui/lib/cookies";
import { isBrowser } from "@workspace/ui/utils/index";
import { intlFormat } from "date-fns";

function toSafeNumber(value?: Date | number | string | null) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeTimestamp(value: number) {
  return value > 0 && value < 10_000_000_000 ? value * 1000 : value;
}

export function getPlatform(): string {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  if (userAgent.includes("android")) return "android";
  if (userAgent.includes("iphone") || userAgent.includes("ipad")) return "ios";

  return "unknown";
}

export function differenceInDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatDate(date?: Date | number | string, showTime = true) {
  if (date === undefined || date === null || date === "") return;

  const dateValue: Date | number =
    date instanceof Date ? date : normalizeTimestamp(toSafeNumber(date));
  if (!dateValue) return;

  const timeZone = localStorage.getItem("timezone") || "UTC";
  return intlFormat(dateValue, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    ...(showTime && {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }),
    hour12: false,
    timeZone,
  });
}

export function setAuthorization(token: string): void {
  setCookie("Authorization", token);
}

export function getRedirectUrl(): string {
  if (typeof window === "undefined") return "/dashboard";
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  return redirect?.startsWith("/") ? redirect : "/dashboard";
}

export function setRedirectUrl(value?: string) {
  if (value) {
    sessionStorage.setItem("redirect-url", value);
  }
}

export function Logout() {
  if (!isBrowser()) return;
  removeCookie("Authorization");

  const pathname = location.pathname;
  const hash = location.hash.slice(1);

  if (!["", "/"].includes(pathname)) {
    setRedirectUrl(pathname);
    location.href = "/";
    return;
  }

  if (hash && !["", "/"].includes(hash)) {
    setRedirectUrl(hash);
    location.href = "/";
  }
}
