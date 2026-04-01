'use client'

/**
 * useMessages hook for SolarIQ Communication Hub (WK-028)
 * Provides thread management, message fetching, and sending capabilities
 */

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api'

// ============== Types ==============

export interface MessageThread {
  id: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerInitials: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  status: 'active' | 'completed' | 'pending'
  leadId?: string
  dealId?: string
  leadStatus?: string
  dealStage?: string
  isTyping?: boolean
}

export interface Message {
  id: string
  threadId: string
  content: string
  contentType: 'text' | 'image' | 'document' | 'quote_card'
  senderType: 'contractor' | 'customer' | 'system'
  createdAt: Date
  isRead: boolean
  attachmentUrl?: string
  attachmentName?: string
  quoteData?: {
    systemSize: number
    totalPrice: number
    validUntil?: Date
  }
}

export interface InternalNote {
  id: string
  threadId: string
  content: string
  authorName: string
  createdAt: Date
  pinned: boolean
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Messaging data is currently unavailable'
}

function buildInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapThread(thread: any): MessageThread {
  const customerName = thread.metadata?.customerName || thread.customerName || 'Customer'

  return {
    id: thread.id,
    customerName,
    customerPhone: thread.customerPhone,
    customerEmail: thread.customerEmail,
    customerInitials: buildInitials(customerName) || 'CU',
    lastMessage: thread.lastMessagePreview || '',
    lastMessageTime: new Date(thread.lastMessageAt || thread.updatedAt || Date.now()),
    unreadCount: thread.unreadContractor || 0,
    status:
      thread.status === 'active' ? 'active' : thread.status === 'closed' ? 'completed' : 'pending',
    leadId: thread.leadId,
    dealId: thread.dealId,
    leadStatus: thread.leadStatus,
    dealStage: thread.dealStage,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(message: any): Message {
  return {
    id: message.id,
    threadId: message.threadId,
    content: message.content,
    contentType: message.contentType || 'text',
    senderType:
      message.senderType === 'b2c'
        ? 'customer'
        : message.senderType === 'system'
          ? 'system'
          : 'contractor',
    createdAt: new Date(message.createdAt || Date.now()),
    isRead: message.isRead || false,
    attachmentUrl: message.attachments?.[0]?.url,
    attachmentName: message.attachments?.[0]?.fileName,
    quoteData: message.quoteData,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(note: any): InternalNote {
  return {
    id: note.id,
    threadId: note.threadId,
    content: note.content,
    authorName: note.authorName || note.author_name || 'Team',
    createdAt: new Date(note.createdAt || note.created_at || Date.now()),
    pinned: Boolean(note.pinned),
  }
}

// ============== Hooks ==============

export function useThreads() {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchThreads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/v1/chat/threads')
      const items = Array.isArray(response.data?.threads) ? response.data.threads : []
      setThreads(items.map(mapThread))
    } catch (fetchError) {
      setThreads([])
      setError(getErrorMessage(fetchError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return { threads, isLoading, isDemoMode: false, error, refetch: fetchThreads }
}

export function useMessages(threadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [notes, setNotes] = useState<InternalNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!threadId) {
      setMessages([])
      setNotes([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [messagesResponse, notesResponse] = await Promise.all([
        apiClient.get(`/api/v1/chat/threads/${threadId}/messages`),
        apiClient.get(`/api/v1/chat/threads/${threadId}/notes`),
      ])

      const threadMessages = Array.isArray(messagesResponse.data?.messages)
        ? messagesResponse.data.messages.map(mapMessage)
        : []
      const threadNotes = Array.isArray(notesResponse.data?.notes)
        ? notesResponse.data.notes.map(mapNote)
        : []

      setMessages(threadMessages)
      setNotes(threadNotes)
    } catch (fetchError) {
      setMessages([])
      setNotes([])
      setError(getErrorMessage(fetchError))
    } finally {
      setIsLoading(false)
    }
  }, [threadId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return { messages, notes, isLoading, error, refetch: fetchMessages }
}

export function useSendMessage(threadId: string | null) {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!threadId || !content.trim()) {
        return null
      }

      setIsSending(true)
      setError(null)

      try {
        const response = await apiClient.post(`/api/v1/chat/threads/${threadId}/messages`, {
          content,
          contentType: 'text',
        })
        return mapMessage(response.data)
      } catch (sendError) {
        setError(getErrorMessage(sendError))
        return null
      } finally {
        setIsSending(false)
      }
    },
    [threadId]
  )

  const addNote = useCallback(
    async (content: string): Promise<InternalNote | null> => {
      if (!threadId || !content.trim()) {
        return null
      }

      setError(null)

      try {
        const response = await apiClient.post(`/api/v1/chat/threads/${threadId}/notes`, {
          content,
          pinned: false,
        })
        return mapNote(response.data)
      } catch (noteError) {
        setError(getErrorMessage(noteError))
        return null
      }
    },
    [threadId]
  )

  return { sendMessage, addNote, isSending, error }
}
