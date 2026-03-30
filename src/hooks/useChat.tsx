/**
 * Chat hooks for SolarIQ Web (WK-028)
 *
 * This module provides React hooks for the chat messaging system including
 * WebSocket connection management, thread/message operations, and presence tracking.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { io, Socket } from 'socket.io-client'
import {
  ThreadWithLastMessage,
  MessageResponse,
  MessageCreate,
  ThreadCreate,
  ThreadUpdate,
  QuickReplyInDB,
  QuickReplyCreate,
  QuickReplyUpdate,
  NoteResponse,
  ReportInDB,
  ReportCreate,
  PresenceResponse,
  PresenceStatus,
  WSMessageSend,
  WSMessageNew,
  WSTypingIndicator,
  WSMessageRead,
  WSPresenceChanged,
  ThreadListResponse,
  ThreadDetailResponse,
  QuickReplyListResponse,
  ContentType,
  SenderType,
} from '@/types/chat'

// ============== Configuration ==============

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || ''
const WS_RECONNECT_DELAY = 3000
const WS_MAX_RECONNECT_ATTEMPTS = 5
const TYPING_DEBOUNCE_MS = 3000

// ============== WebSocket Context ==============

interface WebSocketContextValue {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  reconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  isConnected: false,
  connectionError: null,
  reconnect: () => {},
})

/**
 * WebSocket Provider Component
 * Manages Socket.IO connection with automatic reconnection
 */
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (!WS_URL) {
      console.warn('WebSocket URL not configured')
      return
    }

    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: WS_MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: WS_RECONNECT_DELAY,
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setConnectionError(null)
      reconnectAttempts.current = 0
      // eslint-disable-next-line no-console
      console.log('WebSocket connected')
    })

    newSocket.on('disconnect', (reason: string) => {
      setIsConnected(false)
      // eslint-disable-next-line no-console
      console.log('WebSocket disconnected:', reason)
    })

    newSocket.on('connect_error', (error: Error) => {
      setConnectionError(error.message)
      reconnectAttempts.current += 1
      // eslint-disable-next-line no-console
      console.error('WebSocket connection error:', error.message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    const cleanup = connect()
    const timeoutRef = reconnectTimeout
    return () => {
      cleanup?.()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [connect])

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
    }
    connect()
  }, [socket, connect])

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      connectionError,
      reconnect,
    }),
    [socket, isConnected, connectionError, reconnect]
  )

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

/**
 * Hook to access WebSocket context
 */
export function useWebSocket() {
  return useContext(WebSocketContext)
}

// ============== useChat Hook ==============

interface UseChatOptions {
  /** Auto-connect to thread room on mount */
  autoJoin?: boolean
  /** Thread ID to join */
  threadId?: string
  /** Enable typing indicators */
  enableTyping?: boolean
}

/**
 * Main chat hook for thread and message management
 */
