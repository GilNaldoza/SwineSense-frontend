import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Heart,
  AlertTriangle,
  TrendingUp,
  Activity,
  Syringe,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getPigDashboardStats, type PigDashboardStats } from "@/api/pigs";
import { getScanTrends, getPigsByType, type ScanTrend, type TypeStat } from "@/api/analytics";
import { getUpcomingTreatments, type UpcomingTreatments } from "@/api/treatments";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Color palette
const HEALTH_COLORS = {
  healthy: "#10B981",
  atRisk: "#F59E0B",
  sick: "#EF4444",
};

const TYPE_COLORS: Record<string, string> = {
  piglet: "#EC4899",
  sow: "#8B5CF6",
  boar: "#3B82F6",
  gilt: "#F97316",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PigDashboardStats | null>(null);
  const [scanTrends, setScanTrends] = useState<ScanTrend[]>([]);
  const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
  const [treatments, setTreatments] = useState<UpcomingTreatments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [dashboardStats, trendsData, typesData, treatmentsData] =
        await Promise.allSettled([
          getPigDashboardStats(),
          getScanTrends({ period: "14d" }),
          getPigsByType(),
          getUpcomingTreatments(7),
        ]);

      if (dashboardStats.status === "fulfilled") {
        setStats(dashboardStats.value);
      }
      if (trendsData.status === "fulfilled") {
        setScanTrends(trendsData.value.trends);
      }
      if (typesData.status === "fulfilled") {
        setTypeStats(typesData.value.types);
      }
      if (treatmentsData.status === "fulfilled") {
        setTreatments(treatmentsData.value);
      }

      // If the main stats failed, throw to show error
      if (dashboardStats.status === "rejected") {
        throw dashboardStats.reason;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard stats";
      setError(message);
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = stats
    ? [
        {
          label: "Total Pigs",
          value: stats.totalPigs.toLocaleString(),
          icon: Users,
          color: "bg-blue-100",
          iconColor: "text-blue-600",
          borderColor: "border-l-blue-500",
        },
        {
          label: "Healthy",
          value: stats.healthStatus.healthy.toLocaleString(),
          icon: Heart,
          color: "bg-green-100",
          iconColor: "text-green-600",
          borderColor: "border-l-green-500",
        },
        {
          label: "At-Risk",
          value: stats.healthStatus.atRisk.toLocaleString(),
          icon: AlertTriangle,
          color: "bg-amber-100",
          iconColor: "text-amber-600",
          borderColor: "border-l-amber-500",
        },
        {
          label: "Sick",
          value: stats.healthStatus.sick.toLocaleString(),
          icon: Activity,
          color: "bg-red-100",
          iconColor: "text-red-600",
          borderColor: "border-l-red-500",
        },
      ]
    : [];

  const healthScore =
    stats && stats.totalPigs > 0
      ? Math.round((stats.healthStatus.healthy / stats.totalPigs) * 100)
      : 0;

  // Health pie chart data
  const healthPieData = stats
    ? [
        { name: "Healthy", value: stats.healthStatus.healthy, color: HEALTH_COLORS.healthy },
        { name: "At-Risk", value: stats.healthStatus.atRisk, color: HEALTH_COLORS.atRisk },
        { name: "Sick", value: stats.healthStatus.sick, color: HEALTH_COLORS.sick },
      ].filter((d) => d.value > 0)
    : [];

  // Scan area chart data
  const scanChartData = scanTrends.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    scans: t.count,
  }));

  // Type bar chart data
  const typeBarData = typeStats.map((t) => ({
    type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
    count: t.count,
    fill: TYPE_COLORS[t.type.toLowerCase()] || "#6B7280",
  }));

  // Format recent scans from the API into display-ready activity items
  const recentActivity = (stats?.recentScans || [])
    .slice(0, 5)
    .map((scan, idx) => ({
      id: idx,
      action: "Pig scanned",
      pig: scan.pigId ? `Pig #${scan.pigId}` : "Unknown",
      time: new Date(scan.scanTimestamp).toLocaleString(),
      rfid: scan.rfidTag,
    }));

  const overdueCount = treatments?.overdue?.length || 0;
  const upcomingCount = treatments?.upcoming?.length || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 mt-1">Loading farm overview...</p>
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-100 rounded"></div>
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
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-red-700">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 rounded-lg border border-dashed border-gray-300 bg-gray-50">
          <p className="text-gray-600">
            No dashboard metrics are available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Overview of your swine farm</p>
        </div>
        <Button
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg"
          onClick={() => navigate("/pig-management")}
        >
          Manage Pigs
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className={`hover:shadow-lg transition-all duration-200 border-l-4 ${stat.borderColor}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className={`${stat.iconColor} w-6 h-6`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution Pie Chart */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-pink-500" />
              Health Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={healthPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {healthPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">
                No health data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Activity Area Chart */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              Scan Activity (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={scanChartData}>
                  <defs>
                    <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#EC4899"
                    strokeWidth={2}
                    fill="url(#scanGradient)"
                    dot={{ fill: "#EC4899", r: 3 }}
                    activeDot={{ r: 5, fill: "#EC4899" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">
                No scan data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pig Types Bar Chart */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-pink-500" />
              Pig Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={typeBarData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {typeBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">
                No pig type data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Treatment Alerts Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Syringe className="w-5 h-5 text-pink-500" />
              Treatment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overdue */}
            <div
              className={`p-4 rounded-xl ${overdueCount > 0 ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 ${overdueCount > 0 ? "text-red-500" : "text-gray-400"}`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Overdue
                  </span>
                </div>
                <span
                  className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-600" : "text-gray-400"}`}
                >
                  {overdueCount}
                </span>
              </div>
            </div>

            {/* Upcoming */}
            <div
              className={`p-4 rounded-xl ${upcomingCount > 0 ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock
                    className={`w-4 h-4 ${upcomingCount > 0 ? "text-amber-500" : "text-gray-400"}`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Upcoming (7 days)
                  </span>
                </div>
                <span
                  className={`text-2xl font-bold ${upcomingCount > 0 ? "text-amber-600" : "text-gray-400"}`}
                >
                  {upcomingCount}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                className="w-full text-pink-600 border border-pink-600 hover:bg-pink-50"
                variant="outline"
                onClick={() => navigate("/treatments")}
              >
                <Syringe className="w-4 h-4 mr-2" />
                View Treatments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-pink-500" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">
                  No recent scans recorded yet.
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.pig}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.rfid ? `RFID: ${activity.rfid}` : activity.action}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Health Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">
                  Health Score
                </p>
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                    healthScore >= 90
                      ? "bg-green-100 text-green-700"
                      : healthScore >= 70
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {healthScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${healthScore}%`,
                    background:
                      healthScore >= 90
                        ? "linear-gradient(90deg, #10B981, #34D399)"
                        : healthScore >= 70
                          ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                          : "linear-gradient(90deg, #EF4444, #F87171)",
                  }}
                ></div>
              </div>
            </div>

            {/* Pig Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Pig Types</p>
                <p className="text-sm font-bold text-gray-900">
                  {Object.keys(stats?.byType || {}).length}
                </p>
              </div>
              {stats?.byType &&
                Object.entries(stats.byType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-xs text-gray-600 mt-1.5"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[type.toLowerCase()] || "#6B7280",
                        }}
                      ></span>
                      <span className="capitalize">{type}</span>
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>

            {/* Total Pens */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-600">Total Pens</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats?.penOverview?.length || 0}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full text-pink-600 border border-pink-600 hover:bg-pink-50"
                variant="outline"
                onClick={() => navigate("/analytics")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
