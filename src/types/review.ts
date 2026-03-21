/**
 * Review & Rating Types for WK-026
 * 
 * Covers:
 * - Review submission by B2C users
 * - Contractor reply management
 * - Admin moderation
 * - Public rating summaries and badge calculation
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export enum ReviewStatus {
    PENDING = "pending",
    PUBLISHED = "published",
    REJECTED = "rejected",
    HIDDEN = "hidden",
}

export enum ReviewDimensionType {
    INSTALLATION_QUALITY = "installation_quality",
    COMMUNICATION = "communication",
    TIMELINE = "timeline",
    VALUE_FOR_MONEY = "value_for_money",
    CLEANLINESS = "cleanliness",
}

export enum ReportReason {
    INAPPROPRIATE = "inappropriate",
    FAKE = "fake",
    SPAM = "spam",
    OFFENSIVE = "offensive",
    PERSONAL_INFO = "personal_info",
    IRRELEVANT = "irrelevant",
    HARASSMENT = "harassment",
    OTHER = "other",
}

// ─────────────────────────────────────────────────────────────────────────────
// Dimension schemas
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionScore {
    dimension: ReviewDimensionType;
    score: number; // 1-5
}

export interface DimensionScoreResponse {
    dimension: ReviewDimensionType;
    score: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Review schemas
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewCreate {
    dealId?: string;
    contractorId: string;
    overallRating: number; // 1-5
    title?: string;
    body: string;
    dimensions?: DimensionScore[];
    photos?: string[];
    wouldRecommend?: boolean;
    anonymous?: boolean;
}

export interface ReviewContractorReply {
    reply: string;
}

export interface ReviewModerationUpdate {
    status: ReviewStatus;
    note?: string;
}

export interface ReviewReportCreate {
    reason: ReportReason;
    detail?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response schemas
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewResponse {
    id: string;
    dealId?: string;
    contractorId: string;
    reviewerId: string;
    overallRating: number;
    title?: string;
    body?: string;
    isVerifiedPurchase: boolean;
    status: ReviewStatus;
    contractorReply?: string;
    contractorReplyAt?: string;
    helpfulCount: number;
    reportCount: number;
    dimensions: DimensionScoreResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface ReviewListResponse {
    reviews: ReviewResponse[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    avgRating: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rating summary / badge schemas
// ─────────────────────────────────────────────────────────────────────────────

export interface RatingDistribution {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
}

export interface DimensionAverage {
    dimension: ReviewDimensionType;
    avgScore: number;
    count: number;
}

export interface ContractorBadge {
    key: string;
    nameTh: string;
    nameEn: string;
    icon: string;
}

export interface ContractorRatingSummary {
    contractorId: string;
    avgRating: number;
    totalReviews: number;
    publishedReviews: number;
    distribution: RatingDistribution;
    dimensionAverages: DimensionAverage[];
    badges: ContractorBadge[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpful vote schemas
// ─────────────────────────────────────────────────────────────────────────────

export interface HelpfulVoteResponse {
    reviewId: string;
    helpful: boolean;
    helpfulCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Report schemas
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewReportResponse {
    id: string;
    reviewId: string;
    reporterId: string;
    reason: ReportReason;
    detail?: string;
    status: string;
    createdAt: string;
}

export interface ReviewReportListResponse {
    reports: ReviewReportResponse[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Frontend-specific types
// ─────────────────────────────────────────────────────────────────────────────

export interface Review {
    id: string;
    dealId?: string;
    contractorId: string;
    reviewerId: string;
    overallRating: number;
    title?: string;
    body?: string;
    isVerifiedPurchase: boolean;
    status: ReviewStatus;
    contractorReply?: string;
    contractorReplyAt?: string;
    helpfulCount: number;
    reportCount: number;
    dimensions: DimensionScoreResponse[];
    createdAt: string;
    updatedAt: string;
    userVotedHelpful?: boolean;
}

export interface ReviewCreateInput {
    dealId?: string;
    contractorId: string;
    overallRating: number;
    title?: string;
    body: string;
    dimensions?: DimensionScore[];
    photos?: string[];
    wouldRecommend?: boolean;
    anonymous?: boolean;
}

// Dimension labels for display
export const REVIEW_DIMENSION_LABELS: Record<ReviewDimensionType, { en: string; th: string }> = {
    [ReviewDimensionType.INSTALLATION_QUALITY]: { en: "Installation Quality", th: "คุณภาพการติดตั้ง" },
    [ReviewDimensionType.COMMUNICATION]: { en: "Communication", th: "การสื่อสาร" },
    [ReviewDimensionType.TIMELINE]: { en: "Timeline", th: "การดำเนินการตามกำหนด" },
    [ReviewDimensionType.VALUE_FOR_MONEY]: { en: "Value for Money", th: "คุ้มค่าราคา" },
    [ReviewDimensionType.CLEANLINESS]: { en: "Cleanliness", th: "ความสะอาด" },
};

// Report reason labels for display
export const REPORT_REASON_LABELS: Record<ReportReason, { en: string; th: string }> = {
    [ReportReason.INAPPROPRIATE]: { en: "Inappropriate Content", th: "เนื้อหาไม่เหมาะสม" },
    [ReportReason.FAKE]: { en: "Fake Review", th: "รีวิวปลอม" },
    [ReportReason.SPAM]: { en: "Spam", th: "สแปม" },
    [ReportReason.OFFENSIVE]: { en: "Offensive Language", th: "ใช้คำหยาบคาย" },
    [ReportReason.PERSONAL_INFO]: { en: "Personal Information Exposed", th: "เปิดเผยข้อมูลส่วนบุคคล" },
    [ReportReason.IRRELEVANT]: { en: "Irrelevant Content", th: "เนื้อหาไม่เกี่ยวข้อง" },
    [ReportReason.HARASSMENT]: { en: "Harassment", th: "การคุกคาม" },
    [ReportReason.OTHER]: { en: "Other", th: "อื่นๆ" },
};
