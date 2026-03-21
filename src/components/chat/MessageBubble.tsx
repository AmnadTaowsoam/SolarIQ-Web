'use client'

/**
 * MessageBubble component for SolarIQ Communication Hub (WK-028)
 * Renders individual chat messages with different content types
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Message } from '@/hooks/useMessages'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  showAvatar?: boolean
}

function formatTime(date: Date): string {
  return format(new Date(date), 'HH:mm', { locale: th })
}

function QuoteCard({ quoteData, isOwn }: { quoteData: NonNullable<Message['quoteData']>; isOwn: boolean }) {
  return (
    <div className={cn(
      'rounded-lg p-3 border mt-1',
      isOwn ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white border-gray-200 text-gray-900'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wide">ใบเสนอราคา</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold">{quoteData.systemSize} kW</p>
        <p className="text-sm font-medium">฿{quoteData.totalPrice.toLocaleString()}</p>
        {quoteData.validUntil && (
          <p className={cn('text-xs', isOwn ? 'text-orange-100' : 'text-gray-500')}>
            หมดอายุ: {format(new Date(quoteData.validUntil), 'd MMM yyyy', { locale: th })}
          </p>
        )}
      </div>
    </div>
  )
}

export function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false)

  const isOwn = message.senderType === 'contractor'
  const isSystem = message.senderType === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-500">
          {message.content}
        </div>
      </div>
    )
  }

  const initials = isOwn ? 'คุณ' : 'ลค'

  return (
    <div
      className={cn('flex gap-2 mb-2 group', isOwn ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium self-end">
          {initials}
        </div>
      )}
      {showAvatar && isOwn && <div className="w-8 flex-shrink-0" />}

      {/* Bubble */}
      <div className={cn('max-w-[72%] space-y-0.5', isOwn ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5 shadow-sm',
          isOwn
            ? 'bg-orange-500 text-white rounded-tr-sm'
            : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'
        )}>
          {message.contentType === 'quote_card' && message.quoteData ? (
            <>
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <QuoteCard quoteData={message.quoteData} isOwn={isOwn} />
            </>
          ) : message.contentType === 'image' && message.attachmentUrl ? (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.attachmentUrl}
                alt="รูปภาพ"
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.attachmentUrl, '_blank')}
              />
              {message.content && <p className="text-sm mt-2 whitespace-pre-wrap">{message.content}</p>}
            </div>
          ) : message.contentType === 'document' && message.attachmentUrl ? (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('flex items-center gap-2 hover:opacity-80 transition-opacity')}
            >
              <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium truncate">{message.attachmentName || 'เอกสาร'}</span>
            </a>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          )}

          {/* Timestamp inside bubble */}
          <div className={cn(
            'flex items-center gap-1 mt-1 text-[10px]',
            isOwn ? 'text-orange-100 justify-end' : 'text-gray-400'
          )}>
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && (
              <svg className={cn('w-3.5 h-3.5', message.isRead ? 'text-orange-200' : 'text-orange-300')} viewBox="0 0 24 24" fill="currentColor">
                {message.isRead ? (
                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                ) : (
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                )}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
