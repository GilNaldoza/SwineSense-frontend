import client from "./client"

export type Treatment = {
  id: string
  pigId: string
  type: 'vaccination' | 'deworming' | 'medication' | 'checkup'
  name: string
  dosage?: string
  administeredAt: string
  nextDueDate?: string
  administeredBy?: string
  pigNumber?: string
  pigType?: string
  pen?: string
  notes?: string
  createdAt: string
}

export type TreatmentsResponse = {
  treatments: Treatment[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type UpcomingTreatments = {
  upcoming: Treatment[]
  overdue: Treatment[]
}

type BackendTreatment = {
  treatmentId?: number | string
  id?: number | string
  pigId?: number | string
  type?: string
  name?: string
  dosage?: string
  administeredAt?: string
  nextDueDate?: string
  notes?: string
  createdAt?: string
  admin?: { fullName?: string }
  pig?: { pigNumber?: string; pigType?: string; pen?: string }
}

const adaptTreatment = (t: BackendTreatment): Treatment => ({
  id: String(t.treatmentId || t.id || ''),
  pigId: String(t.pigId || ''),
  type: (t.type as Treatment['type']) || 'checkup',
  name: t.name || '',
  dosage: t.dosage || undefined,
  administeredAt: t.administeredAt || '',
  nextDueDate: t.nextDueDate || undefined,
  administeredBy: t.admin?.fullName || undefined,
  pigNumber: t.pig?.pigNumber || undefined,
  pigType: t.pig?.pigType || undefined,
  pen: t.pig?.pen || undefined,
  notes: t.notes || undefined,
  createdAt: t.createdAt || '',
})

export async function getTreatments(opts?: {
  search?: string
  type?: string
  pigId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}): Promise<TreatmentsResponse> {
  const params = new URLSearchParams()
  if (opts?.search) params.append('search', opts.search)
  if (opts?.type) params.append('type', opts.type)
  if (opts?.pigId) params.append('pigId', opts.pigId)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)
  if (opts?.page) params.append('page', opts.page.toString())
  if (opts?.limit) params.append('limit', opts.limit.toString())

  const response = await client.get(`/treatments?${params.toString()}`)
  return {
    treatments: (response.data?.data?.treatments || []).map(adaptTreatment),
    pagination: response.data?.data?.pagination
  }
}

export async function getUpcomingTreatments(days: number = 7): Promise<UpcomingTreatments> {
  const response = await client.get(`/treatments/upcoming?days=${days}`)
  return {
    upcoming: (response.data?.upcoming || []).map(adaptTreatment),
    overdue: (response.data?.overdue || []).map(adaptTreatment),
  }
}

export async function getPigTreatments(pigId: string, limit: number = 50): Promise<Treatment[]> {
  const response = await client.get(`/treatments/pig/${pigId}?limit=${limit}`)
  return (response.data || []).map(adaptTreatment)
}

export async function createTreatment(data: {
  pigId: number
  type: string
  name: string
  dosage?: string
  administeredAt: string
  nextDueDate?: string
  notes?: string
}): Promise<Treatment> {
  const response = await client.post('/treatments', data)
  return adaptTreatment(response.data)
}

export async function updateTreatment(id: string, data: Partial<{
  type: string
  name: string
  dosage: string
  administeredAt: string
  nextDueDate: string
  notes: string
}>): Promise<Treatment> {
  const response = await client.put(`/treatments/${id}`, data)
  return adaptTreatment(response.data)
}

export async function deleteTreatment(id: string): Promise<void> {
  await client.delete(`/treatments/${id}`)
}

export async function exportTreatmentsToCSV(opts?: {
  search?: string
  type?: string
  pigId?: string
  startDate?: string
  endDate?: string
}): Promise<Blob> {
  const params = new URLSearchParams()
  if (opts?.search) params.append('search', opts.search)
  if (opts?.type) params.append('type', opts.type)
  if (opts?.pigId) params.append('pigId', opts.pigId)
  if (opts?.startDate) params.append('startDate', opts.startDate)
  if (opts?.endDate) params.append('endDate', opts.endDate)
  const response = await client.get(`/treatments/export?${params.toString()}`, { responseType: 'blob' })
  return response.data
}
