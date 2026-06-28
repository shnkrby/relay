'use client'

import { BellIcon, CheckCheckIcon, CalendarIcon, ZapIcon, UsersIcon, ShieldCheckIcon, UserPlusIcon } from 'lucide-react'
import { NotificationType } from '@/types/database'

interface NotificationItemProps {
  notification: {
    id: string
    type: NotificationType
    title: string
    message: string
    link: string | null
    is_read: boolean
    created_at: string
  }
  onClick?: () => void
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  task_assigned: <ZapIcon className="size-4" />,
  task_completed: <CheckCheckIcon className="size-4" />,
  duty_assigned: <CalendarIcon className="size-4" />,
  event_created: <CalendarIcon className="size-4" />,
  role_changed: <ShieldCheckIcon className="size-4" />,
  member_joined: <UserPlusIcon className="size-4" />,
}

const typeColors: Record<NotificationType, string> = {
  task_assigned: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  task_completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  duty_assigned: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  event_created: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  role_changed: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  member_joined: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer
        ${notification.is_read
          ? 'hover:bg-slate-50 dark:hover:bg-slate-900/30'
          : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
        }
      `}
    >
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${typeColors[notification.type]}`}>
        {typeIcons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${notification.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="size-2 rounded-full bg-blue-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </button>
  )
}
