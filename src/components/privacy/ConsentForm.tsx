'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePrivacy } from '@/hooks/usePrivacy';
import {
  ConsentType,
  REQUIRED_CONSENTS,
  OPTIONAL_CONSENTS,
  CONSENT_DESCRIPTIONS,
} from '@/types/privacy';

interface ConsentFormProps {
  onComplete?: () => void;
  showRequiredOnly?: boolean;
}

export function ConsentForm({ onComplete, showRequiredOnly = false }: ConsentFormProps) {
  const { consentTypes, fetchConsentTypes, grantConsents, isLoadingConsent, consentError } = usePrivacy();
  const [consentValues, setConsentValues] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchConsentTypes();
  }, [fetchConsentTypes]);

  useEffect(() => {
    if (consentTypes) {
      const initialValues: Record<string, boolean> = {};
      [...consentTypes.required, ...consentTypes.optional].forEach((ct) => {
        initialValues[ct.type] = false;
      });
      setConsentValues(initialValues);
    }
  }, [consentTypes]);

  const handleToggle = (type: string, isRequired: boolean) => {
    if (isRequired && showRequiredOnly) {
      // Required consents must be accepted in required-only mode
      return;
    }
    setConsentValues((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const consents = Object.entries(consentValues).map(([type, granted]) => ({
        consent_type: type as ConsentType,
        granted,
      }));

      await grantConsents({
        consents,
      });

      onComplete?.();
    } catch (error) {
      console.error('Failed to submit consents:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequiredAccepted = REQUIRED_CONSENTS.every(
    (ct) => consentValues[ct] === true
  );

  if (!consentTypes) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {consentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {consentError}
        </div>
      )}

      {/* Required Consents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ข้อมูลที่จำเป็นต้องเก็บ *
        </h3>
        <p className="text-sm text-gray-600">
          ข้อมูลเหล่านี้จำเป็นสำหรับการใช้งานบริการของเรา
        </p>
        {consentTypes.required.map((ct) => (
          <Card key={ct.type} className="p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentValues[ct.type] || false}
                onChange={() => handleToggle(ct.type, true)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {CONSENT_DESCRIPTIONS[ct.type] || ct.description}
                </p>
                <p className="text-sm text-gray-500 mt-1">จำเป็นต้องยินยอม</p>
              </div>
            </label>
          </Card>
        ))}
      </div>

      {/* Optional Consents */}
      {!showRequiredOnly && consentTypes.optional.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            ข้อมูลเพิ่มเติม (ไม่บังคับ)
          </h3>
          <p className="text-sm text-gray-600">
            คุณสามารถเลือกให้ความยินยอมหรือไม่ก็ได้ การใช้งานบริการหลักจะไม่ได้รับผลกระทบ
          </p>
          {consentTypes.optional.map((ct) => (
            <Card key={ct.type} className="p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentValues[ct.type] || false}
                  onChange={() => handleToggle(ct.type, false)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {CONSENT_DESCRIPTIONS[ct.type] || ct.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">ไม่บังคับ</p>
                </div>
              </label>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!allRequiredAccepted || isSubmitting || isLoadingConsent}
          className="py-3"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              กำลังบันทึก...
            </span>
          ) : (
            'ยินยอมและดำเนินการต่อ'
          )}
        </Button>
        
        {!allRequiredAccepted && (
          <p className="text-sm text-red-600 text-center mt-2">
            กรุณายินยอมให้เก็บข้อมูลที่จำเป็นทั้งหมด
          </p>
        )}
      </div>

      {/* Privacy Policy Link */}
      <div className="text-center text-sm text-gray-500">
        <p>
          การกดปุ่ม "ยินยอม" แสดงว่าคุณได้อ่านและยอมรับ{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            นโยบายความเป็นส่วนตัว
          </a>{' '}
          ของเรา
        </p>
      </div>
    </form>
  );
}

export default ConsentForm;
