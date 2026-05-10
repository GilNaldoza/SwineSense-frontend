import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import Logo from "@/assets/SwineSense_TextLogo_White.svg";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Scan History", icon: FileText, path: "/records" },
    { label: "Pig Management", icon: Users, path: "/pig-management" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Staff", icon: Users, path: "/staff" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    // TODO: Clear auth tokens and redirect to login
    navigate("/sign-in");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
        w-64 bg-linear-to-b from-pink-400 to-pink-500 h-screen flex flex-col text-white shadow-lg
        fixed md:relative z-50 md:z-auto transform md:transform-none transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-pink-300/30">
          <img src={Logo} alt="SwineSense" className="h-10 w-auto" />
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose} // Close sidebar on mobile after navigation
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-white/20 text-white font-semibold"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-pink-300/30 space-y-2">
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
          >
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
    </>
  );
};

export default Sidebar;
