/**
 * Review Service for WK-026
 *
 * Frontend service for interacting with the review API endpoints.
 */

import { apiClient } from '@/lib/api'
import type {
  Review,
  ReviewResponse,
  ReviewListResponse,
  ReviewCreate,
  ReviewContractorReply,
  ReviewModerationUpdate,
  ReviewReportCreate,
  ReviewReportListResponse,
  ContractorRatingSummary,
  HelpfulVoteResponse,
  ReviewStatus,
  ReportReason,
} from '@/types/review'

// Query options for fetching reviews
interface ReviewQueryOptions {
  status?: ReviewStatus
  rating?: number
  page?: number
  pageSize?: number
  includePhotos?: boolean
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful'
}

/**
 * Map API response to frontend Review type
 */
function mapReviewResponse(r: ReviewResponse): Review {
  return {
    id: r.id,
    contractorId: r.contractorId,
    reviewerId: r.reviewerId,
    dealId: r.dealId,
    overallRating: r.overallRating,
    title: r.title,
    body: r.body,
    isVerifiedPurchase: r.isVerifiedPurchase,
    status: r.status,
    contractorReply: r.contractorReply,
    contractorReplyAt: r.contractorReplyAt,
    helpfulCount: r.helpfulCount,
    reportCount: r.reportCount,
    dimensions: r.dimensions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

/**
 * Review Service
 * Provides methods for interacting with the review API
 */
export const ReviewService = {
  /**
   * Get reviews for a specific contractor
   */
  async getReviewsForContractor(
    contractorId: string,
    options?: ReviewQueryOptions
  ): Promise<ReviewListResponse> {
    const params = new URLSearchParams()

    if (options?.status) {
      params.append('status', options.status)
    }
    if (options?.rating) {
      params.append('rating', options.rating.toString())
    }
    if (options?.page) {
      params.append('page', options.page.toString())
    }
    if (options?.pageSize) {
      params.append('page_size', options.pageSize.toString())
    }
    if (options?.includePhotos !== undefined) {
      params.append('has_photos', options.includePhotos.toString())
    }
    if (options?.sortBy) {
      params.append('sort_by', options.sortBy)
    }

    const queryString = params.toString()
    const url = `/api/reviews/contractors/${contractorId}${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<ReviewListResponse>(url)
    return response.data
  },

  /**
   * Get a single review by ID
   */
  async getReview(reviewId: string): Promise<Review> {
    const response = await apiClient.get<ReviewResponse>(`/api/liff/reviews/${reviewId}`)
    return mapReviewResponse(response.data)
  },

  /**
   * Submit a new review
   */
  async submitReview(data: ReviewCreate): Promise<Review> {
    const response = await apiClient.post<ReviewResponse>('/api/liff/reviews', data)
    return mapReviewResponse(response.data)
  },

  /**
   * Update an existing review (within 48 hour window)
   */
  async updateReview(reviewId: string, data: Partial<ReviewCreate>): Promise<Review> {
    const response = await apiClient.patch<ReviewResponse>(`/api/liff/reviews/${reviewId}`, data)
    return mapReviewResponse(response.data)
  },

  /**
   * Submit contractor reply to a review
   */
  async contractorReply(reviewId: string, reply: string): Promise<Review> {
    const payload: ReviewContractorReply = { reply }
    const response = await apiClient.patch<ReviewResponse>(
      `/api/reviews/${reviewId}/reply`,
      payload
    )
    return mapReviewResponse(response.data)
  },

  /**
   * Vote a review as helpful
   */
  async voteHelpful(reviewId: string, helpful: boolean): Promise<HelpfulVoteResponse> {
    const response = await apiClient.post<HelpfulVoteResponse>(
      `/api/liff/reviews/${reviewId}/helpful`,
      { helpful }
    )
    return response.data
  },

  /**
   * Report a review
   */
  async reportReview(reviewId: string, reason: ReportReason, detail?: string): Promise<void> {
    const payload: ReviewReportCreate = { reason, detail }
    await apiClient.post(`/api/liff/reviews/${reviewId}/report`, payload)
  },

  /**
   * Get contractor rating summary
   */
  async getContractorRatingSummary(contractorId: string): Promise<ContractorRatingSummary> {
    const response = await apiClient.get<ContractorRatingSummary>(
      `/api/reviews/contractors/${contractorId}/summary`
    )
    return response.data
  },

  /**
   * Get all reviews for admin moderation
   */
  async getAdminReviews(options?: ReviewQueryOptions): Promise<ReviewListResponse> {
    const params = new URLSearchParams()

    if (options?.status) {
      params.append('status', options.status)
    }
    if (options?.page) {
      params.append('page', options.page.toString())
    }
    if (options?.pageSize) {
      params.append('page_size', options.pageSize.toString())
    }

    const queryString = params.toString()
    const url = `/api/admin/reviews${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<ReviewListResponse>(url)
    return response.data
  },

  /**
   * Moderate a review (admin only)
   */
  async moderateReview(reviewId: string, status: ReviewStatus, note?: string): Promise<Review> {
    const payload: ReviewModerationUpdate = { status, note }
    const response = await apiClient.patch<ReviewResponse>(
      `/api/admin/reviews/${reviewId}/moderate`,
      payload
    )
    return mapReviewResponse(response.data)
  },

  /**
   * Get review reports for admin
   */
  async getReviewReports(options?: {
    page?: number
    pageSize?: number
  }): Promise<ReviewReportListResponse> {
    const params = new URLSearchParams()

    if (options?.page) {
      params.append('page', options.page.toString())
    }
    if (options?.pageSize) {
      params.append('page_size', options.pageSize.toString())
    }

    const queryString = params.toString()
    const url = `/api/admin/reviews/reports${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<ReviewReportListResponse>(url)
    return response.data
  },

  /**
   * Resolve a review report (admin only)
   */
  async resolveReport(reportId: string, action: 'dismiss' | 'remove_review'): Promise<void> {
    await apiClient.post(`/api/admin/reviews/reports/${reportId}/resolve`, { action })
  },
}

export default ReviewService
