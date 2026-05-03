import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search, Edit, Trash2, Mail, Phone, Plus } from 'lucide-react'

export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const staff = [
    { id: 1, name: 'Maria Santos', role: 'Farm Manager', email: 'maria@swinesense.com', phone: '555-0101', status: 'active' },
    { id: 2, name: 'Juan Dela Cruz', role: 'Veterinarian', email: 'juan@swinesense.com', phone: '555-0102', status: 'active' },
    { id: 3, name: 'Rosa Garcia', role: 'Farm Attendant', email: 'rosa@swinesense.com', phone: '555-0103', status: 'active' },
    { id: 4, name: 'Carlos Rodriguez', role: 'Farm Attendant', email: 'carlos@swinesense.com', phone: '555-0104', status: 'inactive' },
    { id: 5, name: 'Ana Lopez', role: 'Data Entry', email: 'ana@swinesense.com', phone: '555-0105', status: 'active' },
  ]

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500 mt-1">Manage farm staff and team members</p>
        </div>
        <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2">
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
              <option value="Farm Manager">Farm Manager</option>
              <option value="Veterinarian">Veterinarian</option>
              <option value="Farm Attendant">Farm Attendant</option>
              <option value="Data Entry">Data Entry</option>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Filter</Button>
              <Button variant="outline" className="flex-1">Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-pink-200 to-pink-300 rounded-full flex items-center justify-center">
                  <span className="font-bold text-pink-700">{member.name.charAt(0)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(member.status)}`}>
                  {member.status}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{member.role}</p>

              <div className="space-y-2 mb-4 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline truncate">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{member.phone}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
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
            <p className="text-gray-600 text-sm font-medium">Active Members</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{staff.filter(s => s.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 text-sm font-medium">Inactive Members</p>
            <p className="text-3xl font-bold text-gray-400 mt-2">{staff.filter(s => s.status === 'inactive').length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
