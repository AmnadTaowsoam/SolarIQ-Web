import { useState, useEffect, useCallback } from 'react';

interface ConsentType {
    id: string;
    type: string;
    label: string;
    description: string;
    granted: boolean;
    granted_at: string | null;
}

interface UseLIFFConsentReturn {
    consents: ConsentType[];
    isLoading: boolean;
    error: string | null;
    grantConsent: (consentType: string) => Promise<void>;
    withdrawConsent: (consentType: string) => Promise<void>;
    refreshConsents: () => Promise<void>;
}

const CONSENT_DEFINITIONS = [
    {
        type: 'marketing',
        label: 'การตลาดและโปรโมชั่น',
        description: 'ยินยอมรับข้อมูลข่าวสาร โปรโมชั่น และสิทธิประโยชน์พิเศษจาก SolarIQ',
    },
    {
        type: 'contact_sharing',
        label: 'แชร์ข้อมูลติดต่อ',
        description: 'ยินยอมให้แชร์ข้อมูลติดต่อกับผู้ติดตั้งที่ได้รับการรับรอง',
    },
    {
        type: 'analysis_results',
        label: 'ผลวิเคราะห์ต้นทุน',
        description: 'ยินยอมให้เก็บผลการวิเคราะห์ต้นทุนไฟฟ้าและศักยภาพโซลาร์เซลล์',
    },
    {
        type: 'proposal_sharing',
        label: 'รับใบเสนอราคา',
        description: 'ยินยอมรับใบเสนอราคาและข้อเสนอจากผู้ติดตั้งผ่านระบบ',
    },
];

export function useLIFFConsent(lineUserId: string | null): UseLIFFConsentReturn {
    const [consents, setConsents] = useState<ConsentType[]>(() =>
        CONSENT_DEFINITIONS.map((def) => ({
            id: def.type,
            type: def.type,
            label: def.label,
            description: def.description,
            granted: false,
            granted_at: null,
        }))
    );

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConsents = useCallback(async () => {
        if (!lineUserId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/liff/consent/${lineUserId}`);

            if (response.ok) {
                const data = await response.json();
                const mergedConsents = CONSENT_DEFINITIONS.map((def) => {
                    const existingConsent = data.consents?.find((c: ConsentType) => c.type === def.type);
                    return {
                        id: def.type,
                        type: def.type,
                        label: def.label,
                        description: def.description,
                        granted: existingConsent?.granted ?? false,
                        granted_at: existingConsent?.granted_at ?? null,
                    };
                });
                setConsents(mergedConsents);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch consents');
        } finally {
            setIsLoading(false);
        }
    }, [lineUserId]);

    useEffect(() => {
        fetchConsents();
    }, [fetchConsents]);

    const grantConsent = useCallback(async (consentType: string) => {
        if (!lineUserId) {
            throw new Error('LINE User ID is required');
        }

        try {
            setError(null);

            const response = await fetch('/api/liff/consent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    line_user_id: lineUserId,
                    consent_type: consentType,
                    granted: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to grant consent');
            }

            await fetchConsents();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to grant consent');
            throw err;
        }
    }, [lineUserId, fetchConsents]);

    const withdrawConsent = useCallback(async (consentType: string) => {
        if (!lineUserId) {
            throw new Error('LINE User ID is required');
        }

        try {
            setError(null);

            const response = await fetch(`/api/liff/consent/${lineUserId}/${consentType}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to withdraw consent');
            }

            await fetchConsents();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to withdraw consent');
            throw err;
        }
    }, [lineUserId, fetchConsents]);

    const refreshConsents = useCallback(async () => {
        await fetchConsents();
    }, [fetchConsents]);

    return {
        consents,
        isLoading,
        error,
        grantConsent,
        withdrawConsent,
        refreshConsents,
    };
}
