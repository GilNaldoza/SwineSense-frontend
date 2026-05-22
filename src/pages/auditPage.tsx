import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Download, Shield } from "lucide-react"
import client from "@/api/client"

type AuditLog = {
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
    fullName?: string
  }
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [actionType, setActionType] = useState("")
  const [targetTable, setTargetTable] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Record<string, string | number> = { page, limit }
      if (actionType) params.actionType = actionType
      if (targetTable) params.targetTable = targetTable
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const { data } = await client.get("/audit", { params })
      setLogs(data?.data?.audits || data?.audits || [])
      if (data?.data?.pagination) {
        setTotalPages(data.data.pagination.totalPages)
        setTotalCount(data.data.pagination.total)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to fetch audit logs.")
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  const handleExport = async () => {
    try {
      const params: Record<string, string> = {}
      if (actionType) params.actionType = actionType
      if (targetTable) params.targetTable = targetTable
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const { data } = await client.get("/audit/export", {
        params,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-100 text-green-700",
      update: "bg-amber-100 text-amber-700",
      delete: "bg-red-100 text-red-700",
      login: "bg-blue-100 text-blue-700",
      export: "bg-purple-100 text-purple-700",
    }
    return colors[action] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-pink-600" />
            Audit Log
          </h2>
          <p className="text-gray-500 mt-1">
            Track all administrative actions across the system
          </p>
        </div>
        <Button
          className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={handleFilter}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <Select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="export">Export</option>
            </Select>
            <Select
              value={targetTable}
              onChange={(e) => setTargetTable(e.target.value)}
            >
              <option value="">All Targets</option>
              <option value="pigs">Pigs</option>
              <option value="pig_scans">Pig Scans</option>
              <option value="users">Users</option>
              <option value="admins">Admins</option>
              <option value="weight_logs">Weight Logs</option>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" className="flex-1">
                Filter
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setActionType("")
                  setTargetTable("")
                  setStartDate("")
                  setEndDate("")
                  setPage(1)
                  setTimeout(fetchLogs, 0)
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {totalCount > 0 ? `${totalCount} audit entries` : "Audit Entries"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    Time
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    Admin
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    Action
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    Target
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    ID
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500"
                    >
                      Loading audit logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500"
                    >
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.auditId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {log.admin?.fullName || log.admin?.username || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getActionBadge(log.actionType)}`}
                        >
                          {log.actionType.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 capitalize">
                        {log.targetTable?.replace(/_/g, " ") || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                        {log.targetId || "-"}
                      </td>
                      <td
                        className="py-3 px-4 text-gray-600 max-w-[250px] truncate"
                        title={log.description || ""}
                      >
                        {log.description || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} ({totalCount} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
