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
} from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ChatThread,
  ChatMessage,
  MessageCreate,
  ThreadCreate,
  ThreadUpdate,
  QuickReply,
  QuickReplyCreate,
  QuickReplyUpdate,
  ChatNote,
  NoteCreate,
  ChatReport,
  ReportCreate,
  UserPresence,
  PresenceStatus,
  WSEvent,
  WSMessageSend,
  WSMessageNew,
  WSTypingStart,
  WSTypingStop,
  WSReadReceipt,
  WSPresenceUpdate,
  MessageResponse,
  ThreadListResponse,
  ThreadDetailResponse,
  QuickReplyListResponse,
  UseChatReturn,
  UseQuickRepliesReturn,
  UsePresenceReturn,
} from '@/types/chat';

// ============== Configuration ==============

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || '';
const WS_RECONNECT_DELAY = 3000;
const WS_MAX_RECONNECT_ATTEMPTS = 5;
const TYPING_DEBOUNCE_MS = 3000;

// ============== WebSocket Context ==============

interface WebSocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  isConnected: false,
  connectionError: null,
  reconnect: () => {},
});

/**
 * WebSocket Provider Component
 * Manages Socket.IO connection with automatic reconnection
 */
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!WS_URL) {
      console.warn('WebSocket URL not configured');
      return;
    }

    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: WS_MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: WS_RECONNECT_DELAY,
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('WebSocket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      setConnectionError(error.message);
      reconnectAttempts.current += 1;
      console.error('WebSocket connection error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    connect();
  }, [socket, connect]);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      connectionError,
      reconnect,
    }),
    [socket, isConnected, connectionError, reconnect]
  );

  return (
    <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
  );
}

/**
 * Hook to access WebSocket context
 */
export function useWebSocket() {
  return useContext(WebSocketContext);
}

// ============== useChat Hook ==============

interface UseChatOptions {
  /** Auto-connect to thread room on mount */
  autoJoin?: boolean;
  /** Thread ID to join */
  threadId?: string;
  /** Enable typing indicators */
  enableTyping?: boolean;
}

