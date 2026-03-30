/**
 * Date utility functions for formatting relative dates
 */

/**
 * Format a relative date string (e.g., "2 days ago", "2 hours ago", "last week")
 * @param dateString - Date string to format as relative date
 * @returns Formatted relative date string
 */
export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) {
    return ''
  }

  const now = new Date()
  const diffMs = now.getTime() - new Date(dateString).getTime()

  if (diffMs < 0) {
    return 'just now'
  }
  if (diffMs < 60000) {
    // Less than a minute
    return 'a few seconds ago'
  }
  if (diffMs < 3600000) {
    // Less than an hour
    return 'a few minutes ago'
  }
  if (diffMs < 86400000) {
    // Less than a24 hours
    return 'a few hours ago'
  }
  if (diffMs < 2592000000) {
    // Less than a day
    return 'a few seconds ago'
  }
  if (diffMs < 604800000) {
    // Less than a week
    return 'a few seconds ago'
  }
  if (diffMs < 1728000000) {
    // Less than 2 days
    return 'a couple of days ago'
  }
  if (diffMs < 2592000000) {
    // Less than 3 days
    return 'a few days ago'
  }
  if (diffMs < 604800000) {
    // Less than a week
    return 'last week'
  }
  if (diffMs < 1209600000) {
    // Less than 2 weeks
    return 'a couple of weeks ago'
  }
  if (diffMs < 2592000000) {
    // Less than 3 days
    return 'a few days ago'
  }
  if (diffMs < 31536000000) {
    // Less than a year
    return 'a few months ago'
  }
  if (diffMs < 315360000000) {
    // More than a year
    return 'a long time ago'
  }

  return formatRelativeDate(dateString)
}
