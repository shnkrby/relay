"use client"

import * as React from "react"
import { LayoutDashboardIcon, CheckSquareIcon, CalendarIcon, UsersIcon, Settings2Icon, CircleHelpIcon, Building2Icon, ZapIcon, ShieldCheckIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Organization } from "@/types/database"
import { OrgSwitcher } from "@/components/relay/org-switcher"

type PickedOrg = Pick<Organization, 'id' | 'name' | 'slug'>

export function AppSidebar({
  currentOrg,
  userOrgs,
  role,
  userName,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  currentOrg: PickedOrg
  userOrgs: PickedOrg[]
  role: string
  userName: string
}) {
  const navMain = [
    {
      title: "Dashboard",
      url: `/${currentOrg.slug}`,
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Tasks",
      url: `/${currentOrg.slug}/tasks`,
      icon: <CheckSquareIcon />,
    },
    {
      title: "Leadership",
      url: `/${currentOrg.slug}/leadership`,
      icon: <ShieldCheckIcon />,
    },
    {
      title: "Events",
      url: `/${currentOrg.slug}/events`,
      icon: <CalendarIcon />,
    },
    {
      title: "Committees",
      url: `/${currentOrg.slug}/committees`,
      icon: <UsersIcon />,
    },
    {
      title: "Organizations",
      url: `/organizations`,
      icon: <Building2Icon />,
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: `/${currentOrg.slug}/settings`,
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/organizations" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <ZapIcon className="size-5 fill-current" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-lg tracking-tight">Relay</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <OrgSwitcher currentOrg={currentOrg} userOrgs={userOrgs} role={role} userName={userName} />
      </SidebarFooter>
    </Sidebar>
  )
}
