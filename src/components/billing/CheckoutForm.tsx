'use client'

/**
 * Checkout Form Component (WK-102)
 * Handles payment method selection and checkout flow for subscription
 */

import React, { useState } from 'react'
import Image from 'next/image'
import { CreditCard, Smartphone, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { type Plan, type OpnSourceType, formatPrice } from '@/types/billing'
import { useCreateCheckoutSession } from '@/hooks/useBilling'

// ============== Types ==============

interface CheckoutFormProps {
  plan: Plan
  billingCycle: 'monthly' | 'annual'
  onSuccess?: (chargeId: string) => void
  onError?: (error: string) => void
}

type PaymentMethod = 'credit_card' | 'promptpay' | 'bank_transfer'

interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  icon: React.ReactNode
  description: string
  sourceType: OpnSourceType
}

// ============== Constants ==============

const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Visa, Mastercard, JCB',
    sourceType: 'credit_card',
  },
  {
    id: 'promptpay',
    name: 'PromptPay QR',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'Scan QR code with mobile banking app',
    sourceType: 'promptpay',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <Building2 className="w-5 h-5" />,
    description: 'SCB, KBank, BBL, Krungthai',
    sourceType: 'internet_banking_scb',
  },
]

const BANK_OPTIONS = [
  { value: 'internet_banking_scb', label: 'SCB Easy App' },
  { value: 'internet_banking_kbank', label: 'K PLUS' },
  { value: 'internet_banking_bbl', label: 'Bualuang mBanking' },
]

// ============== Component ==============

export function CheckoutForm({ plan, billingCycle, onSuccess, onError }: CheckoutFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('promptpay')
  const [selectedBank, setSelectedBank] = useState('internet_banking_scb')
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState<{
    authorize_uri?: string
    charge_id?: string
    qr_code_uri?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkoutMutation = useCreateCheckoutSession()

  // Calculate price based on billing cycle
  const price =
    billingCycle === 'annual'
      ? Math.floor(plan.price_thb * 12 * 0.8) // 20% discount for annual
      : plan.price_thb

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setError(null)
  }

  const handleBankChange = (bankValue: string) => {
    setSelectedBank(bankValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      const sourceType =
        selectedMethod === 'bank_transfer'
          ? (selectedBank as OpnSourceType)
          : PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.sourceType

      if (!sourceType) {
        throw new Error('Invalid payment method')
      }

      const result = await checkoutMutation.mutateAsync({
        plan: plan.id,
        billing_period: billingCycle,
        source_type: sourceType,
        return_uri: `${window.location.origin}/billing?checkout=success`,
      })

      setCheckoutResult(result)

      if (result.authorize_uri) {
        // Redirect to payment page for bank transfer or credit card
        window.location.href = result.authorize_uri
      } else if (result.charge_id && selectedMethod === 'promptpay') {
        // Show QR code for PromptPay
        onSuccess?.(result.charge_id)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Checkout" subtitle={`Complete your subscription to ${plan.name} plan`} />

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-[var(--brand-background)] rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--brand-text-secondary)]">{plan.name} Plan</span>
              <span className="font-semibold">{formatPrice(price)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--brand-text-secondary)]">Billing Cycle</span>
              <span className="font-semibold capitalize">{billingCycle}</span>
            </div>
            {billingCycle === 'annual' && (
              <div className="flex justify-between items-center text-green-600 text-sm">
                <span>Annual Discount (20%)</span>
                <span>-{formatPrice(plan.price_thb * 12 * 0.2)}</span>
              </div>
            )}
            <div className="border-t border-[var(--brand-border)] pt-2 mt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(price)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-1 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handlePaymentMethodChange(method.id)}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-600 bg-blue-500/10'
                      : 'border-[var(--brand-border)] hover:border-[var(--brand-border)]'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedMethod === method.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)]'
                    }`}
                  >
                    {method.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-[var(--brand-text-secondary)]">
                      {method.description}
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Selection for Bank Transfer */}
          {selectedMethod === 'bank_transfer' && (
            <div>
              <label className="block text-sm font-medium text-[var(--brand-text)] mb-3">
                Select Bank
              </label>
              <div className="grid grid-cols-1 gap-2">
                {BANK_OPTIONS.map((bank) => (
                  <button
                    key={bank.value}
                    type="button"
                    onClick={() => handleBankChange(bank.value)}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-colors ${
                      selectedBank === bank.value
                        ? 'border-blue-600 bg-blue-500/10'
                        : 'border-[var(--brand-border)] hover:border-[var(--brand-border)]'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ${
                        selectedBank === bank.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-[var(--brand-border)]'
                      }`}
                    >
                      {selectedBank === bank.value && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-[var(--brand-surface)] rounded-full" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{bank.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PromptPay QR Code Display */}
          {checkoutResult?.qr_code_uri && selectedMethod === 'promptpay' && (
            <div className="bg-[var(--brand-background)] rounded-lg p-6 text-center">
              <div className="mb-4">
                <Image
                  src={checkoutResult.qr_code_uri}
                  alt="PromptPay QR Code"
                  width={256}
                  height={256}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-[var(--brand-text-secondary)] mb-2">
                Scan this QR code with your mobile banking app to complete payment
              </p>
              <p className="text-sm text-[var(--brand-text-secondary)]">
                Amount: {formatPrice(price)}
              </p>
              <p className="text-xs text-[var(--brand-text-secondary)] mt-4">
                Payment will be processed automatically after scanning
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400 font-medium">Payment Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isProcessing || !!checkoutResult?.qr_code_uri}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : selectedMethod === 'promptpay' ? (
              'Generate QR Code'
            ) : (
              `Pay ${formatPrice(price)}`
            )}
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--brand-text-secondary)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Secured by Omise/Opn Payments</span>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default CheckoutForm
