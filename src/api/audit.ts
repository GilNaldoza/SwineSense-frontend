import client from './client'

export type AuditLog = {
  auditId: number
  adminId: number
  actionType: string
  targetTable: string
  targetId: string | null
  description: string | null
  ipAddress: string | null
  createdAt: string
  admin?: {
      username: string
      role: string
  }
}

export async function getAudits(params?: { 
    page?: number; 
    limit?: number; 
    adminId?: number; 
    startDate?: string;
    endDate?: string;
}) {
  const { data } = await client.get('/audit', { params })
  return data
}
