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

// ============== Demo Data ==============

const DEMO_THREADS: MessageThread[] = [
  {
    id: 'thread-1',
    customerName: 'สมชาย ใจดี',
    customerPhone: '08X-XXX-XX89',
    customerEmail: 's***@gmail.com',
    customerInitials: 'สช',
    lastMessage: 'ขอบคุณมากครับ รอดูใบเสนอราคาได้เลย',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 2,
    status: 'active',
    leadId: 'lead-001',
    leadStatus: 'quoted',
  },
  {
    id: 'thread-2',
    customerName: 'นางสาว วิภา รักสะอาด',
    customerPhone: '09X-XXX-XX45',
    customerEmail: 'v***@hotmail.com',
    customerInitials: 'วภ',
    lastMessage: 'อยากทราบว่าการรับประกันกี่ปีครับ',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
    status: 'pending',
    leadId: 'lead-002',
    leadStatus: 'new',
  },
  {
    id: 'thread-3',
    customerName: 'คุณ ประสิทธิ์ ทองดี',
    customerPhone: '06X-XXX-XX12',
    customerEmail: 'p***@yahoo.com',
    customerInitials: 'ปส',
    lastMessage: 'ติดตั้งเสร็จแล้ว ขอบคุณทีมงานมากนะครับ',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    unreadCount: 0,
    status: 'completed',
    dealId: 'deal-001',
    dealStage: 'closed_won',
  },
]

