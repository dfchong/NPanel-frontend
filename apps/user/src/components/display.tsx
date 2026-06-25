import { formatBytes } from "@workspace/ui/utils/formatting";
import { unitConversion } from "@workspace/ui/utils/unit-conversions";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

type DisplayType = "currency" | "traffic" | "number" | "trafficSpeed";

interface DisplayProps<T> {
  value?: T;
  unlimited?: boolean;
  type?: DisplayType;
}

function toSafeNumber(value?: number | string | null) {
  const parsed =
    typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function Display<T extends number | string | undefined | null>({
  value = 0,
  unlimited = false,
  type = "number",
}: DisplayProps<T>): string {
  const { t } = useTranslation("components");
  const { common } = useGlobalStore();
  const { currency } = common;
  const numericValue = toSafeNumber(value);

  if (type === "currency") {
    const formattedValue = `${currency?.currency_symbol ?? ""}${unitConversion("centsToDollars", numericValue)?.toFixed(2) ?? "0.00"}`;
    return formattedValue;
  }

  if (
    ["traffic", "trafficSpeed", "number"].includes(type) &&
    unlimited &&
    numericValue === 0
  ) {
    return t("unlimited");
  }

  if (type === "traffic") {
    return numericValue ? formatBytes(numericValue) : "0";
  }

  if (type === "trafficSpeed") {
    return numericValue
      ? `${formatBytes(numericValue).replace("B", "b")}ps`
      : "0";
  }

  if (type === "number") {
    return value !== null && value !== undefined ? String(value) : "0";
  }

  return "0";
}
