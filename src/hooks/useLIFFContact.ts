import { useState, useEffect, useCallback } from 'react';

interface ContactFormData {
    phone: string;
    email: string;
    display_name: string;
    address: string;
    province: string;
    district: string;
}

interface ContactData extends ContactFormData {
    id: string;
    line_user_id: string;
    quality_score: number | null;
    quality_tier: string | null;
    created_at: string;
    updated_at: string;
}

interface UseLIFFContactReturn {
    contact: ContactData | null;
    isLoading: boolean;
    error: string | null;
    createContact: (data: ContactFormData) => Promise<void>;
    updateContact: (data: Partial<ContactFormData>) => Promise<void>;
    refreshContact: () => Promise<void>;
}

export function useLIFFContact(lineUserId: string | null): UseLIFFContactReturn {
    const [contact, setContact] = useState<ContactData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContact = useCallback(async () => {
        if (!lineUserId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/liff/contact/${lineUserId}`);

            if (response.ok) {
                const data: ContactData = await response.json();
                setContact(data);
            } else if (response.status !== 404) {
                throw new Error('Failed to fetch contact');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch contact');
        } finally {
            setIsLoading(false);
        }
    }, [lineUserId]);

    useEffect(() => {
        fetchContact();
    }, [fetchContact]);

    const createContact = useCallback(async (data: ContactFormData) => {
        if (!lineUserId) {
            throw new Error('LINE User ID is required');
        }

        try {
            setError(null);

            const response = await fetch('/api/liff/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    line_user_id: lineUserId,
                    ...data,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create contact');
            }

            const newContact: ContactData = await response.json();
            setContact(newContact);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create contact');
            throw err;
        }
    }, [lineUserId]);

    const updateContact = useCallback(async (data: Partial<ContactFormData>) => {
        if (!lineUserId) {
            throw new Error('LINE User ID is required');
        }

        try {
            setError(null);

            const response = await fetch(`/api/liff/contact/${lineUserId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update contact');
            }

            const updatedContact: ContactData = await response.json();
            setContact(updatedContact);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update contact');
            throw err;
        }
    }, [lineUserId]);

    const refreshContact = useCallback(async () => {
        await fetchContact();
    }, [fetchContact]);

    return {
        contact,
        isLoading,
        error,
        createContact,
        updateContact,
        refreshContact,
    };
}
