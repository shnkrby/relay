"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { BellIcon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Organization } from "@/types/database"

type PickedOrg = Pick<Organization, 'id' | 'name' | 'slug'>

interface SiteHeaderProps {
  currentOrg: PickedOrg;
  role?: string;
}

export function SiteHeader({ currentOrg, role = "Member" }: SiteHeaderProps) {
  const pathname = usePathname()
  
  // Basic logic to determine current page name from URL
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  const pageName = lastSegment === segments[0] ? 'Dashboard' : lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) px-4 lg:px-6 bg-white dark:bg-slate-950">
      <div className="flex items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {currentOrg.name} / <span className="text-slate-900 dark:text-white font-semibold">{pageName}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            {role}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <BellIcon className="size-5" />
          <span className="absolute top-0 right-0 size-2 bg-blue-600 rounded-full border border-white dark:border-slate-950"></span>
        </button>
      </div>
    </header>
  )
}
