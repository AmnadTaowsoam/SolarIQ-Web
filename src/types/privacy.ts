/**
 * Privacy and PDPA compliance types (WK-018)
 */

export enum ConsentType {
  DATA_COLLECTION = 'data_collection',
  BILL_ANALYSIS = 'bill_analysis',
  LOCATION_DATA = 'location_data',
  MARKETING = 'marketing',
  DATA_SHARING = 'data_sharing',
}

export enum DeletionRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum DeletionRequestType {
  FULL_DELETION = 'full_deletion',
  PARTIAL_DELETION = 'partial_deletion',
}

export enum DataAction {
  VIEW = 'view',
  EXPORT = 'export',
  SHARE = 'share',
  DELETE = 'delete',
}

export enum PrivacyResourceType {
  LEAD = 'lead',
  BILL_IMAGE = 'bill_image',
  SOLAR_ANALYSIS = 'solar_analysis',
  CHAT_HISTORY = 'chat_history',
  USER_PROFILE = 'user_profile',
  CONSENT_RECORD = 'consent_record',
}

export interface ConsentTypeDetail {
  type: string;
  description: string;
  is_required: boolean;
}

export interface ConsentTypesResponse {
  required: ConsentTypeDetail[];
  optional: ConsentTypeDetail[];
}

export interface ConsentResponse {
  id: string;
  user_id: string;
  consent_type: string;
  granted: boolean;
  ip_address: string | null;
  granted_at: string | null;
  revoked_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsentStatusResponse {
  user_id: string;
  consents: ConsentResponse[];
  has_all_required: boolean;
  missing_required: string[];
  can_use_service: boolean;
}

export interface ConsentCreate {
  consent_type: ConsentType;
  granted: boolean;
  ip_address?: string;
  user_agent?: string;
  version?: string;
}

export interface ConsentBatchCreate {
  consents: { consent_type: ConsentType; granted: boolean }[];
  ip_address?: string;
  user_agent?: string;
}

export interface DeletionRequestResponse {
  id: string;
  user_id: string;
  request_type: string;
  status: DeletionRequestStatus;
  requested_at: string;
  completed_at: string | null;
  processed_by: string | null;
  notes: string | null;
  rejection_reason: string | null;
  resources_deleted: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DeletionRequestCreate {
  request_type: DeletionRequestType;
  notes?: string;
}

export interface DeletionRequestList {
  requests: DeletionRequestResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface DataAccessLogResponse {
  id: number;
  user_id: string;
  accessed_by: string;
  resource_type: string;
  resource_id: string;
  action: DataAction;
  ip_address: string | null;
  accessed_at: string;
  metadata_: Record<string, unknown> | null;
}

export interface DataAccessLogList {
  logs: DataAccessLogResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface DataExportResponse {
  user_id: string;
  exported_at: string;
  resources_included: string[];
  download_url: string | null;
  expires_at: string | null;
}

export interface RetentionPolicyResponse {
  id: string;
  resource_type: string;
  retention_days: number;
  description: string | null;
  is_active: boolean;
  last_enforced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessSummary {
  user_id: string;
  total_accesses: number;
  by_resource_type: Record<string, number>;
  recent_accesses: Array<{
    resource_type: string;
    action: string;
    accessed_by: string;
    accessed_at: string;
  }>;
}

// Consent type descriptions in Thai
export const CONSENT_DESCRIPTIONS: Record<string, string> = {
  [ConsentType.DATA_COLLECTION]: 'ยินยอมให้เก็บข้อมูลส่วนบุคคล',
  [ConsentType.BILL_ANALYSIS]: 'ยินยอมให้วิเคราะห์ข้อมูลบิลค่าไฟ',
  [ConsentType.LOCATION_DATA]: 'ยินยอมให้เก็บข้อมูลตำแหน่งที่ตั้ง',
  [ConsentType.MARKETING]: 'ยินยอมให้ติดต่อเพื่อนำเสนอบริการ',
  [ConsentType.DATA_SHARING]: 'ยินยอมให้แชร์ข้อมูลกับผู้รับเหมาโซลาร์',
};

// Required consent types
export const REQUIRED_CONSENTS: ConsentType[] = [
  ConsentType.DATA_COLLECTION,
  ConsentType.BILL_ANALYSIS,
  ConsentType.LOCATION_DATA,
];

// Optional consent types
export const OPTIONAL_CONSENTS: ConsentType[] = [
  ConsentType.MARKETING,
  ConsentType.DATA_SHARING,
];
