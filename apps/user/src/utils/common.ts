import { removeCookie, setCookie } from "@workspace/ui/lib/cookies";
import { isBrowser } from "@workspace/ui/utils/index";

export function getPlatform(): string {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent.toLowerCase();

  // Mobile platforms must be checked FIRST:
  // - Android UA contains "Linux" → would falsely match linux rule
  // - iPhone/iPad UA contains "Mac OS X" → would falsely match mac rule
  if (userAgent.includes("android")) return "android";
  if (userAgent.includes("iphone") || userAgent.includes("ipad")) return "ios";
  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";

  return "unknown";
}

function toTimestamp(value: Date | number | string): number {
  if (value instanceof Date) return value.getTime();
  const numericValue =
    typeof value === "string"
      ? Number.isFinite(Number(value))
        ? Number(value)
        : Date.parse(value)
      : value;
  if (!Number.isFinite(numericValue)) return 0;
  return numericValue > 0 && numericValue < 10_000_000_000
    ? numericValue * 1000
    : numericValue;
}

export function differenceInDays(
  date1: Date | number | string,
  date2: Date | number | string
): number {
  const diffTime = Math.abs(toTimestamp(date1) - toTimestamp(date2));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatDate(timestamp: number | string): string {
  if (!timestamp) return "";
  return new Date(toTimestamp(timestamp)).toLocaleDateString();
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
  const hash = location.hash.slice(1); // 移除 '#'

  if (
    !(
      ["", "/", "/auth", "/tos", "/privacy-policy"].includes(pathname) ||
      pathname.startsWith("/purchasing") ||
      pathname.startsWith("/oauth/")
    )
  ) {
    setRedirectUrl(pathname);
    location.href = "/#/auth";
    return;
  }

  if (
    hash &&
    !(
      ["", "/", "/auth", "/tos", "/privacy-policy"].includes(hash) ||
      hash.startsWith("/purchasing") ||
      hash.startsWith("/oauth/")
    )
  ) {
    setRedirectUrl(hash);
    location.href = "/#/auth";
  }
}
