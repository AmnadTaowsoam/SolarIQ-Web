'use client'

/**
 * Messages / Communication Hub page (WK-028)
 * Full contractor communication hub with thread list, chat area, and info panel
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { th } from 'date-fns/locale'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useThreads, useMessages, useSendMessage } from '@/hooks/useMessages'
import type { MessageThread, Message, InternalNote } from '@/hooks/useMessages'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { ChatInput } from '@/components/chat/ChatInput'

// ============== Helpers ==============

function getInitialsColor(name: string): string {
  const colors = [
    'bg-orange-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-teal-400',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function formatThreadTime(date: Date, yesterday: string): string {
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: th })
  }
  if (isYesterday(date)) {
    return yesterday
  }
  return format(date, 'd MMM', { locale: th })
}

function formatMessageDate(date: Date, today: string, yesterday: string): string {
  if (isToday(date)) {
    return today
  }
  if (isYesterday(date)) {
    return yesterday
  }
  return format(date, 'd MMMM yyyy', { locale: th })
}

function groupMessagesByDate(
  messages: Message[],
  today: string,
  yesterday: string
): { date: string; messages: Message[] }[] {
  const groups: Record<string, Message[]> = {}
  messages.forEach((msg) => {
    const key = formatMessageDate(new Date(msg.createdAt), today, yesterday)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(msg)
  })
  return Object.entries(groups).map(([date, messages]) => ({ date, messages }))
}

// ============== Thread List Panel ==============

type FilterTab = 'all' | 'unread' | 'active' | 'completed'

function ThreadListPanel({
  threads,
  selectedId,
  onSelect,
  isDemoMode,
  onNewConversation,
}: {
  threads: MessageThread[]
  selectedId: string | null
  onSelect: (t: MessageThread) => void
  isDemoMode: boolean
  onNewConversation: () => void
}) {
  const t = useTranslations('messagesPage')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  const filtered = threads.filter((th) => {
    if (search && !th.customerName.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (filter === 'unread' && th.unreadCount === 0) {
      return false
    }
    if (filter === 'active' && th.status !== 'active') {
      return false
    }
    if (filter === 'completed' && th.status !== 'completed') {
      return false
    }
    return true
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('filters.all') },
    { key: 'unread', label: t('filters.unread') },
    { key: 'active', label: t('filters.active') },
    { key: 'completed', label: t('filters.completed') },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">{t('title')}</h2>
          {isDemoMode && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Demo
            </span>
          )}
        </div>
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'flex-shrink-0 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap',
              filter === tab.key
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tab.key === 'unread' && threads.some((t) => t.unreadCount > 0) && (
              <span className="ml-1 w-4 h-4 inline-flex items-center justify-center text-[10px] bg-orange-500 text-white rounded-full">
                {threads.reduce((s, t) => s + t.unreadCount, 0)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <svg
              className="w-10 h-10 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm text-gray-500">{t('noConversations')}</p>
          </div>
        ) : (
          filtered.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onSelect(thread)}
              className={cn(
                'w-full px-4 py-3.5 text-left border-b border-gray-50 hover:bg-orange-50/50 transition-colors',
                selectedId === thread.id && 'bg-orange-50 border-l-2 border-l-orange-500'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                    getInitialsColor(thread.customerName)
                  )}
                >
                  {thread.customerInitials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-sm truncate',
                        thread.unreadCount > 0
                          ? 'font-bold text-gray-900'
                          : 'font-medium text-gray-800'
                      )}
                    >
                      {thread.customerName}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {formatThreadTime(new Date(thread.lastMessageTime), t('yesterday'))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5 gap-2">
                    <p
                      className={cn(
                        'text-xs truncate flex-1',
                        thread.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                      )}
                    >
                      {thread.lastMessage || t('noMessages')}
                    </p>
                    {thread.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="mt-1">
                    <span
                      className={cn(
                        'inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                        thread.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : thread.status === 'completed'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      {thread.status === 'active'
                        ? t('status.active')
                        : thread.status === 'completed'
                          ? t('status.completed')
                          : t('status.pending')}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* New conversation button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {t('startNewConversation')}
        </button>
      </div>
    </div>
  )
}

// ============== Chat Area Panel ==============

function ChatAreaPanel({
  thread,
  messages,
  isLoading,
  onSend,
}: {
  thread: MessageThread | null
  messages: Message[]
  isLoading: boolean
  onSend: (content: string) => void
}) {
  const t = useTranslations('messagesPage')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTypingIndicator, _setIsTypingIndicator] = useState(false)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center px-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-orange-500"
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
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">{t('selectConversation')}</h3>
        <p className="text-sm text-gray-500">{t('selectConversationHint')}</p>
      </div>
    )
  }

  const grouped = groupMessagesByDate(messages, t('today'), t('yesterday'))

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold',
              getInitialsColor(thread.customerName)
            )}
          >
            {thread.customerInitials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{thread.customerName}</h3>
            <div className="flex items-center gap-2">
              {thread.leadId && (
                <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                  Lead #{thread.leadId.slice(-4)}
                </span>
              )}
              {thread.dealId && (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  Deal #{thread.dealId.slice(-4)}
                </span>
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  thread.status === 'active'
                    ? 'text-green-600'
                    : thread.status === 'completed'
                      ? 'text-gray-500'
                      : 'text-yellow-600'
                )}
              >
                {thread.status === 'active'
                  ? `• ${t('status.active')}`
                  : thread.status === 'completed'
                    ? `• ${t('status.completed')}`
                    : `• ${t('status.pending')}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {thread.leadId && (
            <a
              href={`/leads/${thread.leadId}`}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              {t('viewLeadDetail')}
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-12 h-12 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm text-gray-500">{t('startConversation')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('sendMessagePrompt')}</p>
          </div>
        ) : (
          <>
            {grouped.map(({ date, messages: dayMessages }) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 rounded-full px-4 py-1 text-[11px] text-gray-500 font-medium">
                    {date}
                  </div>
                </div>
                {dayMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            ))}

            {/* Typing indicator */}
            {isTypingIndicator && (
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{t('typingIndicator')}</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        onTypingStart={() => {}}
        onTypingStop={() => {}}
        disabled={thread.status === 'completed'}
        placeholder={
          thread.status === 'completed' ? t('conversationCompleted') : t('inputPlaceholder')
        }
      />
    </div>
  )
}

