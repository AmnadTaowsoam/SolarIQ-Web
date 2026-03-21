/**
 * ChatLayout component for SolarIQ Chat (WK-028)
 *
 * Main layout for the Communication Hub page with responsive design.
 * supporting thread list, chat area, quick replies, internal notes, and reports/moderation.
 */

'use client';

import React, { useState } from 'react';
import {
  ChatThread,
  ChatMessage,
  ThreadStatus,
  SenderType,
  QuickReply,
  QuickReplyCategory,
} from '@/types/chat';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

import ThreadList from '././ThreadList';
import ChatArea from '././ChatArea';
import QuickReplyPanel from '././QuickReplyPanel';
import InternalNotesPanel from '././InternalNotesPanel';
import ReportModal from '././ReportModal';

// ============== Types ==============

interface ChatLayoutProps {
  className?: string;
}

interface ChatLayoutState {
  threads: ChatThread[];
  selectedThreadId: string | null;
  currentThread: ChatThread | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  typingUsers: string[];
  unreadCount: number;
  onSelectThread: (thread: ChatThread) => void;
  onArchiveThread?: (threadId: string) => void;
  onAssignThread?: (threadId: string, userId: string) => void;
  onSendMessage: (content: string) => void;
  onMarkAsRead?: (threadId: string) => void;
  onShowQuickReplies?: () => void;
  onShowInternalNotes?: () => void;
  onShowReportModal?: () => void;
  onShowSettings?: () => void;
}

type ViewType = 'threads' | 'messages' | 'notes' | 'reports';

// ============== Sub-Components ==============

interface HeaderProps {
  unreadCount: number;
  isConnected: boolean;
  onRefresh: () => void;
}

function Header({
  unreadCount,
  isConnected,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <h1 className="text-lg font-semibold text-gray-900">ข้อความ</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4a0 1 0 2a0 0 0 0 2a0 0 0 0a0 0 0 0 2a0 0 0 0a1a />
          </svg>
          <span className="text-sm text-gray-500">กำลังดำเนิ่าลูกค้าใหม่าะอะ
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <Badge className="bg-blue-100 text-blue-800">
          {unreadCount} ข้อความใหม่
        </Badge>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-300'
          }`}
          />
          <span className="text-xs">
            {isConnected ? 'เชื่อมต่อือ            : 'ไม่เชื่อมต่อับ'}
          </span>
        </div>
      </div>
    </header>
  );
}

export function ChatLayout({
  threads,
  selectedThreadId,
  currentThread,
  messages,
  isLoading,
  isConnected,
  typingUsers,
  unreadCount,
  onSelectThread,
  onArchiveThread,
  onAssignThread,
  onSendMessage,
  onMarkAsRead,
  onShowQuickReplies,
  onShowInternalNotes,
  onShowReportModal,
  onShowSettings,
  className,
}: ChatLayoutProps) {
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar - Thread list */}
      <div className="w-80 lg:w-1/4 border-r border-gray-200 flex flex-col">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId}
          isLoading={isLoading}
          onSelectThread={onSelectThread}
        />
      {/* Main chat area */}
      <div className="flex-1 flex flex-col border-l border-gray-200">
        <ChatArea
          thread={currentThread}
          messages={messages}
          isLoading={isLoading}
          typingUsers={typingUsers}
          onSendMessage={onSendMessage}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
          onMarkAsRead={onMarkAsRead}
        />
      </div>

      {/* Right sidebar - Quick Replies & Notes */}
      {showQuickReplies && (
        <div className="w-80 lg:w-1/4 border-r border-gray-200 bg-white">
          <QuickReplyPanel
            replies={quickReplies}
            onSelect={(reply) => {
              onSendMessage(reply.content);
              setShowQuickReplies(false);
            }}
          />
        </div>
      )}

      {showInternalNotes && (
        <div className="w-80 lg:w-1/4 border-r border-gray-200 bg-white">
          <InternalNotesPanel
            threadId={selectedThreadId}
            onClose={() => setShowInternalNotes(false)}
          />
        </div>
      )}

      {/* Modals */}
      <QuickReplyModal
        isOpen={showQuickReplies}
        onClose={() => setShowQuickReplies(false)}
        threadId={selectedThreadId}
        replies={quickReplies}
        onSelect={onSelectQuickReply}
      />

      <InternalNotesModal
        opens={showInternalNotes}
        onClose={() => setShowInternalNotes(false)}
        threadId={selectedThreadId}
      />

      <ReportModal
        opens={showReportModal}
        onClose={() => setShowReportModal(false)}
        threadId={selectedThreadId}
        onReportSubmitted={onReportSubmitted}
      />

      <SettingsModal
        opens={showSettings}
        onClose={() => setShowSettings(false)}
        thread={currentThread}
      />
    </div>
  );
}
