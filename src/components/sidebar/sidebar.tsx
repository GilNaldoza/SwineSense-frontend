import { useLayout } from "@/components/layout/useLayout"
import type { SectionKey } from "@/components/layout/LayoutContext"

import logo from "@/assets/logo.svg"
import logo2 from "@/assets/logo2.svg"
import intersect from "@/assets/Intersect.svg"

import React from "react"
import { LayoutDashboard, Users, Building2, LogOut, LineChart, Trash2, Shield, PiggyBank } from "lucide-react"
import type { JSX } from "react"
import { useNavigate } from "react-router-dom"

type ItemType = { key?: SectionKey; label: string; icon: JSX.Element; restricted?: boolean; nav?: boolean; path?: string }

const items: ItemType[] = [
  { key: "All", label: "All", icon: <LayoutDashboard size={18} /> },
  { key: "Students", label: "Students", icon: <Users size={18} /> },
  { key: "Faculties", label: "Faculties", icon: <Building2 size={18} /> },
  { key: "Analytics", label: "Analytics", icon: <LineChart size={18} /> },
  { key: "Archive", label: "Archive", icon: <Trash2 size={18} />, restricted: true },
  { key: "Staff", label: "Staff", icon: <Shield size={18} />, restricted: true },
  { label: "🐷 Pig Management", icon: <PiggyBank size={18} />, nav: true, path: "/pig-management" },
]

export default function Sidebar() {
  const { section, setSection } = useLayout()
  const navigate = useNavigate()

  // Get current user role from localStorage
  const userRole = React.useMemo(() => {
    try {
        const stored = localStorage.getItem('profile')
        if (!stored) return 'staff'
        return JSON.parse(stored).role || 'staff'
    } catch { return 'staff' }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/sign-in")
  }

  return (
    <aside
      className="
        relative
        w-16 lg:w-64
        h-screen
        border-r
        bg-white
        px-2 lg:px-6
        py-6 lg:py-16
        flex
        flex-col
      "
    >
      {/* Logo */}
      <div className="mb-8 lg:mb-16 flex items-center justify-center">
        {/* Compact logo on small/medium */}
        <img
          src={logo2}
          alt="LENS Logo"
          className="block lg:hidden w-8 h-8 select-none"
        />
        {/* Full logo on large+ */}
        <img
          src={logo}
          alt="LENS Logo"
          className="hidden lg:block w-40 select-none"
        />
      </div>

      {/* Buttons */}
      <nav className="flex flex-col gap-2 flex-1">
        {items.map((item) => {
          if (item.restricted && userRole !== 'super_admin') return null

          const isActive = item.key ? section === item.key : false
          const isArchive = item.key === "Archive"
          const isRestricted = item.key === "Staff" || item.key === "Archive"

          return (
            <button
              key={item.label}
              onClick={() => item.nav ? navigate(item.path!) : setSection(item.key!)}
              className={`
                flex items-center lg:justify-start justify-center gap-0 lg:gap-3 px-2 lg:px-4 py-2 rounded-lg text-sm
                transition
                ${isRestricted 
                    ? isActive 
                        ? (isArchive ? "bg-red-50 text-red-600 font-semibold" : "bg-purple-50 text-purple-600 font-semibold")
                        : (isArchive ? "text-red-600 hover:bg-red-50" : "text-purple-600 hover:bg-purple-50")
                    : isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700"}
                ${item.nav ? "hover:bg-green-50 text-green-600" : ""}
              `}
            >
              <span className={`${isRestricted ? (isArchive ? "text-red-600" : "text-purple-600") : isActive ? "text-blue-600" : "text-gray-500"} ${item.nav ? "text-green-600" : ""}`}>
                {item.icon}
              </span>
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="
          flex items-center lg:justify-start justify-center gap-0 lg:gap-3 px-2 lg:px-4 py-2 rounded-lg text-sm
          transition
          text-red-600 hover:bg-red-50 mt-auto
        "
      >
        <span className="text-red-600">
          <LogOut size={18} />
        </span>
        <span className="hidden lg:inline">Logout</span>
      </button>

      {/* Background decoration */}
      <img
        src={intersect}
        alt="background decoration"
        className="absolute bottom-0 left-0 w-full opacity-40 pointer-events-none select-none hidden lg:block"
      />
    </aside>
  )
}
