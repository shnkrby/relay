import Link from 'next/link'
import { Building2, ChevronRight } from 'lucide-react'

type OrgListProps = {
  organizations: {
    role: string
    organizations: {
      id: string
      name: string
      slug: string
      logo_url: string | null
    }
  }[]
}

export function OrgList({ organizations }: OrgListProps) {
  if (!organizations || organizations.length === 0) {
    return null
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((orgMember, index) => {
          // Supabase joins return the joined table as an object (or array depending on relationship).
          // For a foreign key relation, it's an object.
          const org = orgMember.organizations as any
          if (!org) return null
          
          return (
            <Link key={org.id || index} href={`/${org.slug}`}>
              <div className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-primary hover:shadow-md dark:bg-slate-900 dark:border-slate-800 h-full">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <Building2 className="size-6" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {org.name}
                    </h3>
                    <p className="text-sm text-slate-500 capitalize">{orgMember.role}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Enter Workspace <ChevronRight className="ml-1 size-4" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
