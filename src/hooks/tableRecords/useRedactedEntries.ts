import { useQuery } from '@tanstack/react-query'
import { getRedactedEntries } from '@/api/entries'

export type UseRedactedParams = {
  userType?: 'student' | 'faculty' | 'all'
  page?: number
  limit?: number
  sort?: string
}

export function useRedactedEntries(params: UseRedactedParams, options?: { enabled?: boolean }) {
  const { userType, page = 1, limit = 10, sort } = params
  const key = ['redacted-entries', userType ?? 'all', page, limit, sort ?? ''] as const
  return useQuery({
    queryKey: key,
    queryFn: () => getRedactedEntries({ userType, page, limit, sort }),
    staleTime: 1000 * 30,
    enabled: options?.enabled ?? true,
  })
}