// ============== Info Panel ==============

function InfoPanel({
  thread,
  notes,
  onAddNote,
}: {
  thread: MessageThread | null
  notes: InternalNote[]
  onAddNote: (content: string) => void
}) {
  const t = useTranslations('messagesPage')
  const [activeTab, setActiveTab] = useState<'info' | 'notes'>('info')
  const [newNote, setNewNote] = useState('')

  if (!thread) {
    return null
  }

  const handleAddNote = () => {
    if (!newNote.trim()) {
      return
    }
    onAddNote(newNote.trim())
    setNewNote('')
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['info', 'notes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 text-xs font-semibold transition-colors',
              activeTab === tab
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'info' ? t('infoPanel.customerInfo') : t('infoPanel.internalNotes')}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' ? (
          <div className="p-4 space-y-4">
            {/* Customer info */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {t('infoPanel.customerInfo')}
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                      getInitialsColor(thread.customerName)
                    )}
                  >
                    {thread.customerInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{thread.customerName}</p>
                  </div>
                </div>

                {thread.customerPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.25 6.338c0 5.697 3.402 10.607 8.316 12.845M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591l4.682 4.682m-4.682-4.682c-.982-1.5-1.66-3.234-1.946-5.11M15 6.338V3.104m0 3.234l2.5-2.5"
                      />
                    </svg>
                    <span className="font-medium">{thread.customerPhone}</span>
                    <span className="text-xs text-gray-400">(masked)</span>
                  </div>
                )}

                {thread.customerEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    <span>{thread.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Lead / Deal */}
            {(thread.leadId || thread.dealId) && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t('infoPanel.relatedLeadDeal')}
                </h4>
                <div className="space-y-2">
                  {thread.leadId && (
                    <div className="flex items-center justify-between p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                      <div>
                        <p className="text-xs font-semibold text-orange-800">Lead</p>
                        <p className="text-xs text-orange-700">
                          {thread.leadStatus === 'new'
                            ? t('leadStatus.new')
                            : thread.leadStatus === 'quoted'
                              ? t('leadStatus.quoted')
                              : thread.leadStatus === 'won'
                                ? t('leadStatus.won')
                                : thread.leadStatus}
                        </p>
                      </div>
                      <a
                        href={`/leads/${thread.leadId}`}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 underline"
                      >
                        {t('infoPanel.viewLead')}
                      </a>
                    </div>
                  )}
                  {thread.dealId && (
                    <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-100">
                      <div>
                        <p className="text-xs font-semibold text-green-800">Deal</p>
                        <p className="text-xs text-green-700">
                          {thread.dealStage === 'closed_won'
                            ? t('dealStage.closed_won')
                            : thread.dealStage}
                        </p>
                      </div>
                      <a
                        href={`/deals/${thread.dealId}`}
                        className="text-xs font-medium text-green-600 hover:text-green-700 underline"
                      >
                        {t('infoPanel.viewDeal')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('infoPanel.notesVisibleToTeam')}
            </h4>

            {/* Notes list */}
            {notes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">{t('infoPanel.noNotesYet')}</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    'p-3 rounded-lg border text-xs',
                    note.pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'
                  )}
                >
                  {note.pinned && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <svg
                        className="w-3 h-3 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16 4l-4 4-4-4L4 8l4 4-4 4 4 4 4-4 4 4 4-4-4-4 4-4z" />
                      </svg>
                      <span className="text-yellow-600 font-semibold">{t('infoPanel.pinned')}</span>
                    </div>
                  )}
                  <p className="text-gray-800 leading-relaxed">{note.content}</p>
                  <p className="text-gray-400 mt-1.5">
                    {note.authorName} •{' '}
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: th })}
                  </p>
                </div>
              ))
            )}

            {/* Add note */}
            <div className="mt-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t('infoPanel.addNotePlaceholder')}
                rows={3}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 w-full py-2 text-xs font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('infoPanel.saveNote')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============== Main Page ==============

