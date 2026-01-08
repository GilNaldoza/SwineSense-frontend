import { useQuery } from '@tanstack/react-query'
import { getEntries } from '@/api/entries'

export type UseEntriesParams = {
  userType?: 'student' | 'faculty' | 'all'
  query?: string
  page?: number
  limit?: number
  sort?: string
  yearLevel?: string
  location?: string
  startDate?: string
  endDate?: string
  college?: string
  department?: string
}

export function useEntries(params: UseEntriesParams, options?: { enabled?: boolean }) {
  const { userType, query, page = 1, limit = 10, sort, location, startDate, endDate, college, department } = params

  const key = ['entries', userType ?? 'all', query ?? '', page, limit, sort ?? '', params.yearLevel ?? '', location ?? '', startDate ?? '', endDate ?? '', college ?? '', department ?? ''] as const

  return useQuery({
    queryKey: key,
    queryFn: () => getEntries({ userType, query, page, limit, sort, yearLevel: params.yearLevel, location, startDate, endDate, college, department }),
    staleTime: 1000 * 10, // 10s
    refetchInterval: 5000, // Poll every 5s
    enabled: options?.enabled ?? true,
  })
}
