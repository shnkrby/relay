import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutGridIcon } from 'lucide-react'
import Link from 'next/link'

interface Committee {
  id: string
  name: string
  logo_url: string | null
}

interface MyCommitteesPanelProps {
  committees: Committee[]
  orgSlug: string
}

export function MyCommitteesPanel({ committees, orgSlug }: MyCommitteesPanelProps) {
  return (
    <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <LayoutGridIcon className="size-5 text-purple-600" />
          <CardTitle className="text-lg">My Committees</CardTitle>
        </div>
        <Link 
          href={`/${orgSlug}/committees`}
          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {committees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
            <LayoutGridIcon className="size-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Not in any committees.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Join a committee to start participating.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {committees.map((committee) => (
              <div key={committee.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-bold overflow-hidden">
                  {committee.logo_url ? (
                    <img src={committee.logo_url} alt={committee.name} className="h-full w-full object-cover" />
                  ) : (
                    committee.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {committee.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
