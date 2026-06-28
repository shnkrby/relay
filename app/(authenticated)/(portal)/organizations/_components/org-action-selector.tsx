'use client'

import { JoinOrgDialog } from './join-org-dialog'
import { CreateOrgDialog } from './create-org-dialog'
import { HashIcon, PlusIcon } from 'lucide-react'

export function OrgActionSelector() {
  return (
    <>
      <JoinOrgDialog>
        <button className="flex flex-col items-center justify-center h-full min-h-[240px] w-full rounded-xl border-2 border-dashed border-border bg-transparent hover:bg-muted/50 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            <HashIcon className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Join Organization</h3>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-[200px]">Have a code? Join your team's workspace.</p>
        </button>
      </JoinOrgDialog>
      
      <CreateOrgDialog>
        <button className="flex flex-col items-center justify-center h-full min-h-[240px] w-full rounded-xl border-2 border-dashed border-border bg-transparent hover:bg-muted/50 hover:border-purple-500/50 dark:hover:border-purple-400/50 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
          <div className="flex size-14 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
            <PlusIcon className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Start New Organization</h3>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-[200px]">Create a fresh workspace for your team.</p>
        </button>
      </CreateOrgDialog>
    </>
  )
}
