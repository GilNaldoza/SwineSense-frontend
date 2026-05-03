import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Bell, Lock, Users, Database, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const [farmName, setFarmName] = useState('Sunrise Swine Farm')
  const [email, setEmail] = useState('admin@swinesense.com')
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your farm and account settings</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-pink-600" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
            <Input
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="fil">Filipino</option>
                <option value="es">Spanish</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </Select>
            </div>
          </div>
          <div className="pt-4">
            <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-pink-600" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600 mt-1">Receive alerts about pig health and farm events</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-pink-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-pink-600 rounded" />
              <span className="text-sm text-gray-700">Health alerts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-pink-600 rounded" />
              <span className="text-sm text-gray-700">Scan reports</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-pink-600 rounded" />
              <span className="text-sm text-gray-700">Daily summary</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-pink-600 rounded" />
              <span className="text-sm text-gray-700">Weekly reports</span>
            </label>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-pink-600" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
            <Input
              type="password"
              placeholder="Current password"
              className="w-full mb-2"
            />
            <Input
              type="password"
              placeholder="New password"
              className="w-full mb-2"
            />
            <Input
              type="password"
              placeholder="Confirm password"
              className="w-full"
            />
          </div>
          <div className="pt-4">
            <Button className="bg-linear-to-r from-pink-500 to-pink-600 text-white">
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Manage user roles and permissions. Visit the Staff Management page to add or edit team members.
          </p>
          <Button variant="outline" className="w-full">
            Go to Staff Management
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 mb-2">Logout</p>
            <p className="text-sm text-gray-600 mb-4">Sign out from all devices</p>
            <Button className="text-red-600 border border-red-600 hover:bg-red-50 gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
          <div className="pt-4 border-t border-red-200">
            <p className="font-medium text-gray-900 mb-2">Delete Account</p>
            <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all data</p>
            <Button className="text-red-600 border border-red-600 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
