"use client";

import { Link, useLocation } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { cn } from "@workspace/ui/lib/utils";
import { Fragment, useMemo, useState } from "react";
import { useGlobalStore } from "@/stores/global";
import { LayoutSwitch } from "./layout-switch";
import { findNavByUrl, type NavItem, useNavs } from "./navs";
import TimezoneSwitch from "./timezone-switch";
import { UserNav } from "./user-nav";

function hasChildren(obj: NavItem): obj is NavItem & { items: NavItem[] } {
  return Array.isArray((obj as any).items) && (obj as any).items.length > 0;
}

/* ── Single Dock Item ── */
function DockItem({
  children,
  active,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  label: string;
}) {
  return (
    <div className="group relative flex flex-col items-center">
      {/* Tooltip label */}
      <span
        className={cn(
          "-top-9 -translate-x-1/2 pointer-events-none absolute left-1/2 whitespace-nowrap",
          "rounded-md bg-popover px-2 py-1 text-popover-foreground text-xs shadow-md ring-1 ring-border",
          "scale-90 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100"
        )}
      >
        {label}
      </span>

      {/* Icon wrapper with scale effect */}
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl transition-all duration-200",
          "group-hover:-translate-y-1 group-hover:scale-125",
          active
            ? "bg-primary/15 text-primary shadow-primary/20 shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {children}
      </div>

      {/* Active dot */}
      <span
        className={cn(
          "mt-0.5 size-1 rounded-full transition-all duration-200",
          active ? "bg-primary opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

export function BottombarLayout({ children }: { children: React.ReactNode }) {
  const navs = useNavs();
  const pathname = useLocation({ select: (l) => l.pathname });
  const { common } = useGlobalStore();
  const { site } = common;
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.replace(/\/+$/, "") : p;
  const isActive = (url: string) => {
    const path = normalize(pathname);
    const target = normalize(url);
    if (target === "/dashboard") return path === target;
    return path === target || path.startsWith(`${target}/`);
  };
  const isGroupActive = (nav: NavItem) =>
    hasChildren(nav) && nav.items.some((i) => isActive(i.url ?? ""));

  const breadcrumbs = useMemo(
    () => findNavByUrl(navs, pathname),
    [navs, pathname]
  );

  return (
    <div className="flex min-h-svh flex-col">
      {/* ── Top Header (minimal) ── */}
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
        {/* Logo */}
        <Link className="flex shrink-0 items-center gap-2" to="/">
          <img
            alt="logo"
            className="size-6"
            height={24}
            src={site.site_logo || "/favicon.svg"}
            width={24}
          />
          <span className="hidden max-w-[120px] truncate font-semibold text-sm sm:block">
            {site.site_name}
          </span>
        </Link>

        <Separator className="mx-1 h-4" orientation="vertical" />

        {/* Breadcrumb */}
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList>
            {breadcrumbs.map((item, idx) => (
              <Fragment key={item?.title}>
                {idx < breadcrumbs.length - 1 && (
                  <>
                    <BreadcrumbItem>
                      <Link
                        className="text-muted-foreground text-sm hover:text-foreground"
                        to={item?.url || "/dashboard"}
                      >
                        {item?.title}
                      </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                {idx === breadcrumbs.length - 1 && (
                  <BreadcrumbPage className="truncate font-medium text-sm">
                    {item?.title}
                  </BreadcrumbPage>
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Right controls */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitch />
          <TimezoneSwitch />
          <LayoutSwitch />
          <ThemeSwitch />
          <UserNav />
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-auto p-4 pb-28">{children}</main>

      {/* ── macOS Dock ── */}
      <div className="-translate-x-1/2 fixed bottom-5 left-1/2 z-50">
        <nav
          className={cn(
            "flex items-end gap-1 px-3 py-2",
            "rounded-2xl border border-border/60",
            "bg-background/70 backdrop-blur-xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]",
            "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]"
          )}
        >
          {navs.map((nav) => {
            const active = hasChildren(nav)
              ? isGroupActive(nav)
              : "url" in nav && isActive((nav as any).url ?? "");
            const icon = "icon" in nav ? (nav as any).icon : null;

            if (hasChildren(nav)) {
              return (
                <Popover
                  key={nav.title}
                  onOpenChange={(open) =>
                    setOpenPopover(open ? nav.title : null)
                  }
                  open={openPopover === nav.title}
                >
                  <PopoverTrigger asChild>
                    <button className="outline-none" type="button">
                      <DockItem active={active} label={nav.title}>
                        {icon ? (
                          <Icon className="size-6" icon={icon} />
                        ) : (
                          <span className="size-6 rounded-lg bg-muted" />
                        )}
                      </DockItem>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="center"
                    className="w-56 p-2"
                    side="top"
                    sideOffset={12}
                  >
                    {/* Popover header */}
                    <div className="mb-1.5 flex items-center gap-2 px-1 py-0.5">
                      {icon && (
                        <Icon
                          className="size-4 text-muted-foreground"
                          icon={icon}
                        />
                      )}
                      <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        {nav.title}
                      </span>
                    </div>
                    <div className="grid gap-0.5">
                      {nav.items.map((item) => {
                        const itemActive = isActive(item.url ?? "");
                        return (
                          <Link
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                              itemActive
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                            )}
                            key={item.title}
                            onClick={() => setOpenPopover(null)}
                            to={item.url ?? "/dashboard"}
                          >
                            {item.icon && (
                              <Icon
                                className="size-4 shrink-0"
                                icon={item.icon}
                              />
                            )}
                            <span className="truncate">{item.title}</span>
                            {itemActive && (
                              <span className="ml-auto size-1.5 rounded-full bg-primary" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return (
              <Link
                key={nav.title}
                to={"url" in nav ? (nav as any).url : "/dashboard"}
              >
                <DockItem active={active} label={nav.title}>
                  {icon ? (
                    <Icon className="size-6" icon={icon} />
                  ) : (
                    <span className="size-6 rounded-lg bg-muted" />
                  )}
                </DockItem>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
