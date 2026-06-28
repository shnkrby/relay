"use client"

import * as React from "react"
import { LayoutDashboardIcon, CheckSquareIcon, CalendarIcon, UsersIcon, Building2Icon, ZapIcon, ShieldCheckIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { Organization } from "@/types/database"
import { OrgSwitcher } from "@/components/relay/org-switcher"
import { EntityLogo } from "@/components/relay/entity-logo"

type PickedOrg = Pick<Organization, 'id' | 'name' | 'slug' | 'logo_url'>

export function AppSidebar({
  currentOrg,
  userOrgs,
  role,
  userName,
  avatarUrl,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  currentOrg: PickedOrg
  userOrgs: PickedOrg[]
  role: string
  userName: string
  avatarUrl?: string | null
}) {
  const navMain = [
    {
      title: "Dashboard",
      url: `/${currentOrg.slug}`,
      icon: <LayoutDashboardIcon />,
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
      title: "Duties",
      url: `/${currentOrg.slug}/duties`,
      icon: <CheckSquareIcon />,
    },
    {
      title: "Committees",
      url: `/${currentOrg.slug}/committees`,
      icon: <UsersIcon />,
    },

    {
      title: "Organization",
      url: `/${currentOrg.slug}/organization`,
      icon: <Building2Icon />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/organizations" />}>
              <div className="flex aspect-square size-8 items-center justify-center">
                <Image src="/logo.png" alt="Relay Logo" width={32} height={32} className="rounded-lg" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-lg tracking-tight">Relay</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <OrgSwitcher currentOrg={currentOrg} userOrgs={userOrgs} role={role} userName={userName} avatarUrl={avatarUrl} />
      </SidebarFooter>
    </Sidebar>
  )
}
