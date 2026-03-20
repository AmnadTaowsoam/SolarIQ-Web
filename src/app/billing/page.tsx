'use client';

/**
 * Billing Page (WK-017)
 * Main billing management page for subscription, invoices, and usage
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, FileText, BarChart3, Settings, ExternalLink } from 'lucide-react';
import { PlanSelector } from '@/components/billing/PlanSelector';
import { UsageBar } from '@/components/billing/UsageBar';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { SubscriptionCard } from '@/components/billing/SubscriptionCard';
import {
  useBillingStatus,
  usePlans,
  useInvoices,
  useUsage,
  useSubscribe,
  useUpdateSubscription,
  useCancelSubscription,
  useCustomerPortal,
} from '@/hooks/useBilling';
import { type PlanType, getStatusColor, getStatusText } from '@/types/billing';

type TabType = 'overview' | 'plans' | 'invoices' | 'usage';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isProcessing, setIsProcessing] = useState(false);

  // Queries
  const { data: billingStatus, isLoading: isLoadingStatus } = useBillingStatus();
  const { data: plansData } = usePlans();
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices(1, 10);
  const { data: usageData } = useUsage();

  // Mutations
  const subscribeMutation = useSubscribe();
  const updateSubscriptionMutation = useUpdateSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();
  const customerPortalMutation = useCustomerPortal();

  const handleSelectPlan = async (planId: PlanType) => {
    setIsProcessing(true);
    try {
      if (billingStatus?.subscription) {
        // Update existing subscription
        await updateSubscriptionMutation.mutateAsync({ plan_id: planId });
      } else {
        // Create new subscription
        await subscribeMutation.mutateAsync({ plan_id: planId });
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      setIsProcessing(true);
      try {
        await cancelSubscriptionMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleOpenPortal = async () => {
    try {
      const result = await customerPortalMutation.mutateAsync();
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: CreditCard },
    { id: 'plans' as TabType, label: 'Plans', icon: Settings },
    { id: 'invoices' as TabType, label: 'Invoices', icon: FileText },
    { id: 'usage' as TabType, label: 'Usage', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription, view invoices, and track usage
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Subscription Card */}
            {billingStatus?.subscription && (
              <SubscriptionCard
                subscription={billingStatus.subscription}
                onCancel={handleCancelSubscription}
                onManagePayment={handleOpenPortal}
                isProcessing={isProcessing}
              />
            )}

            {/* Usage Summary */}
            {usageData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Usage
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {usageData.usage.map((item, index) => (
                    <UsageBar
                      key={index}
                      label={item.resource_type.replace('_', ' ').toUpperCase()}
                      current={item.total_quantity}
                      limit={item.limit}
                      percentage={item.percentage_used}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('plans')}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Change Plan</div>
                    <div className="text-sm text-gray-500">
                      Upgrade or downgrade your subscription
                    </div>
                  </div>
                </button>
                <button
                  onClick={handleOpenPortal}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Manage Payment</div>
                    <div className="text-sm text-gray-500">
                      Update payment method via Stripe
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 mt-1">
                Select the plan that best fits your business needs
              </p>
            </div>
            <PlanSelector
              currentPlan={billingStatus?.subscription?.plan_id}
              onSelectPlan={handleSelectPlan}
              isLoading={isProcessing}
            />
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Invoice History</h2>
              <p className="text-gray-600 mt-1">
                View and download your past invoices
              </p>
            </div>
            {isLoadingInvoices ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <InvoiceTable invoices={invoicesData?.invoices ?? []} />
            )}
          </div>
        )}

        {activeTab === 'usage' && usageData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Usage Details
              </h2>
              <p className="text-gray-600 mb-6">
                Billing period: {new Date(usageData.period_start).toLocaleDateString()} -{' '}
                {new Date(usageData.period_end).toLocaleDateString()}
              </p>
              <div className="space-y-6">
                {usageData.usage.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">
                        {item.resource_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-gray-600">
                        {item.total_quantity} / {item.limit ?? '∞'}
                      </span>
                    </div>
                    <UsageBar
                      label=""
                      current={item.total_quantity}
                      limit={item.limit}
                      percentage={item.percentage_used}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
