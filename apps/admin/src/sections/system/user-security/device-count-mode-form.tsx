import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getNodeConfig,
  updateNodeConfig,
} from "@workspace/ui/services/admin/system";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const deviceCountModeSchema = z.object({
  device_count_mode: z.string().optional(),
});

type DeviceCountModeFormData = z.infer<typeof deviceCountModeSchema>;

export default function DeviceCountModeForm() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["getNodeConfig"],
    queryFn: async () => {
      const { data } = await getNodeConfig();
      return data.data;
    },
  });

  const admissionEnabled = data?.device_admission_enabled ?? false;

  const form = useForm<DeviceCountModeFormData>({
    resolver: zodResolver(deviceCountModeSchema),
    defaultValues: {
      device_count_mode: "ip",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        device_count_mode: data.device_count_mode || "ip",
      });
    }
  }, [data, form]);

  async function onSubmit(values: DeviceCountModeFormData) {
    if (!(data && admissionEnabled)) return;
    setLoading(true);
    try {
      await updateNodeConfig({
        ...data,
        device_count_mode: values.device_count_mode,
      } as API.NodeConfig);
      toast.success(t("deviceCountMode.saveSuccess", "Save Successful"));
      refetch();
      setOpen(false);
    } catch (_error) {
      toast.error(t("deviceCountMode.saveFailed", "Save Failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <div
          className="flex cursor-pointer items-center justify-between gap-4 transition-colors hover:bg-accent/50"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" icon="mdi:devices" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {t("deviceCountMode.title", "Device Count Mode")}
              </p>
              <p className="text-muted-foreground text-sm">
                {admissionEnabled
                  ? t(
                      "deviceCountMode.description",
                      "Configure how online devices are counted"
                    )
                  : t(
                      "deviceCountMode.disabledReason",
                      "Enable real-time device admission first"
                    )}
              </p>
            </div>
          </div>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </div>
      </SheetTrigger>
      <SheetContent className="w-[600px] max-w-full md:max-w-screen-md">
        <SheetHeader>
          <SheetTitle>
            {t("deviceCountMode.title", "Device Count Mode")}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6">
          <Form {...form}>
            <form
              className="space-y-2 pt-4"
              id="device-count-mode-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {!admissionEnabled && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 text-sm dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                  {t(
                    "deviceCountMode.disabledDescription",
                    "Device count mode depends on real-time device admission. While it is off, nodes do not use this mode for connection admission and device limits still use the traditional heartbeat mechanism."
                  )}
                </div>
              )}
              <FormField
                control={form.control}
                name="device_count_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("deviceCountMode.modeLabel", "Count Mode")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={!admissionEnabled}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "deviceCountMode.selectPlaceholder",
                              "Select device count mode"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ip">
                            {t("deviceCountMode.byIp", "Count by IP")}
                          </SelectItem>
                          <SelectItem value="connection">
                            {t(
                              "deviceCountMode.byConnection",
                              "Count by Connection"
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {field.value === "connection"
                        ? t(
                            "deviceCountMode.byConnectionDescription",
                            "Each active proxy connection counts as one device slot. Stricter policy, suitable for preventing account sharing."
                          )
                        : t(
                            "deviceCountMode.byIpDescription",
                            "Devices sharing the same public IP (e.g. same WiFi) count as one device slot. More lenient policy."
                          )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="flex-row justify-end gap-2 pt-3">
          <Button
            disabled={loading}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            disabled={loading || !admissionEnabled}
            form="device-count-mode-form"
            type="submit"
          >
            {loading && (
              <Icon className="mr-2 animate-spin" icon="mdi:loading" />
            )}
            {t("common.save", "Save Settings")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
