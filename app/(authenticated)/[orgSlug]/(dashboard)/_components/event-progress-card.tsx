"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChartIcon, ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface EventProgressData {
  id: string
  title: string
  status: string
  startDate: string | null
  endDate: string | null
  completedTasks: number
  totalTasks: number
}

interface EventProgressCardProps {
  events: EventProgressData[]
  orgSlug: string
}

const progressColors = [
  { bar: 'bg-blue-500', ring: 'text-blue-500', bg: 'bg-blue-500/10' },
  { bar: 'bg-purple-500', ring: 'text-purple-500', bg: 'bg-purple-500/10' },
  { bar: 'bg-emerald-500', ring: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { bar: 'bg-orange-500', ring: 'text-orange-500', bg: 'bg-orange-500/10' },
]

function RadialProgress({ percent, colorClass, size = 48 }: { percent: number, colorClass: string, size?: number }) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={colorClass}
          style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">
        {Math.round(percent)}%
      </span>
    </div>
  )
}

export function EventProgressCards({ events, orgSlug }: EventProgressCardProps) {
  return (
    <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChartIcon className="size-5 text-purple-600" />
          <CardTitle className="text-lg">Event Progress</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          render={<Link href={`/${orgSlug}/events`} />}
          nativeButton={false}
        >
          All Events
          <ArrowRightIcon className="size-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChartIcon className="size-10 text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No active events.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Events will appear here once created.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const color = progressColors[index % progressColors.length]
              const percent = event.totalTasks > 0
                ? (event.completedTasks / event.totalTasks) * 100
                : 0

              return (
                <Link
                  key={event.id}
                  href={`/${orgSlug}/events/${event.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                >
                  <RadialProgress percent={percent} colorClass={color.ring} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 capitalize border-none
                          ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                          ${event.status === 'upcoming' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                          ${event.status === 'completed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : ''}
                        `}
                      >
                        {event.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {event.completedTasks}/{event.totalTasks} tasks
                      </span>
                    </div>
                  </div>
                  <ArrowRightIcon className="size-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
