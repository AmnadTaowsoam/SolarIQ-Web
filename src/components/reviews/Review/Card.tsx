/**
 * Review Card component for displaying a single review.
 */

import React, { useState } from 'react'
import Image from 'next/image'

interface ReviewCardProps {
  id: string
  rating: number
  title?: string
  content: string
  authorName: string
  isAnonymous?: boolean
  createdAt: string
  photos?: string[]
  helpfulCount?: number
  onHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewCard({
  id,
  rating,
  title,
  content,
  authorName,
  isAnonymous = false,
  createdAt,
  photos,
  helpfulCount = 0,
  onHelpful,
  onReport,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayName = isAnonymous ? 'Anonymous' : authorName
  const shouldTruncate = content.length > 200
  const displayContent = shouldTruncate && !isExpanded ? `${content.slice(0, 200)}...` : content

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <StarDisplay rating={rating} />
          {title && <h4 className="mt-1 font-medium text-gray-900">{title}</h4>}
        </div>
        <span className="text-xs text-gray-500">{createdAt}</span>
      </div>

      <p className="mt-2 text-sm text-gray-700">{displayContent}</p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:underline mt-1"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {photos && photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={photo}
                alt={`Review photo ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">By {displayName}</span>
        <div className="flex items-center gap-3">
          {onHelpful && (
            <button
              onClick={() => onHelpful(id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              Helpful ({helpfulCount})
            </button>
          )}
          {onReport && (
            <button
              onClick={() => onReport(id)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Report
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
