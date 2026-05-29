import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Syringe, Download, Plus, AlertTriangle, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import {
  getTreatments,
  getUpcomingTreatments,
  createTreatment,
  deleteTreatment,
  exportTreatmentsToCSV,
  type Treatment,
  type UpcomingTreatments,
} from "@/api/treatments"
import { getPigs, type PigRecord } from "@/api/pigs"

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingTreatments>({ upcoming: [], overdue: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "upcoming">("all")
  const [exporting, setExporting] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 15

  // Form
  const [pigs, setPigs] = useState<PigRecord[]>([])
  const [formData, setFormData] = useState({
    pigId: "",
    type: "vaccination",
    name: "",
    dosage: "",
    administeredAt: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [treatmentRes, upcomingRes] = await Promise.all([
        getTreatments({ search: search || undefined, type: typeFilter || undefined, page, limit }),
        getUpcomingTreatments(14),
      ])
      setTreatments(treatmentRes.treatments)
      if (treatmentRes.pagination) setTotalPages(treatmentRes.pagination.totalPages)
      setUpcoming(upcomingRes)
    } catch (err) {
      console.error(err)
      setError("Failed to load treatments")
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, page, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.pigId || !formData.name) return
    try {
      setSaving(true)
      await createTreatment({
        pigId: Number(formData.pigId),
        type: formData.type,
        name: formData.name,
        dosage: formData.dosage || undefined,
        administeredAt: formData.administeredAt,
        nextDueDate: formData.nextDueDate || undefined,
        notes: formData.notes || undefined,
      })
      setShowForm(false)
      setFormData({ pigId: "", type: "vaccination", name: "", dosage: "", administeredAt: new Date().toISOString().split("T")[0], nextDueDate: "", notes: "" })
      fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this treatment record?")) return
    try {
      await deleteTreatment(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await exportTreatmentsToCSV({ search: search || undefined, type: typeFilter || undefined })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `treatments_export_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const loadPigsForForm = async () => {
    try {
      const res = await getPigs({ limit: 200 })
      setPigs(res.pigs)
    } catch (err) {
      console.error(err)
    }
    setShowForm(true)
  }

  const typeColors: Record<string, string> = {
    vaccination: "bg-blue-100 text-blue-700",
    deworming: "bg-purple-100 text-purple-700",
    medication: "bg-amber-100 text-amber-700",
    checkup: "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Treatments</h2>
          <p className="text-gray-500 mt-1">Vaccination, medication, and health treatment records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
          <Button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white gap-2" onClick={loadPigsForForm}>
            <Plus className="w-4 h-4" />
            Record Treatment
          </Button>
        </div>
      </div>

      {/* Alert Cards */}
      {(upcoming.overdue.length > 0 || upcoming.upcoming.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcoming.overdue.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">{upcoming.overdue.length} Overdue</p>
                    <p className="text-sm text-red-600">Treatments past their due date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {upcoming.upcoming.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">{upcoming.upcoming.length} Due Soon</p>
                    <p className="text-sm text-amber-600">Treatments due in the next 14 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("all")}>
          All Treatments
        </button>
        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "upcoming" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`} onClick={() => setActiveTab("upcoming")}>
          Upcoming & Overdue
        </button>
      </div>

      {activeTab === "all" ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Treatment Records</CardTitle>
              <div className="flex gap-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input placeholder="Search treatments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
                  <Button type="submit" variant="secondary" size="sm">Search</Button>
                </form>
                <select className="px-3 py-1.5 border rounded-md text-sm" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}>
                  <option value="">All Types</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="deworming">Deworming</option>
                  <option value="medication">Medication</option>
                  <option value="checkup">Checkup</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Pig</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Treatment</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Dosage</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Next Due</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">By</th>
                    <th className="px-4 py-3 font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : treatments.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No treatments found.</td></tr>
                  ) : (
                    treatments.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-pink-600">{t.pigNumber || `Pig #${t.pigId}`}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[t.type] || "bg-gray-100 text-gray-700"}`}>{t.type}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 text-gray-600">{t.dosage || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(t.administeredAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{t.nextDueDate ? (
                          <span className={new Date(t.nextDueDate) < new Date() ? "text-red-600 font-semibold" : "text-gray-600"}>{new Date(t.nextDueDate).toLocaleDateString()}</span>
                        ) : "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{t.administeredBy || "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcoming.overdue.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-red-700">Overdue Treatments</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcoming.overdue.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-semibold text-gray-900">{t.name} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${typeColors[t.type]}`}>{t.type}</span></p>
                        <p className="text-sm text-gray-600">{t.pigNumber || `Pig #${t.pigId}`} • Due: {t.nextDueDate ? new Date(t.nextDueDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {upcoming.upcoming.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-amber-700">Due in Next 14 Days</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcoming.upcoming.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div>
                        <p className="font-semibold text-gray-900">{t.name} <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${typeColors[t.type]}`}>{t.type}</span></p>
                        <p className="text-sm text-gray-600">{t.pigNumber || `Pig #${t.pigId}`} • Due: {t.nextDueDate ? new Date(t.nextDueDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {upcoming.overdue.length === 0 && upcoming.upcoming.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Syringe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming or overdue treatments</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Treatment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Treatment</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pig *</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.pigId} onChange={(e) => setFormData({ ...formData, pigId: e.target.value })} required>
                  <option value="">Select a pig...</option>
                  {pigs.map((p) => (
                    <option key={p.id} value={p.id}>{p.pigId} ({p.pigType}, Pen {p.pen})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="vaccination">Vaccination</option>
                    <option value="deworming">Deworming</option>
                    <option value="medication">Medication</option>
                    <option value="checkup">Checkup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Hog Cholera Vaccine" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <Input value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} placeholder="e.g. 2ml" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Administered *</label>
                  <Input type="date" value={formData.administeredAt} onChange={(e) => setFormData({ ...formData, administeredAt: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
                <Input type="date" value={formData.nextDueDate} onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white" disabled={saving}>
                  {saving ? "Saving..." : "Record Treatment"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
