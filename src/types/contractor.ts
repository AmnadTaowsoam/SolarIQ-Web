/**
 * Frontend types and API hooks for WK-024 Contractor Profiles
 *
 * Contains TypeScript types and API hooks for the contractor profile feature.
 */

import { useState, useEffect, useCallback } from 'react';

// ============== Enums ==============

export type BusinessType = 'company' | 'partnership' | 'sole_proprietor';
export type EmployeeCount = '1-5' | '6-15' | '16-50' | '51-100' | '100+';
export type CertificationType =
    | 'electrical_license'
    | 'erc_license'
    | 'engineering_license'
    | 'iso_9001'
    | 'iso_14001'
    | 'brand_authorized'
    | 'training_cert'
    | 'insurance'
    | 'other';
export type VerificationStatus = 'pending_review' | 'verified' | 'rejected' | 'expired';
export type InstallationType = 'rooftop' | 'ground_mount' | 'carport' | 'floating';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type ModerationItemType = 'profile' | 'certification' | 'portfolio';

// ============== Base Types ==============

export interface TimestampMixin {
    created_at: string;
    updated_at?: string;
}

export interface UUIDMixin {
    id: string;
}

// ============== Image Types ==============

export interface PortfolioImage {
    url: string;
    thumbnail_url?: string;
    caption?: string;
    display_order: number;
}

// ============== Contractor Profile ==============

export interface ContractorProfile {
    org_id: string;
    company_name: string;
    short_description?: string;
    description?: string;
    logo_url?: string;
    cover_image_url?: string;
    founded_year?: number;
    employee_count?: EmployeeCount;
    business_type?: BusinessType;
    tax_id?: string;
    phone?: string;
    email?: string;
    website?: string;
    line_oa_id?: string;
    facebook_url?: string;
    google_maps_url?: string;
    address?: string;
    province?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    verified: boolean;
    verified_at?: string;
    verified_by?: string;
    completeness_score: number;
    active: boolean;
    created_at: string;
    updated_at?: string;
    certifications?: Certification[];
    portfolio_projects?: PortfolioProject[];
    team_members?: TeamMember[];
    packages?: ContractorPackage[];
    metrics?: ContractorMetrics | null;
}

export interface ContractorProfileUpdate {
    company_name?: string;
    short_description?: string;
    description?: string;
    logo_url?: string;
    cover_image_url?: string;
    founded_year?: number;
    employee_count?: EmployeeCount;
    business_type?: BusinessType;
    tax_id?: string;
    phone?: string;
    email?: string;
    website?: string;
    line_oa_id?: string;
    facebook_url?: string;
    google_maps_url?: string;
    address?: string;
    province?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
}

export interface ContractorProfilePublic {
    org_id: string;
    company_name: string;
    short_description?: string;
    logo_url?: string;
    cover_image_url?: string;
    province?: string;
    district?: string;
    verified: boolean;
    completeness_score: number;
    total_projects: number;
    total_capacity_kw: number;
    avg_rating?: number;
    total_reviews: number;
    created_at: string;
}

export interface ContractorDirectoryFilters {
    province?: string;
    installation_type?: InstallationType;
    min_capacity_kw?: number;
    verified_only?: boolean;
    search?: string;
}

