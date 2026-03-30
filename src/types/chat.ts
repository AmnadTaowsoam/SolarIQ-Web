/**
 * Chat types for SolarIQ Web (WK-028)
 *
 * This module defines TypeScript types for the chat messaging system
 * including threads, messages, quick replies, notes, reports, and presence.
 */

// ============== Enums ==============

export enum ThreadStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CLOSED = 'closed',
}

export enum SenderType {
  B2C = 'b2c',
  CONTRACTOR = 'contractor',
  SYSTEM = 'system',
}

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  LOCATION = 'location',
  QUOTE_CARD = 'quote_card',
  SYSTEM = 'system',
}

export enum QuickReplyCategory {
  GREETING = 'greeting',
  PRICING = 'pricing',
  SCHEDULING = 'scheduling',
  FOLLOW_UP = 'follow_up',
  CLOSING = 'closing',
  CUSTOM = 'custom',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE = 'inappropriate',
  FRAUD = 'fraud',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACTIONED = 'actioned',
  DISMISSED = 'dismissed',
}

export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  OFFLINE = 'offline',
}

// ============== Attachment Types ==============

export interface FileAttachment {
  /** File URL */
  url: string
  /** Thumbnail URL for images */
  thumbnailUrl?: string
  /** Original file name */
  fileName: string
  /** File size in bytes */
  fileSize: number
  /** File MIME type */
  mimeType: string
}

export interface LocationData {
  /** Latitude */
  lat: number
  /** Longitude */
  lng: number
  /** Human-readable address */
  address?: string
}

export interface QuoteCardData {
  /** Quote ID */
  quoteId: string
  /** System size in kW */
  systemSize: number
  /** Total price in THB */
  totalPrice: number
  /** Quote validity date */
  validUntil?: Date
}

// ============== Message Types ==============

export interface MessageBase {
  /** Message content */
  content: string
  /** Content type */
  contentType: ContentType
  /** File attachments */
  attachments?: FileAttachment[]
  /** ID of message being replied to */
  replyToId?: string
  /** Location data for location messages */
  location?: LocationData
  /** Quote data for quote messages */
  quoteData?: QuoteCardData
  /** Client-generated ID for deduplication */
  clientMessageId?: string
}

export interface MessageCreate extends MessageBase {
  /** Thread ID */
  threadId: string
}

export interface MessageInDB extends MessageBase {
  /** Message ID */
  id: string
  /** Thread ID */
  threadId: string
  /** Sequence number for ordering */
  sequenceNumber: number
  /** Sender type */
  senderType: SenderType
  /** Sender user ID */
  senderId?: string
  /** Read timestamp */
  readAt?: Date
  /** Deletion timestamp */
  deletedAt?: Date
  /** Creation timestamp */
  createdAt: Date
}

export interface MessageResponse extends MessageInDB {
  /** Whether message is deleted */
  isDeleted: boolean
  /** Whether message is read */
  isRead: boolean
  /** Replied message */
  replyTo?: MessageInDB
}

// ============== Thread Types ==============

export interface ThreadMetadata {
  /** Customer name */
  customerName?: string
  /** Property type */
  propertyType?: string
  /** System size */
  systemSize?: number
  /** Location */
  location?: string
}

export interface ThreadBase {
  /** Lead ID */
  leadId?: string
  /** Deal ID */
  dealId?: string
  /** B2C user ID */
  b2cUserId: string
  /** Contractor ID */
  contractorId: string
  /** Organization ID */
  orgId: string
  /** Thread status */
  status: ThreadStatus
  /** Thread metadata */
  metadata?: ThreadMetadata
}

export type ThreadCreate = ThreadBase

export interface ThreadUpdate {
  /** Thread status */
  status?: ThreadStatus
  /** Assigned user ID */
  assignedTo?: string
  /** Thread metadata */
  metadata?: ThreadMetadata
}

