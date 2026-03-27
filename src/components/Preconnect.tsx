/**
 * WK-109: Performance Optimization - Preconnect Component
 * This component adds preconnect hints for external domains to improve LCP
 */

export function Preconnect() {
  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Google Maps API */}
      <link rel="preconnect" href="https://maps.googleapis.com" />
      <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />

      {/* Stripe */}
      <link rel="preconnect" href="https://js.stripe.com" />

      {/* Sentry (if enabled) */}
      {process.env.NEXT_PUBLIC_SENTRY_DSN && <link rel="preconnect" href="https://sentry.io" />}

      {/* DNS prefetch for other domains */}
      <link rel="dns-prefetch" href="https://api.stripe.com" />
      <link rel="dns-prefetch" href="https://checkout.stripe.com" />
    </>
  )
}
