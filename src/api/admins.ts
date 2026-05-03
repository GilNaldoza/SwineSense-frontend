import client from './client'

export type Admin = {
  adminId: number
  username: string
  fullName: string
  email: string
  role: 'super_admin' | 'staff'
  createdAt: string
  lastLogin: string | null
}

export type CreateAdminPayload = {
    username?: string
    password: string
    fullName: string
    email: string
    role?: 'super_admin' | 'staff'
}

export async function getAdmins() {
  const { data } = await client.get<Admin[]>('/admins')
  return data
}

export async function createAdmin(payload: CreateAdminPayload) {
  const { data } = await client.post('/admins', payload)
  return data
}

export async function deleteAdmin(id: number) {
  await client.delete(`/admins/${id}`)
}