export interface ThreadInDB extends ThreadBase {
  /** Thread ID */
  id: string
  /** Last message timestamp */
  lastMessageAt?: Date
  /** Last message preview */
  lastMessagePreview?: string
  /** Last message sender type */
  lastMessageSender?: SenderType
  /** Unread count for B2C user */
  unreadB2c: number
  /** Unread count for contractor */
  unreadContractor: number
  /** Assigned user ID */
  assignedTo?: string
  /** Assignment timestamp */
  assignedAt?: Date
  /** Creation timestamp */
  createdAt: Date
  /** Update timestamp */
  updatedAt: Date
}

export interface ThreadWithLastMessage extends ThreadInDB {
  /** Last message */
  lastMessage?: MessageResponse
}

export interface ThreadWithCustomer extends ThreadWithLastMessage {
  /** Customer name */
  customerName?: string
  /** Customer phone */
  customerPhone?: string
  /** Customer email */
  customerEmail?: string
  /** Lead status */
  leadStatus?: string
  /** Deal stage */
  dealStage?: string
  /** Property details */
  propertyDetails?: Record<string, unknown>
  /** Solar system details */
  solarSystemDetails?: Record<string, unknown>
}

export interface ThreadListResponse {
  /** List of threads */
  threads: ThreadWithLastMessage[]
  /** Total count */
  total: number
  /** Unread total */
  unreadTotal: number
}

export interface ThreadDetailResponse extends ThreadWithCustomer {
  /** Messages */
  messages: MessageResponse[]
  /** Has more messages */
  hasMore: boolean
  /** Internal notes */
  notes: NoteResponse[]
}

// ============== Quick Reply Types ==============

export interface QuickReplyBase {
  /** Template title */
  title: string
  /** Template content */
  content: string
  /** Template category */
  category: QuickReplyCategory
}

export type QuickReplyCreate = QuickReplyBase

export interface QuickReplyUpdate {
  /** Template title */
  title?: string
  /** Template content */
  content?: string
  /** Template category */
  category?: QuickReplyCategory
  /** Active status */
  active?: boolean
  /** Sort order */
  sortOrder?: number
}

export interface QuickReplyInDB extends QuickReplyBase {
  /** Template ID */
  id: string
  /** Contractor ID */
  contractorId?: string
  /** Organization ID */
  orgId: string
  /** Usage count */
  usageCount: number
  /** Last used timestamp */
  lastUsedAt?: Date
  /** Extracted variable names */
  variables?: string[]
  /** Active status */
  active: boolean
  /** Sort order */
  sortOrder: number
  /** Creation timestamp */
  createdAt: Date
  /** Update timestamp */
  updatedAt: Date
}

export interface QuickReplyListResponse {
  /** List of templates */
  templates: QuickReplyInDB[]
  /** Total count */
  total: number
}

export interface QuickReplyUseRequest {
  /** Variable values */
  variables: Record<string, string>
}

// ============== Note Types ==============

export interface NoteBase {
  /** Note content */
  content: string
  /** Whether note is pinned */
  pinned: boolean
  /** Mentioned user IDs */
  mentionedUsers?: string[]
}

export type NoteCreate = NoteBase

export interface NoteUpdate {
  /** Note content */
  content?: string
  /** Whether note is pinned */
  pinned?: boolean
  /** Mentioned user IDs */
  mentionedUsers?: string[]
}

export interface NoteInDB extends NoteBase {
  /** Note ID */
  id: string
  /** Thread ID */
  threadId: string
  /** Author ID */
  authorId: string
  /** Creation timestamp */
  createdAt: Date
  /** Update timestamp */
  updatedAt: Date
}

export interface NoteResponse extends NoteInDB {
  /** Author name */
  authorName?: string
}

// ============== Report Types ==============

export interface ReportBase {
  /** Report reason */
  reason: ReportReason
  /** Report description */
  description?: string
}

