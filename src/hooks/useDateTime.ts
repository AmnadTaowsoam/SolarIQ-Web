'use client'

import { useFormatter } from 'next-intl'

export function useDateTime() {
  const format = useFormatter()

  function formatDate(date: Date | string): string {
    return format.dateTime(new Date(date), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function formatDateTime(date: Date | string): string {
    return format.dateTime(new Date(date), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatRelative(date: Date | string): string {
    return format.relativeTime(new Date(date))
  }

  return { formatDate, formatDateTime, formatRelative }
}
