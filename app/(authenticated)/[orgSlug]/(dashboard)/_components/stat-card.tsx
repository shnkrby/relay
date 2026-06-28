"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: ReactNode
  accent?: 'default' | 'red' | 'green' | 'blue' | 'purple' | 'amber'
}

const accentStyles = {
  default: {
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconText: 'text-slate-600 dark:text-slate-300',
    valueBg: '',
  },
  red: {
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconText: 'text-red-600 dark:text-red-400',
    valueBg: 'text-red-600 dark:text-red-400',
  },
  green: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    valueBg: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    valueBg: '',
  },
  purple: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconText: 'text-purple-600 dark:text-purple-400',
    valueBg: '',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    valueBg: '',
  },
}

export function StatCard({ title, value, subtitle, icon, accent = 'default' }: StatCardProps) {
  const styles = accentStyles[accent]

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-slate-200/80 dark:border-slate-800/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {title}
        </CardTitle>
        <div className={`flex size-8 items-center justify-center rounded-lg ${styles.iconBg}`}>
          <div className={`size-4 ${styles.iconText}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold text-slate-900 dark:text-white ${styles.valueBg}`}>
          {value}
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}
