'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

interface InfiniteScrollConfig<T> {
  queryKey: unknown[]
  fetchFn: (context: {
    pageParam: number
  }) => Promise<{ items: T[]; nextPage: number | null; totalPages: number }>
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
  perPage: _perPage = 10,
  initialPage = 1,
  staleTime = 5 * 60 * 1000, // 5 minutes
}: InfiniteScrollConfig<T>): UseInfiniteScrollReturn<T> {
  void _perPage // reserved for future use
  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = initialPage }) => fetchFn({ pageParam }),
    initialPageParam: initialPage,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    staleTime,
  })

  return {
    items: data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: isFetching && !isFetchingNextPage,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isRefreshing: isRefetching,
    refresh: refetch,
    error: error ?? null,
  }
}
