'use client'

import { useState } from 'react'
import { MessageSquare, X, Star, Send, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'

const CATEGORIES = [
  {
    value: 'accuracy',
    label:
      '\u0E04\u0E27\u0E32\u0E21\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33\u0E02\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25',
  },
  {
    value: 'cost',
    label:
      '\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E44\u0E21\u0E48\u0E15\u0E23\u0E07',
  },
  {
    value: 'roof',
    label:
      '\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E25\u0E31\u0E07\u0E04\u0E32\u0E1C\u0E34\u0E14',
  },
  { value: 'other', label: '\u0E2D\u0E37\u0E48\u0E19\u0E46' },
]

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [category, setCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await api.post(API_ENDPOINTS.SOLAR.FEEDBACK, {
        rating,
        comment,
        category,
      })
      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        setIsOpen(false)
        setRating(0)
        setComment('')
        setCategory('')
      }, 2000)
    } catch {
      // Silent fail - feedback is non-critical
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Feedback"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Feedback Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-2xl overflow-hidden">
          {isSubmitted ? (
            // Thank you animation
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 animate-bounce" />
              <div className="text-lg font-bold text-[var(--brand-text)]">
                {'\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13!'}
              </div>
              <div className="text-sm text-[var(--brand-text-secondary)] mt-1">
                {
                  '\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E41\u0E19\u0E30\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E21\u0E35\u0E04\u0E38\u0E13\u0E04\u0E48\u0E32\u0E21\u0E32\u0E01'
                }
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--brand-border)] bg-[var(--brand-primary)]/5">
                <div className="font-bold text-[var(--brand-text)]">
                  {
                    '\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C'
                  }
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {
                    '\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E23\u0E32\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07\u0E43\u0E2B\u0E49\u0E14\u0E35\u0E02\u0E36\u0E49\u0E19'
                  }
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="text-sm font-medium text-[var(--brand-text)] block mb-2">
                    {'\u0E04\u0E27\u0E32\u0E21\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33'}
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-[var(--brand-text-secondary)]'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-[var(--brand-text)] block mb-1">
                    {'\u0E2B\u0E21\u0E27\u0E14\u0E2B\u0E21\u0E39\u0E48'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="">
                      {
                        '\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2B\u0E21\u0E27\u0E14\u0E2B\u0E21\u0E39\u0E48'
                      }
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm font-medium text-[var(--brand-text)] block mb-1">
                    {
                      '\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21'
                    }
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder={
                      '\u0E1A\u0E2D\u0E01\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E2D\u0E22\u0E32\u0E01\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07...'
                    }
                    className="w-full px-3 py-1.5 text-sm rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {
                    '\u0E2A\u0E48\u0E07\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19'
                  }
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