export interface ReportCreate extends ReportBase {
  /** Specific message ID being reported */
  messageId?: string
}

export interface ReportInDB extends ReportBase {
  /** Report ID */
  id: string
  /** Thread ID */
  threadId: string
  /** Message ID */
  messageId?: string
  /** Reporter ID */
  reporterId: string
  /** Reporter type */
  reporterType: SenderType
  /** Report status */
  status: ReportStatus
  /** Reviewer ID */
  reviewedBy?: string
  /** Action taken */
  actionTaken?: string
  /** Resolution note */
  resolutionNote?: string
  /** Resolution timestamp */
  resolvedAt?: Date
  /** Creation timestamp */
  createdAt: Date
}

export interface ReportResponse extends ReportInDB {
  /** Reviewer name */
  reviewerName?: string
}

export interface ReportResolveRequest {
  /** New status */
  status: ReportStatus
  /** Action taken */
  actionTaken?: string
  /** Resolution note */
  resolutionNote?: string
}

// ============== Presence Types ==============

export interface PresenceUpdate {
  /** Presence status */
  status: PresenceStatus
  /** Active thread ID */
  activeThreadId?: string
}

export interface PresenceResponse {
  /** User ID */
  userId: string
  /** Presence status */
  status: PresenceStatus
  /** Last seen timestamp */
  lastSeenAt: Date
  /** Active thread ID */
  activeThreadId?: string
}

// ============== Upload Types ==============

export interface UploadRequest {
  /** File name */
  fileName: string
  /** File MIME type */
  fileType: string
  /** File size in bytes */
  fileSize: number
}

export interface UploadResponse {
  /** Signed upload URL */
  uploadUrl: string
  /** Public file URL after upload */
  fileUrl: string
  /** Thumbnail URL for images */
  thumbnailUrl?: string
  /** Upload URL expiry in seconds */
  expiresIn: number
}

// ============== Pagination Types ==============

export interface ThreadFilter {
  /** Thread status filter */
  status?: ThreadStatus
  /** Search term */
  search?: string
  /** Assigned user filter */
  assignedTo?: string
  /** Has unread filter */
  hasUnread?: boolean
}

export interface MessagePagination {
  /** List of messages */
  messages: MessageResponse[]
  /** Has more messages */
  hasMore: boolean
}

// ============== WebSocket Event Types ==============

export type WSEventType =
  | 'message:send'
  | 'message:new'
  | 'message:ack'
  | 'message:error'
  | 'message:read'
  | 'typing:start'
  | 'typing:stop'
  | 'typing:indicator'
  | 'thread:join'
  | 'thread:leave'
  | 'thread:updated'
  | 'presence:changed'

export interface WSEventBase {
  /** Event type */
  eventType: WSEventType
}

export interface WSMessageSend extends WSEventBase {
  eventType: 'message:send'
  /** Thread ID */
  threadId: string
  /** Message content */
  content: string
  /** Content type */
  contentType: ContentType
  /** Client message ID */
  clientMessageId: string
  /** Attachments */
  attachments?: FileAttachment[]
  /** Location data */
  location?: LocationData
  /** Quote data */
  quoteData?: QuoteCardData
  /** Reply to ID */
  replyToId?: string
}

export interface WSMessageNew extends WSEventBase {
  eventType: 'message:new'
  /** New message */
  message: MessageResponse
}

export interface WSMessageAck extends WSEventBase {
  eventType: 'message:ack'
  /** Client message ID */
  clientMessageId: string
  /** Created message */
  message: MessageResponse
}

export interface WSMessageError extends WSEventBase {
  eventType: 'message:error'
  /** Client message ID */
  clientMessageId: string
  /** Error message */
  error: string
}

export interface WSMessageRead extends WSEventBase {
  eventType: 'message:read'
  /** Thread ID */
  threadId: string
  /** Message ID */
  messageId: string
  /** User ID */
  userId: string
}

