import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Combobox } from "@workspace/ui/composed/combobox";
import { DatePicker } from "@workspace/ui/composed/date-picker";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { unitConversion } from "@workspace/ui/utils/unit-conversions";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useSubscribe } from "@/stores/subscribe";

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toMilliseconds(value: number | string | null | undefined) {
  const parsed = toNumber(value);
  if (!parsed) return 0;
  return parsed < 10_000_000_000 ? parsed * 1000 : parsed;
}

function toSeconds(value: number | null | undefined) {
  const parsed = toNumber(value);
  if (!parsed) return 0;
  return parsed >= 10_000_000_000 ? Math.floor(parsed / 1000) : parsed;
}

interface Props {
  trigger: ReactNode;
  title: string;
  loading?: boolean;
  initialData?: API.UserSubscribe;
  onSubmit: (values: SubscriptionFormValues) => Promise<boolean>;
}

const formSchema = z.object({
  subscribe_id: z.string().min(1, "Please select a subscription"),
  traffic: z.number().optional(),
  speed_limit: z.number().optional(),
  device_limit: z.number().optional(),
  expired_at: z.number().nullish().optional(),
  upload: z.number().optional(),
  download: z.number().optional(),
  id: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof formSchema>;

export function SubscriptionForm({
  trigger,
  title,
  loading,
  initialData,
  onSubmit,
}: Props) {
  const { t } = useTranslation("user");
  const [open, setOpen] = useState(false);
  const defaultValues = useMemo<SubscriptionFormValues>(
    () => ({
      subscribe_id: initialData?.subscribe_id || "",
      traffic: toNumber(initialData?.traffic),
      upload: toNumber(initialData?.upload),
      download: toNumber(initialData?.download),
      expired_at: toMilliseconds(initialData?.expire_time),
      ...(initialData && { id: initialData.id }),
    }),
    [initialData]
  );

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = async (values: SubscriptionFormValues) => {
    const success = await onSubmit({
      ...values,
      expired_at: toSeconds(values.expired_at),
    });
    if (success) {
      setOpen(false);
      form.reset(defaultValues);
    }
  };

  const { subscribes } = useSubscribe();

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            form.reset(defaultValues);
            setOpen(true);
          }}
        >
          {trigger}
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))] px-4">
          <div className="pr-4">
            <Form {...form}>
              <form
                className="mt-4 space-y-4"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name="subscribe_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("subscription", "Subscription")}</FormLabel>
                      <FormControl>
                        <Combobox<string, false>
                          onChange={(value) => {
                            form.setValue(field.name, value);
                          }}
                          options={subscribes?.map((item) => ({
                            value: item.id!,
                            label: item.name!,
                          }))}
                          placeholder="Select Subscription"
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="traffic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("trafficLimit", "Traffic Limit")}
                      </FormLabel>
                      <FormControl>
                        <EnhancedInput
                          placeholder={t("unlimited", "Unlimited")}
                          type="number"
                          {...field}
                          formatInput={(value) =>
                            unitConversion("bytesToGb", value)
                          }
                          formatOutput={(value) =>
                            unitConversion("gbToBytes", value)
                          }
                          onValueChange={(value) => {
                            form.setValue(field.name, value as number);
                          }}
                          suffix="GB"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="upload"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("uploadTraffic", "Upload Traffic")}
                      </FormLabel>
                      <FormControl>
                        <EnhancedInput
                          placeholder="0"
                          type="number"
                          {...field}
                          formatInput={(value) =>
                            unitConversion("bytesToGb", value)
                          }
                          formatOutput={(value) =>
                            unitConversion("gbToBytes", value)
                          }
                          onValueChange={(value) => {
                            form.setValue(field.name, value as number);
                          }}
                          suffix="GB"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="download"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("downloadTraffic", "Download Traffic")}
                      </FormLabel>
                      <FormControl>
                        <EnhancedInput
                          placeholder="0"
                          type="number"
                          {...field}
                          formatInput={(value) =>
                            unitConversion("bytesToGb", value)
                          }
                          formatOutput={(value) =>
                            unitConversion("gbToBytes", value)
                          }
                          onValueChange={(value) => {
                            form.setValue(field.name, value as number);
                          }}
                          suffix="GB"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expired_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("expiredAt", "Expired At")}</FormLabel>
                      <FormControl>
                        <DatePicker
                          onChange={(value: number | null | undefined) => {
                            form.setValue(field.name, value || 0);
                          }}
                          placeholder={t("permanent", "Permanent")}
                          value={
                            field.value && field.value > 0
                              ? field.value
                              : undefined
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>
        <SheetFooter className="flex-row justify-end gap-2 pt-3">
          <Button
            disabled={loading}
            onClick={() => {
              setOpen(false);
            }}
            variant="outline"
          >
            {t("cancel", "Cancel")}
          </Button>
          <Button disabled={loading} onClick={form.handleSubmit(handleSubmit)}>
            {loading && (
              <Icon className="mr-2 animate-spin" icon="mdi:loading" />
            )}
            {t("confirm", "Confirm")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
