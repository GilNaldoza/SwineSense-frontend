import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import {
  getPigDashboardStats,
  exportPigsToCSV,
  type PigDashboardStats,
} from "@/api/pigs";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PigDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getPigDashboardStats();
      setStats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load analytics";
      setError(message);
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportPigsToCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `swinesense_pigs_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const HEALTH_COLORS: Record<string, string> = {
    Healthy: "#10b981",
    "At-Risk": "#f59e0b",
    Sick: "#ef4444",
  };
  const TYPE_COLORS: Record<string, string> = {
    piglet: "#3b82f6",
    gilt: "#f59e0b",
    sow: "#8b5cf6",
    boar: "#ef4444",
  };

  const healthDistributionData = stats
    ? [
        {
          name: "Healthy",
          value: stats.healthStatus.healthy,
          fill: HEALTH_COLORS["Healthy"],
        },
        {
          name: "At-Risk",
          value: stats.healthStatus.atRisk,
          fill: HEALTH_COLORS["At-Risk"],
        },
        {
          name: "Sick",
          value: stats.healthStatus.sick,
          fill: HEALTH_COLORS["Sick"],
        },
      ].filter((d) => d.value > 0)
    : [];

  const typeDistributionData = stats
    ? Object.entries(stats.byType).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        fill: TYPE_COLORS[type] || "#6b7280",
      }))
    : [];

  const scansByDayData = (stats?.scansByDay || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    scans: d.count,
  }));

  const healthScore =
    stats && stats.totalPigs > 0
      ? Math.round((stats.healthStatus.healthy / stats.totalPigs) * 100)
      : 0;

  const metrics = stats
    ? [
        {
          label: "Total Pigs",
          value: stats.totalPigs.toLocaleString(),
          trend: "",
          icon: "🐖",
        },
        {
          label: "Health Score",
          value: `${healthScore}%`,
          trend:
            healthScore >= 90
              ? "Excellent"
              : healthScore >= 70
                ? "Good"
                : "Needs Attention",
          icon: "💚",
        },
        {
          label: "Active Pens",
          value: `${stats.penOverview?.length || 0}`,
          trend: "",
          icon: "🏠",
        },
        {
          label: "Scans (7 days)",
          value: `${(stats.scansByDay || []).reduce((acc, d) => acc + d.count, 0)}`,
          trend: "",
          icon: "📡",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 mt-1">Loading farm metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-lg border border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-800">
            Analytics failed to load
          </h2>
          <p className="mt-2 text-red-700">{error}</p>
          <Button onClick={fetchStats} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 mt-1">Farm performance and key metrics</p>
        </div>
        <Button
          className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2"
          onClick={handleExport}
          disabled={exporting || loading || !stats}
        >
          <Download className="w-4 h-4" />
          {exporting ? "Exporting..." : "Export Report"}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {metric.value}
                  </p>
                  {metric.trend && (
                    <p
                      className={`text-xs font-semibold mt-1 ${metric.trend === "Excellent" ? "text-green-600" : metric.trend === "Good" ? "text-blue-600" : "text-amber-600"}`}
                    >
                      {metric.trend}
                    </p>
                  )}
                </div>
                <div className="text-3xl">{metric.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Activity (Line Chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              Scan Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scansByDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scansByDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: "#ec4899" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No scan data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Health Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {healthDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {healthDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No pig data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 - Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Pig Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {typeDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]}>
                  {typeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No pig data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Health Overview
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>{stats?.healthStatus.healthy || 0} healthy pigs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                <span>{stats?.healthStatus.atRisk || 0} at-risk pigs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                <span>{stats?.healthStatus.sick || 0} sick pigs</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Type Breakdown</h3>
            <ul className="space-y-2 text-sm">
              {stats?.byType &&
                Object.entries(stats.byType).map(([type, count]) => (
                  <li key={type} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="capitalize">
                      {type}: {count}
                    </span>
                  </li>
                ))}
              {(!stats?.byType || Object.keys(stats.byType).length === 0) && (
                <li className="text-gray-400">No data yet</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pen Overview</h3>
            <ul className="space-y-2 text-sm">
              {stats?.penOverview &&
                stats.penOverview.slice(0, 5).map((pen) => (
                  <li
                    key={pen.pen}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                      {pen.pen}
                    </span>
                    <span className="font-semibold">{pen.count} pigs</span>
                  </li>
                ))}
              {(!stats?.penOverview || stats.penOverview.length === 0) && (
                <li className="text-gray-400">No data yet</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