/**
 * Main chat hook for thread and message management
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { autoJoin = true, threadId, enableTyping = true } = options;
  const { socket, isConnected } = useWebSocket();

  // State
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  // API base URL
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  // Fetch threads
  const fetchThreads = useCallback(
    async (params?: { status?: string; assignedTo?: string; page?: number; limit?: number }) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set('status', params.status);
        if (params?.assignedTo) queryParams.set('assigned_to', params.assignedTo);
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());

        const response = await fetch(`${apiBase}/chat/threads?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch threads');
        }

        const data: ThreadListResponse = await response.json();
        setThreads(data.items);
        setUnreadCount(data.unread_count);
        setHasMore(data.has_more);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Fetch single thread
  const fetchThread = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/threads/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch thread');
        }

        const data: ThreadDetailResponse = await response.json();
        setCurrentThread(data.thread);
        setMessages(data.messages.items);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Create thread
  const createThread = useCallback(
    async (data: ThreadCreate) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/threads`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create thread');
        }

        const newThread: ChatThread = await response.json();
        setThreads((prev) => [newThread, ...prev]);
        setCurrentThread(newThread);

        return newThread;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Update thread
  const updateThread = useCallback(
    async (id: string, data: ThreadUpdate) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/threads/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update thread');
        }

        const updatedThread: ChatThread = await response.json();
        setCurrentThread(updatedThread);
        setThreads((prev) =>
          prev.map((t) => (t.id === id ? updatedThread : t))
        );

        return updatedThread;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Fetch messages
  const fetchMessages = useCallback(
    async (
      threadId: string,
      params?: { before?: string; after?: string; limit?: number }
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params?.before) queryParams.set('before', params.before);
        if (params?.after) queryParams.set('after', params.after);
        if (params?.limit) queryParams.set('limit', params.limit.toString());

        const response = await fetch(
          `${apiBase}/chat/threads/${threadId}/messages?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages((prev) => [...data.items, ...prev]);
        setHasMore(data.has_more);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Send message
  const sendMessage = useCallback(
    async (data: MessageCreate) => {
      if (!socket || !isConnected) {
        throw new Error('WebSocket not connected');
      }

      const clientMessageId = crypto.randomUUID();
      const wsMessage: WSMessageSend = {
        event: WSEvent.MESSAGE_SEND,
        data: {
          thread_id: data.threadId,
          content: data.content,
          content_type: data.contentType,
          attachments: data.attachments,
          reply_to_id: data.replyToId,
          location: data.location,
          quote_data: data.quoteData,
          client_message_id: clientMessageId,
        },
      };

      socket.emit('message:send', wsMessage);

      // Return optimistic message
      const optimisticMessage: ChatMessage = {
        id: clientMessageId,
        threadId: data.threadId,
        content: data.content,
        contentType: data.contentType,
        sequenceNumber: -1,
        senderType: 'contractor' as any,
        senderId: localStorage.getItem('userId') || undefined,
        attachments: data.attachments,
        replyToId: data.replyToId,
        location: data.location,
        quoteData: data.quoteData,
        createdAt: new Date(),
        isDeleted: false,
        isRead: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      return optimisticMessage;
    },
    [socket, isConnected]
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch(`${apiBase}/chat/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete message');
        }

        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [apiBase]
  );

  // Mark as read
  const markAsRead = useCallback(
    async (threadId: string) => {
      try {
        await fetch(`${apiBase}/chat/threads/${threadId}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        setMessages((prev) =>
          prev.map((m) => (m.readAt ? m : { ...m, readAt: new Date() }))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    },
    [apiBase]
  );

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socket || !isConnected || !currentThread || !enableTyping) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit('typing:start', {
        thread_id: currentThread.id,
      });
    }

    // Reset timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      stopTyping();
    }, TYPING_DEBOUNCE_MS);
  }, [socket, isConnected, currentThread, enableTyping]);

  const stopTyping = useCallback(() => {
    if (!socket || !isConnected || !currentThread || !enableTyping) return;

    if (isTyping.current) {
      isTyping.current = false;
      socket.emit('typing:stop', {
        thread_id: currentThread.id,
      });
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  }, [socket, isConnected, currentThread, enableTyping]);

  // Join thread room
  const joinThread = useCallback(
    (id: string) => {
      if (!socket || !isConnected) return;
      socket.emit('thread:join', { thread_id: id });
    },
    [socket, isConnected]
  );

  // Leave thread room
  const leaveThread = useCallback(
    (id: string) => {
      if (!socket || !isConnected) return;
      socket.emit('thread:leave', { thread_id: id });
    },
    [socket, isConnected]
  );

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return;

    // New message received
    const handleNewMessage = (data: WSMessageNew) => {
      const newMessage: ChatMessage = {
        id: data.id,
        threadId: data.thread_id,
        content: data.content,
        contentType: data.content_type,
        sequenceNumber: data.sequence_number,
        senderType: data.sender_type,
        senderId: data.sender_id,
        attachments: data.attachments,
        replyToId: data.reply_to_id,
        location: data.location,
        quoteData: data.quote_data,
        readAt: data.read_at ? new Date(data.read_at) : undefined,
        createdAt: new Date(data.created_at),
        isDeleted: false,
        isRead: !!data.read_at,
      };

      setMessages((prev) => {
        // Avoid duplicates (client-generated IDs)
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev.map((m) => (m.id === newMessage.id ? newMessage : m));
        }
        return [...prev, newMessage];
      });

      // Update thread preview
      setThreads((prev) =>
        prev.map((t) =>
          t.id === data.thread_id
            ? {
                ...t,
                lastMessageAt: new Date(data.created_at),
                lastMessagePreview: data.content.substring(0, 100),
                lastMessageSender: data.sender_type,
              }
            : t
        )
      );
    };

    // Typing started
    const handleTypingStart = (data: WSTypingStart) => {
      if (currentThread?.id === data.thread_id) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.user_id)) {
            return [...prev, data.user_id];
          }
          return prev;
        });
      }
    };

    // Typing stopped
    const handleTypingStop = (data: WSTypingStop) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
    };

    // Read receipt
    const handleReadReceipt = (data: WSReadReceipt) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.threadId === data.thread_id && !m.readAt
            ? { ...m, readAt: new Date(data.read_at) }
            : m
        )
      );
    };

    // Presence update
    const handlePresenceUpdate = (data: WSPresenceUpdate) => {
      // Handle presence update (can be used for online indicators)
      console.log('Presence update:', data);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:read', handleReadReceipt);
    socket.on('presence:update', handlePresenceUpdate);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('message:read', handleReadReceipt);
      socket.off('presence:update', handlePresenceUpdate);
    };
  }, [socket, currentThread]);

  // Auto-join thread on mount
  useEffect(() => {
    if (autoJoin && threadId && isConnected) {
      joinThread(threadId);
      fetchThread(threadId);

      return () => {
        leaveThread(threadId);
      };
    }
  }, [autoJoin, threadId, isConnected, joinThread, leaveThread, fetchThread]);

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
  };
}

// ============== useQuickReplies Hook ==============

/**
 * Hook for managing quick reply templates
 */
