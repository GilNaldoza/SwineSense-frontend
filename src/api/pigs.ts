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

export type PigScansResponse = {
  scans: PigScanLog[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

type BackendPigModel = {
  id?: string;
  pigId?: number | string;
  pigNumber?: string;
  rfidTag: string;
  pigType: 'piglet' | 'sow' | 'boar' | 'gilt';
  sire?: string | null;
  dam?: string | null;
  pen: string;
  healthStatus: 'healthy' | 'at-risk' | 'sick';
  weight?: number | null;
  dateOfBirth: string;
  notes?: string | null;
  lastScanned: string;
  createdAt: string;
  updatedAt: string;
}

type BackendScan = {
  scanId?: number | string
  scan_id?: number | string
  id?: number | string
  pigId?: number | string
  pig_id?: number | string
  pig?: { rfidTag?: string }
  rfidTag?: string
  rfid_tag?: string
  timestamp?: string
  scanTimestamp?: string
  location?: string
  scannedBy?: number | string
  staffId?: number | string
  notes?: string
}

type BackendPenStat = {
  pen?: string
  count?: number
  _count?: { pigId?: number }
  healthy?: number
  atRisk?: number
  sick?: number
  healthStatus?: { healthy?: number; atRisk?: number; sick?: number }
}

type BackendWeight = {
  weightLogId?: number | string
  id?: number | string
  pigId?: number | string
  weight?: number
  recordedAt?: string
  admin?: { fullName?: string }
  notes?: string
}

/**
 * Adapter to map backend Pig model to frontend PigRecord type
 */
const adaptPig = (p: BackendPigModel): PigRecord => ({
  id: (p.pigId ? p.pigId.toString() : p.id) || '',
  pigId: (p.pigNumber || p.pigId || '').toString(),
  rfidTag: p.rfidTag,
  pigType: p.pigType,
  sire: p.sire || undefined,
  dam: p.dam || undefined,
  pen: p.pen,
  healthStatus: p.healthStatus,
  weight: p.weight || undefined,
  dateOfBirth: p.dateOfBirth,
  notes: p.notes || undefined,
  lastScanned: p.lastScanned,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

/**
 * Adapter to map backend Scan model to frontend PigScanLog type
 */
const adaptScan = (s: BackendScan): PigScanLog => ({
  id: String(s.scanId || s.scan_id || s.id || ''),
  pigId: String(s.pigId || s.pig_id || ''),
  rfidTag: s.pig?.rfidTag || s.rfidTag || s.rfid_tag || '',
  scanTimestamp: s.timestamp || s.scanTimestamp || '',
  location: s.location || undefined,
  staffId: s.scannedBy ? String(s.scannedBy) : (s.staffId ? String(s.staffId) : undefined),
  notes: s.notes || undefined,
});

/**
 * Check if a pig exists by RFID tag
 */
export async function checkPigByRfid(rfidTag: string): Promise<PigRecord | null> {
  const response = await client.get(`/pigs/check-rfid/${encodeURIComponent(rfidTag)}`)
  return response.data ? adaptPig(response.data) : null
}

/**
 * Create a new pig record
 */
export async function createPigRecord(pigData: Omit<PigRecord, 'id' | 'lastScanned' | 'createdAt' | 'updatedAt'>): Promise<PigRecord> {
  const backendData = {
    ...pigData,
    pigNumber: pigData.pigId // map frontend pigId back to backend pigNumber
  }
  const response = await client.post('/pigs', backendData)
  return adaptPig(response.data)
}

/**
 * Update an existing pig record
 */
export async function updatePigRecord(
  pigId: string,
  pigData: Partial<Omit<PigRecord, 'id' | 'lastScanned' | 'createdAt' | 'updatedAt'>>
): Promise<PigRecord> {
  const backendData = {
    ...pigData,
    ...(pigData.pigId && { pigNumber: pigData.pigId })
  }
  const response = await client.put(`/pigs/${pigId}`, backendData)
  return adaptPig(response.data)
}

/**
 * Get a single pig record
 */
export async function getPigById(pigId: string): Promise<PigRecord> {
  const response = await client.get(`/pigs/${pigId}`)
  return adaptPig(response.data)
}

/**
 * Get all pigs with filtering
 */
export async function getPigs(opts?: GetPigsOptions): Promise<PigsResponse> {
  const params = new URLSearchParams()
  
  if (opts?.pigType && opts.pigType !== 'all') params.append('pigType', opts.pigType)
  if (opts?.healthStatus && opts.healthStatus !== 'all') params.append('healthStatus', opts.healthStatus)
  if (opts?.pen) params.append('pen', opts.pen)
  if (opts?.query) params.append('search', opts.query) // backend uses 'search' instead of 'query'
  if (opts?.page) params.append('page', opts.page.toString())
  if (opts?.limit) params.append('limit', opts.limit.toString())
  if (opts?.sort) params.append('sort', opts.sort)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)

  const response = await client.get(`/pigs?${params.toString()}`)
  return {
    pigs: (response.data?.data?.pigs || []).map(adaptPig),
    pagination: response.data?.data?.pagination
  }
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

  const response = await client.get(`/pigs/stats/dashboard?${params.toString()}`)
  const raw = response.data
  
  const byType: { [key: string]: number } = {}
  if (raw.typeStats) {
      raw.typeStats.forEach((t: { pigType: string; _count: { pigId: number } }) => {
          byType[t.pigType] = t._count.pigId
      })
  }

  const healthStatus = { healthy: 0, atRisk: 0, sick: 0 }
  if (raw.healthStats) {
      raw.healthStats.forEach((h: { healthStatus: string; _count: { pigId: number } }) => {
          if (h.healthStatus === 'healthy') healthStatus.healthy = h._count.pigId
          else if (h.healthStatus === 'at-risk') healthStatus.atRisk = h._count.pigId
          else if (h.healthStatus === 'sick') healthStatus.sick = h._count.pigId
      })
  }

    const penOverview = (raw.penStats || []).map((p: BackendPenStat) => ({
      pen: p.pen || '',
      count: p.count || p._count?.pigId || 0,
      healthStatus: {
        healthy: p.healthy || p.healthStatus?.healthy || 0,
        atRisk: p.atRisk || p.healthStatus?.atRisk || 0,
        sick: p.sick || p.healthStatus?.sick || 0,
      }
    }))

  return {
      totalPigs: raw.totalPigs || 0,
      byType,
      healthStatus,
      recentScans: (raw.recentScans || []).map(adaptScan),
      scansByDay: raw.scansByDay || [],
      penOverview
  }
}

/**
 * Get recently scanned pigs
 */
export async function getRecentScans(limit: number = 10): Promise<PigScanLog[]> {
  const response = await client.get(`/pigs/scans/recent?limit=${limit}`)
  return (response.data || []).map(adaptScan)
}

/**
 * Get paginated pig scans
 */
export async function getPigScans(opts?: GetPigsOptions): Promise<PigScansResponse> {
  const params = new URLSearchParams()
  
  if (opts?.query) params.append('search', opts.query)
  if (opts?.pen) params.append('location', opts.pen) // Note: Backend scans use 'location', but we can map 'pen' to it
  if (opts?.page) params.append('page', opts.page.toString())
  if (opts?.limit) params.append('limit', opts.limit.toString())
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)

  const response = await client.get(`/pigs/scans?${params.toString()}`)
  return {
    scans: (response.data?.data?.scans || []).map(adaptScan),
    pagination: response.data?.data?.pagination
  }
}

/**
 * Record a manual pig scan
 */
export async function recordPigScan(
  rfidTag: string,
  location?: string,
  notes?: string
): Promise<PigScanLog> {
  const response = await client.post('/pigs/scans', {
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
  await client.delete(`/pigs/${pigId}`)
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

  // Use /export instead of /export/csv to match backend route
  const response = await client.get(`/pigs/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Export pig scan records as CSV
 */
export async function exportPigScansToCSV(opts?: { search?: string; location?: string; startDate?: string; endDate?: string }): Promise<Blob> {
  const params = new URLSearchParams()
  if (opts?.search) params.append('search', opts.search)
  if (opts?.location) params.append('location', opts.location)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)
  const response = await client.get(`/pigs/scans/export?${params.toString()}`, { responseType: 'blob' })
  return response.data
}

/**
 * Weight log entry type
 */
export type WeightLogEntry = {
  id: string
  pigId: string
  weight: number
  recordedAt: string
  recordedBy?: string
  notes?: string
}

/**
 * Get weight history for a pig
 */
export async function getWeightHistory(pigId: string, limit: number = 50): Promise<WeightLogEntry[]> {
  const response = await client.get(`/pigs/${pigId}/weight?limit=${limit}`)
  return (response.data || []).map((w: BackendWeight) => ({
    id: String(w.weightLogId || w.id || ''),
    pigId: String(w.pigId || ''),
    weight: w.weight || 0,
    recordedAt: w.recordedAt || '',
    recordedBy: w.admin?.fullName || undefined,
    notes: w.notes || undefined,
  }))
}

/**
 * Record a new weight entry for a pig
 */
export async function recordWeight(pigId: string, weight: number, notes?: string): Promise<WeightLogEntry> {
  const response = await client.post(`/pigs/${pigId}/weight`, { weight, notes })
  return response.data
}
