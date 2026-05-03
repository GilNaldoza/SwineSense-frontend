import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, FileText, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import Logo from '@/assets/logo.svg'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Records', icon: FileText, path: '/records' },
    { label: 'Pig Management', icon: Users, path: '/pig-management' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Staff', icon: Users, path: '/staff' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    // TODO: Clear auth tokens and redirect to login
    navigate('/sign-in')
  }

  return (
    <div className="w-64 bg-linear-to-b from-pink-400 to-pink-500 h-screen flex flex-col text-white shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-pink-300/30">
        <img src={Logo} alt="SwineSense" className="h-10 w-auto" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-pink-300/30 space-y-2">
        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors text-left"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

