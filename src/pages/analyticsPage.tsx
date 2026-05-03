import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { Download, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const weightTrendData = [
    { month: 'Jan', avg: 180 },
    { month: 'Feb', avg: 195 },
    { month: 'Mar', avg: 210 },
    { month: 'Apr', avg: 225 },
    { month: 'May', avg: 240 },
  ]

  const healthDistributionData = [
    { name: 'Healthy', value: 1242, fill: '#10b981' },
    { name: 'At-Risk', value: 35, fill: '#f59e0b' },
    { name: 'Sick', value: 7, fill: '#ef4444' },
  ]

  const typeDistributionData = [
    { type: 'Sow', count: 450, fill: '#8b5cf6' },
    { type: 'Boar', count: 280, fill: '#ef4444' },
    { type: 'Piglet', count: 350, fill: '#3b82f6' },
    { type: 'Gilt', count: 162, fill: '#f59e0b' },
  ]

  const metrics = [
    { label: 'Avg Weight Gain', value: '2.5 lbs/week', trend: '+12%', icon: '📈' },
    { label: 'Feed Efficiency', value: '3.2 FCR', trend: '+8%', icon: '🌾' },
    { label: 'Mortality Rate', value: '0.5%', trend: '-3%', icon: '📊' },
    { label: 'Vaccination Rate', value: '99.2%', trend: 'Stable', icon: '💉' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500 mt-1">Farm performance and key metrics</p>
        </div>
        <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  <p className={`text-xs font-semibold mt-1 ${metric.trend.includes('+') ? 'text-green-600' : metric.trend.includes('-') ? 'text-red-600' : 'text-gray-600'}`}>
                    {metric.trend}
                  </p>
                </div>
                <div className="text-3xl">{metric.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              Average Weight Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Health Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={healthDistributionData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {healthDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Pig Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Positive Indicators</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>98% vaccination coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>96% health score</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                <span>Consistent growth trend</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Areas to Monitor</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                <span>35 pigs at-risk</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                <span>Feed cost trending up</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                <span>Space optimization needed</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Review at-risk pigs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Optimize feed schedule</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Plan facility expansion</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
