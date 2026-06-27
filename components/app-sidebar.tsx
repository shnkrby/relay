"use client"

import * as React from "react"
import { LayoutDashboardIcon, CheckSquareIcon, CalendarIcon, UsersIcon, Settings2Icon, CircleHelpIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { OrgSwitcher } from "@/app/(authenticated)/[orgSlug]/_components/org-switcher"

interface Org {
  id: string
  name: string
  slug: string
}

export function AppSidebar({
  currentOrg,
  userOrgs,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  currentOrg: Org
  userOrgs: Org[]
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
      title: "Events",
      url: `/${currentOrg.slug}/events`,
      icon: <CalendarIcon />,
    },
    {
      title: "Committees",
      url: `/${currentOrg.slug}/committees`,
      icon: <UsersIcon />,
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

  const user = {
    name: "User",
    email: "user@relay.com",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <OrgSwitcher currentOrg={currentOrg} userOrgs={userOrgs} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
