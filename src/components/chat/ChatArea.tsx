/**
 * ChatArea component for SolarIQ Chat (WK-028)
 *
 * Main chat area displaying messages and input for sending new messages.
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ChatMessage, ChatThread, ContentType, SenderType, FileAttachment } from '@/types/chat'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// ============== Types ==============

interface ChatAreaProps {
  thread: ChatThread | null
  messages: ChatMessage[]
  isLoading?: boolean
  hasMore?: boolean
  typingUsers?: string[]
  onSendMessage: (content: string, contentType?: ContentType) => void
  onLoadMore?: () => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  onMarkAsRead?: () => void
  className?: string
}

// ============== Helper Functions ==============

function formatMessageTime(date: Date): string {
  return format(new Date(date), 'HH:mm', { locale: th })
}

function formatMessageDate(date: Date): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: th })
}

function groupMessagesByDate(messages: ChatMessage[]): Map<string, ChatMessage[]> {
  const groups = new Map<string, ChatMessage[]>()

  messages.forEach((message) => {
    const dateKey = formatMessageDate(message.createdAt)
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    groups.get(dateKey)!.push(message)
  })

  return groups
}

// ============== Sub-Components ==============

interface MessageBubbleProps {
  message: ChatMessage
  showAvatar?: boolean
  onReply?: () => void
}

function MessageBubble({ message, showAvatar = true, onReply: _onReply }: MessageBubbleProps) {
  const isOwn = message.senderType === SenderType.CONTRACTOR
  const isSystem = message.senderType === SenderType.SYSTEM

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-[var(--brand-background)] rounded-full px-4 py-2 text-sm text-[var(--brand-text-secondary)]">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
          {message.senderType === SenderType.B2C ? 'C' : 'C'}
        </div>
      )}

      {/* Message content */}
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-3 py-2',
          isOwn ? 'bg-blue-500 text-white' : 'bg-[var(--brand-background)] text-[var(--brand-text)]'
        )}
      >
        {/* Reply indicator */}
        {message.replyTo && (
          <div
            className={cn(
              'text-xs mb-1 px-2 py-1 rounded border-l-2',
              isOwn
                ? 'bg-blue-600 border-blue-300 text-blue-100'
                : 'bg-[var(--brand-border)] border-gray-400 text-[var(--brand-text-secondary)]'
            )}
          >
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Content based on type */}
        {renderMessageContent(message, isOwn)}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment: FileAttachment, idx: number) => (
              <MessageAttachment key={idx} attachment={attachment} isOwn={isOwn} />
            ))}
          </div>
        )}

        {/* Time and status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOwn ? 'text-blue-100' : 'text-[var(--brand-text-secondary)]'
          )}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && message.isRead && (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

function renderMessageContent(message: ChatMessage, isOwn: boolean) {
  switch (message.contentType) {
    case ContentType.IMAGE:
      return (
        <div className="rounded overflow-hidden">
          {/* eslint-disable @next/next/no-img-element */}
          {message.attachments?.[0]?.url && (
            <img
              src={message.attachments[0].url}
              alt="Shared image"
              className="max-w-full cursor-pointer hover:opacity-90"
              onClick={() => window.open(message.attachments?.[0]?.url || '', '_blank')}
            />
          )}
          {/* eslint-enable @next/next/no-img-element */}
          {message.content && <p className="mt-2">{message.content}</p>}
        </div>
      )

    case ContentType.LOCATION:
      return (
        <div className={cn('rounded p-3', isOwn ? 'bg-blue-600' : 'bg-[var(--brand-border)]')}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">{message.location?.address}</span>
          </div>
          {message.location?.lat && message.location?.lng && (
            <a
              href={`https://www.google.com/maps?q=${message.location.lat},${message.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('text-xs mt-1 block', isOwn ? 'text-blue-200' : 'text-blue-600')}
            >
              Google Maps
            </a>
          )}
        </div>
      )

    case ContentType.QUOTE_CARD:
      return (
        <div
          className={cn(
            'rounded p-3 border',
            isOwn
              ? 'bg-blue-600 border-blue-400'
              : 'bg-[var(--brand-surface)] border-[var(--brand-border)]'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="font-medium"></span>
          </div>
          {message.quoteData && (
            <>
              <p className="text-lg font-bold">{message.quoteData.systemSize} kW</p>
              <p className="text-sm">฿{message.quoteData.totalPrice.toLocaleString()}</p>
              {message.quoteData.validUntil && (
                <p
                  className={cn(
                    'text-xs mt-1',
                    isOwn ? 'text-blue-200' : 'text-[var(--brand-text-secondary)]'
                  )}
                >
                  {format(new Date(message.quoteData.validUntil), 'd MMM yyyy', {
                    locale: th,
                  })}
                </p>
              )}
            </>
          )}
        </div>
      )

    case ContentType.DOCUMENT:
      return (
        <div className={cn('rounded p-3', isOwn ? 'bg-blue-600' : 'bg-[var(--brand-border)]')}>
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p className="font-medium text-sm">{message.attachments?.[0]?.fileName || ''}</p>
              {message.attachments?.[0]?.fileSize && (
                <p className="text-xs opacity-75">
                  {(message.attachments[0].fileSize / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>
        </div>
      )

    default:
      return <p className="whitespace-pre-wrap break-words">{message.content}</p>
  }
}

interface MessageAttachmentProps {
  attachment: FileAttachment
  isOwn: boolean
}

function MessageAttachment({ attachment, isOwn }: MessageAttachmentProps) {
  const isImage = attachment.mimeType.startsWith('image/')

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.url}
        alt={attachment.fileName}
        className="max-w-full rounded cursor-pointer hover:opacity-90"
        onClick={() => window.open(attachment.url, '_blank')}
      />
    )
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-2 p-2 rounded',
        isOwn ? 'bg-blue-600' : 'bg-[var(--brand-border)]'
      )}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span className="text-sm truncate">{attachment.fileName}</span>
    </a>
  )
}

interface TypingIndicatorProps {
  users: string[]
}

function TypingIndicator({
  users,
  t,
}: TypingIndicatorProps & { t: ReturnType<typeof useTranslations> }) {
  if (users.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-sm text-[var(--brand-text-secondary)]">{t('typing')}</span>
    </div>
  )
}

interface DateSeparatorProps {
  date: string
}

function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-[var(--brand-background)] rounded-full px-4 py-1 text-xs text-[var(--brand-text-secondary)]">
        {date}
      </div>
    </div>
  )
}

interface MessageInputProps {
  onSend: (content: string) => void
  onTypingStart: () => void
  onTypingStop: () => void
  disabled?: boolean
  placeholder?: string
}

function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder,
}: MessageInputProps) {
  const t = useTranslations('chat')
  const [message, setMessage] = useState('')
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    onTypingStart()

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop()
    }, 3000)
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
      onTypingStop()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 p-4 border-t border-[var(--brand-border)] bg-[var(--brand-surface)]">
      {/* Attachment button */}
      <button
        className="p-2 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-background)] rounded-full"
        title={t('attachFile')}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </button>

      {/* Input field */}
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder ?? t('typeMessage')}
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-[var(--brand-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-[var(--brand-background)]"
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  )
}

// ============== Main Component ==============

export function ChatArea({
  thread,
  messages,
  isLoading = false,
  hasMore = false,
  typingUsers = [],
  onSendMessage,
  onLoadMore,
  onTypingStart,
  onTypingStop,
  onMarkAsRead,
  className,
}: ChatAreaProps) {
  const t = useTranslations('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, shouldAutoScroll])

  // Mark as read when viewing messages
  useEffect(() => {
    if (thread && onMarkAsRead) {
      onMarkAsRead()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread?.id, onMarkAsRead])

  // Handle scroll to detect if user is at bottom
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShouldAutoScroll(isAtBottom)

    // Load more when scrolled to top
    if (scrollTop < 50 && hasMore && onLoadMore) {
      onLoadMore()
    }
  }, [hasMore, onLoadMore])

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className={cn('flex flex-col h-full bg-[var(--brand-background)]', className)}>
      {/* Thread header */}
      {thread && (
        <div className="px-4 py-3 border-b border-[var(--brand-border)] bg-[var(--brand-surface)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--brand-text)]">
                {thread.metadata?.customerName || t('customer')}
              </h3>
              <p className="text-sm text-[var(--brand-text-secondary)]">
                {thread.metadata?.propertyType}
                {thread.metadata?.systemSize && ` • ${thread.metadata.systemSize} kW`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  thread.status === 'active'
                    ? 'bg-green-500/10 text-green-800'
                    : thread.status === 'archived'
                      ? 'bg-[var(--brand-background)] text-[var(--brand-text)]'
                      : 'bg-red-100 text-red-400'
                )}
              >
                {thread.status === 'active'
                  ? t('statusActive')
                  : thread.status === 'archived'
                    ? t('archived')
                    : t('statusClosed')}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        )}

        {/* Load more button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center py-2">
            <Button variant="outline" size="sm" onClick={onLoadMore}>
              {t('loadMore')}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[var(--brand-text-secondary)]">
            <svg
              className="w-16 h-16 mb-4 text-[var(--brand-text-secondary)]"
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
            <p>{t('noMessages')}</p>
            <p className="text-sm mt-1">{t('startConversation')}</p>
          </div>
        )}

        {/* Messages grouped by date */}
        {Array.from(groupedMessages.entries()).map(([date, dateMessages]) => (
          <div key={date}>
            <DateSeparator date={date} />
            {dateMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        ))}

        {/* Typing indicator */}
        <TypingIndicator users={typingUsers} t={t} />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      {thread && (
        <MessageInput
          onSend={onSendMessage}
          onTypingStart={onTypingStart || (() => {})}
          onTypingStop={onTypingStop || (() => {})}
          disabled={thread.status !== 'active'}
          placeholder={thread.status === 'active' ? t('typeMessage') : t('conversationClosed')}
        />
      )}
    </div>
  )
}

export default ChatArea