export interface ContractorDirectoryListResponse {
    items: ContractorProfilePublic[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    filters?: ContractorDirectoryFilters;
}

export interface ContractorProfileCompleteness {
    score: number;
    breakdown: Record<string, any>;
    missing_items: string[];
}

// ============== Certification ==============

export interface Certification {
    id: string;
    type: CertificationType;
    name: string;
    issuer?: string;
    license_number?: string;
    issue_date?: string;
    expiry_date?: string;
    image_url: string;
    verification_status: VerificationStatus;
    is_verified: boolean;
    is_expired: boolean;
}

export interface CertificationCreate {
    type: CertificationType;
    name: string;
    issuer?: string;
    license_number?: string;
    issue_date?: string;
    expiry_date?: string;
    image_url: string;
}

export interface CertificationUpdate {
    type?: CertificationType;
    name?: string;
    issuer?: string;
    license_number?: string;
    issue_date?: string;
    expiry_date?: string;
    image_url?: string;
}

// ============== Portfolio Project ==============

export interface PortfolioProject {
    id: string;
    org_id: string;
    title: string;
    description?: string;
    customer_name?: string;
    location_province: string;
    location_district?: string;
    system_size_kw: number;
    panel_brand?: string;
    panel_model?: string;
    inverter_brand?: string;
    inverter_model?: string;
    installation_type: InstallationType;
    completion_date: string;
    images: PortfolioImage[];
    featured: boolean;
    display_order: number;
}

export interface PortfolioProjectCreate {
    title: string;
    description?: string;
    customer_name?: string;
    location_province: string;
    location_district?: string;
    system_size_kw: number;
    panel_brand?: string;
    panel_model?: string;
    inverter_brand?: string;
    inverter_model?: string;
    installation_type: InstallationType;
    completion_date: string;
    images?: PortfolioImage[];
    featured?: boolean;
    display_order?: number;
}

export interface PortfolioProjectUpdate {
    title?: string;
    description?: string;
    customer_name?: string;
    location_province?: string;
    location_district?: string;
    system_size_kw?: number;
    panel_brand?: string;
    panel_model?: string;
    inverter_brand?: string;
    inverter_model?: string;
    installation_type?: InstallationType;
    completion_date?: string;
    images?: PortfolioImage[];
    featured?: boolean;
    display_order?: number;
}

export interface PortfolioStats {
    total_projects: number;
    total_capacity_kw: number;
    by_installation_type: Record<InstallationType, number>;
    by_province: Record<string, number>;
    avg_system_size_kw?: number;
    newest_project_date?: string;
    oldest_project_date?: string;
}

// ============== Team Member ==============

export interface TeamMember {
    id: string;
    org_id: string;
    name: string;
    photo_url?: string;
    role: string;
    title?: string;
    certifications?: string[];
    experience_years?: number;
    languages?: string[];
    bio?: string;
    display_order: number;
    active: boolean;
}

export interface TeamMemberCreate {
    name: string;
    photo_url?: string;
    role: string;
    title?: string;
    certifications?: string[];
    experience_years?: number;
    languages?: string[];
    bio?: string;
    display_order?: number;
    active?: boolean;
}

export interface TeamMemberUpdate {
    name?: string;
    photo_url?: string;
    role?: string;
    title?: string;
    certifications?: string[];
    experience_years?: number;
    languages?: string[];
    bio?: string;
    display_order?: number;
    active?: boolean;
}

// ============== Contractor Package ==============

export interface ContractorPackage {
    id: string;
    org_id: string;
    name: string;
    description?: string;
    price_per_kw?: number;
    min_system_size_kw?: number;
    max_system_size_kw?: number;
    panel_brands?: string[];
    inverter_brands?: string[];
    warranty_panel_years: number;
    warranty_inverter_years: number;
    warranty_install_years: number;
    warranty_roof_leak_years?: number;
    warranty_additional?: string;
    features?: string[];
    payment_options?: string[];
    financing_partners?: string[];
    popular: boolean;
    display_order: number;
    active: boolean;
}

export interface ContractorPackageCreate {
    name: string;
    description?: string;
    price_per_kw?: number;
    min_system_size_kw?: number;
    max_system_size_kw?: number;
    panel_brands?: string[];
    inverter_brands?: string[];
    warranty_panel_years: number;
    warranty_inverter_years: number;
    warranty_install_years: number;
    warranty_roof_leak_years?: number;
    warranty_additional?: string;
    features?: string[];
    payment_options?: string[];
    financing_partners?: string[];
    popular: boolean;
    display_order?: number;
    active?: boolean;
}

export interface ContractorPackageUpdate {
    name?: string;
    description?: string;
    price_per_kw?: number;
    min_system_size_kw?: number;
    max_system_size_kw?: number;
    panel_brands?: string[];
    inverter_brands?: string[];
    warranty_panel_years?: number;
    warranty_inverter_years?: number;
    warranty_install_years?: number;
    warranty_roof_leak_years?: number;
    warranty_additional?: string;
    features?: string[];
    payment_options?: string[];
    financing_partners?: string[];
    popular?: boolean;
    display_order?: number;
    active?: boolean;
}

// ============== Contractor Metrics ==============

export interface ContractorMetrics {
    org_id: string;
    avg_response_time_hours?: number;
    lead_acceptance_rate?: number;
    quote_to_close_rate?: number;
    avg_completion_days?: number;
    active_since?: string;
    total_leads_received: number;
    total_leads_accepted: number;
    total_quotes_sent: number;
    total_deals_completed: number;
    total_installations: number;
    total_kw_installed: number;
    last_calculated: string;
}

// ============== Moderation ==============

export interface ModerationQueueItem {
    id: string;
    org_id: string;
    company_name?: string;
    item_type: ModerationItemType;
    item_id: string;
    status: ModerationStatus;
    data_snapshot?: Record<string, any>;
    submitted_at: string;
    reviewed_by?: string;
    reviewed_at?: string;
    rejection_reason?: string;
}

export interface ModerationReview {
    action: 'approve' | 'reject';
    rejection_reason?: string;
}

// ============== API Response Types ==============

export interface ImageUploadResponse {
    url: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
    file_size_bytes?: number;
}

export interface PresignedUploadRequest {
    file_name: string;
    content_type: string;
    image_type: 'logo' | 'cover' | 'certification' | 'portfolio' | 'team';
    portfolio_id?: string;
}

export interface PresignedUploadResponse {
    upload_url: string;
    file_url: string;
    expires_in: number;
}

// ============== API Hooks ==============

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const getAuthHeaders = (): HeadersInit => {
    const headers = new Headers();
    const token = localStorage.getItem('auth_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}, [{ }];
);

// Contractor API
export const contractorApi = {
    // Directory
    listContractors: async (params?: {
        page?: number;
        page_size?: number;
        province?: string;
        verified_only?: boolean;
        search?: string;
    }): Promise<ContractorDirectoryListResponse> => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.set('page', '1');
        if (page_size) queryParams.set('page_size', '20');
        if (province) queryParams.set('province', province);
        if (verified_only) queryParams.set('verified_only', 'true');
        if (search) queryParams.set('search', search);
        if (installation_type) queryParams.set('installation_type', installationType);
        if (minCapacity_kw) queryParams.set('min_capacity_kw', minCapacityKw.toString());

        const response = await fetch(`${API_BASE_URL}/contractors?${queryParams.toString()}`,      if (!response.ok) {
            throw new Error('Failed to list contractors');
        }
        return response.json();
    },

    // Get contractor detail
    getContractor: async (orgId: string): Promise<ContractorProfile> => {
        const response = await fetch(`${API_BASE_URL}/contractors/${orgId}`);
        if (!response.ok) {
            throw new Error('Failed to get contractor');
        }
        return response.json();
    },

    // Get my profile
    getMyProfile: async (): Promise<ContractorProfile> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to get profile');
        }
        return response.json();
    },

