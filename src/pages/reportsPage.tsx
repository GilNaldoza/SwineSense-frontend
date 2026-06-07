import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Syringe, Printer, ArrowLeft } from "lucide-react"
import { getPigDashboardStats, type PigDashboardStats } from "@/api/pigs"
import { getPigsByPen, type PenStat } from "@/api/analytics"
import { getUpcomingTreatments, type Treatment } from "@/api/treatments"

type ReportType = "farm-summary" | "treatment-schedule" | null

interface FarmSummaryData {
  stats: PigDashboardStats
  pens: PenStat[]
}

interface TreatmentScheduleData {
  overdue: Treatment[]
  upcoming: Treatment[]
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [farmData, setFarmData] = useState<FarmSummaryData | null>(null)
  const [treatmentData, setTreatmentData] = useState<TreatmentScheduleData | null>(null)

  const generateFarmSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [stats, penData] = await Promise.all([
        getPigDashboardStats(),
        getPigsByPen(),
      ])
      setFarmData({ stats, pens: penData.pens })
      setActiveReport("farm-summary")
    } catch {
      setError("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }, [])

  const generateTreatmentSchedule = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUpcomingTreatments(30)
      setTreatmentData({ overdue: data.overdue, upcoming: data.upcoming })
      setActiveReport("treatment-schedule")
    } catch {
      setError("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePrint = () => window.print()

  const reportDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  if (activeReport === "farm-summary" && farmData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <Button variant="ghost" onClick={() => setActiveReport(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
          </Button>
          <Button onClick={handlePrint} className="bg-pink-500 hover:bg-pink-600 text-white">
            <Printer className="w-4 h-4 mr-2" /> Print Report
          </Button>
        </div>

        <div className="print-area space-y-6 max-w-4xl mx-auto">
          <div className="text-center border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900">SwineSense Farm Summary</h1>
            <p className="text-gray-500 mt-1">{reportDate}</p>
          </div>

          {/* Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Pigs</p>
                <p className="text-3xl font-bold text-gray-900">{farmData.stats.totalPigs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Healthy</p>
                <p className="text-3xl font-bold text-green-600">{farmData.stats.healthStatus.healthy}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">At-Risk</p>
                <p className="text-3xl font-bold text-amber-600">{farmData.stats.healthStatus.atRisk}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Sick</p>
                <p className="text-3xl font-bold text-red-600">{farmData.stats.healthStatus.sick}</p>
              </CardContent>
            </Card>
          </div>

          {/* Type Breakdown */}
          <Card>
            <CardHeader><CardTitle>Pig Type Distribution</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">Type</th>
                    <th className="text-right py-2 font-medium text-gray-500">Count</th>
                    <th className="text-right py-2 font-medium text-gray-500">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {farmData.stats.byType && Object.entries(farmData.stats.byType).map(([type, count]) => (
                    <tr key={type} className="border-b last:border-0">
                      <td className="py-2 capitalize font-medium">{type}</td>
                      <td className="py-2 text-right">{count}</td>
                      <td className="py-2 text-right text-gray-500">
                        {farmData.stats.totalPigs > 0
                          ? ((count / farmData.stats.totalPigs) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Pen Distribution */}
          <Card>
            <CardHeader><CardTitle>Pen Distribution</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">Pen</th>
                    <th className="text-right py-2 font-medium text-gray-500">Total</th>
                    <th className="text-right py-2 font-medium text-gray-500">Healthy</th>
                    <th className="text-right py-2 font-medium text-gray-500">At-Risk</th>
                    <th className="text-right py-2 font-medium text-gray-500">Sick</th>
                  </tr>
                </thead>
                <tbody>
                  {farmData.pens.map(pen => (
                    <tr key={pen.pen} className="border-b last:border-0">
                      <td className="py-2 font-medium">{pen.pen}</td>
                      <td className="py-2 text-right">{pen.count}</td>
                      <td className="py-2 text-right text-green-600">{pen.healthy}</td>
                      <td className="py-2 text-right text-amber-600">{pen.atRisk}</td>
                      <td className="py-2 text-right text-red-600">{pen.sick}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <p className="text-xs text-gray-400 text-center pt-4 border-t">
            Generated by SwineSense • {reportDate}
          </p>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    )
  }

  if (activeReport === "treatment-schedule" && treatmentData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <Button variant="ghost" onClick={() => setActiveReport(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
          </Button>
          <Button onClick={handlePrint} className="bg-pink-500 hover:bg-pink-600 text-white">
            <Printer className="w-4 h-4 mr-2" /> Print Report
          </Button>
        </div>

        <div className="print-area space-y-6 max-w-4xl mx-auto">
          <div className="text-center border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900">Treatment Schedule Report</h1>
            <p className="text-gray-500 mt-1">{reportDate}</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{treatmentData.overdue.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Upcoming (30 days)</p>
                <p className="text-3xl font-bold text-amber-600">{treatmentData.upcoming.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Overdue */}
          {treatmentData.overdue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">⚠ Overdue Treatments</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-500">Pig</th>
                      <th className="text-left py-2 font-medium text-gray-500">Treatment</th>
                      <th className="text-left py-2 font-medium text-gray-500">Type</th>
                      <th className="text-right py-2 font-medium text-gray-500">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentData.overdue.map(t => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">Pig #{t.pigId}</td>
                        <td className="py-2">{t.name}</td>
                        <td className="py-2 capitalize">{t.type}</td>
                        <td className="py-2 text-right text-red-600">
                          {t.nextDueDate ? new Date(t.nextDueDate).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Upcoming */}
          {treatmentData.upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📅 Upcoming Treatments</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-500">Pig</th>
                      <th className="text-left py-2 font-medium text-gray-500">Treatment</th>
                      <th className="text-left py-2 font-medium text-gray-500">Type</th>
                      <th className="text-right py-2 font-medium text-gray-500">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentData.upcoming.map(t => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">Pig #{t.pigId}</td>
                        <td className="py-2">{t.name}</td>
                        <td className="py-2 capitalize">{t.type}</td>
                        <td className="py-2 text-right">
                          {t.nextDueDate ? new Date(t.nextDueDate).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {treatmentData.overdue.length === 0 && treatmentData.upcoming.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No overdue or upcoming treatments found.
            </div>
          )}

          <p className="text-xs text-gray-400 text-center pt-4 border-t">
            Generated by SwineSense • {reportDate}
          </p>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    )
  }

  // Report selection view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-500 mt-1">Generate printable reports for your farm records</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Farm Summary</CardTitle>
                <p className="text-sm text-gray-500">Complete farm overview</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Total pig counts, health status breakdown, type distribution, and per-pen analysis. Perfect for daily farm checks and record-keeping.
            </p>
            <Button
              onClick={generateFarmSummary}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg"
            >
              {loading && activeReport === null ? "Generating..." : "Generate & Print"}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Syringe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Treatment Schedule</CardTitle>
                <p className="text-sm text-gray-500">Overdue & upcoming treatments</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Lists all overdue and upcoming treatments for the next 30 days. Essential for vet visits and ensuring vaccination compliance.
            </p>
            <Button
              onClick={generateTreatmentSchedule}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg"
            >
              {loading && activeReport === null ? "Generating..." : "Generate & Print"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
