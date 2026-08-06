import * as React from "react";

import { NavMain } from "@/components/nav-main";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  FileSlidersIcon,
  Settings,
  UserCog,
  Users,
  FileText,
} from "lucide-react";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const session = await auth.api.getSession({
  headers: await headers(), // you need to pass the headers object.
});
if (!session) {
  redirect("/login");
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/org",
        icon: <LayoutDashboardIcon />,
      },
      {
        title: "invoice",
        url: "/org/invoice",
        icon: <FileText />,
      },
      {
        title: "clients",
        url: "/org/clients",
        icon: <Users />,
      },
      {
        title: "employee",
        url: "/org/employee",
        icon: <UserCog />,
      },
      {
        title: "settings",
        url: "/org/settings",
        icon: <Settings />,
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <FileSlidersIcon className="size-5!" />
              <span className="text-base font-semibold">InvoSend.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          name={session?.user.name as string}
          email={session?.user.email as string}
          avatar={session?.user.image as string}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
