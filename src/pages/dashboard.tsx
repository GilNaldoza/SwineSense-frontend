import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Heart, AlertTriangle, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const stats = [
    { label: 'Total Pigs', value: '1,284', icon: Users, color: 'bg-blue-100', iconColor: 'text-blue-600', change: '+12' },
    { label: 'Healthy', value: '1,242', icon: Heart, color: 'bg-green-100', iconColor: 'text-green-600', change: '+48' },
    { label: 'At-Risk', value: '42', icon: AlertTriangle, color: 'bg-amber-100', iconColor: 'text-amber-600', change: '-5' },
    { label: 'Activity', value: '98%', icon: TrendingUp, color: 'bg-purple-100', iconColor: 'text-purple-600', change: '+2%' },
  ]

  const recentActivity = [
    { id: 1, action: 'Pig scanned', pig: 'PIG-002', time: '2 minutes ago', status: 'healthy' },
    { id: 2, action: 'Health check', pig: 'PIG-015', time: '15 minutes ago', status: 'at-risk' },
    { id: 3, action: 'Record updated', pig: 'PIG-087', time: '1 hour ago', status: 'healthy' },
    { id: 4, action: 'New entry', pig: 'PIG-156', time: '2 hours ago', status: 'healthy' },
    { id: 5, action: 'Alert triggered', pig: 'PIG-034', time: '3 hours ago', status: 'sick' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Overview of your swine farm</p>
        </div>
        <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white hover:shadow-lg">
          New Record
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-green-600 text-xs font-semibold mt-1">{stat.change}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`${stat.iconColor} w-6 h-6`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'healthy' ? 'bg-green-500' :
                      activity.status === 'at-risk' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.pig}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              ))}
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
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-sm font-bold text-gray-900">96%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-600">Feed Efficiency</p>
                <p className="text-sm font-bold text-gray-900">89%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-600">Space Usage</p>
                <p className="text-sm font-bold text-gray-900">73%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full text-pink-600 border border-pink-600 hover:bg-pink-50" variant="outline">
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
