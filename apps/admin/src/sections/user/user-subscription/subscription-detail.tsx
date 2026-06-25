import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Switch } from "@workspace/ui/components/switch";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import { ProTable } from "@workspace/ui/composed/pro-table/pro-table";
import { getNodeConfig } from "@workspace/ui/services/admin/system";
import {
  getUserSubscribeDevices,
  kickOfflineByUserDevice,
} from "@workspace/ui/services/admin/user";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { IpLink } from "@/components/ip-link";
import { formatDate } from "@/utils/common";

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SubscriptionDetail({
  trigger,
  userId,
  subscriptionId,
}: {
  trigger: ReactNode;
  userId: string | number;
  subscriptionId: string | number;
}) {
  const { t } = useTranslation("user");
  const [open, setOpen] = useState(false);
  const [deviceCountMode, setDeviceCountMode] = useState<string>("ip");

  useEffect(() => {
    if (open) {
      getNodeConfig()
        .then(({ data }) => {
          if (data.data?.device_count_mode) {
            setDeviceCountMode(data.data.device_count_mode);
          }
        })
        .catch(() => {
          // Keep the default display mode when config loading fails.
        });
    }
  }, [open]);

  function formatDuration(connectedAt?: string) {
    if (!connectedAt) return "-";
    const start = new Date(connectedAt).getTime();
    if (Number.isNaN(start)) return "-";
    const now = Date.now();
    const diffSec = Math.floor((now - start) / 1000);
    if (diffSec < 60) return `${diffSec}s`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
    const hours = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    return `${hours}h ${mins}m`;
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        className="w-[700px] max-w-full md:max-w-screen-md"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>{t("onlineDevices", "Online Devices")}</SheetTitle>
          <div className="mt-1">
            <Badge variant="outline">
              {deviceCountMode === "connection"
                ? t(
                    "deviceCountModeConnection",
                    "Current Mode: Count by Connection"
                  )
                : t("deviceCountModeIp", "Current Mode: Count by IP")}
            </Badge>
          </div>
        </SheetHeader>
        <div className="mt-4 max-h-[calc(100dvh-120px)] overflow-y-auto">
          <ProTable<API.UserDevice, Record<string, unknown>>
            actions={{
              render: (row) => {
                if (!row.identifier) return [];
                return [
                  <ConfirmButton
                    cancelText={t("cancel", "Cancel")}
                    confirmText={t("confirm", "Confirm")}
                    description={t(
                      "kickOfflineConfirm",
                      `Kick device ${row.ip} offline?`
                    )}
                    key="offline"
                    onConfirm={async () => {
                      await kickOfflineByUserDevice({ id: row.id });
                      toast.success(
                        t("kickOfflineSuccess", "Device kicked offline")
                      );
                    }}
                    title={t("confirmOffline", "Confirm Offline")}
                    trigger={
                      <Button variant="destructive">
                        {t("confirmOffline", "Confirm Offline")}
                      </Button>
                    }
                  />,
                ];
              },
            }}
            columns={[
              {
                accessorKey: "enabled",
                header: t("enable", "Enable"),
                cell: ({ row }) => (
                  <Switch
                    checked={row.getValue("enabled")}
                    onChange={(checked) => {
                      console.log("Switch:", checked);
                    }}
                  />
                ),
              },
              { accessorKey: "id", header: "ID" },
              { accessorKey: "identifier", header: "IMEI" },
              {
                accessorKey: "user_agent",
                header: t("userAgent", "User Agent"),
              },
              {
                accessorKey: "ip",
                header: "IP",
                cell: ({ row }) => <IpLink ip={row.getValue("ip")} />,
              },
              {
                accessorKey: "node_name",
                header: t("nodeName", "Node"),
                cell: ({ row }) => row.getValue("node_name") || "-",
              },
              {
                accessorKey: "protocol",
                header: t("protocol", "Protocol"),
                cell: ({ row }) => {
                  const protocol = row.getValue("protocol") as string;
                  return protocol ? (
                    <Badge variant="secondary">{protocol}</Badge>
                  ) : (
                    "-"
                  );
                },
              },
              {
                accessorKey: "connected_at",
                header: t("connectedDuration", "Duration"),
                cell: ({ row }) =>
                  formatDuration(row.getValue("connected_at") as string),
              },
              {
                accessorKey: "online",
                header: t("loginStatus", "Login Status"),
                cell: ({ row }) => (
                  <Badge
                    variant={row.getValue("online") ? "default" : "destructive"}
                  >
                    {row.getValue("online")
                      ? t("online", "Online")
                      : t("offline", "Offline")}
                  </Badge>
                ),
              },
              {
                accessorKey: "updated_at",
                header: t("lastSeen", "Last Seen"),
                cell: ({ row }) =>
                  formatDate(
                    toNumber(row.getValue("updated_at") as number | string)
                  ),
              },
            ]}
            request={async (pagination) => {
              const { data } = await getUserSubscribeDevices({
                user_id: String(userId),
                subscribe_id: String(subscriptionId),
                ...pagination,
              });
              return {
                list: data.data?.list || [],
                total: data.data?.total || 0,
              };
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
