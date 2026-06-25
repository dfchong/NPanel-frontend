"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useTranslation } from "react-i18next";
import AverageModeTab from "./average-mode-tab";
import CurrentGroupResults from "./current-group-results";
import GroupConfig from "./group-config";
import GroupHistory from "./group-history";
// import UserGroups from "./user-groups";
import NodeGroups from "./node-groups";
import SubscribeModeTab from "./subscribe-mode-tab";
import TrafficModeTab from "./traffic-mode-tab";

export default function Group() {
  const { t } = useTranslation("group");

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">
        {t("title", "Group Management")}
      </h2>

      <Tabs defaultValue="config">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="config">{t("config", "Config")}</TabsTrigger>
          {/* <TabsTrigger value="user">
            {t("userGroups", "User Groups")}
          </TabsTrigger> */}
          <TabsTrigger value="node">
            {t("nodeGroups", "Node Groups")}
          </TabsTrigger>
          <TabsTrigger value="average">
            {t("averageMode", "Average Mode")}
          </TabsTrigger>
          <TabsTrigger value="subscribe">
            {t("subscribeMode", "Subscribe Mode")}
          </TabsTrigger>
          <TabsTrigger value="traffic">
            {t("trafficMode", "Traffic Mode")}
          </TabsTrigger>
          <TabsTrigger value="results">
            {t("currentGroupingResult", "Current Grouping Result")}
          </TabsTrigger>
          <TabsTrigger value="history">{t("history", "History")}</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="config">
          <GroupConfig />
        </TabsContent>

        {/* <TabsContent value="user" className="mt-4">
          <UserGroups />
        </TabsContent> */}

        <TabsContent className="mt-4" value="node">
          <NodeGroups />
        </TabsContent>

        <TabsContent className="mt-4" value="average">
          <AverageModeTab />
        </TabsContent>

        <TabsContent className="mt-4" value="subscribe">
          <SubscribeModeTab />
        </TabsContent>

        <TabsContent className="mt-4" value="traffic">
          <TrafficModeTab />
        </TabsContent>

        <TabsContent className="mt-4" value="results">
          <CurrentGroupResults />
        </TabsContent>

        <TabsContent className="mt-4" value="history">
          <GroupHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
