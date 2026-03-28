'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import clsx from 'clsx'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Notification {
  id: string
  type: 'lead' | 'proposal' | 'payment' | 'report' | 'system'
  titleKey: string
  descriptionKey: string
  timestampKey: string
  timestampParams?: Record<string, number>
  read: boolean
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Demo notifications
// ---------------------------------------------------------------------------

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'proposal',
    titleKey: 'dealUpdated',
    descriptionKey: 'dealUpdated',
    timestampKey: 'minutesAgo',
    timestampParams: { minutes: 5 },
    read: false,
  },
  {
    id: '2',
    type: 'lead',
    titleKey: 'leadAssigned',
    descriptionKey: 'leadAssigned',
    timestampKey: 'minutesAgo',
    timestampParams: { minutes: 15 },
    read: false,
  },
  {
    id: '3',
    type: 'report',
    titleKey: 'serviceRequest',
    descriptionKey: 'serviceRequest',
    timestampKey: 'hoursAgo',
    timestampParams: { hours: 1 },
    read: false,
  },
  {
    id: '4',
    type: 'payment',
    titleKey: 'invoicePaid',
    descriptionKey: 'invoicePaid',
    timestampKey: 'hoursAgo',
    timestampParams: { hours: 3 },
    read: true,
  },
  {
    id: '5',
    type: 'lead',
    titleKey: 'dealUpdated',
    descriptionKey: 'dealUpdated',
    timestampKey: 'hoursAgo',
    timestampParams: { hours: 5 },
    read: true,
  },
  {
    id: '6',
    type: 'system',
    titleKey: 'systemAlert',
    descriptionKey: 'systemAlert',
    timestampKey: 'daysAgo',
    timestampParams: { days: 1 },
    read: true,
  },
]

// ---------------------------------------------------------------------------
// Notification type icon map
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<Notification['type'], { bg: string; icon: React.ReactNode }> = {
  lead: {
    bg: 'bg-blue-50 text-blue-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
        />
      </svg>
    ),
  },
  proposal: {
    bg: 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)]',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  payment: {
    bg: 'bg-green-50 text-green-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
  },
  report: {
    bg: 'bg-purple-50 text-purple-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  system: {
    bg: 'bg-gray-100 text-gray-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
}

// ---------------------------------------------------------------------------
// Hook: useNotificationCount (used by Navbar)
// ---------------------------------------------------------------------------

export function useNotificationCount() {
  // In production, this would come from an API or WebSocket
  return DEMO_NOTIFICATIONS.filter((n) => !n.read).length
}

// ---------------------------------------------------------------------------
// NotificationPanel — Slide-out panel from right
// ---------------------------------------------------------------------------

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS)
  const tNotifications = useTranslations('notifications')

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-[2px]" onClick={onClose} />
      )}

      {/* Slide-out panel */}
      <div
        className={clsx(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl border-l border-gray-200/80',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">{tNotifications('title')}</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-[var(--brand-primary)] rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary)] px-2.5 py-1.5 hover:bg-[var(--brand-primary-light)] rounded-lg transition-colors"
              >
                {tNotifications('markAllRead')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">
                {tNotifications('noNotifications')}
              </p>
              <p className="text-xs text-gray-400 mt-1">{tNotifications('noNotificationsDesc')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => {
                const config = TYPE_CONFIG[notification.type]
                return (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={clsx(
                      'w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50/80',
                      !notification.read && 'bg-[var(--brand-primary-light)]'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        config.bg
                      )}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={clsx(
                            'text-sm leading-snug',
                            notification.read ? 'text-gray-700' : 'text-gray-900 font-semibold'
                          )}
                        >
                          {tNotifications(notification.titleKey)}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-[var(--brand-primary)] rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {tNotifications(notification.descriptionKey)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {tNotifications(notification.timestampKey, notification.timestampParams)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