export function useQuickReplies(): UseQuickRepliesReturn {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  // Fetch quick replies
  const fetchReplies = useCallback(
    async (params?: { category?: string; search?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.set('category', params.category);
        if (params?.search) queryParams.set('search', params.search);

        const response = await fetch(`${apiBase}/chat/quick-replies?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quick replies');
        }

        const data: QuickReplyListResponse = await response.json();
        setReplies(data.items);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Create quick reply
  const createReply = useCallback(
    async (data: QuickReplyCreate) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/quick-replies`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create quick reply');
        }

        const newReply: QuickReply = await response.json();
        setReplies((prev) => [...prev, newReply]);

        return newReply;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Update quick reply
  const updateReply = useCallback(
    async (id: string, data: QuickReplyUpdate) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/quick-replies/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update quick reply');
        }

        const updatedReply: QuickReply = await response.json();
        setReplies((prev) =>
          prev.map((r) => (r.id === id ? updatedReply : r))
        );

        return updatedReply;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Delete quick reply
  const deleteReply = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`${apiBase}/chat/quick-replies/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete quick reply');
        }

        setReplies((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [apiBase]
  );

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
        });

        if (!response.ok) {
          throw new Error('Failed to use quick reply');
        }

        const result: QuickReply = await response.json();

        // Update usage count in local state
        setReplies((prev) =>
          prev.map((r) => (r.id === id ? result : r))
        );

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [apiBase]
  );

  return {
    replies,
    isLoading,
    error,
    fetchReplies,
    createReply,
    updateReply,
    deleteReply,
    useReply,
  };
}

// ============== usePresence Hook ==============

/**
 * Hook for managing user presence
 */
export function usePresence(userId?: string): UsePresenceReturn {
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { socket, isConnected } = useWebSocket();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  // Fetch presence
  const fetchPresence = useCallback(
    async (targetUserId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/presence/${targetUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch presence');
        }

        const data: UserPresence = await response.json();
        setPresence(data);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Update own presence
  const updatePresence = useCallback(
    async (status: PresenceStatus) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/presence`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error('Failed to update presence');
        }

        const data: UserPresence = await response.json();
        setPresence(data);

        // Broadcast via WebSocket
        if (socket && isConnected) {
          socket.emit('presence:update', { status });
        }

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase, socket, isConnected]
  );

  // Fetch presence on mount if userId provided
  useEffect(() => {
    if (userId) {
      fetchPresence(userId);
    }
  }, [userId, fetchPresence]);

  // Listen for presence updates
  useEffect(() => {
    if (!socket || !userId) return;

    const handlePresenceUpdate = (data: WSPresenceUpdate) => {
      if (data.user_id === userId) {
        setPresence((prev) =>
          prev
            ? {
                ...prev,
                status: data.status,
                lastSeenAt: new Date(data.last_seen_at),
              }
            : prev
        );
      }
    };

    socket.on('presence:update', handlePresenceUpdate);

    return () => {
      socket.off('presence:update', handlePresenceUpdate);
    };
  }, [socket, userId]);

  return {
    presence,
    isLoading,
    error,
    fetchPresence,
    updatePresence,
  };
}

// ============== useInternalNotes Hook ==============

