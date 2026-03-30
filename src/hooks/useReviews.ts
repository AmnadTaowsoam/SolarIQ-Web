/**
 * Review & Rating hooks for WK-026.
 *
 * Provides functionality for:
 * - Review submission by B2C users
 * - Contractor reply management
 * - Admin moderation
 * - Public rating summaries and badge calculation
 * - Helpful votes
 * - Review reports
 */
import { useState, useCallback } from 'react'
import { ReviewService } from '../services/review'
import type {
  Review,
  ReviewResponse,
  ContractorRatingSummary,
  ReviewCreateInput,
  ReviewStatus,
  ReportReason,
} from '../types/review'

/**
 * Hook for fetching reviews for a contractor
 */
export function useReviews(
  contractorId: string,
  options?: {
    status?: ReviewStatus
    rating?: number
    page?: number
    pageSize?: number
    includePhotos?: boolean
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful'
  }
) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await ReviewService.getReviewsForContractor(contractorId, options)
      const mappedReviews = response.reviews.map(
        (r: ReviewResponse): Review => ({
          id: r.id,
          contractorId: r.contractorId,
          reviewerId: r.reviewerId,
          dealId: r.dealId,
          overallRating: r.overallRating,
          title: r.title,
          body: r.body,
          isVerifiedPurchase: r.isVerifiedPurchase,
          status: r.status as ReviewStatus,
          contractorReply: r.contractorReply,
          contractorReplyAt: r.contractorReplyAt,
          helpfulCount: r.helpfulCount,
          reportCount: r.reportCount,
          dimensions: r.dimensions.map((d) => ({
            dimension: d.dimension,
            score: d.score,
          })),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })
      )

      setReviews(mappedReviews)
      setTotal(response.total)
      setAvgRating(response.avgRating ?? null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'))
    } finally {
      setIsLoading(false)
    }
  }, [contractorId, options])

  return { reviews, total, avgRating, isLoading, error, refetch: fetchReviews }
}

/**
 * Hook for submitting a review
 */
export function useSubmitReview() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitReview = useCallback(async (data: ReviewCreateInput): Promise<Review | null> => {
    setIsSubmitting(true)
    setError(null)
    try {
      const review = await ReviewService.submitReview(data)
      return review
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit review'))
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { submitReview, isSubmitting, error }
}

/**
 * Hook for contractor reply to a review
 */
export function useContractorReply() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitReply = useCallback(async (reviewId: string, reply: string): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)
    try {
      await ReviewService.contractorReply(reviewId, reply)
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit reply'))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { submitReply, isSubmitting, error }
}

/**
 * Hook for voting a review as helpful
 */
export function useHelpfulVote() {
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const vote = useCallback(async (reviewId: string, helpful: boolean): Promise<boolean> => {
    setIsVoting(true)
    setError(null)
    try {
      await ReviewService.voteHelpful(reviewId, helpful)
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to vote'))
      return false
    } finally {
      setIsVoting(false)
    }
  }, [])

  return { vote, isVoting, error }
}

/**
 * Hook for reporting a review
 */
export function useReportReview() {
  const [isReporting, setIsReporting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const report = useCallback(
    async (reviewId: string, reason: ReportReason, details?: string): Promise<boolean> => {
      setIsReporting(true)
      setError(null)
      try {
        await ReviewService.reportReview(reviewId, reason, details)
        return true
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to report review'))
        return false
      } finally {
        setIsReporting(false)
      }
    },
    []
  )

  return { report, isReporting, error }
}

/**
 * Hook for getting contractor rating summary
 */
export function useRatingSummary(contractorId: string) {
  const [summary, setSummary] = useState<ContractorRatingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await ReviewService.getContractorRatingSummary(contractorId)
      setSummary(response)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rating summary'))
    } finally {
      setIsLoading(false)
    }
  }, [contractorId])

  return { summary, isLoading, error, refetch: fetchSummary }
}

/**
 * Hook for admin moderation actions
 */
export function useModeration() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const moderate = useCallback(
    async (reviewId: string, status: ReviewStatus, note?: string): Promise<boolean> => {
      setIsUpdating(true)
      setError(null)
      try {
        await ReviewService.moderateReview(reviewId, status, note)
        return true
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to moderate review'))
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    []
  )

  return { moderate, isUpdating, error }
}
