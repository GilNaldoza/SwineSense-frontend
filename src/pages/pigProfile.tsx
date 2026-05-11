import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Download, Save, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPigById, updatePigRecord, deletePigRecord, type PigRecord } from "@/api/pigs"

export default function PigProfile() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [pig, setPig] = useState<PigRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<PigRecord>>({})
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (id) fetchPig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchPig = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getPigById(id)
      setPig(data)
      setEditData(data)
    } catch (err) {
      console.error(err)
      setError("Pig not found or failed to load.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id || !editData) return
    try {
      setSaving(true)
      const updated = await updatePigRecord(id, {
        pigId: editData.pigId,
        rfidTag: editData.rfidTag,
        pigType: editData.pigType,
        pen: editData.pen,
        healthStatus: editData.healthStatus,
        weight: editData.weight,
        dateOfBirth: editData.dateOfBirth,
        sire: editData.sire,
        dam: editData.dam,
        notes: editData.notes,
      })
      setPig(updated)
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to update pig:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await deletePigRecord(id)
      navigate('/pig-management')
    } catch (err) {
      console.error("Failed to delete pig:", err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Loading...</h2>
            <p className="text-gray-500 mt-1">Fetching pig profile</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-pulse"><CardContent className="p-6"><div className="h-48 bg-gray-100 rounded"></div></CardContent></Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pig Not Found</h2>
            <p className="text-red-500 mt-1">{error || "This pig does not exist."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{pig.pigId}</h2>
            <p className="text-gray-500 mt-1">Pig Profile & Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                className="bg-linear-to-r from-green-500 to-green-600 text-white hover:shadow-lg gap-2"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => { setIsEditing(false); setEditData(pig) }}>
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </>
          )}
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
                  <p className="text-sm text-gray-600">Pig Number</p>
                  {isEditing ? (
                    <input className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.pigId || ''} onChange={e => setEditData({ ...editData, pigId: e.target.value })} />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 mt-1">{pig.pigId}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">RFID Tag</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1 font-mono">{pig.rfidTag}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  {isEditing ? (
                    <select className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.pigType || ''} onChange={e => setEditData({ ...editData, pigType: e.target.value as PigRecord['pigType'] })}>
                      <option value="piglet">Piglet</option>
                      <option value="gilt">Gilt</option>
                      <option value="sow">Sow</option>
                      <option value="boar">Boar</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{pig.pigType}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pen/Location</p>
                  {isEditing ? (
                    <input className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.pen || ''} onChange={e => setEditData({ ...editData, pen: e.target.value })} />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 mt-1">{pig.pen}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  {isEditing ? (
                    <input type="number" step="0.1" className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.weight || ''} onChange={e => setEditData({ ...editData, weight: parseFloat(e.target.value) || undefined })} />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 mt-1">{pig.weight ? `${pig.weight} kg` : 'Not recorded'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {isEditing ? (
                    <select className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.healthStatus || ''} onChange={e => setEditData({ ...editData, healthStatus: e.target.value as PigRecord['healthStatus'] })}>
                      <option value="healthy">Healthy</option>
                      <option value="at-risk">At Risk</option>
                      <option value="sick">Sick</option>
                    </select>
                  ) : (
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      pig.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                      pig.healthStatus === 'at-risk' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pig.healthStatus}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  {isEditing ? (
                    <input type="date" className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.dateOfBirth?.split('T')[0] || ''} onChange={e => setEditData({ ...editData, dateOfBirth: e.target.value })} />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 mt-1">{pig.dateOfBirth ? new Date(pig.dateOfBirth).toLocaleDateString() : 'Unknown'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Scanned</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{pig.lastScanned ? new Date(pig.lastScanned).toLocaleString() : 'Never'}</p>
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
                  {isEditing ? (
                    <input className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.dam || ''} onChange={e => setEditData({ ...editData, dam: e.target.value })} placeholder="e.g. PIG-001" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 mt-1">{pig.dam || 'Unknown'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sire (Father)</p>
                  {isEditing ? (
                    <input className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={editData.sire || ''} onChange={e => setEditData({ ...editData, sire: e.target.value })} placeholder="e.g. PIG-002" />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 mt-1">{pig.sire || 'Unknown'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} placeholder="Add notes..." />
              ) : (
                <p className="text-sm text-gray-700">{pig.notes || 'No notes recorded.'}</p>
              )}
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
                  <p className="text-sm font-semibold text-gray-900 mt-1">{pig.lastScanned ? new Date(pig.lastScanned).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Date of Birth</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{pig.dateOfBirth ? new Date(pig.dateOfBirth).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Registered On</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(pig.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {!isEditing && (
              <>
                <Button
                  className="w-full bg-linear-to-r from-pink-500 to-pink-600 text-white"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Pig Record</h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete <strong>{pig.pigId}</strong>? This action can be undone by an administrator.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