interface UseInternalNotesReturn {
  notes: ChatNote[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: (threadId: string) => Promise<ChatNote[]>;
  createNote: (threadId: string, content: string) => Promise<ChatNote>;
  updateNote: (threadId: string, noteId: string, content: string) => Promise<ChatNote>;
  deleteNote: (threadId: string, noteId: string) => Promise<void>;
}

/**
 * Hook for managing internal notes (contractor-only)
 */
export function useInternalNotes(): UseInternalNotesReturn {
  const [notes, setNotes] = useState<ChatNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  // Fetch notes
  const fetchNotes = useCallback(
    async (threadId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/notes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }

        const data: ChatNote[] = await response.json();
        setNotes(data);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Create note
  const createNote = useCallback(
    async (threadId: string, content: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to create note');
        }

        const newNote: ChatNote = await response.json();
        setNotes((prev) => [...prev, newNote]);

        return newNote;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Update note
  const updateNote = useCallback(
    async (threadId: string, noteId: string, content: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${apiBase}/chat/threads/${threadId}/notes/${noteId}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update note');
        }

        const updatedNote: ChatNote = await response.json();
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? updatedNote : n))
        );

        return updatedNote;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Delete note
  const deleteNote = useCallback(
    async (threadId: string, noteId: string) => {
      try {
        const response = await fetch(
          `${apiBase}/chat/threads/${threadId}/notes/${noteId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete note');
        }

        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [apiBase]
  );

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}

// ============== useChatReports Hook ==============

interface UseChatReportsReturn {
  reports: ChatReport[];
  isLoading: boolean;
  error: string | null;
  createReport: (threadId: string, data: ReportCreate) => Promise<ChatReport>;
  fetchPendingReports: () => Promise<ChatReport[]>;
  resolveReport: (
    reportId: string,
    action: 'dismiss' | 'warn' | 'ban',
    notes?: string
  ) => Promise<ChatReport>;
}

/**
 * Hook for managing chat reports
 */
export function useChatReports(): UseChatReportsReturn {
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  // Create report
  const createReport = useCallback(
    async (threadId: string, data: ReportCreate) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/threads/${threadId}/report`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create report');
        }

        const newReport: ChatReport = await response.json();
        setReports((prev) => [...prev, newReport]);

        return newReport;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  // Fetch pending reports (admin only)
  const fetchPendingReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/chat/reports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data: ChatReport[] = await response.json();
      setReports(data);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiBase]);

  // Resolve report (admin only)
  const resolveReport = useCallback(
    async (
      reportId: string,
      action: 'dismiss' | 'warn' | 'ban',
      notes?: string
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/chat/reports/${reportId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, notes }),
        });

        if (!response.ok) {
          throw new Error('Failed to resolve report');
        }

        const updatedReport: ChatReport = await response.json();
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? updatedReport : r))
        );

        return updatedReport;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  return {
    reports,
    isLoading,
    error,
    createReport,
    fetchPendingReports,
    resolveReport,
  };
}

// ============== useFileUpload Hook ==============

interface UploadResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}

interface UseFileUploadReturn {
  isUploading: boolean;
  error: string | null;
  requestUploadUrl: (
    fileName: string,
    fileType: string,
    fileSize: number
  ) => Promise<UploadResponse>;
  uploadFile: (file: File) => Promise<string>;
}

/**
 * Hook for file uploads in chat
 */
export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  // Request presigned upload URL
  const requestUploadUrl = useCallback(
    async (fileName: string, fileType: string, fileSize: number) => {
      setIsUploading(true);
      setError(null);

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
        });

        if (!response.ok) {
          throw new Error('Failed to get upload URL');
        }

        const data: UploadResponse = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [apiBase]
  );

  // Upload file to presigned URL
  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      setIsUploading(true);
      setError(null);

      try {
        // Get presigned URL
        const { uploadUrl, fileUrl } = await requestUploadUrl(
          file.name,
          file.type,
          file.size
        );

        // Upload to storage
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        return fileUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [requestUploadUrl]
  );

  return {
    isUploading,
    error,
    requestUploadUrl,
    uploadFile,
  };
}

// ============== Exports ==============

export {
  WebSocketContext,
  type WebSocketContextValue,
};
