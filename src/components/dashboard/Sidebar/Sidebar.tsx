"use client";

import settingIcon from "@/assets/dashboard/account-setting-01.png";
import chat from "@/assets/dashboard/bubble-chat.png";
import estimate from "@/assets/dashboard/estimate.png";
import filemanagement from "@/assets/dashboard/file-management.png";
import invoiceIcon from "@/assets/dashboard/invoice.png";
import newOffice from "@/assets/dashboard/new-office.png";
import logo from "@/assets/kal-logo.png";

import { logOut } from "@/redux/ReduxFunction";

import Cookies from "js-cookie";
import { LayoutDashboard, LogOut, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  onCloseClick?: () => void;
}

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  isImage?: boolean;
}

const Sidebar = ({ onCloseClick }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const role = "Admin";
  let allMenuItems: MenuItem[] = [];

  if (role === "Admin") {
    allMenuItems = [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      {
        href: "/admin/employee-management",
        icon: filemanagement,
        label: "Employee Management",
        isImage: true,
      },
      {
        href: "/admin/estimate",
        icon: estimate,
        label: "Estimate",
        isImage: true,
      },
      {
        href: "/admin/invoice",
        icon: invoiceIcon,
        label: "Invoice",
        isImage: true,
      },
      {
        href: "/admin/office-administration",
        icon: newOffice,
        label: "Office Administration",
        isImage: true,
      },
      {
        href: "/admin/message",
        icon: chat,
        label: "Message",
        isImage: true,
      },
      {
        href: "/admin/settings",
        icon: settingIcon,
        label: "Settings",
        isImage: true,
      },
    ];
  }

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
    logOut();
  };

  return (
    <div className="relative">
      <aside className="w-full lg:w-72 h-screen bg-secondary flex flex-col">
        {/* Close button for mobile */}
        <button
          onClick={onCloseClick}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-6 flex justify-center">
          <Image src={logo} alt="logo" width={131} height={101} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {allMenuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors ${
                      isActive
                        ? "bg-primary text-white font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={onCloseClick}
                  >
                    {item.isImage ? (
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={20}
                        height={20}
                        className={isActive ? "filter brightness-0 invert" : ""}
                      />
                    ) : (
                      <item.icon
                        className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`}
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
