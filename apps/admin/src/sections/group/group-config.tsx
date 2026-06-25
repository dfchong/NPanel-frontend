"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  getGroupConfig,
  resetGroups,
  updateGroupConfig,
} from "@workspace/ui/services/admin/group";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function GroupConfig() {
  const { t } = useTranslation("group");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [config, setConfig] = useState<{
    enabled: boolean;
    mode: "average" | "subscribe" | "traffic";
  }>({
    enabled: false,
    mode: "average",
  });

  const loadConfig = async () => {
    try {
      const { data } = await getGroupConfig();
      if (data.data) {
        setConfig({
          enabled: data.data.enabled,
          mode: (data.data.mode || "average") as
            | "average"
            | "subscribe"
            | "traffic",
        });
      }
    } catch (error) {
      console.error("Failed to load group config:", error);
      toast.error(t("loadFailed", "Failed to load configuration"));
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleUpdateEnabled = async (enabled: boolean) => {
    setSaving(true);
    try {
      const payload: any = {
        enabled,
        mode: config.mode,
      };
      await updateGroupConfig(payload);
      setConfig({ ...config, enabled });
      toast.success(t("saved", "Configuration saved successfully"));
    } catch (error) {
      console.error("Failed to update group config:", error);
      toast.error(t("saveFailed", "Failed to save configuration"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMode = async (
    mode: "average" | "subscribe" | "traffic"
  ) => {
    setSaving(true);
    try {
      const payload: any = {
        enabled: config.enabled,
        mode,
      };
      await updateGroupConfig(payload);
      setConfig({ ...config, mode });
      toast.success(t("saved", "Configuration saved successfully"));
    } catch (error) {
      console.error("Failed to update group config:", error);
      toast.error(t("saveFailed", "Failed to save configuration"));
    } finally {
      setSaving(false);
    }
  };

  const handleResetGroups = async () => {
    setResetting(true);
    try {
      await resetGroups({ confirm: true });
      toast.success(
        t("resetSuccess", "All groups have been reset successfully")
      );
      setShowResetDialog(false);
      // Reload config after reset
      await loadConfig();
    } catch (error) {
      console.error("Failed to reset groups:", error);
      toast.error(t("resetFailed", "Failed to reset groups"));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("groupConfig", "Group Configuration")}</CardTitle>
          <CardDescription>
            {t(
              "groupConfigDescription",
              "Configure user group and node group settings"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium" htmlFor="enabled">
                {t("enableGrouping", "Enable Grouping")}
              </label>
              <p className="text-muted-foreground text-sm">
                {t(
                  "enableGroupingDescription",
                  "When enabled, users will only see nodes from their assigned group"
                )}
              </p>
            </div>
            <input
              checked={config.enabled}
              className="h-4 w-4"
              disabled={saving}
              id="enabled"
              onChange={(e) => handleUpdateEnabled(e.target.checked)}
              type="checkbox"
            />
          </div>

          {/* Mode Selection */}
          {config.enabled && (
            <div className="space-y-2">
              <div className="font-medium">
                {t("groupingMode", "Grouping Mode")}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    config.mode === "average"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  } ${saving ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={saving}
                  onClick={() => handleUpdateMode("average")}
                  type="button"
                >
                  <div className="font-medium">
                    {t("averageMode", "Average Mode")}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {t(
                      "averageModeDescription",
                      "Distribute users evenly across groups"
                    )}
                  </div>
                </button>

                <button
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    config.mode === "subscribe"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  } ${saving ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={saving}
                  onClick={() => handleUpdateMode("subscribe")}
                  type="button"
                >
                  <div className="font-medium">
                    {t("subscribeMode", "Subscribe Mode")}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {t(
                      "subscribeModeDescription",
                      "Group users by their subscription plan"
                    )}
                  </div>
                </button>

                <button
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    config.mode === "traffic"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  } ${saving ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={saving}
                  onClick={() => handleUpdateMode("traffic")}
                  type="button"
                >
                  <div className="font-medium">
                    {t("trafficMode", "Traffic Mode")}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {t(
                      "trafficModeDescription",
                      "Group users by their traffic usage"
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-end border-t pt-4">
            <AlertDialog
              onOpenChange={setShowResetDialog}
              open={showResetDialog}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  {t("resetGroups", "Reset All Groups")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("resetGroupsTitle", "Reset All Groups")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(
                      "resetGroupsDescription",
                      "This action will delete all node groups and user groups, reset all users' group ID to 0, clear all products' node group IDs, and clear all nodes' node group IDs. This action cannot be undone."
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleResetGroups}
                  >
                    {resetting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("confirm", "Confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
