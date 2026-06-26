export type SubscribePriceOptionLike = API.SubscribePriceOption &
  Record<string, any>;

export function getSubscribePriceOptions(
  subscribe?: Partial<API.Subscribe> | null
): SubscribePriceOptionLike[] {
  const raw =
    (subscribe as any)?.price_options || (subscribe as any)?.priceOptions || [];
  return Array.isArray(raw) ? [...raw].sort(compareSubscribePriceOptions) : [];
}

export function getOptionId(option?: SubscribePriceOptionLike | null) {
  return option?.id;
}

export function getOptionDurationUnit(option?: SubscribePriceOptionLike | null) {
  return option?.duration_unit || option?.durationUnit || "Month";
}

export function getOptionDurationValue(
  option?: SubscribePriceOptionLike | null
) {
  const unit = getOptionDurationUnit(option);
  if (unit === "NoLimit") return 0;
  return Number(option?.duration_value ?? option?.durationValue ?? 1) || 1;
}

export function getOptionPrice(option?: SubscribePriceOptionLike | null) {
  return Number(option?.price ?? 0) || 0;
}

export function getOptionOriginalPrice(option?: SubscribePriceOptionLike | null) {
  return Number(option?.original_price ?? option?.originalPrice ?? 0) || 0;
}

const durationUnitMinutes: Record<string, number> = {
  Minute: 1,
  Hour: 60,
  Day: 60 * 24,
  Week: 60 * 24 * 7,
  Month: 60 * 24 * 30,
  Year: 60 * 24 * 365,
  NoLimit: Number.POSITIVE_INFINITY,
};

function getOptionDurationSortValue(option?: SubscribePriceOptionLike | null) {
  const unit = getOptionDurationUnit(option);
  if (unit === "NoLimit") return Number.POSITIVE_INFINITY;
  return getOptionDurationValue(option) * (durationUnitMinutes[unit] ?? 0);
}

function compareSubscribePriceOptions(
  left: SubscribePriceOptionLike,
  right: SubscribePriceOptionLike
) {
  const leftDuration = getOptionDurationSortValue(left);
  const rightDuration = getOptionDurationSortValue(right);
  if (leftDuration !== rightDuration) return leftDuration - rightDuration;

  const sortDiff = Number(left.sort ?? 0) - Number(right.sort ?? 0);
  if (sortDiff !== 0) return sortDiff;

  return getOptionPrice(left) - getOptionPrice(right);
}

export function getDefaultPriceOption(
  subscribe?: Partial<API.Subscribe> | null
) {
  const options = getSubscribePriceOptions(subscribe);
  return (
    options.find((item) => Boolean(item.is_default ?? item.isDefault)) ||
    options[0]
  );
}
