'use client';

/**
 * Subscription Card Component (WK-017)
 * Displays current subscription details with status badge and action buttons
 */

import React from 'react';
import { CalendarDays, CreditCard, RefreshCw, XCircle, ArrowRightCircle } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import {
  type SubscriptionWithPlan,
  type SubscriptionStatus,
  formatPrice,
  getStatusText,
} from '@/types/billing';
import { useResumeSubscription } from '@/hooks/useBilling';

// ============== Props ==============

interface SubscriptionCardProps {
  subscription: SubscriptionWithPlan;
  onCancel: () => void;
  onManagePayment: () => void;
  onChangePlan?: () => void;
  isProcessing?: boolean;
}

// ============== Helpers ==============

function getStatusBadgeVariant(status: SubscriptionStatus): BadgeProps['variant'] {
  switch (status) {
    case 'active':
      return 'success';
    case 'trialing':
      return 'info';
    case 'past_due':
      return 'warning';
    case 'canceled':
      return 'danger';
    case 'incomplete':
    case 'unpaid':
      return 'warning';
    default:
      return 'default';
  }
}

function formatDateThai(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============== Component ==============

export function SubscriptionCard({
  subscription,
  onCancel,
  onManagePayment,
  onChangePlan,
  isProcessing = false,
}: SubscriptionCardProps) {
  const resumeMutation = useResumeSubscription();

  const isCanceled = subscription.status === 'canceled' || subscription.cancel_at_period_end;
  const isActive = subscription.status === 'active';
  const isTrialing = subscription.status === 'trialing';

  const handleResume = async () => {
    try {
      await resumeMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    }
  };

  const isResuming = resumeMutation.isPending;
  const disabled = isProcessing || isResuming;

  return (
    <Card>
      <CardHeader
        title="การสมัครสมาชิกปัจจุบัน"
        subtitle="รายละเอียดแพ็กเกจและสถานะการสมัครสมาชิก"
        action={
          <Badge variant={getStatusBadgeVariant(subscription.status)} size="md">
            {getStatusText(subscription.status)}
          </Badge>
        }
      />

      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Plan Name */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">แพ็กเกจ</p>
              <p className="text-base font-semibold text-gray-900">{subscription.plan.name}</p>
              <p className="text-sm text-gray-500">{formatPrice(subscription.plan.price_thb)}/เดือน</p>
            </div>
          </div>

          {/* Current Period */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">รอบบิลปัจจุบัน</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDateThai(subscription.current_period_start)}
              </p>
              <p className="text-sm text-gray-500">
                ถึง {formatDateThai(subscription.current_period_end)}
              </p>
            </div>
          </div>

          {/* Next Renewal */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ต่ออายุถัดไป</p>
              {subscription.cancel_at_period_end ? (
                <p className="text-sm font-medium text-red-600">จะสิ้นสุดเมื่อหมดรอบบิล</p>
              ) : (
                <p className="text-sm font-medium text-gray-900">
                  {formatDateThai(subscription.current_period_end)}
                </p>
              )}
              <p className="text-sm text-gray-500">
                เหลืออีก {subscription.days_until_period_end} วัน
              </p>
            </div>
          </div>

          {/* Trial End (if applicable) */}
          {isTrialing && subscription.trial_end && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ทดลองใช้สิ้นสุด</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateThai(subscription.trial_end)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cancel warning banner */}
        {subscription.cancel_at_period_end && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              การสมัครสมาชิกของคุณถูกยกเลิกแล้ว แต่ยังสามารถใช้งานได้จนถึง{' '}
              <span className="font-semibold">
                {formatDateThai(subscription.current_period_end)}
              </span>{' '}
              คุณสามารถกลับมาใช้งานได้อีกครั้งก่อนวันดังกล่าว
            </p>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <div className="flex flex-wrap gap-3">
          {/* Change Plan button */}
          {onChangePlan && (isActive || isTrialing) && (
            <button
              onClick={onChangePlan}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightCircle className="w-4 h-4" />
              เปลี่ยนแพ็กเกจ
            </button>
          )}

          {/* Resume button (if canceled but still in period) */}
          {isCanceled && subscription.cancel_at_period_end && (
            <button
              onClick={handleResume}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isResuming ? 'animate-spin' : ''}`} />
              {isResuming ? 'กำลังดำเนินการ...' : 'กลับมาใช้งานต่อ'}
            </button>
          )}

          {/* Manage Payment button */}
          <button
            onClick={onManagePayment}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            จัดการการชำระเงิน
          </button>

          {/* Cancel button (only if active/trialing and not already canceling) */}
          {(isActive || isTrialing) && !subscription.cancel_at_period_end && (
            <button
              onClick={onCancel}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              ยกเลิกการสมัคร
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default SubscriptionCard;
