import { useState, useEffect, useCallback } from 'react';

interface ProposalItem {
    id: string;
    contractor_name: string;
    system_size: number;
    total_price: number;
    price_per_watt: number;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    valid_until: string;
    created_at: string;
    notes: string | null;
}

interface UseLIFFProposalsReturn {
    proposals: ProposalItem[];
    isLoading: boolean;
    error: string | null;
    acceptProposal: (proposalId: string) => Promise<void>;
    declineProposal: (proposalId: string, => Promise<void>;
refreshProposals: () => Promise<void>;
}

export function useLIFFProposals(lineUserId: string | null): UseLIFFProposalsReturn {
    const [proposals, setProposals] = useState<ProposalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProposals = useCallback(async () => {
        if (!lineUserId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/liff/proposals/${lineUserId}`);

            if (response.ok) {
                const data = await response.json();
                setProposals(data.proposals || []);
            } else {
                setProposals([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
        } finally {
            setIsLoading(false);
        }
    }, [lineUserId]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    const acceptProposal = useCallback(async (proposalId: string) => {
        if (!lineUserId) {
            throw new Error('LINE User ID is required');
        }

        try {
            setError(null);

            const response = await fetch(`/api/liff/proposal/${proposalId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    response: 'accepted',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to accept proposal');
            }

            await fetchProposals();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to accept proposal');
            throw err;
        }
    }, [lineUserId, fetchProposals]);

    const declineProposal = useCallback(async (proposalId: string) => {
        if (!lineUserId) {
            throw new Error('LINE User ID is required');
        }

        try {
            setError(null);

            const response = await fetch(`/api/liff/proposal/${proposalId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    response: 'declined',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to decline proposal');
            }

            await fetchProposals();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decline proposal');
            throw err;
        }
    }, [lineUserId, fetchProposals]);

    const refreshProposals = useCallback(async () => {
        await fetchProposals();
    }, [fetchProposals]);

    return {
        proposals,
        isLoading,
        error,
        acceptProposal,
        declineProposal,
        refreshProposals,
    };
}