    // Update my profile
    updateMyProfile: async (data: ContractorProfileUpdate): Promise<ContractorProfile> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        return response.json();
    },

    // Upload logo
    uploadLogo: async (file: File): Promise<ImageUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/contractors/me/logo`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload logo');
        }
        return response.json();
    },

    // Upload cover image
    uploadCoverImage: async (file: File): Promise<ImageUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/contractors/me/cover-image`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload cover image');
        }
        return response.json();
    },

    // Certifications
    listCertifications: async (): Promise<Certification[]> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/certifications`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to list certifications');
        }
        return response.json();
    },

    createCertification: async (data: CertificationCreate): Promise<Certification> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/certifications`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create certification');
        }
        return response.json();
    },

    updateCertification: async (certId: string, data: CertificationUpdate): Promise<Certification> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/certifications/${certId}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update certification');
        }
        return response.json();
    },

    deleteCertification: async (certId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/certifications/${certId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to delete certification');
        }
    },

    // Portfolio
    listPortfolio: async (): Promise<PortfolioProject[]> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/portfolio`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to list portfolio');
        }
        return response.json();
    },

    createPortfolioProject: async (data: PortfolioProjectCreate): Promise<PortfolioProject> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/portfolio`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create portfolio project');
        }
        return response.json();
    },

    updatePortfolioProject: async (projectId: string, data: PortfolioProjectUpdate): Promise<PortfolioProject> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/portfolio/${projectId}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update portfolio project');
        }
        return response.json();
    },

    deletePortfolioProject: async (projectId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/portfolio/${projectId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to delete portfolio project');
        }
    },

    // Team Members
    listTeamMembers: async (): Promise<TeamMember[]> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/team`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to list team members');
        }
        return response.json();
    },

    createTeamMember: async (data: TeamMemberCreate): Promise<TeamMember> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/team`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create team member');
        }
        return response.json();
    },

    updateTeamMember: async (memberId: string, data: TeamMemberUpdate): Promise<TeamMember> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/team/${memberId}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update team member');
        }
        return response.json();
    },

    deleteTeamMember: async (memberId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/team/${memberId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to delete team member');
        }
    },

    // Packages
    listPackages: async (): Promise<ContractorPackage[]> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/packages`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to list packages');
        }
        return response.json();
    },

    createPackage: async (data: ContractorPackageCreate): Promise<ContractorPackage> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/packages`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to create package');
        }
        return response.json();
    },

    updatePackage: async (packageId: string, data: ContractorPackageUpdate): Promise<ContractorPackage> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/packages/${packageId}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update package');
        }
        return response.json();
    },

    deletePackage: async (packageId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/packages/${packageId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to delete package');
        }
    },

    // Completeness
    getCompleteness: async (): Promise<ContractorProfileCompleteness> => {
        const response = await fetch(`${API_BASE_URL}/contractors/me/completeness`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to get completeness');
        }
        return response.json();
    },

    // Presigned Upload URL
    getPresignedUploadUrl: async (request: PresignedUploadRequest): Promise<PresignedUploadResponse> => {
        const response = await fetch(`${API_BASE_URL}/contractors/images/presigned-url`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            throw new Error('Failed to get presigned upload URL');
        }
        return response.json();
    },
}

export default contractorApi;
