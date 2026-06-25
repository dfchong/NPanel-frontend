"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import {
  getUserDetail,
  getUserSubscribeById,
} from "@workspace/ui/services/admin/user";
import { formatBytes } from "@workspace/ui/utils/formatting";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { formatDate } from "@/utils/common";

// import EditUserGroupDialog from "./edit-user-group-dialog";
// import { getUserGroupList } from "@workspace/ui/services/admin/group";

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function UserSubscribeDetail({
  id,
  enabled,
  hoverCard = false,
}: {
  id: string | number;
  enabled: boolean;
  hoverCard?: boolean;
}) {
  const { t } = useTranslation("user");
  const resolvedId = id ? String(id) : "";

  const { data } = useQuery({
    enabled: resolvedId !== "" && resolvedId !== "0" && enabled,
    queryKey: ["getUserSubscribeById", resolvedId],
    queryFn: async () => {
      const { data } = await getUserSubscribeById({ id: resolvedId });
      return data.data;
    },
  });

  // Fetch user groups for display
  // const { data: groupsData } = useQuery({
  //   enabled: id !== 0 && enabled,
  //   queryKey: ["getUserGroupList"],
  //   queryFn: async () => {
  //     const { data } = await getUserGroupList({
  //       page: 1,
  //       size: 100,
  //     });
  //     return data.data?.list || [];
  //   },
  // });

  if (!resolvedId || resolvedId === "0") return "--";

  const usedTraffic = data
    ? toNumber(data.upload) + toNumber(data.download)
    : 0;
  const totalTraffic = toNumber(data?.traffic);
  const remainingTraffic = totalTraffic > 0 ? totalTraffic - usedTraffic : 0;

  // Get user group info from data.user
  // const userGroupId = typeof data?.user?.user_group_id === 'number' ? data?.user?.user_group_id : 0;
  // const groupLocked = data?.user?.group_locked || false;
  // const groupIds = userGroupId > 0 ? [userGroupId] : [];

  // const groupNames = userGroupId > 0
  //   ? groupsData?.find((g: API.UserGroup) => g.id === userGroupId)?.name || "--"
  //   : "--";

  const subscribeContent = (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-medium text-sm">{t("subscriptionInfo")}</h3>
        <div className="rounded-lg bg-muted/30 p-3">
          <ul className="grid gap-3">
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">
                {t("subscriptionId")}
              </span>
              <span>{data?.id || "--"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("subscriptionName")}
              </span>
              <span>{data?.subscribe?.name || "--"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("token")}</span>
              <div className="font-mono text-xs" title={data?.token || ""}>
                {data?.token || "--"}
              </div>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("trafficUsage")}</span>
              <span>
                {data
                  ? totalTraffic === 0
                    ? `${formatBytes(usedTraffic)} / ${t("unlimited")}`
                    : `${formatBytes(usedTraffic)} / ${formatBytes(totalTraffic)}`
                  : "--"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("remainingTraffic")}
              </span>
              <span>
                {data
                  ? totalTraffic === 0
                    ? t("unlimited")
                    : formatBytes(remainingTraffic)
                  : "--"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("startTime")}</span>
              <span>
                {data?.start_time
                  ? formatDate(toNumber(data.start_time))
                  : "--"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("expireTime")}</span>
              <span>
                {data?.expire_time && toNumber(data.expire_time) !== 0
                  ? formatDate(toNumber(data.expire_time))
                  : t("permanent", "Permanent")}
              </span>
            </li>
            {/* <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("userGroup")}</span>
              <div className="flex items-center gap-2">
                <span>{groupNames || "--"}</span>
                {data?.id && (
                  <EditUserGroupDialog
                    userId={data?.user_id || 0}
                    userSubscribeId={data?.id}
                    currentGroupIds={groupIds}
                    currentLocked={groupLocked}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        {t("edit", "Edit")}
                      </Button>
                    }
                    onSubmit={async () => {
                      window.location.reload();
                      return true;
                    }}
                  />
                )}
              </div>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("groupLocked")}</span>
              <span>
                {groupLocked ? t("yes", "Yes") : t("no", "No")}
              </span>
            </li> */}
          </ul>
        </div>
      </div>

      {!hoverCard && (
        <div>
          <h3 className="mb-2 font-medium text-sm">
            {t("userInfo")}
            {/* Removed link to legacy user detail page */}
          </h3>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">{t("userId")}</span>
              <span>{data?.user_id}</span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">{t("balance")}</span>
              <span>
                <Display type="currency" value={toNumber(data?.user.balance)} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("giftAmount")}</span>
              <span>
                <Display
                  type="currency"
                  value={toNumber(data?.user?.gift_amount)}
                />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("commission")}</span>
              <span>
                <Display
                  type="currency"
                  value={toNumber(data?.user?.commission)}
                />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("createdAt")}</span>
              <span>
                {data?.user?.created_at &&
                  formatDate(toNumber(data?.user?.created_at))}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  if (hoverCard) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button className="p-0" variant="link">
            {data?.subscribe?.name || t("loading")}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-96">{subscribeContent}</HoverCardContent>
      </HoverCard>
    );
  }

  return subscribeContent;
}

export function UserDetail({ id }: { id: string | number }) {
  const { t } = useTranslation("user");
  const resolvedId = id ? String(id) : "";

  const { data } = useQuery({
    enabled: resolvedId !== "" && resolvedId !== "0",
    queryKey: ["getUserDetail", resolvedId],
    queryFn: async () => {
      const { data } = await getUserDetail({ id: resolvedId });
      return data.data;
    },
  });

  if (!resolvedId || resolvedId === "0") return "--";

  // auth_methods 可能在加载中、请求失败或老版本接口返回时为 undefined，
  // 这里做空值保护，避免在工单等页面渲染时报 "Cannot read properties of undefined (reading 'find')"
  const authMethods = data?.auth_methods ?? [];
  const identifier =
    authMethods.find((m) => m.auth_type === "email")?.auth_identifier ||
    authMethods[0]?.auth_identifier;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button asChild className="p-0" variant="link">
          <Link search={{ user_id: resolvedId }} to="/dashboard/user">
            {identifier || t("loading", "Loading...")}
          </Link>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="grid gap-3">
          <ul className="grid gap-3">
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">ID</span>
              <span>{data?.id}</span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">
                {t("balance", "Balance")}
              </span>
              <span>
                <Display type="currency" value={toNumber(data?.balance)} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("giftAmount", "Gift Amount")}
              </span>
              <span>
                <Display type="currency" value={toNumber(data?.gift_amount)} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("commission", "Commission")}
              </span>
              <span>
                <Display type="currency" value={toNumber(data?.commission)} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("createdAt", "Created At")}
              </span>
              <span>
                {data?.created_at && formatDate(toNumber(data?.created_at))}
              </span>
            </li>
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
