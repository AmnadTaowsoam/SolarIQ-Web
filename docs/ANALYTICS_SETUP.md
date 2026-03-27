# Analytics & Conversion Tracking Setup Guide

This guide explains how to set up and use the Google Analytics 4 (GA4) tracking system for SolarIQ.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [Conversion Events](#conversion-events)
5. [B2B SaaS Funnel Dashboard](#b2b-saas-funnel-dashboard)
6. [UTM Parameter Tracking](#utm-parameter-tracking)
7. [Marketing Attribution](#marketing-attribution)
8. [PDPA Compliance](#pdpa-compliance)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The analytics tracking system provides:

- **GA4 Integration**: Full Google Analytics 4 support with gtag.js
- **Conversion Tracking**: 8 key conversion events for B2B SaaS funnel
- **PDPA Compliance**: Cookie consent management before tracking
- **UTM Tracking**: Marketing campaign attribution
- **Funnel Dashboard**: Visual B2B SaaS conversion funnel
- **Type-Safe API**: Full TypeScript support

### B2B SaaS Funnel Stages

```
Landing Page → Sign Up → Trial Start → Onboarding Complete →
First Analysis → First Proposal → Upgrade Click → Purchase
```

---

## Prerequisites

### 1. Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for `solariqapp.com`
3. Note your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Environment Configuration

Add the GA4 Measurement ID to your environment variables:

```bash
# SolarIQ-Web/.env.local
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Setup Instructions

### 1. Core Components

The analytics system consists of:

- `src/lib/ga4.ts` - Core GA4 tracking library
- `src/hooks/useGA4.ts` - React hook for analytics
- `src/components/GoogleAnalytics.tsx` - GA4 script loader
- `src/components/CookieConsent.tsx` - PDPA-compliant consent banner

### 2. Root Layout Integration

The root layout automatically includes:

```tsx
// src/app/layout.tsx
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { CookieConsentBanner } from '@/components/CookieConsent'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        {/* Your app content */}
        <CookieConsentBanner />
      </body>
    </html>
  )
}
```

### 3. Using the Analytics Hook

```tsx
import { useGA4 } from '@/hooks/useGA4'

function MyComponent() {
  const { trackEvent, trackPurchase, hasConsent } = useGA4()

  const handleButtonClick = () => {
    if (hasConsent) {
      trackEvent('button_click', {
        button_name: 'cta_button',
        location: 'homepage',
      })
    }
  }

  return <button onClick={handleButtonClick}>Click Me</button>
}
```

---

## Conversion Events

### Event List

| Event                 | Trigger                  | Parameters                                                                          |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| `sign_up`             | Account created          | `method`, `plan`                                                                    |
| `trial_start`         | Trial activated          | `plan_id`, `plan_name`, `trial_days`                                                |
| `onboarding_complete` | Onboarding finished      | `steps_completed`, `total_steps`, `duration_seconds`                                |
| `first_analysis`      | First solar analysis     | `system_size_kw`, `estimated_savings`, `location`                                   |
| `first_proposal`      | First proposal generated | `proposal_id`, `system_size_kw`, `estimated_cost`, `format`                         |
| `upgrade_click`       | Clicked upgrade button   | `current_plan`, `target_plan`, `feature`                                            |
| `purchase`            | Subscription payment     | `transaction_id`, `value`, `currency`, `items`, `plan_id`, `plan_name`, `plan_type` |
| `line_connect`        | Connected LINE OA        | `line_user_id`, `liff_id`                                                           |

### Implementation Examples

#### Sign Up Event

```tsx
// src/app/signup/page.tsx
const { trackSignUp, trackTrialStart } = useGA4()

const handleSignupSuccess = async () => {
  await signupApi()

  trackSignUp({
    method: 'email',
    plan: isTrial ? 'trial' : 'free',
  })

  if (isTrial) {
    trackTrialStart({
      plan_id: 'trial',
      plan_name: 'Free Trial',
      trial_days: 14,
    })
  }
}
```

#### Purchase Event

```tsx
// src/app/(marketing)/checkout/success/page.tsx
const { trackPurchase } = useGA4()

useEffect(() => {
  if (sessionId && amount > 0) {
    trackPurchase({
      transaction_id: sessionId,
      value: amount,
      currency: 'THB',
      plan_id: 'professional_monthly',
      plan_name: 'Professional',
      plan_type: 'monthly',
      items: [
        {
          item_id: 'professional_monthly',
          item_name: 'Professional Plan',
          item_category: 'subscription',
          price: 3990,
          quantity: 1,
        },
      ],
    })
  }
}, [sessionId, amount])
```

---

## B2B SaaS Funnel Dashboard

### Access the Dashboard

Navigate to: `/analytics/funnel`

### Dashboard Features

1. **Period Selection**: View data for 7, 30, or 90 days
2. **Funnel Visualization**: Visual representation of conversion stages
3. **Conversion Rates**: Percentage conversion between stages
4. **Drop-off Rates**: Percentage of users who drop off
5. **Key Metrics**: Overall conversion rate, total revenue, avg time to purchase
6. **Insights**: AI-powered recommendations for improvement

### Funnel Stages Displayed

1. Landing Page Views
2. Sign Ups
3. Trial Starts
4. Onboarding Complete
5. First Analysis
6. First Proposal
7. Upgrade Clicks
8. Purchases
9. LINE Connect

---

## UTM Parameter Tracking

### Supported UTM Parameters

- `utm_source` - Traffic source (e.g., google, facebook, line)
- `utm_medium` - Traffic medium (e.g., cpc, email, social)
- `utm_campaign` - Campaign name
- `utm_term` - Search term
- `utm_content` - Content variant

### Automatic Tracking

UTM parameters are automatically:

1. **Extracted** from URL on first visit
2. **Stored** in session storage
3. **Attached** to sign-up and purchase events
4. **Available** via `useGA4()` hook

### Usage Example

```tsx
import { useGA4 } from '@/hooks/useGA4'

function MyComponent() {
  const { marketingAttribution } = useGA4()

  useEffect(() => {
    console.log('Source:', marketingAttribution.source)
    console.log('Medium:', marketingAttribution.medium)
    console.log('Campaign:', marketingAttribution.campaign)
  }, [marketingAttribution])
}
```

---

## Marketing Attribution

### Attribution Data

The `marketingAttribution` object provides:

```typescript
{
  source: string // 'google', 'facebook', 'line', 'direct', etc.
  medium: string // 'organic', 'cpc', 'referral', etc.
  campaign: string // Campaign name
  term: string // Search term
  content: string // Content variant
  referrer: string // Referrer URL
}
```

### Referral Attribution

If no UTM parameters are present, the system automatically:

1. Parses the HTTP referrer
2. Extracts the domain as source
3. Sets medium to 'referral'
4. Falls back to 'direct' if no referrer

---

## PDPA Compliance

### Consent Management

The analytics system is PDPA-compliant:

1. **Default Deny**: All tracking denied by default
2. **Explicit Consent**: User must opt-in before tracking
3. **Granular Control**: Separate consent for analytics and marketing
4. **Easy Withdrawal**: Users can change consent anytime

### Consent States

```typescript
interface CookieConsent {
  necessary: boolean // Always true (required)
  analytics: boolean // GA4 tracking
  marketing: boolean // Ad tracking
  timestamp: number
}
```

### Consent Update Flow

```tsx
// When user accepts cookies
const { updateConsent } = useGA4()

updateConsent({
  analytics: true,
  marketing: false,
})

// This calls:
// gtag('consent', 'update', {
//   analytics_storage: 'granted',
//   ad_storage: 'denied',
//   ad_user_data: 'denied',
//   ad_personalization: 'denied',
// })
```

---

## Testing

### Local Development

For local development without GA4:

```bash
# Leave NEXT_PUBLIC_GA4_MEASUREMENT_ID empty
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
```

### Verify Event Firing

1. Open browser DevTools → Console
2. Accept cookies in the consent banner
3. Trigger an event (e.g., sign up)
4. Check console for event logs

### GA4 Real-Time View

1. Go to Google Analytics → Real-time report
2. Trigger events on your site
3. Verify events appear in real-time

### Debug Mode

Enable GA4 debug mode:

```tsx
// In browser console
window.dataLayer = window.dataLayer || []
window.dataLayer.push({ debug_mode: true })
```

---

## Troubleshooting

### Events Not Firing

**Problem**: Events not appearing in GA4

**Solutions**:

1. Check if user accepted cookies
2. Verify `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set
3. Check browser console for errors
4. Verify GA4 property is receiving data

### Consent Not Working

**Problem**: Tracking starts before consent

**Solutions**:

1. Check that `GoogleAnalytics` component is in `<head>`
2. Verify default consent is set to 'denied'
3. Check that `updateConsent` is called on user action

### UTM Parameters Lost

**Problem**: UTM parameters not attached to events

**Solutions**:

1. Verify UTM parameters are in URL
2. Check session storage for `solariq_utm_params`
3. Ensure `storeUTMParams()` is called on page load

### Funnel Data Not Showing

**Problem**: Funnel dashboard shows no data

**Solutions**:

1. Verify events are firing correctly
2. Check GA4 real-time view
3. Ensure date range includes recent data
4. Refresh the dashboard

---

## Best Practices

### 1. Always Check Consent

```tsx
const { trackEvent, hasConsent } = useGA4()

if (hasConsent) {
  trackEvent('my_event', { param: 'value' })
}
```

### 2. Use Descriptive Event Names

```tsx
// Good
trackEvent('proposal_downloaded', { format: 'pdf' })

// Avoid
trackEvent('click', { element: 'button' })
```

### 3. Include Relevant Parameters

```tsx
trackPurchase({
  transaction_id: 'txn_123',
  value: 3990,
  currency: 'THB',
  items: [...],
  plan_id: 'professional_monthly',
  plan_name: 'Professional',
  plan_type: 'monthly',
})
```

### 4. Test Before Deploying

1. Test all conversion events
2. Verify GA4 receives events
3. Check consent flow works correctly
4. Test UTM parameter tracking

---

## Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [GA4 Event Builder](https://ga-dev-tools.web.app/ga4-event-builder/)
- [PDPA Compliance Guidelines](https://www.pdpc.go.th/)
- [UTM Parameter Best Practices](https://support.google.com/analytics/answer/1033863)

---

## Support

For issues or questions:

1. Check this documentation
2. Review the ticket: `WK-110_analytics_tracking.md`
3. Contact the development team

---

**Last Updated**: 2026-03-27
**Ticket**: WK-110 Analytics & Conversion Tracking
