import { useState, useEffect, useRef } from "react";
import { User, Bell, Menu, AlertTriangle, Activity, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPigDashboardStats } from "@/api/pigs";
import { getUpcomingTreatments } from "@/api/treatments";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<{ atRisk: number; sick: number; overdueTreatments: number }>({
    atRisk: 0,
    sick: 0,
    overdueTreatments: 0,
  });
  const alertRef = useRef<HTMLDivElement>(null);

  // Get the logged-in user's name from localStorage
  const userName = (() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.fullName || user.username || "User";
      }
    } catch {
      // Ignore parse errors
    }
    return "User";
  })();

  // Fetch health alerts + treatment alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [stats, treatmentData] = await Promise.all([
          getPigDashboardStats(),
          getUpcomingTreatments(14),
        ]);
        setAlerts({
          atRisk: stats.healthStatus.atRisk,
          sick: stats.healthStatus.sick,
          overdueTreatments: treatmentData.overdue?.length || 0,
        });
      } catch {
        // Silently fail — not critical
      }
    };
    fetchAlerts();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(e.target as Node)) {
        setShowAlerts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalAlerts = alerts.atRisk + alerts.sick + alerts.overdueTreatments;

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Hamburger menu for mobile */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Welcome, {userName}!
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Notification Bell with Health Alerts */}
        <div className="relative" ref={alertRef}>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Bell size={20} className="text-gray-600" />
            {totalAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Alerts dropdown */}
          {showAlerts && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  Health Alerts
                </p>
              </div>
              <div className="p-2">
                {totalAlerts === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    <Activity size={24} className="mx-auto mb-2 text-green-500" />
                    All pigs are healthy! 🎉
                  </div>
                ) : (
                  <>
                    {alerts.sick > 0 && (
                      <button
                        onClick={() => {
                          setShowAlerts(false);
                          navigate("/pig-management");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={16} className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-700">
                            {alerts.sick} sick pig{alerts.sick !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requires immediate attention
                          </p>
                        </div>
                      </button>
                    )}
                    {alerts.atRisk > 0 && (
                      <button
                        onClick={() => {
                          setShowAlerts(false);
                          navigate("/pig-management");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={16} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-700">
                            {alerts.atRisk} at-risk pig
                            {alerts.atRisk !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            Monitor closely
                          </p>
                        </div>
                      </button>
                    )}
                    {alerts.overdueTreatments > 0 && (
                      <button
                        onClick={() => {
                          setShowAlerts(false);
                          navigate("/treatments");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Syringe size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-700">
                            {alerts.overdueTreatments} overdue treatment
                            {alerts.overdueTreatments !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            Schedule follow-up
                          </p>
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile button → Settings */}
        <button
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => navigate("/settings")}
        >
          <User size={20} className="text-gray-600" />
          <span className="text-sm text-gray-700 hidden sm:inline">
            Profile
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