export default function MessagesPage() {
  const t = useTranslations('messagesPage')
  const tc = useTranslations('common')
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [localNotes, setLocalNotes] = useState<InternalNote[]>([])
  const [mobileView, setMobileView] = useState<'threads' | 'chat'>('threads')

  const { threads, isLoading: _threadsLoading, isDemoMode } = useThreads()
  const { messages, notes, isLoading: messagesLoading } = useMessages(selectedThread?.id || null)
  const { sendMessage, addNote } = useSendMessage(selectedThread?.id || null)

  // Sync messages/notes from hook to local state
  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  useEffect(() => {
    setLocalNotes(notes)
  }, [notes])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  const handleSelectThread = useCallback((thread: MessageThread) => {
    setSelectedThread(thread)
    setMobileView('chat')
  }, [])

  const handleSendMessage = useCallback(
    async (content: string) => {
      const sent = await sendMessage(content)
      if (sent) {
        setLocalMessages((prev) => [...prev, sent])
      }
    },
    [sendMessage]
  )

  const handleAddNote = useCallback(
    async (content: string) => {
      const note = await addNote(content)
      if (note) {
        setLocalNotes((prev) => [...prev, note])
      }
    },
    [addNote]
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) {
    return null
  }

  return (
    <AppLayout user={user}>
      {/* Override AppLayout padding for full-height chat */}
      <div className="-m-4 lg:-m-6 xl:-m-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Demo banner */}
        {isDemoMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs flex-shrink-0">
            <svg
              className="w-4 h-4 text-amber-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-amber-800 font-medium">{t('demoMode')}</span>
          </div>
        )}

        {/* 3-column layout */}
        <div className="flex flex-1 min-h-0">
          {/* Thread list — 300px */}
          <div
            className={cn(
              'w-[300px] flex-shrink-0 min-h-0',
              'hidden lg:flex lg:flex-col',
              mobileView === 'threads' && 'flex flex-col w-full lg:w-[300px]'
            )}
          >
            <ThreadListPanel
              threads={threads}
              selectedId={selectedThread?.id || null}
              onSelect={handleSelectThread}
              isDemoMode={isDemoMode}
              onNewConversation={() => {
                const newThread: MessageThread = {
                  id: `thread-new-${Date.now()}`,
                  customerName: 'New Conversation',
                  customerAvatar: '',
                  lastMessage: '',
                  lastMessageAt: new Date().toISOString(),
                  unreadCount: 0,
                  status: 'active' as const,
                  channel: 'line' as const,
                }
                setSelectedThread(newThread)
                setLocalMessages([])
                setLocalNotes([])
                setMobileView('chat')
              }}
            />
          </div>

          {/* Mobile back button overlay */}
          {mobileView === 'chat' && (
            <div className="lg:hidden fixed top-16 left-0 z-10 p-2">
              <button
                onClick={() => setMobileView('threads')}
                className="flex items-center gap-1 px-3 py-2 bg-white shadow-md rounded-full text-sm font-medium text-gray-700 border border-gray-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                {tc('back')}
              </button>
            </div>
          )}

          {/* Chat area — flex-1 */}
          <div
            className={cn(
              'flex-1 min-h-0 min-w-0',
              mobileView === 'threads' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
            )}
          >
            <ChatAreaPanel
              thread={selectedThread}
              messages={localMessages}
              isLoading={messagesLoading}
              onSend={handleSendMessage}
            />
          </div>

          {/* Info panel — 280px (desktop only) */}
          {selectedThread && (
            <div className="hidden xl:flex xl:flex-col w-[280px] flex-shrink-0 min-h-0">
              <InfoPanel thread={selectedThread} notes={localNotes} onAddNote={handleAddNote} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
