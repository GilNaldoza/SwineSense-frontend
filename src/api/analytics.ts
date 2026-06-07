import client from './client'

export type ScanTrend = { date: string; count: number }
export type TypeStat = { type: string; count: number; percentage: string }
export type PenStat = { pen: string; count: number; healthy: number; atRisk: number; sick: number }
export type HealthTrend = { date: string; healthy: number; atRisk: number; sick: number }

export async function getScanTrends(opts?: { period?: string; startDate?: string; endDate?: string }): Promise<{ trends: ScanTrend[]; totalScans: number }> {
  const params = new URLSearchParams()
  if (opts?.period) params.append('period', opts.period)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)
  const response = await client.get(`/analytics/trends?${params.toString()}`)
  return response.data?.data || { trends: [], totalScans: 0 }
}

export async function getPigsByType(): Promise<{ types: TypeStat[]; totalPigs: number }> {
  const response = await client.get('/analytics/by-type')
  return response.data?.data || { types: [], totalPigs: 0 }
}

export async function getPigsByPen(): Promise<{ pens: PenStat[]; totalPens: number }> {
  const response = await client.get('/analytics/by-pen')
  return response.data?.data || { pens: [], totalPens: 0 }
}

export async function getHealthTrends(opts?: { period?: string; startDate?: string; endDate?: string }): Promise<{ trends: HealthTrend[] }> {
  const params = new URLSearchParams()
  if (opts?.period) params.append('period', opts.period)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)
  const response = await client.get(`/analytics/health-trends?${params.toString()}`)
  return response.data?.data || { trends: [] }
}