export function useChat(options: UseChatOptions = {}) {
  const { autoJoin = true, threadId, enableTyping = true } = options
  const { socket, isConnected } = useWebSocket()

  // State
  const [threads, setThreads] = useState<ThreadWithLastMessage[]>([])
  const [currentThread, setCurrentThread] = useState<ThreadDetailResponse | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Refs
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const isTyping = useRef(false)

  // API base URL
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

  // Fetch threads
  const fetchThreads = useCallback(
    async (params?: { status?: string; assignedTo?: string; page?: number; limit?: number }) => {
      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()
        if (params?.status) {
          queryParams.set('status', params.status)
        }
        if (params?.assignedTo) {
          queryParams.set('assigned_to', params.assignedTo)
        }
        if (params?.page) {
          queryParams.set('page', params.page.toString())
        }
        if (params?.limit) {
          queryParams.set('limit', params.limit.toString())
        }

        const response = await fetch(`${apiBase}/chat/threads?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch threads')
        }

        const data: ThreadListResponse = await response.json()
        setThreads(data.threads)
        setUnreadCount(data.unreadTotal)
        setHasMore(data.threads.length < data.total)

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Fetch single thread
  const fetchThread = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/threads/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch thread')
        }

        const data: ThreadDetailResponse = await response.json()
        setCurrentThread(data)
        setMessages(data.messages)

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Create thread
  const createThread = useCallback(
    async (data: ThreadCreate) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/threads`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create thread')
        }

        const newThread: ThreadWithLastMessage = await response.json()
        setThreads((prev) => [newThread, ...prev])
        setCurrentThread(newThread as ThreadDetailResponse)

        return newThread
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Update thread
  const updateThread = useCallback(
    async (id: string, data: ThreadUpdate) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/threads/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update thread')
        }

        const updatedThread: ThreadWithLastMessage = await response.json()
        setCurrentThread(updatedThread as ThreadDetailResponse)
        setThreads((prev) => prev.map((t) => (t.id === id ? updatedThread : t)))

        return updatedThread
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Fetch messages
  const fetchMessages = useCallback(
    async (threadId: string, params?: { before?: string; after?: string; limit?: number }) => {
      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()
        if (params?.before) {
          queryParams.set('before', params.before)
        }
        if (params?.after) {
          queryParams.set('after', params.after)
        }
        if (params?.limit) {
          queryParams.set('limit', params.limit.toString())
        }

        const response = await fetch(
          `${apiBase}/chat/threads/${threadId}/messages?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }

        const data = await response.json()
        setMessages((prev) => [...data.items, ...prev])
        setHasMore(data.has_more)

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Send message
  const sendMessage = useCallback(
    async (data: MessageCreate) => {
      if (!socket || !isConnected) {
        throw new Error('WebSocket not connected')
      }

      const clientMessageId = crypto.randomUUID()
      const wsMessage: WSMessageSend = {
        eventType: 'message:send',
        threadId: data.threadId,
        content: data.content,
        contentType: data.contentType || ContentType.TEXT,
        attachments: data.attachments,
        replyToId: data.replyToId,
        location: data.location,
        quoteData: data.quoteData,
        clientMessageId,
      }

      socket.emit('message:send', wsMessage)

      // Return optimistic message
      const optimisticMessage: MessageResponse = {
        id: clientMessageId,
        threadId: data.threadId,
        content: data.content,
        contentType: data.contentType || ContentType.TEXT,
        sequenceNumber: -1,
        senderType: SenderType.CONTRACTOR,
        senderId: localStorage.getItem('userId') || undefined,
        attachments: data.attachments,
        replyToId: data.replyToId,
        location: data.location,
        quoteData: data.quoteData,
        createdAt: new Date(),
        isDeleted: false,
        isRead: false,
      }

      setMessages((prev) => [...prev, optimisticMessage])

      return optimisticMessage
    },
    [socket, isConnected]
  )

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch(`${apiBase}/chat/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete message')
        }

        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      }
    },
    [apiBase]
  )

  // Mark as read
  const markAsRead = useCallback(
    async (threadId: string) => {
      try {
        await fetch(`${apiBase}/chat/threads/${threadId}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        setMessages((prev) => prev.map((m) => (m.readAt ? m : { ...m, readAt: new Date() })))
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to mark as read:', err)
      }
    },
    [apiBase]
  )

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socket || !isConnected || !currentThread || !enableTyping) {
      return
    }

    if (!isTyping.current) {
      isTyping.current = true
      socket.emit('typing:start', {
        thread_id: currentThread.id,
      })
    }

    // Reset timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }

    typingTimeout.current = setTimeout(() => {
      stopTyping()
    }, TYPING_DEBOUNCE_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, currentThread, enableTyping])

  const stopTyping = useCallback(() => {
    if (!socket || !isConnected || !currentThread || !enableTyping) {
      return
    }

    if (isTyping.current) {
      isTyping.current = false
      socket.emit('typing:stop', {
        thread_id: currentThread.id,
      })
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
      typingTimeout.current = null
    }
  }, [socket, isConnected, currentThread, enableTyping])

  // Join thread room
  const joinThread = useCallback(
    (id: string) => {
      if (!socket || !isConnected) {
        return
      }
      socket.emit('thread:join', { thread_id: id })
    },
    [socket, isConnected]
  )

  // Leave thread room
  const leaveThread = useCallback(
    (id: string) => {
      if (!socket || !isConnected) {
        return
      }
      socket.emit('thread:leave', { thread_id: id })
    },
    [socket, isConnected]
  )

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) {
      return
    }

    // New message received
    const handleNewMessage = (data: WSMessageNew) => {
      const msg = data.message

      setMessages((prev) => {
        // Avoid duplicates (client-generated IDs)
        if (prev.some((m) => m.id === msg.id)) {
          return prev.map((m) => (m.id === msg.id ? msg : m))
        }
        return [...prev, msg]
      })

      // Update thread preview
      setThreads((prev) =>
        prev.map((t) =>
          t.id === msg.threadId
            ? {
                ...t,
                lastMessageAt: msg.createdAt,
                lastMessagePreview: msg.content.substring(0, 100),
                lastMessageSender: msg.senderType,
              }
            : t
        )
      )
    }

    // Typing indicator
    const handleTypingIndicator = (data: WSTypingIndicator) => {
      if (currentThread?.id === data.threadId) {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId]
            }
            return prev
          })
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
        }
      }
    }

    // Read receipt
    const handleReadReceipt = (data: WSMessageRead) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.threadId === data.threadId && !m.readAt ? { ...m, readAt: new Date() } : m
        )
      )
    }

    // Presence update
    const handlePresenceUpdate = (data: WSPresenceChanged) => {
      // Handle presence update (can be used for online indicators)
      // eslint-disable-next-line no-console
      console.log('Presence update:', data)
    }

    socket.on('message:new', handleNewMessage)
    socket.on('typing:indicator', handleTypingIndicator)
    socket.on('message:read', handleReadReceipt)
    socket.on('presence:changed', handlePresenceUpdate)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('typing:indicator', handleTypingIndicator)
      socket.off('message:read', handleReadReceipt)
      socket.off('presence:changed', handlePresenceUpdate)
    }
  }, [socket, currentThread])

  // Auto-join thread on mount
  useEffect(() => {
    if (!autoJoin || !threadId || !isConnected) {
      return
    }

    joinThread(threadId)
    fetchThread(threadId)

    return () => {
      leaveThread(threadId)
    }
  }, [autoJoin, threadId, isConnected, joinThread, leaveThread, fetchThread])

  return {
    // State
    threads,
    currentThread,
    messages,
    isLoading,
    error,
    hasMore,
    typingUsers,
    unreadCount,

    // Thread actions
    fetchThreads,
    fetchThread,
    createThread,
    updateThread,

    // Message actions
    fetchMessages,
    sendMessage,
    deleteMessage,
    markAsRead,

    // Typing actions
    startTyping,
    stopTyping,

    // Room actions
    joinThread,
    leaveThread,
  }
}

// ============== useQuickReplies Hook ==============

/**
 * Hook for managing quick reply templates
 */
export function useQuickReplies() {
  const [replies, setReplies] = useState<QuickReplyInDB[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

  // Fetch quick replies
  const fetchReplies = useCallback(
    async (params?: { category?: string; search?: string }) => {
      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()
        if (params?.category) {
          queryParams.set('category', params.category)
        }
        if (params?.search) {
          queryParams.set('search', params.search)
        }

        const response = await fetch(`${apiBase}/chat/quick-replies?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch quick replies')
        }

        const data: QuickReplyListResponse = await response.json()
        setReplies(data.templates)

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Create quick reply
  const createReply = useCallback(
    async (data: QuickReplyCreate) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/quick-replies`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create quick reply')
        }

        const newReply: QuickReplyInDB = await response.json()
        setReplies((prev) => [...prev, newReply])

        return newReply
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Update quick reply
  const updateReply = useCallback(
    async (id: string, data: QuickReplyUpdate) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/quick-replies/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update quick reply')
        }

        const updatedReply: QuickReplyInDB = await response.json()
        setReplies((prev) => prev.map((r) => (r.id === id ? updatedReply : r)))

        return updatedReply
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Delete quick reply
  const deleteReply = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`${apiBase}/chat/quick-replies/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete quick reply')
        }

        setReplies((prev) => prev.filter((r) => r.id !== id))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      }
    },
    [apiBase]
  )

  // Use quick reply (increments usage count)
  const useReply = useCallback(
    async (id: string, variables?: Record<string, string>) => {
      try {
        const response = await fetch(`${apiBase}/chat/quick-replies/${id}/use`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ variables }),
        })

        if (!response.ok) {
          throw new Error('Failed to use quick reply')
        }

        const result: QuickReplyInDB = await response.json()

        // Update usage count in local state
        setReplies((prev) => prev.map((r) => (r.id === id ? result : r)))

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      }
    },
    [apiBase]
  )

  return {
    replies,
    isLoading,
    error,
    fetchReplies,
    createReply,
    updateReply,
    deleteReply,
    useReply,
  }
}