export interface WSTypingStart extends WSEventBase {
  eventType: 'typing:start'
  /** Thread ID */
  threadId: string
}

export interface WSTypingStop extends WSEventBase {
  eventType: 'typing:stop'
  /** Thread ID */
  threadId: string
}

export interface WSTypingIndicator extends WSEventBase {
  eventType: 'typing:indicator'
  /** Thread ID */
  threadId: string
  /** User ID */
  userId: string
  /** Is typing */
  isTyping: boolean
}

export interface WSThreadJoin extends WSEventBase {
  eventType: 'thread:join'
  /** Thread ID */
  threadId: string
}

export interface WSThreadLeave extends WSEventBase {
  eventType: 'thread:leave'
  /** Thread ID */
  threadId: string
}

export interface WSThreadUpdated extends WSEventBase {
  eventType: 'thread:updated'
  /** Thread ID */
  threadId: string
  /** Last message */
  lastMessage: MessageResponse | null
  /** Unread count */
  unreadCount: number
}

export interface WSPresenceChanged extends WSEventBase {
  eventType: 'presence:changed'
  /** User ID */
  userId: string
  /** Presence status */
  status: PresenceStatus
}

// ============== Chat Hook Types ==============

export interface UseChatOptions {
  /** Auto-connect on mount */
  autoConnect?: boolean
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean
  /** Reconnect attempts */
  reconnectAttempts?: number
  /** Reconnect interval in ms */
  reconnectInterval?: number
}

export interface UseChatReturn {
  /** Connected threads */
  threads: ThreadWithLastMessage[]
  /** Active thread */
  activeThread: ThreadDetailResponse | null
  /** Messages for active thread */
  messages: MessageResponse[]
  /** Is connecting */
  isConnecting: boolean
  /** Is connected */
  isConnected: boolean
  /** Is typing indicator */
  isTyping: boolean
  /** Typing user ID */
  typingUserId: string | null
  /** Error */
  error: Error | null
  /** Connect to socket */
  connect: () => void
  /** Disconnect from socket */
  disconnect: () => void
  /** Join thread */
  joinThread: (threadId: string) => void
  /** Leave thread */
  leaveThread: (threadId: string) => void
  /** Send message */
  sendMessage: (data: MessageCreate) => void
  /** Mark as read */
  markAsRead: (threadId: string, messageId: string) => void
  /** Start typing indicator */
  startTyping: (threadId: string) => void
  /** Stop typing indicator */
  stopTyping: (threadId: string) => void
  /** Load more messages */
  loadMoreMessages: () => void
  /** Has more messages */
  hasMoreMessages: boolean
  /** Refresh threads */
  refreshThreads: () => void
}

export interface UseWebSocketOptions {
  /** Socket URL */
  url?: string
  /** Auth token */
  token: string
  /** Auto-connect */
  autoConnect?: boolean
  /** Reconnect attempts */
  reconnectAttempts?: number
  /** Reconnect interval */
  reconnectInterval?: number
}

// ============== Convenience Type Aliases ==============

/** Alias for QuickReplyInDB, used in UI components */
export type QuickReply = QuickReplyInDB

/** Alias for MessageResponse, used in UI components */
export type ChatMessage = MessageResponse

/** Alias for ThreadWithLastMessage, used in UI components */
export type ChatThread = ThreadWithLastMessage

export interface UseWebSocketReturn {
  /** Socket instance */
  socket: unknown | null
  /** Is connected */
  isConnected: boolean
  /** Is connecting */
  isConnecting: boolean
  /** Error */
  error: Error | null
  /** Connect */
  connect: () => void
  /** Disconnect */
  disconnect: () => void
  /** Emit event */
  emit: (event: string, data: unknown) => void
  /** Subscribe to event */
  on: (event: string, callback: (data: unknown) => void) => void
  /** Unsubscribe from event */
  off: (event: string, callback: (data: unknown) => void) => void
}
