'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CalendarIcon, MapIcon, ArrowRightIcon, CalendarDaysIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { Event } from '@/types/database'

import { EventActionsMenu } from './event-actions-menu'

interface EventListProps {
  events: Event[]
  orgSlug: string
  isAdmin: boolean
  orgId: string
}

export function EventList({ events, orgSlug, isAdmin, orgId }: EventListProps) {
  const [search, setSearch] = useState('')

  const filteredEvents = events.filter((event) => {
    const s = search.toLowerCase()
    return (
      event.title.toLowerCase().includes(s) ||
      (event.description && event.description.toLowerCase().includes(s))
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm mb-4">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search events..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <MapIcon className="size-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No events scheduled</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Events act as containers for massive tasks and cross-committee duties.
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-slate-500 dark:text-slate-400">No events match your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="shadow-sm flex flex-col group hover:border-blue-500 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`
                        shrink-0 capitalize
                        ${event.status === 'upcoming' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none' : ''}
                        ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none animate-pulse' : ''}
                        ${event.status === 'paused' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-none' : ''}
                        ${event.status === 'completed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none' : ''}
                        ${event.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none' : ''}
                      `}
                    >
                      {event.status}
                    </Badge>
                    {isAdmin && <EventActionsMenu event={event} orgId={orgId} orgSlug={orgSlug} />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {event.description || 'No description provided.'}
                </p>
                <div className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="size-3.5 text-blue-500" />
                    <span>
                      {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                      {' - '}
                      {event.end_date ? new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-slate-50/50 dark:bg-slate-900/20">
                <Link 
                  href={`/${orgSlug}/events/${event.id}`} 
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Open Operations Board
                  <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