// ============== usePresence Hook ==============

/**
 * Hook for managing user presence
 */
export function usePresence(userId?: string) {
  const [presence, setPresence] = useState<PresenceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { socket, isConnected } = useWebSocket()
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

  // Fetch presence
  const fetchPresence = useCallback(
    async (targetUserId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/presence/${targetUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch presence')
        }

        const data: PresenceResponse = await response.json()
        setPresence(data)

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Update own presence
  const updatePresence = useCallback(
    async (status: PresenceStatus) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/presence`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        })

        if (!response.ok) {
          throw new Error('Failed to update presence')
        }

        const data: PresenceResponse = await response.json()
        setPresence(data)

        // Broadcast via WebSocket
        if (socket && isConnected) {
          socket.emit('presence:update', { status })
        }

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase, socket, isConnected]
  )

  // Fetch presence on mount if userId provided
  useEffect(() => {
    if (userId) {
      fetchPresence(userId)
    }
  }, [userId, fetchPresence])

  // Listen for presence updates
  useEffect(() => {
    if (!socket || !userId) {
      return
    }

    const handlePresenceUpdate = (data: WSPresenceChanged) => {
      if (data.userId === userId) {
        setPresence((prev: PresenceResponse | null) =>
          prev
            ? {
                ...prev,
                status: data.status,
                lastSeenAt: new Date(),
              }
            : prev
        )
      }
    }

    socket.on('presence:changed', handlePresenceUpdate)

    return () => {
      socket.off('presence:changed', handlePresenceUpdate)
    }
  }, [socket, userId])

  return {
    presence,
    isLoading,
    error,
    fetchPresence,
    updatePresence,
  }
}

// ============== useInternalNotes Hook ==============

interface UseInternalNotesReturn {
  notes: NoteResponse[]
  isLoading: boolean
  error: string | null
  fetchNotes: (threadId: string) => Promise<NoteResponse[]>
  createNote: (threadId: string, content: string) => Promise<NoteResponse>
  updateNote: (threadId: string, noteId: string, content: string) => Promise<NoteResponse>
  deleteNote: (threadId: string, noteId: string) => Promise<void>
}

/**
 * Hook for managing internal notes (contractor-only)
 */
export function useInternalNotes(): UseInternalNotesReturn {
  const [notes, setNotes] = useState<NoteResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

  // Fetch notes
  const fetchNotes = useCallback(
    async (threadId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/notes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch notes')
        }

        const data: NoteResponse[] = await response.json()
        setNotes(data)

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Create note
  const createNote = useCallback(
    async (threadId: string, content: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        })

        if (!response.ok) {
          throw new Error('Failed to create note')
        }

        const newNote: NoteResponse = await response.json()
        setNotes((prev) => [...prev, newNote])

        return newNote
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Update note
  const updateNote = useCallback(
    async (threadId: string, noteId: string, content: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/notes/${noteId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        })

        if (!response.ok) {
          throw new Error('Failed to update note')
        }

        const updatedNote: NoteResponse = await response.json()
        setNotes((prev) => prev.map((n) => (n.id === noteId ? updatedNote : n)))

        return updatedNote
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Delete note
  const deleteNote = useCallback(
    async (threadId: string, noteId: string) => {
      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/notes/${noteId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete note')
        }

        setNotes((prev) => prev.filter((n) => n.id !== noteId))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      }
    },
    [apiBase]
  )

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  }
}

// ============== useReportInDBs Hook ==============

interface UseReportInDBsReturn {
  reports: ReportInDB[]
  isLoading: boolean
  error: string | null
  createReport: (threadId: string, data: ReportCreate) => Promise<ReportInDB>
  fetchPendingReports: () => Promise<ReportInDB[]>
  resolveReport: (
    reportId: string,
    action: 'dismiss' | 'warn' | 'ban',
    notes?: string
  ) => Promise<ReportInDB>
}

/**
 * Hook for managing chat reports
 */
export function useReportInDBs(): UseReportInDBsReturn {
  const [reports, setReports] = useState<ReportInDB[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

  // Create report
  const createReport = useCallback(
    async (threadId: string, data: ReportCreate) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/report`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create report')
        }

        const newReport: ReportInDB = await response.json()
        setReports((prev) => [...prev, newReport])

        return newReport
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  // Fetch pending reports (admin only)
  const fetchPendingReports = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiBase}/chat/reports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }

      const data: ReportInDB[] = await response.json()
      setReports(data)

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiBase])

  // Resolve report (admin only)
  const resolveReport = useCallback(
    async (reportId: string, action: 'dismiss' | 'warn' | 'ban', notes?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/reports/${reportId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, notes }),
        })

        if (!response.ok) {
          throw new Error('Failed to resolve report')
        }

        const updatedReport: ReportInDB = await response.json()
        setReports((prev) => prev.map((r) => (r.id === reportId ? updatedReport : r)))

        return updatedReport
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiBase]
  )

  return {
    reports,
    isLoading,
    error,
    createReport,
    fetchPendingReports,
    resolveReport,
  }
}

