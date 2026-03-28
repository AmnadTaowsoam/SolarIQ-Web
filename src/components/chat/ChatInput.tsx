'use client'

/**
 * ChatInput component for SolarIQ Communication Hub (WK-028)
 * Message input with auto-resize textarea, quick replies, and attachment support
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface QuickReplyTemplate {
  id: string
  title: string
  content: string
}

const QUICK_REPLY_KEYS = [
  { id: 'qr-1', titleKey: 'greet', contentKey: 'greet' },
  { id: 'qr-2', titleKey: 'info', contentKey: 'info' },
  { id: 'qr-3', titleKey: 'followUp', contentKey: 'followUp' },
  { id: 'qr-4', titleKey: 'confirm', contentKey: 'confirm' },
  { id: 'qr-5', titleKey: 'quote', contentKey: 'quote' },
] as const

interface ChatInputProps {
  onSend: (content: string) => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder,
}: ChatInputProps) {
  const t = useTranslations('chat')
  const tQr = useTranslations('quickReply')
  const QUICK_REPLIES: QuickReplyTemplate[] = QUICK_REPLY_KEYS.map((qr) => ({
    id: qr.id,
    title: tQr(qr.titleKey),
    content: tQr(qr.contentKey),
  }))
  const [message, setMessage] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [message])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value)
      onTypingStart?.()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop?.()
      }, 3000)
    },
    [onTypingStart, onTypingStop]
  )

  const handleSend = useCallback(() => {
    const trimmed = message.trim()
    if (!trimmed || disabled) {
      return
    }
    onSend(trimmed)
    setMessage('')
    onTypingStop?.()
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [message, disabled, onSend, onTypingStop])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault()
        // Image paste detected — in production would upload and send
        // For now just indicate it was detected
        // eslint-disable-next-line no-console
        console.log('Image pasted — upload not connected in demo mode')
        break
      }
    }
  }, [])

  const handleQuickReply = useCallback((template: QuickReplyTemplate) => {
    setMessage(template.content)
    setShowQuickReplies(false)
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* Quick replies bar */}
      {showQuickReplies && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('quickReplies')}
            </span>
            <button
              onClick={() => setShowQuickReplies(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.id}
                onClick={() => handleQuickReply(qr)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-orange-200 text-orange-700 rounded-full hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                {qr.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Quick reply toggle */}
        <button
          onClick={() => setShowQuickReplies(!showQuickReplies)}
          className={cn(
            'flex-shrink-0 p-2 rounded-xl transition-colors mb-0.5',
            showQuickReplies
              ? 'bg-orange-100 text-orange-600'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          )}
          title={t('quickReplies')}
          disabled={disabled}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
          </svg>
        </button>

        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mb-0.5"
          title={t('attachFile')}
          disabled={disabled}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
            />
          </svg>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={disabled ? t('conversationClosed') : (placeholder ?? t('typeMessage'))}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-2xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              'transition-all duration-150',
              'border-gray-200 bg-gray-50',
              'leading-relaxed'
            )}
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            'flex-shrink-0 p-2.5 rounded-xl transition-all duration-150 mb-0.5',
            message.trim() && !disabled
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ChatInput
