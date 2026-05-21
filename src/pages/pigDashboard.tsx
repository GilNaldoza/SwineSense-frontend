import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getPigDashboardStats,
  getRecentScans,
  exportPigsToCSV,
  type PigDashboardStats,
  type PigScanLog,
} from "@/api/pigs";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "365d" | "custom";

export default function PigDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // Dashboard data
  const [stats, setStats] = useState<PigDashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<PigScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pigTypeColors: Record<string, string> = {
    piglet: "#3b82f6", // blue
    sow: "#8b5cf6", // purple
    boar: "#ef4444", // red
    gilt: "#f59e0b", // amber
  };

  const healthStatusColors: Record<string, string> = {
    healthy: "#10b981", // green
    "at-risk": "#f59e0b", // amber
    sick: "#ef4444", // red
  };

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const useRange = timeRange === "custom" && customStart && customEnd;

      const statsData = await getPigDashboardStats(
        useRange ? customStart : undefined,
        useRange ? customEnd : undefined,
      );
      const scans = await getRecentScans(10);

      setStats(statsData);
      setRecentScans(scans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [customEnd, customStart, timeRange]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleExport = async () => {
    try {
      const blob = await exportPigsToCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pig-records-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Pig records exported successfully.");
    } catch (err) {
      toast.error("Failed to export records. Please try again.");
      console.error("Export error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="mb-4 inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-red-700 font-medium">
            Dashboard failed to load: {error}
          </p>
          <Button onClick={loadDashboard} className="mt-2 sm:mt-0">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">No data available</div>
    );
  }

  // Prepare data for charts
  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    fill: pigTypeColors[type] || "#6b7280",
  }));

  const healthData = [
    {
      name: "Healthy",
      value: stats.healthStatus.healthy,
      fill: healthStatusColors.healthy,
    },
    {
      name: "At-Risk",
      value: stats.healthStatus.atRisk,
      fill: healthStatusColors["at-risk"],
    },
    {
      name: "Sick",
      value: stats.healthStatus.sick,
      fill: healthStatusColors.sick,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Pig Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="w-full sm:w-auto"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="365d">Last Year</option>
            <option value="custom">Custom Range</option>
          </Select>

          {timeRange === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="End Date"
              />
            </>
          )}

          <Button
            onClick={handleExport}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isLoading || !stats}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Pigs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalPigs}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats.healthStatus.healthy}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalPigs > 0
                ? (
                    (stats.healthStatus.healthy / stats.totalPigs) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              At-Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {stats.healthStatus.atRisk}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalPigs > 0
                ? ((stats.healthStatus.atRisk / stats.totalPigs) * 100).toFixed(
                    1,
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Sick
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {stats.healthStatus.sick}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalPigs > 0
                ? ((stats.healthStatus.sick / stats.totalPigs) * 100).toFixed(1)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pig Count by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Pig Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Count">
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Health Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Health Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {healthData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.scansByDay && stats.scansByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.scansByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={Math.max(
                      0,
                      Math.floor(stats.scansByDay.length / 7),
                    )}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    dot={false}
                    name="Scans"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No scan data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pen Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Pen/Building Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.penOverview && stats.penOverview.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.penOverview.map((pen) => (
                  <div key={pen.pen} className="border-b pb-3 last:border-b-0">
                    <p className="font-semibold text-sm text-gray-900">
                      {pen.pen}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <div>
                        <span className="text-gray-500">Total: </span>
                        <span className="font-semibold">{pen.count}</span>
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-gray-500">Healthy: </span>
                        <span className="font-semibold">
                          {pen.healthStatus.healthy}
                        </span>
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
                        <span className="text-gray-500">At-Risk: </span>
                        <span className="font-semibold">
                          {pen.healthStatus.atRisk}
                        </span>
                      </div>
                      <div>
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                        <span className="text-gray-500">Sick: </span>
                        <span className="font-semibold">
                          {pen.healthStatus.sick}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No pen data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Scanned Pigs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">
                      Pig ID
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      RFID Tag
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Scanned At
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Location
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{scan.pigId}</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        {scan.rfidTag}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(scan.scanTimestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {scan.location || "-"}
                      </td>
                      <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                        {scan.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No recent scans</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
