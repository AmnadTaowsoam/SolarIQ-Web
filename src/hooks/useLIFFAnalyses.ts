import { useState, useEffect, useCallback } from 'react';

interface AnalysisItem {
    id: string;
    created_at: string;
    monthly_bill: number;
    recommended_size: number;
    estimated_savings: number;
    roi_years: number;
    status: string;
}

interface UseLIFFAnalysesReturn {
    analyses: AnalysisItem[];
    isLoading: boolean;
    error: string | null;
    refreshAnalyses: () => Promise<void>;
}

export function useLIFFAnalyses(lineUserId: string | null): UseLIFFAnalysesReturn {
    const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalyses = useCallback(async () => {
        if (!lineUserId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/liff/analyses/${lineUserId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch analyses');
            }

            const data = await response.json();
            setAnalyses(data.analyses || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analyses');
        } finally {
            setIsLoading(false);
        }
    }, [lineUserId]);

    useEffect(() => {
        fetchAnalyses();
    }, [fetchAnalyses]);

    const refreshAnalyses = useCallback(async () => {
        await fetchAnalyses();
    }, [fetchAnalyses]);

    return {
        analyses,
        isLoading,
        error,
        refreshAnalyses,
    };
}
