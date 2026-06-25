"use client";

import { Separator } from "@workspace/ui/components/separator";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";

function toNumber(value?: number | string | null) {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface SubscribeBillingProps {
  order?: Partial<
    API.OrderDetail & {
      unit_price: number | string;
      unit_time: string;
      subscribe_discount: number | string;
      show_original_price?: boolean;
      quantity: number | string;
    }
  >;
}

export function SubscribeBilling({ order }: Readonly<SubscribeBillingProps>) {
  const { t } = useTranslation("subscribe");
  const quantity = toNumber(order?.quantity) || 1;
  const unitPrice = toNumber(order?.unit_price);
  const price = toNumber(order?.price) || unitPrice;
  const discount = toNumber(order?.discount);
  const couponDiscount = toNumber(order?.coupon_discount);
  const feeAmount = toNumber(order?.fee_amount);
  const giftAmount = toNumber(order?.gift_amount);
  const amount = toNumber(order?.amount);

  return (
    <>
      <div className="font-semibold">
        {t("billing.billingTitle", "Billing Detail")}
      </div>
      <ul className="grid grid-cols-2 gap-3 *:flex *:items-center *:justify-between lg:grid-cols-1">
        {order?.type && [1, 2].includes(order?.type) && (
          <li>
            <span className="text-muted-foreground">
              {t("billing.duration", "Duration")}
            </span>
            <span>
              {quantity}{" "}
              {String(
                t(order?.unit_time || "Month", order?.unit_time || "Month")
              )}
            </span>
          </li>
        )}{" "}
        {order?.show_original_price !== false &&
          order?.type &&
          [1, 2].includes(order?.type) && (
            <li>
              <span className="text-muted-foreground">
                {t("billing.originalPrice", "Original Price (Monthly)")}
              </span>
              <span>
                <Display type="currency" value={unitPrice} />
              </span>
            </li>
          )}{" "}
        <li>
          <span className="text-muted-foreground">
            {t("billing.price", "Price")}
          </span>
          <span>
            <Display type="currency" value={price} />
          </span>
        </li>
        <li>
          <span className="text-muted-foreground">
            {t("billing.productDiscount", "Product Discount")}
          </span>
          <span>
            <Display type="currency" value={discount} />
          </span>
        </li>
        <li>
          <span className="text-muted-foreground">
            {t("billing.couponDiscount", "Coupon Discount")}
          </span>
          <span>
            <Display type="currency" value={couponDiscount} />
          </span>
        </li>
        <li>
          <span className="text-muted-foreground">
            {t("billing.fee", "Fee")}
          </span>
          <span>
            <Display type="currency" value={feeAmount} />
          </span>
        </li>
        <li>
          <span className="text-muted-foreground">
            {t("billing.gift", "Gift")}
          </span>
          <span>
            <Display type="currency" value={giftAmount} />
          </span>
        </li>
      </ul>
      <Separator />
      <div className="flex items-center justify-between font-semibold">
        <span className="text-muted-foreground">
          {t("billing.total", "Total")}
        </span>
        <span>
          <Display type="currency" value={amount} />
        </span>
      </div>
    </>
  );
}
