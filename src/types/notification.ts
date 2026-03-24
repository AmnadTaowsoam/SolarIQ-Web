// Notification types for SolarIQ-Web

export type NotificationCategory =
  | 'lead'
  | 'deal'
  | 'review'
  | 'system'
  | 'chat'
  | 'proposal'
  | 'payment'
  | 'installation'

export type NotificationEventType =
  | 'new_lead'
  | 'lead_assigned'
  | 'lead_updated'
  | 'deal_created'
  | 'deal_status_changed'
  | 'new_review'
  | 'review_response'
  | 'new_message'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_declined'
  | 'payment_received'
  | 'installation_scheduled'
  | 'installation_completed'
  | 'system_alert'

export interface Notification {
  id: string
  event_type: NotificationEventType
  category: NotificationCategory
  title: string
  body?: string
  data: Record<string, unknown>
  action_url?: string | null
  read: boolean
  created_at: string
  expires_at?: string
}

export interface NotificationPreferences {
  push_enabled: boolean
  email_enabled: boolean
  categories: Partial<Record<NotificationCategory, boolean>>
}

export interface NotificationListResponse {
  items: Notification[]
  total: number
  unread_count: number
  page: number
  page_size: number
}
