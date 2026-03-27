# Analytics & Conversion Tracking Test Plan

**Ticket**: WK-110 Analytics & Conversion Tracking
**Date**: 2026-03-27

---

## Test Environment

- **Test URL**: `https://solariqapp.com` (or local development)
- **GA4 Property**: SolarIQ Production
- **Measurement ID**: `G-XXXXXXXXXX`
- **Test Browser**: Chrome, Firefox, Safari, Edge

---

## Test Cases

### 1. Cookie Consent Management

#### TC-001: Cookie Banner Display

**Preconditions**: Clear browser cookies and localStorage
**Steps**:

1. Navigate to `https://solariqapp.com`
2. Verify cookie consent banner appears
3. Verify banner contains "Accept All", "Reject All", and "Manage Settings" buttons

**Expected Result**: Banner appears with all buttons

---

#### TC-002: Accept All Cookies

**Steps**:

1. Click "Accept All" button
2. Verify banner disappears
3. Refresh page
4. Verify banner does not reappear

**Expected Result**: Tracking enabled, banner not shown again

---

#### TC-003: Reject All Cookies

**Steps**:

1. Click "Reject All" button
2. Verify banner disappears
3. Refresh page
4. Verify banner does not reappear
5. Open DevTools → Console
6. Trigger an event (e.g., navigate to a page)

**Expected Result**: Tracking disabled, no events sent

---

#### TC-004: Manage Settings

**Steps**:

1. Click "Manage Settings" button
2. Verify detailed consent options appear
3. Toggle analytics consent
4. Toggle marketing consent
5. Click "Accept Selected"

**Expected Result**: Only selected tracking enabled

---

### 2. Conversion Events

#### TC-005: sign_up Event (Email)

**Preconditions**: User not logged in
**Steps**:

1. Navigate to `/signup`
2. Fill in signup form
3. Submit form
4. Open GA4 Real-Time view
5. Verify `sign_up` event appears

**Expected Parameters**:

- `method`: 'email'
- `plan`: 'trial' or 'free'

---

#### TC-006: sign_up Event (Google)

**Preconditions**: User not logged in
**Steps**:

1. Navigate to `/signup`
2. Click "Sign up with Google"
3. Complete Google OAuth
4. Open GA4 Real-Time view
5. Verify `sign_up` event appears

**Expected Parameters**:

- `method`: 'google'
- `plan`: 'trial' or 'free'

---

#### TC-007: trial_start Event

**Preconditions**: User not logged in
**Steps**:

1. Navigate to `/signup?trial=true`
2. Fill in signup form
3. Submit form
4. Open GA4 Real-Time view
5. Verify `trial_start` event appears

**Expected Parameters**:

- `plan_id`: 'trial'
- `plan_name`: 'Free Trial'
- `trial_days`: 14

---

#### TC-008: onboarding_complete Event

**Preconditions**: User logged in, onboarding not completed
**Steps**:

1. Navigate to `/onboarding`
2. Complete all 5 steps
3. Click "Go to Dashboard"
4. Open GA4 Real-Time view
5. Verify `onboarding_complete` event appears

**Expected Parameters**:

- `steps_completed`: 5
- `total_steps`: 5
- `duration_seconds`: < 300 (5 minutes)

---

#### TC-009: line_connect Event

**Preconditions**: User logged in, onboarding step 2
**Steps**:

1. Navigate to `/onboarding` (step 2)
2. Enter LINE Channel ID and Secret
3. Click "Test Connection"
4. Verify connection succeeds
5. Click "Next"
6. Open GA4 Real-Time view
7. Verify `line_connect` event appears

**Expected Parameters**:

- `line_user_id`: (if available)
- `liff_id`: `NEXT_PUBLIC_LIFF_ID`

---

#### TC-010: first_analysis Event

**Preconditions**: User logged in
**Steps**:

1. Navigate to `/analyze`
2. Enter coordinates and monthly bill
3. Click "Analyze" button
4. Wait for analysis to complete
5. Open GA4 Real-Time view
6. Verify `first_analysis` event appears

