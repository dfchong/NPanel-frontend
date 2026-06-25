"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type LayoutMode, useLayoutStore } from "@/stores/layout";

const layouts: {
  mode: LayoutMode;
  icon: string;
  labelKey: string;
  labelFallback: string;
  descKey: string;
  descFallback: string;
}[] = [
  {
    mode: "sidebar",
    icon: "material-symbols:dock-to-left-outline-rounded",
    labelKey: "layout.sidebar",
    labelFallback: "Sidebar",
    descKey: "layout.sidebarDesc",
    descFallback: "Classic left sidebar navigation",
  },
  {
    mode: "topbar",
    icon: "material-symbols:dock-to-top-outline-rounded",
    labelKey: "layout.topbar",
    labelFallback: "Top Bar",
    descKey: "layout.topbarDesc",
    descFallback: "Horizontal top navigation bar",
  },
  {
    mode: "bottombar",
    icon: "material-symbols:dock-to-bottom-outline-rounded",
    labelKey: "layout.bottombar",
    labelFallback: "Bottom Dock",
    descKey: "layout.bottombarDesc",
    descFallback: "macOS-style bottom dock",
  },
];

export function LayoutSwitch() {
  const { mode, setMode } = useLayoutStore();
  const { t } = useTranslation("components");

  return (
    <Sheet>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                aria-label={t("layout.settings", "Layout Settings")}
                className="scale-95 rounded-full"
                size="icon"
                variant="ghost"
              >
                <LayoutDashboard className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t("layout.settings", "Layout Settings")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SheetContent className="w-72 sm:max-w-xs" side="right">
        <SheetHeader>
          <SheetTitle>{t("layout.settings", "Layout Settings")}</SheetTitle>
        </SheetHeader>

        <div className="mt-2 grid grid-cols-1 gap-2 px-4 pb-4">
          {layouts.map((item) => {
            const isActive = mode === item.mode;
            return (
              <button
                className={cn(
                  "flex items-center gap-3 rounded-xl p-3 text-left text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "bg-muted/50 hover:bg-accent hover:text-accent-foreground"
                )}
                key={item.mode}
                onClick={() => setMode(item.mode)}
                type="button"
              >
                <Icon
                  className={cn(
                    "size-6 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  icon={item.icon}
                />
                <div className="min-w-0">
                  <div className="truncate font-medium leading-none">
                    {t(item.labelKey, item.labelFallback)}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 truncate text-xs",
                      isActive ? "text-primary/70" : "text-muted-foreground"
                    )}
                  >
                    {t(item.descKey, item.descFallback)}
                  </div>
                </div>
                {isActive && (
                  <Icon
                    className="ml-auto size-4 shrink-0 text-primary"
                    icon="mdi:check-circle"
                  />
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
