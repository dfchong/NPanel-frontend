import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@workspace/ui/components/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getNodeConfig,
  updateNodeConfig,
} from "@workspace/ui/services/admin/system";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function DeviceAdmissionToggle() {
  const { t } = useTranslation("system");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["getNodeConfig"],
    queryFn: async () => {
      const { data } = await getNodeConfig();
      return data.data;
    },
  });

  const enabled = data?.device_admission_enabled ?? false;

  async function handleToggle(checked: boolean) {
    if (!data) return;
    setLoading(true);
    try {
      await updateNodeConfig({
        ...data,
        device_admission_enabled: checked,
      } as API.NodeConfig);
      toast.success(t("deviceAdmission.saveSuccess", "Save Successful"));
      queryClient.invalidateQueries({ queryKey: ["getNodeConfig"] });
    } catch (_error) {
      toast.error(t("deviceAdmission.saveFailed", "Save Failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 transition-colors">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" icon="mdi:shield-check" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate font-medium">
              {t("deviceAdmission.title", "Real-time Device Admission Control")}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label={t("deviceAdmission.helpLabel", "Description")}
                  className="inline-flex size-4 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  type="button"
                >
                  <Icon className="size-3.5" icon="mdi:help-circle-outline" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-80 space-y-1.5 leading-relaxed">
                <p>
                  {t(
                    "deviceAdmission.descriptionLine1",
                    "On: each new connection is verified with the panel. Requires OmnXT Node v1.0.0+ with the admission module."
                  )}
                </p>
                <p>
                  {t(
                    "deviceAdmission.descriptionLine2",
                    "Off: no admission checks; device limits use traditional heartbeat mechanism."
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="truncate text-muted-foreground text-sm">
            {enabled
              ? t(
                  "deviceAdmission.enabledSummary",
                  "Admission checks are active"
                )
              : t(
                  "deviceAdmission.disabledSummary",
                  "Using heartbeat-based device limits"
                )}
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="text-muted-foreground text-sm">
          {enabled
            ? t("deviceAdmission.enabled", "Enabled")
            : t("deviceAdmission.disabled", "Disabled")}
        </span>
        <Switch
          checked={enabled}
          disabled={loading}
          onCheckedChange={handleToggle}
        />
      </div>
    </div>
  );
}
