'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, MapIcon, ArrowRightIcon, CalendarDaysIcon } from 'lucide-react'
import Link from 'next/link'
import { Event } from '@/types/database'

interface EventListProps {
  events: Event[]
  orgSlug: string
  isAdmin: boolean
}

export function EventList({ events, orgSlug, isAdmin }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <MapIcon className="size-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No events scheduled</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Events act as containers for massive tasks and cross-committee duties.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="shadow-sm flex flex-col group hover:border-blue-500 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors">
                {event.title}
              </CardTitle>
              <Badge 
                variant="secondary" 
                className={`
                  shrink-0 capitalize
                  ${event.status === 'upcoming' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none' : ''}
                  ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none animate-pulse' : ''}
                  ${event.status === 'completed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none' : ''}
                  ${event.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none' : ''}
                `}
              >
                {event.status}
              </Badge>
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
  )
}