const DEMO_MESSAGES: Record<string, Message[]> = {
  'thread-1': [
    {
      id: 'msg-1',
      threadId: 'thread-1',
      content: 'สวัสดีครับ ผมสนใจติดตั้งโซลาร์เซลล์ที่บ้านครับ',
      contentType: 'text',
      senderType: 'customer',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'msg-2',
      threadId: 'thread-1',
      content: 'สวัสดีครับคุณสมชาย ยินดีให้บริการครับ ขอทราบข้อมูลบิลค่าไฟเฉลี่ยต่อเดือนได้ไหมครับ?',
      contentType: 'text',
      senderType: 'contractor',
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'msg-3',
      threadId: 'thread-1',
      content: 'ประมาณ 3,500-4,000 บาทต่อเดือนครับ',
      contentType: 'text',
      senderType: 'customer',
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'msg-4',
      threadId: 'thread-1',
      content: 'ขอส่งใบเสนอราคาเบื้องต้นให้ดูก่อนนะครับ',
      contentType: 'quote_card',
      senderType: 'contractor',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      isRead: true,
      quoteData: {
        systemSize: 8,
        totalPrice: 180000,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    {
      id: 'msg-5',
      threadId: 'thread-1',
      content: 'ขอบคุณมากครับ รอดูใบเสนอราคาได้เลย',
      contentType: 'text',
      senderType: 'customer',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
    },
    {
      id: 'msg-6',
      threadId: 'thread-1',
      content: 'แล้วมีโปรโมชันพิเศษไหมครับ?',
      contentType: 'text',
      senderType: 'customer',
      createdAt: new Date(Date.now() - 3 * 60 * 1000),
      isRead: false,
    },
  ],
  'thread-2': [
    {
      id: 'msg-7',
      threadId: 'thread-2',
      content: 'สวัสดีค่ะ อยากสอบถามเรื่องโซลาร์เซลล์ค่ะ',
      contentType: 'text',
      senderType: 'customer',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'msg-8',
      threadId: 'thread-2',
      content: 'ยินดีให้บริการครับ มีอะไรให้ช่วยได้เลยครับ',
      contentType: 'text',
      senderType: 'contractor',
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 'msg-9',
      threadId: 'thread-2',
      content: 'อยากทราบว่าการรับประกันกี่ปีครับ',
      contentType: 'text',
      senderType: 'customer',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
    },
  ],
  'thread-3': [
    {
      id: 'msg-10',
      threadId: 'thread-3',
      content: 'ติดตั้งเสร็จแล้ว ขอบคุณทีมงานมากนะครับ',
      contentType: 'text',
      senderType: 'customer',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
  ],
}

const DEMO_NOTES: Record<string, InternalNote[]> = {
  'thread-1': [
    {
      id: 'note-1',
      threadId: 'thread-1',
      content: 'ลูกค้ารายนี้สนใจมาก น่าจะปิดได้ในสัปดาห์นี้',
      authorName: 'ฝ่ายขาย',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      pinned: true,
    },
  ],
}

// ============== Hooks ==============

export function useThreads() {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const fetchThreads = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/api/v1/chat/threads')
      const data = response.data
      if (data && data.threads && data.threads.length >= 0) {
        // Map API response to our type
        const mapped: MessageThread[] = data.threads.map((t: any) => ({
          id: t.id,
          customerName: t.metadata?.customerName || t.customerName || 'ลูกค้า',
          customerPhone: t.customerPhone,
          customerEmail: t.customerEmail,
          customerInitials: (t.metadata?.customerName || t.customerName || 'ลค')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2),
          lastMessage: t.lastMessagePreview || '',
          lastMessageTime: new Date(t.lastMessageAt || t.updatedAt),
          unreadCount: t.unreadContractor || 0,
          status: t.status === 'active' ? 'active' : t.status === 'closed' ? 'completed' : 'pending',
          leadId: t.leadId,
          dealId: t.dealId,
          leadStatus: t.leadStatus,
          dealStage: t.dealStage,
        }))
        setThreads(mapped)
        setIsDemoMode(false)
      } else {
        setThreads(DEMO_THREADS)
        setIsDemoMode(true)
      }
    } catch {
      setThreads(DEMO_THREADS)
      setIsDemoMode(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return { threads, isLoading, isDemoMode, refetch: fetchThreads }
}

export function useMessages(threadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [notes, setNotes] = useState<InternalNote[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!threadId) return
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/api/v1/chat/threads/${threadId}/messages`)
      const data = response.data
      if (data && data.messages) {
        const mapped: Message[] = data.messages.map((m: any) => ({
          id: m.id,
          threadId: m.threadId,
          content: m.content,
          contentType: m.contentType || 'text',
          senderType: m.senderType === 'b2c' ? 'customer' : m.senderType === 'system' ? 'system' : 'contractor',
          createdAt: new Date(m.createdAt),
          isRead: m.isRead || false,
          attachmentUrl: m.attachments?.[0]?.url,
          attachmentName: m.attachments?.[0]?.fileName,
          quoteData: m.quoteData,
        }))
        setMessages(mapped)
      } else {
        setMessages(DEMO_MESSAGES[threadId] || [])
      }
    } catch {
      setMessages(DEMO_MESSAGES[threadId] || [])
    } finally {
      setIsLoading(false)
    }

    // Fetch notes separately
    try {
      const notesResponse = await apiClient.get(`/api/v1/chat/threads/${threadId}/notes`)
      if (notesResponse.data?.notes) {
        setNotes(notesResponse.data.notes)
      } else {
        setNotes(DEMO_NOTES[threadId] || [])
      }
    } catch {
      setNotes(DEMO_NOTES[threadId] || [])
    }
  }, [threadId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return { messages, notes, isLoading, refetch: fetchMessages }
}

export function useSendMessage(threadId: string | null) {
  const [isSending, setIsSending] = useState(false)

  const sendMessage = useCallback(async (content: string): Promise<Message | null> => {
    if (!threadId || !content.trim()) return null
    setIsSending(true)
    try {
      const response = await apiClient.post(`/api/v1/chat/threads/${threadId}/messages`, {
        content,
        contentType: 'text',
      })
      return response.data
    } catch {
      // Demo mode: return a fake sent message
      const demoMsg: Message = {
        id: `msg-demo-${Date.now()}`,
        threadId,
        content,
        contentType: 'text',
        senderType: 'contractor',
        createdAt: new Date(),
        isRead: false,
      }
      return demoMsg
    } finally {
      setIsSending(false)
    }
  }, [threadId])

  const addNote = useCallback(async (content: string): Promise<InternalNote | null> => {
    if (!threadId || !content.trim()) return null
    try {
      const response = await apiClient.post(`/api/v1/chat/threads/${threadId}/notes`, {
        content,
        pinned: false,
      })
      return response.data
    } catch {
      const demoNote: InternalNote = {
        id: `note-demo-${Date.now()}`,
        threadId,
        content,
        authorName: 'คุณ',
        createdAt: new Date(),
        pinned: false,
      }
      return demoNote
    }
  }, [threadId])

  return { sendMessage, addNote, isSending }
}
