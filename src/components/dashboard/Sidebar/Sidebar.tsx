"use client";

import calender from "@/assets/dashboard//calendar.png";
import settingIcon from "@/assets/dashboard/account-setting-01.png";
import chat from "@/assets/dashboard/bubble-chat.png";
import estimate from "@/assets/dashboard/estimate.png";
import estimator from "@/assets/dashboard/estimator.png";
import filemanagement from "@/assets/dashboard/file-management.png";
import invoiceIcon from "@/assets/dashboard/invoice.png";
import newOffice from "@/assets/dashboard/new-office.png";
import logo from "@/assets/kal-logo.png";

import { logOut } from "@/redux/ReduxFunction";

import Cookies from "js-cookie";
import { LayoutDashboard, LogOut, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const params = useParams();
  const role = "Administration";
  // const role = "Admin";
  const currentRole = role.toLowerCase();
  // const role = params.role as string;
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role =
      Cookies.get("role") || localStorage.getItem("role") || "Administration";
    setUserRole(role);
  }, []);

  const isActive = (href: string) => {
    if (href.includes("/estimate")) {
      return pathname.includes("/estimate");
    }
    if (href.includes("/employee-management")) {
      return pathname.includes("/employee-management");
    }
    if (href.includes("/estimator-management")) {
      return pathname.includes("/estimator-management");
    }
    if (href.includes("/invoice")) {
      return pathname.includes("/invoice");
    }
    if (href.includes("/office-administration")) {
      return pathname.includes("/office-administration");
    }
    if (href.includes("/calendar")) {
      return pathname.includes("/calendar");
    }
    if (href.includes("/message")) {
      return pathname.includes("/message");
    }
    if (href.includes("/settings")) {
      return pathname.includes("/settings");
    }
    if (href === `/${currentRole}/dashboard`) {
      return pathname === `/${currentRole}/dashboard`;
    }
    return pathname === href;
  };

  const getHref = (path: string) => {
    return `/${currentRole}${path}`;
  };

  let allMenuItems: MenuItem[] = [];

  if (userRole === "Admin") {
    allMenuItems = [
      {
        href: getHref("/dashboard"),
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      {
        href: getHref("/employee-management"),
        icon: filemanagement,
        label: "Employee Management",
        isImage: true,
      },
      {
        href: getHref("/estimator-management"),
        icon: estimator,
        label: "Estimator Management",
        isImage: true,
      },
      {
        href: getHref("/estimate"),
        icon: estimate,
        label: "Estimate",
        isImage: true,
      },
      {
        href: getHref("/invoice"),
        icon: invoiceIcon,
        label: "Invoice",
        isImage: true,
      },
      {
        href: getHref("/office-administration"),
        icon: newOffice,
        label: "Office Administration",
        isImage: true,
      },
      {
        href: getHref("/calendar"),
        icon: calender,
        label: "Calendar",
        isImage: true,
      },
      {
        href: getHref("/message"),
        icon: chat,
        label: "Message",
        isImage: true,
      },
      {
        href: getHref("/settings"),
        icon: settingIcon,
        label: "Settings",
        isImage: true,
      },
    ];
  } else if (userRole === "Administration") {
    allMenuItems = [
      {
        href: getHref("/office-administration"),
        icon: newOffice,
        label: "Office Administration",
        isImage: true,
      },
      {
        href: getHref("/calendar"),
        icon: calender,
        label: "Calendar",
        isImage: true,
      },
      {
        href: getHref("/settings"),
        icon: settingIcon,
        label: "Settings",
        isImage: true,
      },
    ];
  }

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    localStorage.removeItem("role");
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
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {allMenuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors ${
                      active
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
                        className={active ? "filter brightness-0 invert" : ""}
                      />
                    ) : (
                      <item.icon
                        className={`w-5 h-5 ${active ? "text-white" : "text-gray-600"}`}
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
        <div className="p-4 border-t border-gray-200">
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
