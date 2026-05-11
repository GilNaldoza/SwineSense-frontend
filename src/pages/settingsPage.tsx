import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Lock, Users, Database, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import client from '@/api/client'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [farmName, setFarmName] = useState('SwineSense Farm')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [notifications, setNotifications] = useState(true)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    // Load the logged-in user's profile from localStorage
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setEmail(user.email || '')
        setFullName(user.fullName || user.username || '')
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('csrfToken')
    navigate('/sign-in')
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.")
      return
    }

    try {
      setChangingPassword(true)
      await client.put('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      console.error("Failed to change password:", err)
      const error = err as { response?: { data?: { message?: string } } }
      setPasswordError(error.response?.data?.message || "Failed to change password.")
    } finally {
      setChangingPassword(false)
    }
  }

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name</label>
            <Input
              value={fullName}
              disabled
              className="w-full bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <Input
              type="email"
              value={email}
              disabled
              className="w-full bg-gray-50"
            />
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
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              className="w-full mb-2"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              className="w-full"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">Password updated successfully!</p>}
          <div className="pt-4">
            <Button
              className="bg-linear-to-r from-pink-500 to-pink-600 text-white"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
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
          <Button variant="outline" className="w-full" onClick={() => navigate('/staff')}>
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
            <p className="text-sm text-gray-600 mb-4">Sign out from this device</p>
            <Button
              className="text-red-600 border border-red-600 hover:bg-red-50 gap-2"
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