**Expected Parameters**:

- `system_size_kw`: > 0
- `estimated_savings`: > 0
- `location`: address string

---

#### TC-011: first_proposal Event

**Preconditions**: User logged in, analysis completed
**Steps**:

1. Navigate to `/analyze`
2. Complete analysis
3. Click "+ Save as Lead"
4. Open GA4 Real-Time view
5. Verify `first_proposal` event appears

**Expected Parameters**:

- `proposal_id`: string
- `system_size_kw`: > 0
- `estimated_cost`: > 0
- `format`: 'email'

---

#### TC-012: upgrade_click Event (Plans Tab)

**Preconditions**: User logged in, has subscription
**Steps**:

1. Navigate to `/billing`
2. Click "Change Plan" button
3. Open GA4 Real-Time view
4. Verify `upgrade_click` event appears

**Expected Parameters**:

- `current_plan`: current plan ID
- `feature`: 'change_plan'

---

#### TC-013: upgrade_click Event (Plan Selection)

**Preconditions**: User logged in, on plans tab
**Steps**:

1. Navigate to `/billing`
2. Click "Plans" tab
3. Select a different plan
4. Open GA4 Real-Time view
5. Verify `upgrade_click` event appears

**Expected Parameters**:

- `current_plan`: current plan ID
- `target_plan`: selected plan ID

---

#### TC-014: purchase Event

**Preconditions**: User not logged in or on free plan
**Steps**:

1. Navigate to `/pricing-plans`
2. Click "Start Free Trial" or "Subscribe"
3. Complete checkout process
4. Complete payment
5. Navigate to `/checkout/success`
6. Open GA4 Real-Time view
7. Verify `purchase` event appears

**Expected Parameters**:

- `transaction_id`: Stripe session ID
- `value`: plan price
- `currency`: 'THB'
- `items`: array with plan details
- `plan_id`: plan ID
- `plan_name`: plan name
- `plan_type`: 'monthly' or 'annual'

---

### 3. UTM Parameter Tracking

#### TC-015: UTM Parameter Extraction

**Steps**:

1. Navigate to `https://solariqapp.com/?utm_source=google&utm_medium=cpc&utm_campaign=test_campaign`
2. Open DevTools → Application → Session Storage
3. Verify `solariq_utm_params` exists
4. Verify parameters are correct

**Expected Result**: All UTM parameters stored

---

#### TC-016: UTM Parameters in Events

**Steps**:

1. Navigate to `https://solariqapp.com/?utm_source=google&utm_medium=cpc&utm_campaign=test_campaign`
2. Accept cookies
3. Sign up for account
4. Open GA4 Event Report
5. Check `sign_up` event parameters

**Expected Result**: UTM parameters attached to event

---

#### TC-017: Referral Attribution

**Steps**:

1. Navigate to site from a referrer (e.g., google.com)
2. Accept cookies
3. Check marketing attribution

**Expected Result**: Source = referrer domain, medium = 'referral'

---

#### TC-018: Direct Traffic

**Steps**:

1. Clear browser cookies and localStorage
2. Navigate directly to `https://solariqapp.com`
3. Accept cookies
4. Check marketing attribution

**Expected Result**: Source = 'direct', medium = 'none'

---

### 4. Funnel Dashboard

#### TC-019: Dashboard Load

**Steps**:

1. Navigate to `/analytics/funnel`
2. Verify dashboard loads without errors
3. Verify funnel visualization displays

**Expected Result**: Dashboard loads successfully

---

#### TC-020: Period Selection

**Steps**:

1. Navigate to `/analytics/funnel`
2. Click "7 Days"
3. Verify data updates
4. Click "30 Days"
5. Verify data updates
6. Click "90 Days"
7. Verify data updates

**Expected Result**: Data changes for each period

---

#### TC-021: Funnel Metrics

**Steps**:

1. Navigate to `/analytics/funnel`
2. Verify overall conversion rate displays
3. Verify total revenue displays
4. Verify avg time to purchase displays

**Expected Result**: All metrics display correctly

---

#### TC-022: Conversion Rates

