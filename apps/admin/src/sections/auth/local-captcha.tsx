import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Icon } from "@workspace/ui/composed/icon";
import { adminGenerateCaptcha } from "@workspace/ui/services/admin/auth";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";

export interface LocalCaptchaRef {
  reset: () => void;
}

interface LocalCaptchaProps {
  value?: string | null;
  onChange?: (value: string) => void;
  onCaptchaIdChange?: (id: string) => void;
}

const LocalCaptcha = forwardRef<LocalCaptchaRef, LocalCaptchaProps>(
  ({ value, onChange, onCaptchaIdChange }, ref) => {
    const { t } = useTranslation("auth");
    const [captchaImage, setCaptchaImage] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCaptcha = async () => {
      setLoading(true);
      try {
        const res = await adminGenerateCaptcha();
        const captchaData = res.data?.data;
        if (captchaData) {
          setCaptchaImage(captchaData.image);
          onCaptchaIdChange?.(captchaData.id);
        }
      } catch (error) {
        console.error("Failed to generate captcha:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchCaptcha();
    }, []);

    useImperativeHandle(ref, () => ({
      reset: () => {
        onChange?.("");
        fetchCaptcha();
      },
    }));

    return (
      <div className="flex gap-2">
        <Input
          className="flex-1"
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={t("captcha.placeholder", "Enter captcha code...")}
          value={value || ""}
        />
        <div className="relative h-10 w-32 flex-shrink-0">
          {loading ? (
            <div className="flex h-full items-center justify-center bg-muted">
              <Icon className="animate-spin" icon="mdi:loading" />
            </div>
          ) : captchaImage ? (
            <img
              alt="captcha"
              className="h-full w-full cursor-pointer object-contain"
              height={40}
              onClick={fetchCaptcha}
              src={captchaImage}
              title={t("captcha.clickToRefresh", "Click to refresh")}
              width={128}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-xs">
              {t("captcha.noImage", "No Image")}
            </div>
          )}
        </div>
        <Button
          disabled={loading}
          onClick={fetchCaptcha}
          size="icon"
          title={t("captcha.refresh", "Refresh captcha")}
          type="button"
          variant="outline"
        >
          <Icon icon="mdi:refresh" />
        </Button>
      </div>
    );
  }
);

LocalCaptcha.displayName = "LocalCaptcha";

export default LocalCaptcha;
