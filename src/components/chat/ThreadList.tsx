/**
 * ThreadList component for SolarIQ Chat (WK-028)
 *
 * Displays a list of chat threads with search, filtering, and selection.
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { ChatThread, ThreadStatus, SenderType } from '@/types/chat'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

// ============== Types ==============

interface ThreadListProps {
  threads: ChatThread[]
  selectedThreadId?: string
  isLoading?: boolean
  onSelectThread: (thread: ChatThread) => void
  onArchiveThread?: (threadId: string) => void
  className?: string
}

type FilterType = 'all' | 'unread' | 'mine'

// ============== Helper Functions ==============

function getStatusColor(status: ThreadStatus): string {
  switch (status) {
    case ThreadStatus.ACTIVE:
      return 'bg-green-100 text-green-800'
    case ThreadStatus.ARCHIVED:
      return 'bg-gray-100 text-gray-800'
    case ThreadStatus.CLOSED:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(
  status: ThreadStatus,
  t: ReturnType<typeof useTranslations<'chat'>>
): string {
  switch (status) {
    case ThreadStatus.ACTIVE:
      return t('statusActive')
    case ThreadStatus.ARCHIVED:
      return t('archived')
    case ThreadStatus.CLOSED:
      return t('statusClosed')
    default:
      return status
  }
}

function getLastMessageLabel(
  senderType: SenderType,
  t: ReturnType<typeof useTranslations<'chat'>>
): string {
  switch (senderType) {
    case SenderType.B2C:
      return t('customer')
    case SenderType.CONTRACTOR:
      return t('you')
    case SenderType.SYSTEM:
      return t('system')
    default:
      return ''
  }
}

// ============== Sub-Components ==============

interface ThreadItemProps {
  thread: ChatThread
  isSelected: boolean
  onClick: () => void
  t: ReturnType<typeof useTranslations<'chat'>>
}

function ThreadItem({ thread, isSelected, onClick, t }: ThreadItemProps) {
  const lastMessageTime = thread.lastMessageAt
    ? formatDistanceToNow(new Date(thread.lastMessageAt), {
        addSuffix: true,
        locale: th,
      })
    : ''

  const hasUnread = thread.unreadCount && thread.unreadCount > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors',
        isSelected && 'bg-blue-50 border-l-4 border-l-blue-500'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {thread.metadata?.customerName || t('customer')}
            </span>
            {hasUnread && (
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {thread.unreadCount}
              </span>
            )}
          </div>

          {/* Last message preview */}
          <p className="text-sm text-gray-600 truncate">
            {thread.lastMessageSender && (
              <span className="font-medium">
                {getLastMessageLabel(thread.lastMessageSender, t)}:{' '}
              </span>
            )}
            {thread.lastMessagePreview || ''}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-1">
            {thread.metadata?.propertyType && (
              <span className="text-xs text-gray-500">{thread.metadata.propertyType}</span>
            )}
            {thread.metadata?.systemSize && (
              <span className="text-xs text-gray-500">• {thread.metadata.systemSize} kW</span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1">
          <Badge className={getStatusColor(thread.status)}>
            {getStatusLabel(thread.status, t)}
          </Badge>
          <span className="text-xs text-gray-400">{lastMessageTime}</span>
        </div>
      </div>
    </button>
  )
}

// ============== Main Component ==============

export function ThreadList({
  threads,
  selectedThreadId,
  isLoading = false,
  onSelectThread,
  onArchiveThread: _onArchiveThread,
  className,
}: ThreadListProps) {
  const t = useTranslations('chat')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ThreadStatus | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<FilterType>('all')

  // Filter threads
  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      // Status filter
      if (statusFilter !== 'all' && thread.status !== statusFilter) {
        return false
      }

      // Assignee filter
      if (assigneeFilter === 'mine' && !thread.isAssignedToMe) {
        return false
      }
      if (assigneeFilter === 'unread' && (!thread.unreadCount || thread.unreadCount === 0)) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = thread.metadata?.customerName?.toLowerCase().includes(query)
        const matchesPreview = thread.lastMessagePreview?.toLowerCase().includes(query)
        const matchesLocation = thread.metadata?.location?.toLowerCase().includes(query)

        return matchesName || matchesPreview || matchesLocation
      }

      return true
    })
  }, [threads, searchQuery, statusFilter, assigneeFilter])

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('newConversation')}</h2>

        {/* Search */}
        <Input
          type="search"
          placeholder={t('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        {/* Filters */}
        <div className="flex gap-2 mt-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ThreadStatus | 'all')}
            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5"
          >
            <option value="all">{t('all')}</option>
            <option value={ThreadStatus.ACTIVE}>{t('statusActive')}</option>
            <option value={ThreadStatus.ARCHIVED}>{t('archived')}</option>
            <option value={ThreadStatus.CLOSED}>{t('statusClosed')}</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value as FilterType)}
            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5"
          >
            <option value="all">{t('all')}</option>
            <option value="mine">{t('assign')}</option>
            <option value="unread">{t('unread')}</option>
          </select>
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>{t('noConversations')}</p>
            {searchQuery && <p className="text-sm mt-1">{t('noConversationsDesc')}</p>}
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isSelected={thread.id === selectedThreadId}
              onClick={() => onSelectThread(thread)}
              t={t}
            />
          ))
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        {filteredThreads.length} {t('all').toLowerCase()}
        {threads.some((th) => th.unreadCount && th.unreadCount > 0) && (
          <span className="ml-2">
            • {threads.reduce((sum, th) => sum + (th.unreadCount || 0), 0)} {t('unread')}
          </span>
        )}
      </div>
    </div>
  )
}

export default ThreadList
