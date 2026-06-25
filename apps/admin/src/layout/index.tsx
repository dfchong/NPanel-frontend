import { Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { getCookie } from "@workspace/ui/lib/cookies";
import { useEffect, useState } from "react";
import { Header } from "@/layout/header";
import { useLayoutStore } from "@/stores/layout";
import { BottombarLayout } from "./bottom-nav";
import { SidebarLeft } from "./sidebar-left";
import { TopbarLayout } from "./top-nav";

export default function DashboardLayout() {
  const { mode } = useLayoutStore();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const sidebarState = getCookie("sidebar_state");
    if (sidebarState !== undefined) {
      setOpen(sidebarState === "true");
    }
  }, []);

  // ── Topbar layout ──
  if (mode === "topbar") {
    return (
      <TopbarLayout>
        <Outlet />
      </TopbarLayout>
    );
  }

  // ── Bottombar layout ──
  if (mode === "bottombar") {
    return (
      <BottombarLayout>
        <Outlet />
      </BottombarLayout>
    );
  }

  // ── Default: Sidebar layout ──
  return (
    <SidebarProvider defaultOpen={open}>
      <SidebarLeft />
      <SidebarInset className="relative flex-grow overflow-hidden">
        <Header />
        <div className="h-[calc(100vh-56px)] flex-grow gap-4 overflow-auto p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
