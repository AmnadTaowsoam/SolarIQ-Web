'use client'

import { useInfiniteQuery, UseInfiniteQuery, UseQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

interface InfiniteScrollConfig<T> {
    queryKey: unknown[]
    fetchFn: (context: { pageParam: number }) => Promise<{ items: T[]; nextPage: number | null; totalPages: number }>
    perPage?: number
    initialPage?: number
    staleTime?: number
}

interface UseInfiniteScrollReturn<T> {
    items: T[]
    isLoading: boolean
    isFetchingNextPage: boolean
    hasNextPage: boolean
    fetchNextPage: () => void
    isRefreshing: boolean
    refresh: () => void
    error: Error | null
}

export function useInfiniteScroll<T>({
    queryKey,
    fetchFn,
    perPage = 10,
    initialPage = 1,
    staleTime = 5 * 60 * 1000, // 5 minutes
}: InfiniteScrollConfig<T>): UseInfiniteScrollReturn<T> {
    const queryClient = useQueryClient()

    const {
        const {
            const data = useInfiniteQuery({
                queryKey,
                queryFn: ({ pageParam = initialPage }) => fetchFn({ pageParam }),
                initialPageParam: initialPage,
                getNextPageParam: (lastPage) => {
                    const pages = lastPage.pageParams as number[]
                    return pages < (lastPage.totalPages ?? Infinity) ? pages + 1 : undefined
                },
                staleTime,
                getNextPageParam: (lastPage, allPages) => {
                    const pages = allPages.pageParams as number[]
                    return pages < (allPages.totalPages ?? Infinity) ? pages + 1 : undefined
                },
            })

      return {
                items: data.pages.flatMap((page: { items: T[] }) => page.items),
                    isLoading: data.isFetching,
                        isFetchingNextPage: data.isFetching && !data.isFetchingNextPage,
                            hasNextPage: !data.isFetchingNextPage && data.hasNextPage,
                                fetchNextPage: data.fetchNextPage,
                                    isRefreshing: data.isRefetching,
                                        refresh: data.refetch,
                                            error: data.error ?? null,
      }
    } catch (error) {
    return {
        items: [],
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: () => { },
        isRefreshing: false,
        refresh: () => { },
        error: error as Error,
    }
}
}
