import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PigProfile() {
  const navigate = useNavigate()

  // Sample pig data
  const pig = {
    id: 'PIG-024',
    rfidTag: 'E2000B0E02007619',
    name: 'Rosie',
    type: 'Sow',
    breed: 'Landrace',
    dateOfBirth: '2023-06-15',
    age: '23 months',
    weight: '250 lbs',
    pen: 'Pen A',
    status: 'healthy',
    dam: 'PIG-001',
    sire: 'PIG-002',
    lastScanned: '2025-05-03 14:30',
    lastVaccine: '2025-04-15',
    notes: 'Excellent condition, high productivity',
  }

  const healthMetrics = [
    { label: 'Body Score', value: '8/10', color: 'bg-green-100 text-green-800' },
    { label: 'Feed Intake', value: '3.5 kg/day', color: 'bg-blue-100 text-blue-800' },
    { label: 'Activity Level', value: 'High', color: 'bg-purple-100 text-purple-800' },
    { label: 'Appetite', value: 'Normal', color: 'bg-green-100 text-green-800' },
  ]

  const recentEvents = [
    { date: '2025-05-03', event: 'Health check completed', status: 'normal' },
    { date: '2025-05-02', event: 'Scanned at Pen A', status: 'normal' },
    { date: '2025-04-30', event: 'Feed formula changed', status: 'update' },
    { date: '2025-04-15', event: 'Vaccination completed', status: 'medical' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/records')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{pig.id}</h2>
            <p className="text-gray-500 mt-1">Pig Profile & Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{pig.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RFID Tag</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1 font-mono">{pig.rfidTag}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{pig.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Breed</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{pig.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{pig.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Weight</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{pig.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pen/Location</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{pig.pen}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {pig.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parentage Info */}
          <Card>
            <CardHeader>
              <CardTitle>Parentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Dam (Mother)</p>
                  <button className="text-lg font-semibold text-pink-600 hover:text-pink-700 mt-1">
                    {pig.dam}
                  </button>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sire (Father)</p>
                  <button className="text-lg font-semibold text-pink-600 hover:text-pink-700 mt-1">
                    {pig.sire}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {healthMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${metric.color}`}>
                      {metric.value}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.status === 'normal' ? 'bg-green-500' :
                      item.status === 'update' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.event}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card className="bg-linear-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Last Scanned</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{pig.lastScanned}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Vaccination</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{pig.lastVaccine}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Date of Birth</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{pig.dateOfBirth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{pig.notes}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full bg-linear-to-r from-pink-500 to-pink-600 text-white">
              Update Health
            </Button>
            <Button variant="outline" className="w-full">
              Add Event
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
