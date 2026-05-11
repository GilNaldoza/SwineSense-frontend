import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search, Trash2, Mail, Phone, Plus, X, Save } from 'lucide-react'
import { getAdmins, createAdmin, deleteAdmin, type Admin, type CreateAdminPayload } from '@/api/admins'

export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [staff, setStaff] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<Admin | null>(null)
  const [newStaff, setNewStaff] = useState<CreateAdminPayload>({
    fullName: '',
    email: '',
    password: '',
    role: 'staff',
  })
  const [addError, setAddError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const data = await getAdmins()
      setStaff(data)
    } catch (err) {
      console.error("Failed to fetch staff:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async () => {
    setAddError(null)
    if (!newStaff.fullName.trim() || !newStaff.email.trim() || !newStaff.password.trim()) {
      setAddError("Please fill in all required fields.")
      return
    }
    try {
      setSaving(true)
      await createAdmin({
        ...newStaff,
        username: newStaff.email.split('@')[0], // Auto-generate username from email
      })
      setShowAddModal(false)
      setNewStaff({ fullName: '', email: '', password: '', role: 'staff' })
      await fetchStaff()
    } catch (err) {
      console.error("Failed to add staff:", err)
      setAddError("Failed to create staff member. Email may already exist.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStaff = async (admin: Admin) => {
    try {
      await deleteAdmin(admin.adminId)
      setShowDeleteModal(null)
      await fetchStaff()
    } catch (err) {
      console.error("Failed to delete staff:", err)
    }
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    return role === 'super_admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500 mt-1">Manage farm staff and team members</p>
        </div>
        <Button
          className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="staff">Staff</option>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSearchTerm(''); setFilterRole('all') }}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-32 bg-gray-100 rounded"></div></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <Card key={member.adminId} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-linear-to-br from-pink-200 to-pink-300 rounded-full flex items-center justify-center">
                    <span className="font-bold text-pink-700">{member.fullName.charAt(0)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(member.role)}`}>
                    {member.role === 'super_admin' ? 'Admin' : 'Staff'}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{member.fullName}</h3>
                <p className="text-sm text-gray-600 mb-4 capitalize">{member.role.replace('_', ' ')}</p>

                <div className="space-y-2 mb-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline truncate">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{member.lastLogin ? `Last login: ${new Date(member.lastLogin).toLocaleDateString()}` : 'Never logged in'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteModal(member)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredStaff.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg">No staff members found</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 text-sm font-medium">Total Staff</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{staff.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 text-sm font-medium">Admins</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{staff.filter(s => s.role === 'super_admin').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 text-sm font-medium">Staff Members</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{staff.filter(s => s.role === 'staff').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <Input value={newStaff.fullName} onChange={e => setNewStaff({ ...newStaff, fullName: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="john@swinesense.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <Input type="password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} placeholder="Enter password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value as 'super_admin' | 'staff' })}>
                  <option value="staff">Staff</option>
                  <option value="super_admin">Super Admin</option>
                </Select>
              </div>
              {addError && <p className="text-red-500 text-sm">{addError}</p>}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-linear-to-r from-pink-500 to-pink-600 text-white gap-2" onClick={handleAddStaff} disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? 'Adding...' : 'Add Staff'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Staff Member</h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to remove <strong>{showDeleteModal.fullName}</strong>?
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 text-white hover:bg-red-700" onClick={() => handleDeleteStaff(showDeleteModal)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
