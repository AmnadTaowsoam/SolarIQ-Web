/**
 * Billing types for SolarIQ-Web (WK-017)
 */

export type PlanType = 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus =
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'trialing'
    | 'incomplete'
    | 'unpaid';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export type ResourceType = 'lead_view' | 'ai_analysis' | 'pdf_download' | 'api_call';

// ============== Plan Types ==============

export interface PlanFeature {
    name: string;
    included: boolean;
    limit?: number | null;
}

export interface Plan {
    id: PlanType;
    name: string;
    price_thb: number;
    leads_per_month: number | null;
    users: number | null;
    features: PlanFeature[];
    opn_price_id?: string;
}

export interface PlanList {
    plans: Plan[];
}

// ============== Subscription Types ==============

export interface Subscription {
    id: string;
    organization_id: string;
    plan_id: PlanType;
    status: SubscriptionStatus;
    payment_provider: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    trial_end?: string;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
    plan: Plan;
    days_until_period_end: number;
}

// ============== Invoice Types ==============

export interface Invoice {
    id: string;
    subscription_id?: string;
    organization_id: string;
    amount_thb: number;
    status: InvoiceStatus;
    invoice_number: string;
    invoice_pdf_url?: string;
    provider_invoice_id?: string;
    paid_at?: string;
    due_date?: string;
    description?: string;
    created_at: string;
}

export interface InvoiceListResponse {
    invoices: Invoice[];
    total: number;
    page: number;
    page_size: number;
}

// ============== Usage Types ==============

export interface UsageSummary {
    resource_type: ResourceType;
    total_quantity: number;
    limit?: number | null;
    percentage_used?: number | null;
}

export interface UsageResponse {
    organization_id: string;
    plan_id: PlanType;
    period_start: string;
    period_end: string;
    usage: UsageSummary[];
}

// ============== Organization Types ==============

export interface Organization {
    id: string;
    name: string;
    tax_id?: string;
    address?: string;
    owner_uid: string;
    plan_id: PlanType;
    leads_used_this_month: number;
    omise_customer_id?: string;
    created_at: string;
    updated_at: string;
}

// ============== Billing Status Types ==============

export interface BillingStatus {
    organization: Organization;
    subscription: SubscriptionWithPlan | null;
    current_usage: UsageResponse;
    has_payment_method: boolean;
    invoices_overdue: number;
}

// ============== API Response Types ==============

export interface PaymentSetupResponse {
    client_secret: string;
    setup_intent_id: string;
}

export interface PaymentPortalResponse {
    url: string;
}

export type OpnSourceType =
    | 'credit_card'
    | 'promptpay'
    | 'internet_banking_scb'
    | 'internet_banking_kbank'
    | 'internet_banking_bbl';

export interface CheckoutRequest {
    plan_id: string;
    billing_cycle: string;
    source_type: OpnSourceType;
    return_uri: string;
    promo_code?: string;
}

export interface CheckoutResponse {
    authorize_uri?: string;
    charge_id?: string;
    qr_code_uri?: string;
}

// ============== Plan Constants ==============

export const PLAN_FEATURES: Record<PlanType, PlanFeature[]> = {
    starter: [
        { name: 'AI Analysis', included: true },
        { name: 'PDF Proposal', included: true },
        { name: 'Basic Dashboard', included: true },
        { name: 'Export CSV', included: false },
        { name: 'API Access', included: false },
        { name: 'Email Support', included: true },
    ],
    pro: [
        { name: 'AI Analysis', included: true },
        { name: 'PDF Proposal', included: true },
        { name: 'Full Dashboard', included: true },
        { name: 'Export CSV', included: true },
        { name: 'API Access', included: false },
        { name: 'Priority Support', included: true },
    ],
    enterprise: [
        { name: 'AI Analysis', included: true },
        { name: 'PDF Proposal', included: true },
        { name: 'Full Dashboard + API', included: true },
        { name: 'Export CSV', included: true },
        { name: 'API Access', included: true },
        { name: 'Dedicated Support', included: true },
    ],
};

export const PLANS: Record<PlanType, Plan> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price_thb: 2900,
        leads_per_month: 20,
        users: 1,
        features: PLAN_FEATURES.starter,
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price_thb: 7900,
        leads_per_month: 100,
        users: 5,
        features: PLAN_FEATURES.pro,
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price_thb: 15000,
        leads_per_month: null,
        users: null,
        features: PLAN_FEATURES.enterprise,
    },
};

export function getPlan(planId: PlanType): Plan {
    return PLANS[planId];
}

export function getAllPlans(): Plan[] {
    return Object.values(PLANS);
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
    }).format(price);
}

export function getStatusColor(status: SubscriptionStatus): string {
    switch (status) {
        case 'active':
            return 'text-green-600 bg-green-100';
        case 'trialing':
            return 'text-blue-600 bg-blue-100';
        case 'past_due':
            return 'text-red-600 bg-red-100';
        case 'canceled':
            return 'text-gray-600 bg-gray-100';
        default:
            return 'text-yellow-600 bg-yellow-100';
    }
}

export function getStatusText(status: SubscriptionStatus): string {
    switch (status) {
        case 'active':
            return 'Active';
        case 'trialing':
            return 'Trial';
        case 'past_due':
            return 'Past Due';
        case 'canceled':
            return 'Canceled';
        case 'incomplete':
            return 'Incomplete';
        case 'unpaid':
            return 'Unpaid';
        default:
            return status;
    }
}
