import { User, Bell } from 'lucide-react'

interface HeaderProps {
  userName?: string
}

const Header = ({ userName = 'Juan Dela Cruz' }: HeaderProps) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Welcome, {userName}!</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
        </button>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
          <User size={20} className="text-gray-600" />
          <span className="text-sm text-gray-700">Profile</span>
        </button>
      </div>
    </div>
  )
}

export default Header
