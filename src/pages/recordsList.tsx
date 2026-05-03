import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search, Eye, Edit, Trash2, Download } from 'lucide-react'

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const records = [
    { id: 1, pigId: 'PIG-001', type: 'Sow', pen: 'Pen A', status: 'healthy', weight: '250 lbs', lastScanned: '2025-05-03' },
    { id: 2, pigId: 'PIG-002', type: 'Piglet', pen: 'Pen B', status: 'healthy', weight: '45 lbs', lastScanned: '2025-05-03' },
    { id: 3, pigId: 'PIG-003', type: 'Boar', pen: 'Pen A', status: 'at-risk', weight: '280 lbs', lastScanned: '2025-05-02' },
    { id: 4, pigId: 'PIG-004', type: 'Gilt', pen: 'Pen C', status: 'healthy', weight: '180 lbs', lastScanned: '2025-05-03' },
    { id: 5, pigId: 'PIG-005', type: 'Sow', pen: 'Pen B', status: 'sick', weight: '240 lbs', lastScanned: '2025-05-01' },
    { id: 6, pigId: 'PIG-006', type: 'Piglet', pen: 'Pen A', status: 'healthy', weight: '52 lbs', lastScanned: '2025-05-03' },
    { id: 7, pigId: 'PIG-007', type: 'Boar', pen: 'Pen C', status: 'healthy', weight: '290 lbs', lastScanned: '2025-05-03' },
    { id: 8, pigId: 'PIG-008', type: 'Sow', pen: 'Pen D', status: 'at-risk', weight: '260 lbs', lastScanned: '2025-05-02' },
  ]

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.pigId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      healthy: 'bg-green-100 text-green-800',
      'at-risk': 'bg-amber-100 text-amber-800',
      sick: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || styles.healthy
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Records</h2>
          <p className="text-gray-500 mt-1">Manage all pig records and data</p>
        </div>
        <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by Pig ID or type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="at-risk">At-Risk</option>
              <option value="sick">Sick</option>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Filter</Button>
              <Button variant="outline" className="flex-1">Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Pig ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Pen</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Weight</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Last Scanned</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{record.pigId}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{record.type}</td>
                    <td className="py-3 px-4 text-gray-700">{record.pen}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{record.weight}</td>
                    <td className="py-3 px-4 text-gray-700">{record.lastScanned}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-amber-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No records found</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Showing {filteredRecords.length} of {records.length} records</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
