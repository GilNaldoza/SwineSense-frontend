import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

const Layout = () => {
  const location = useLocation();
  const isAuthPage = ["/", "/sign-in", "/sign-up"].includes(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
