"use client";

import Sidebar from "@/components/dashboard/Sidebar/Sidebar";
import Topbar from "@/components/dashboard/Topbar/Topbar";
import { useState } from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="">
      <div className="flex h-screen flex-row lg:flex-row">
        {/* Sidebar */}
        <div
          className={`lg:w-72 w-full lg:static fixed top-0 left-0 z-[50] transform bg-white transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <Sidebar onCloseClick={toggleSidebar} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-scroll">
          <Topbar onHamburgerClick={toggleSidebar} />

          {/* Content */}
          <main className="flex-1 p-4  sm:p-6  ">{children}</main>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