**Steps**:

1. Navigate to `/analytics/funnel`
2. Check conversion rate for each stage
3. Verify rates are calculated correctly

**Expected Result**: Conversion rates between 0-100%

---

#### TC-023: Drop-off Rates

**Steps**:

1. Navigate to `/analytics/funnel`
2. Check drop-off rate for each stage (except first)
3. Verify rates are calculated correctly

**Expected Result**: Drop-off rates between 0-100%

---

#### TC-024: Export to CSV

**Steps**:

1. Navigate to `/analytics/funnel`
2. Click "Export" button
3. Verify CSV file downloads
4. Open CSV file
5. Verify data is correct

**Expected Result**: CSV contains all funnel data

---

### 5. Page View Tracking

#### TC-025: Page View Events

**Steps**:

1. Accept cookies
2. Navigate to different pages
3. Open GA4 Real-Time view
4. Verify page_view events fire

**Expected Result**: page_view event for each page

---

#### TC-026: Page View Parameters

**Steps**:

1. Accept cookies
2. Navigate to `/analyze`
3. Open GA4 Event Report
4. Check page_view event parameters

**Expected Parameters**:

- `page_path`: '/analyze'
- `page_title`: Page title
- `page_location`: Full URL

---

### 6. PDPA Compliance

#### TC-027: Default Deny

**Steps**:

1. Clear browser cookies and localStorage
2. Navigate to site
3. Open DevTools → Network
4. Trigger page navigation

**Expected Result**: No GA4 requests sent before consent

---

#### TC-028: Consent Update

**Steps**:

1. Accept cookies
2. Open DevTools → Network
3. Trigger an event
4. Verify GA4 requests sent

**Expected Result**: GA4 requests sent after consent

---

#### TC-029: Consent Withdrawal

**Steps**:

1. Accept cookies
2. Navigate to settings
3. Reject analytics consent
4. Trigger an event
5. Open GA4 Real-Time view

**Expected Result**: No new events sent

---

## Test Results

| Test Case | Status | Notes |
| --------- | ------ | ----- |
| TC-001    | ⬜     |       |
| TC-002    | ⬜     |       |
| TC-003    | ⬜     |       |
| TC-004    | ⬜     |       |
| TC-005    | ⬜     |       |
| TC-006    | ⬜     |       |
| TC-007    | ⬜     |       |
| TC-008    | ⬜     |       |
| TC-009    | ⬜     |       |
| TC-010    | ⬜     |       |
| TC-011    | ⬜     |       |
| TC-012    | ⬜     |       |
| TC-013    | ⬜     |       |
| TC-014    | ⬜     |       |
| TC-015    | ⬜     |       |
| TC-016    | ⬜     |       |
| TC-017    | ⬜     |       |
| TC-018    | ⬜     |       |
| TC-019    | ⬜     |       |
| TC-020    | ⬜     |       |
| TC-021    | ⬜     |       |
| TC-022    | ⬜     |       |
| TC-023    | ⬜     |       |
| TC-024    | ⬜     |       |
| TC-025    | ⬜     |       |
| TC-026    | ⬜     |       |
| TC-027    | ⬜     |       |
| TC-028    | ⬜     |       |
| TC-029    | ⬜     |       |

---

## Test Execution Checklist

### Pre-Test Setup

- [ ] GA4 property created
- [ ] Measurement ID configured
- [ ] Test environment ready
- [ ] Test accounts created

### Test Execution

- [ ] All test cases executed
- [ ] Results documented
- [ ] Screenshots captured
- [ ] Issues logged

### Post-Test

- [ ] Test results reviewed
- [ ] Bugs filed if found
- [ ] Documentation updated
- [ ] Sign-off obtained

---

## Known Issues

| Issue ID | Description | Severity | Status |
| -------- | ----------- | -------- | ------ |
|          |             |          |        |

---

## Sign-off

**Tester**: ******\_\_\_******
**Date**: ******\_\_\_******
**Status**: ⬜ Passed / ⬜ Failed / ⬜ Passed with Issues

**Comments**: ******\_\_\_******