// ============== useFileUpload Hook ==============

interface UploadResponse {
  uploadUrl: string
  fileUrl: string
  expiresIn: number
}

interface UseFileUploadReturn {
  isUploading: boolean
  error: string | null
  requestUploadUrl: (
    fileName: string,
    fileType: string,
    fileSize: number
  ) => Promise<UploadResponse>
  uploadFile: (file: File) => Promise<string>
}

/**
 * Hook for file uploads in chat
 */
export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

  // Request presigned upload URL
  const requestUploadUrl = useCallback(
    async (fileName: string, fileType: string, fileSize: number) => {
      setIsUploading(true)
      setError(null)

      try {
        const response = await fetch(`${apiBase}/chat/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_name: fileName,
            file_type: fileType,
            file_size: fileSize,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get upload URL')
        }

        const data: UploadResponse = await response.json()
        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    [apiBase]
  )

  // Upload file to presigned URL
  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      setIsUploading(true)
      setError(null)

      try {
        // Get presigned URL
        const { uploadUrl, fileUrl } = await requestUploadUrl(file.name, file.type, file.size)

        // Upload to storage
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }

        return fileUrl
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    [requestUploadUrl]
  )

  return {
    isUploading,
    error,
    requestUploadUrl,
    uploadFile,
  }
}

// ============== Exports ==============

export { WebSocketContext, type WebSocketContextValue }
