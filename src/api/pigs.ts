import client from "./client"

export type PigRecord = {
  id: string
  rfidTag: string
  pigId: string
  pigType: 'piglet' | 'sow' | 'boar' | 'gilt'
  sire?: string
  dam?: string
  pen: string
  healthStatus: 'healthy' | 'at-risk' | 'sick'
  weight?: number
  dateOfBirth: string
  notes?: string
  lastScanned: string
  createdAt: string
  updatedAt: string
}

export type PigScanLog = {
  id: string
  pigId: string
  rfidTag: string
  scanTimestamp: string
  location?: string
  staffId?: string
  notes?: string
}

export type GetPigsOptions = {
  pigType?: 'piglet' | 'sow' | 'boar' | 'gilt' | 'all'
  healthStatus?: 'healthy' | 'at-risk' | 'sick' | 'all'
  pen?: string
  query?: string
  page?: number
  limit?: number
  sort?: string
  startDate?: string
  endDate?: string
}

export type PigsResponse = {
  pigs: PigRecord[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type PigDashboardStats = {
  totalPigs: number
  byType: { [key: string]: number }
  healthStatus: { healthy: number; atRisk: number; sick: number }
  recentScans: PigScanLog[]
  scansByDay: Array<{ date: string; count: number }>
  penOverview: Array<{ pen: string; count: number; healthStatus: { healthy: number; atRisk: number; sick: number } }>
}

/**
 * Check if a pig exists by RFID tag
 */
export async function checkPigByRfid(rfidTag: string): Promise<PigRecord | null> {
  const response = await client.get(`/api/pigs/check-rfid/${encodeURIComponent(rfidTag)}`)
  return response.data?.pig || null
}

/**
 * Create a new pig record
 */
export async function createPigRecord(pigData: Omit<PigRecord, 'id' | 'lastScanned' | 'createdAt' | 'updatedAt'>): Promise<PigRecord> {
  const response = await client.post('/api/pigs', pigData)
  return response.data
}

/**
 * Update an existing pig record
 */
export async function updatePigRecord(
  pigId: string,
  pigData: Partial<Omit<PigRecord, 'id' | 'lastScanned' | 'createdAt' | 'updatedAt'>>
): Promise<PigRecord> {
  const response = await client.put(`/api/pigs/${pigId}`, pigData)
  return response.data
}

/**
 * Get a single pig record
 */
export async function getPigById(pigId: string): Promise<PigRecord> {
  const response = await client.get(`/api/pigs/${pigId}`)
  return response.data
}

/**
 * Get all pigs with filtering
 */
export async function getPigs(opts?: GetPigsOptions): Promise<PigsResponse> {
  const params = new URLSearchParams()
  
  if (opts?.pigType && opts.pigType !== 'all') params.append('pigType', opts.pigType)
  if (opts?.healthStatus && opts.healthStatus !== 'all') params.append('healthStatus', opts.healthStatus)
  if (opts?.pen) params.append('pen', opts.pen)
  if (opts?.query) params.append('query', opts.query)
  if (opts?.page) params.append('page', opts.page.toString())
  if (opts?.limit) params.append('limit', opts.limit.toString())
  if (opts?.sort) params.append('sort', opts.sort)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)

  const response = await client.get(`/api/pigs?${params.toString()}`)
  return response.data
}

/**
 * Get pig dashboard statistics
 */
export async function getPigDashboardStats(
  startDate?: string,
  endDate?: string
): Promise<PigDashboardStats> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const response = await client.get(`/api/pigs/stats/dashboard?${params.toString()}`)
  return response.data
}

/**
 * Get recently scanned pigs
 */
export async function getRecentScans(limit: number = 10): Promise<PigScanLog[]> {
  const response = await client.get(`/api/pigs/scans/recent?limit=${limit}`)
  return response.data.scans || []
}

/**
 * Record a manual pig scan
 */
export async function recordPigScan(
  rfidTag: string,
  location?: string,
  notes?: string
): Promise<PigScanLog> {
  const response = await client.post('/api/pigs/scans', {
    rfidTag,
    location,
    notes,
  })
  return response.data
}

/**
 * Delete a pig record (soft delete)
 */
export async function deletePigRecord(pigId: string): Promise<void> {
  await client.delete(`/api/pigs/${pigId}`)
}

/**
 * Export pig records as CSV
 */
export async function exportPigsToCSV(opts?: GetPigsOptions): Promise<Blob> {
  const params = new URLSearchParams()
  
  if (opts?.pigType && opts.pigType !== 'all') params.append('pigType', opts.pigType)
  if (opts?.healthStatus && opts.healthStatus !== 'all') params.append('healthStatus', opts.healthStatus)
  if (opts?.pen) params.append('pen', opts.pen)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)

  const response = await client.get(`/api/pigs/export/csv?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}
