import client from './client'

export async function getTrends(
  period: '7d' | '30d' | '90d' | '365d' | '1y' = '30d',
  userType?: 'student' | 'faculty',
  range?: { startDate?: string; endDate?: string }
) {
  const params: Record<string, string> = {}
  if (range?.startDate && range?.endDate) {
    params.startDate = range.startDate
    params.endDate = range.endDate
  } else {
    params.period = period
  }
  if (userType) params.userType = userType
  const res = await client.get('/analytics/trends', { params })
  return res.data?.data as { period: string; trends: { date: string; count: number; label: string }[]; totalEntries: number }
}

export async function getByCollege(range?: { startDate?: string; endDate?: string }) {
  const params: Record<string, string> = {}
  if (range?.startDate && range?.endDate) {
    params.startDate = range.startDate
    params.endDate = range.endDate
  }
  const res = await client.get('/analytics/by-college', { params })
  return res.data?.data as { colleges: { college: string; count: number; percentage: string }[]; totalEntries: number }
}

export async function getByDepartment(range?: { startDate?: string; endDate?: string }, filter?: { college?: string }) {
  const params: Record<string, string> = {}
  if (range?.startDate && range?.endDate) {
    params.startDate = range.startDate
    params.endDate = range.endDate
  }
  if (filter?.college) params.college = filter.college
  const res = await client.get('/analytics/by-department', { params })
  return res.data?.data as { departments: { department: string; college: string; count: number; percentage: string }[]; totalEntries: number }
}

export async function getPeakHours() {
  const res = await client.get('/analytics/peak-hours')
  return res.data?.data as { peakHours: { hour: number; count: number; label: string }[]; peakHour: { hour: number; count: number; label: string } }
}

export async function getTimeByCollege(
  period: '7d'|'30d'|'90d'|'365d'|'1y' = '30d',
  range?: { startDate?: string; endDate?: string },
  opts?: { topN?: number; includeOther?: boolean }
) {
  const params: Record<string, string> = {}
  if (range?.startDate && range?.endDate) {
    params.startDate = range.startDate
    params.endDate = range.endDate
  } else {
    params.period = period
  }
  if (typeof opts?.topN === 'number' && opts.topN > 0) params.topN = String(opts.topN)
  if (typeof opts?.includeOther === 'boolean') params.includeOther = String(opts.includeOther)
  const res = await client.get('/analytics/time-by-college', { params })
  return res.data?.data as { period: string; categories: string[]; data: Array<Record<string, number | string>> }
}

export async function getTimeByDepartment(
  period: '7d'|'30d'|'90d'|'365d'|'1y' = '30d',
  range?: { startDate?: string; endDate?: string },
  filter?: { college?: string; department?: string },
  opts?: { topN?: number; includeOther?: boolean }
) {
  const params: Record<string, string> = {}
  if (range?.startDate && range?.endDate) {
    params.startDate = range.startDate
    params.endDate = range.endDate
  } else {
    params.period = period
  }
  if (filter?.college) params.college = filter.college
  if (filter?.department) params.department = filter.department
  if (typeof opts?.topN === 'number' && opts.topN > 0) params.topN = String(opts.topN)
  if (typeof opts?.includeOther === 'boolean') params.includeOther = String(opts.includeOther)
  const res = await client.get('/analytics/time-by-department', { params })
  return res.data?.data as { period: string; categories: string[]; data: Array<Record<string, number | string>> }
}