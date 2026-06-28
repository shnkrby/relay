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
    <>
      {organizations.map((orgMember, index) => {
        const org = orgMember.organizations as any
        if (!org) return null
        
        return (
          <Link key={org.id || index} href={`/${org.slug}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Card className="h-full flex flex-col bg-card/70 backdrop-blur-md border border-border shadow-sm overflow-hidden group">
              <CardHeader className="flex flex-row items-start justify-between pb-2 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      <Building2Icon className="size-6" />
                    )}
                  </div>
                  <div className="space-y-1 mt-1">
                    <CardTitle className="text-xl font-bold leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{org.name}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center pt-1 font-medium">
                      <UsersIcon className="mr-1.5 size-4" />
                      Workspace
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`
                    ${orgMember.role === 'owner' ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20' : ''}
                    ${orgMember.role === 'admin' ? 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20' : ''}
                    ${orgMember.role === 'member' ? 'bg-secondary text-secondary-foreground border-border' : ''}
                    shadow-none font-semibold px-2.5 py-0.5
                  `}
                >
                  {(orgMember.role === 'owner' || orgMember.role === 'admin') && (
                    <ShieldIcon className="mr-1 size-3" />
                  )}
                  {orgMember.role.charAt(0).toUpperCase() + orgMember.role.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 relative z-10">
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {org.description || "Manage events, track progress, and coordinate tasks within this organization."}
                </p>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-colors duration-500 pointer-events-none" />
              <CardFooter className="pt-4 pb-4 px-6 mt-auto border-t border-border bg-muted/30 flex items-center justify-between relative z-10">
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center transition-all duration-300 group-hover:translate-x-1">
                  Enter Workspace <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        )
      })}
    </>
  )
}
