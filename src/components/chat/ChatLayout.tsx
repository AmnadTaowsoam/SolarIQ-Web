/**
 * ChatLayout component for SolarIQ Chat (WK-028)
 *
 * Main layout for the Communication Hub page with responsive design.
 * supporting thread list, chat area, quick replies, internal notes, and reports/moderation.
 */

'use client'

import React, { useState } from 'react'
import { ThreadInDB, MessageResponse, QuickReplyInDB } from '@/types/chat'
import { cn } from '@/lib/utils'

import ThreadList from './ThreadList'
import ChatArea from './ChatArea'
import QuickReplyPanel from './QuickReplyPanel'
import { InternalNotesPanel } from './InternalNotesPanel'

// ============== Types ==============

interface ChatLayoutProps {
  threads: ThreadInDB[]
  selectedThreadId: string | null
  currentThread: ThreadInDB | null
  messages: MessageResponse[]
  isLoading: boolean
  isConnected: boolean
  typingUsers: string[]
  unreadCount: number
  onSelectThread: (thread: ThreadInDB) => void
  onSendMessage: (content: string) => void
  onMarkAsRead?: (threadId: string) => void
  className?: string
}

export function ChatLayout({
  threads,
  selectedThreadId,
  currentThread,
  messages,
  isLoading,
  typingUsers,
  onSelectThread,
  onSendMessage,
  className,
}: ChatLayoutProps) {
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showInternalNotes, _setShowInternalNotes] = useState(false)
  void _setShowInternalNotes // available for future use

  return (
    <div className={cn('flex h-screen', className)}>
      {/* Sidebar - Thread list */}
      <div className="w-80 lg:w-1/4 border-r border-[var(--brand-border)] flex flex-col">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId ?? undefined}
          isLoading={isLoading}
          onSelectThread={onSelectThread}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col border-l border-[var(--brand-border)]">
        <ChatArea
          thread={currentThread}
          messages={messages}
          isLoading={isLoading}
          typingUsers={typingUsers}
          onSendMessage={onSendMessage}
        />
      </div>

      {/* Right sidebar - Quick Replies & Notes */}
      {showQuickReplies && (
        <div className="w-80 lg:w-1/4 border-r border-[var(--brand-border)] bg-[var(--brand-surface)]">
          <QuickReplyPanel
            replies={[]}
            onSelect={(reply: QuickReplyInDB) => {
              onSendMessage(reply.content)
              setShowQuickReplies(false)
            }}
          />
        </div>
      )}

      {showInternalNotes && (
        <div className="w-80 lg:w-1/4 border-r border-[var(--brand-border)] bg-[var(--brand-surface)]">
          <InternalNotesPanel />
        </div>
      )}
    </div>
  )
}
