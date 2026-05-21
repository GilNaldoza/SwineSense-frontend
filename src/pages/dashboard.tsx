import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Heart,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getPigDashboardStats, type PigDashboardStats } from "@/api/pigs";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PigDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
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
        err instanceof Error ? err.message : "Failed to load dashboard stats";
      setError(message);
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          label: "Total Pigs",
          value: stats.totalPigs.toLocaleString(),
          icon: Users,
          color: "bg-blue-100",
          iconColor: "text-blue-600",
        },
        {
          label: "Healthy",
          value: stats.healthStatus.healthy.toLocaleString(),
          icon: Heart,
          color: "bg-green-100",
          iconColor: "text-green-600",
        },
        {
          label: "At-Risk",
          value: stats.healthStatus.atRisk.toLocaleString(),
          icon: AlertTriangle,
          color: "bg-amber-100",
          iconColor: "text-amber-600",
        },
        {
          label: "Sick",
          value: stats.healthStatus.sick.toLocaleString(),
          icon: Activity,
          color: "bg-red-100",
          iconColor: "text-red-600",
        },
      ]
    : [];

  const healthScore =
    stats && stats.totalPigs > 0
      ? Math.round((stats.healthStatus.healthy / stats.totalPigs) * 100)
      : 0;

  // Format recent scans from the API into display-ready activity items
  const recentActivity = (stats?.recentScans || [])
    .slice(0, 5)
    .map((scan, idx) => ({
      id: idx,
      action: "Pig scanned",
      pig: (scan as Record<string, unknown>).pig
        ? ((scan as Record<string, unknown>).pig as Record<string, string>)
            .pigNumber || `Pig #${scan.pigId}`
        : `Pig #${scan.pigId}`,
      time: new Date(
        scan.scanTimestamp ||
          ((scan as Record<string, unknown>).timestamp as string),
      ).toLocaleString(),
      status: "healthy" as const,
    }));

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
          <Button onClick={fetchStats} className="mt-4">
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
          className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg"
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
            <Card key={idx} className="hover:shadow-lg transition-shadow">
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
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`${stat.iconColor} w-6 h-6`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">
                  No recent scans recorded yet.
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.pig}</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-600">
                  Health Score
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {healthScore}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${healthScore}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-600">Pig Types</p>
                <p className="text-sm font-bold text-gray-900">
                  {Object.keys(stats?.byType || {}).length}
                </p>
              </div>
              {stats?.byType &&
                Object.entries(stats.byType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-xs text-gray-600 mt-1"
                  >
                    <span className="capitalize">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-600">Total Pens</p>
                <p className="text-sm font-bold text-gray-900">
                  {stats?.penOverview?.length || 0}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
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
