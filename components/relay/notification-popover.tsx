'use client'

import { useState, useTransition } from 'react'
import { BellIcon, CheckCheckIcon, BellOffIcon } from 'lucide-react'
import { NotificationItem } from './notification-item'
import { markNotificationsRead, markAllNotificationsRead } from '@/app/(authenticated)/[orgSlug]/(dashboard)/_actions/mark-notifications-read'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NotificationPopoverProps {
  notifications: any[]
  unreadCount: number
  orgId: string
  orgSlug: string
}

export function NotificationPopover({ notifications, unreadCount, orgId, orgSlug }: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleNotificationClick(notification: any) {
    // Mark as read
    if (!notification.is_read) {
      startTransition(async () => {
        await markNotificationsRead([notification.id], orgSlug)
      })
    }

    // Navigate if there's a link
    if (notification.link) {
      router.push(notification.link)
      setIsOpen(false)
    }
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead(orgId, orgSlug)
    })
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-blue-600 rounded-full border-2 border-white dark:border-slate-950">
            <span className="text-[9px] font-bold text-white leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Popover */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 md:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 h-7"
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                >
                  <CheckCheckIcon className="size-3" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BellOffIcon className="size-8 text-slate-200 dark:text-slate-700 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    You'll be notified when something happens.
                  </p>
                </div>
              ) : (
                <div className="p-1 space-y-0.5">
                  {notifications.map((notification: any) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
