import Link from 'next/link'
import { Building2Icon, ChevronRightIcon, ShieldIcon, UsersIcon } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
            <Link key={org.id || index} href={`/${org.slug}`} className="block h-full">
              <Card className="shadow-sm flex flex-col h-full hover:border-blue-500 transition-colors group">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <Building2Icon className="size-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-semibold leading-none group-hover:text-blue-600 transition-colors">{org.name}</CardTitle>
                      <div className="text-sm text-muted-foreground flex items-center pt-1">
                        <UsersIcon className="mr-1.5 size-3.5" />
                        Workspace
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`
                      ${orgMember.role === 'owner' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none' : ''}
                      ${orgMember.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-none' : ''}
                      ${orgMember.role === 'member' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none' : ''}
                    `}
                  >
                    {(orgMember.role === 'owner' || orgMember.role === 'admin') && (
                      <ShieldIcon className="mr-1 size-3" />
                    )}
                    {orgMember.role.charAt(0).toUpperCase() + orgMember.role.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {org.description || "Manage events, track progress, and coordinate tasks within this organization."}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                    Enter Workspace <ChevronRightIcon className="ml-1 size-4" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
