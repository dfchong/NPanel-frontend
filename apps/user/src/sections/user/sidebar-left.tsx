"use client";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
import { useNavs } from "@/layout/navs";

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navs = useNavs();
  return (
    <Sidebar collapsible="none" side="left" {...props}>
      <SidebarContent>
        <SidebarMenu>
          {navs.map((nav) => (
            <SidebarGroup key={nav.title}>
              {nav.items && <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {(nav.items || [nav]).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.url === location.pathname}
                        tooltip={item.title}
                      >
                        <Link to={item.url || "/"}>
                          {item.icon && <Icon icon={item.icon} />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
