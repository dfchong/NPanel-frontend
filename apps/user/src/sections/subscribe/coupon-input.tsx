"use client";

import { Input } from "@workspace/ui/components/input";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface CouponInputProps {
  coupon?: string;
  onCommit: (value: string) => void;
}

const CouponInput: React.FC<CouponInputProps> = ({ coupon, onCommit }) => {
  const { t } = useTranslation("subscribe");
  const [draftCoupon, setDraftCoupon] = useState(coupon ?? "");

  useEffect(() => {
    setDraftCoupon(coupon ?? "");
  }, [coupon]);

  const commitCoupon = useCallback(() => {
    const nextCoupon = draftCoupon.trim();
    if (nextCoupon !== (coupon ?? "")) {
      onCommit(nextCoupon);
    }
    if (nextCoupon !== draftCoupon) {
      setDraftCoupon(nextCoupon);
    }
  }, [coupon, draftCoupon, onCommit]);

  return (
    <>
      <div className="font-semibold">{t("coupon", "Coupon")}</div>
      <Input
        onBlur={commitCoupon}
        onChange={(e) => setDraftCoupon(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitCoupon();
            e.currentTarget.blur();
          }
        }}
        placeholder={t("enterCoupon", "Enter Coupon")}
        value={draftCoupon}
      />
    </>
  );
};

export default CouponInput;
