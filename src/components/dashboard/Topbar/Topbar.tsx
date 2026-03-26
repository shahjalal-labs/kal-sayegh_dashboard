/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import profileAvatar from "@/assets/navbar/profile.png";
import { useMyProfileQuery } from "@/redux/api/authApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import { MdOutlineNotifications } from "react-icons/md";

const Topbar: React.FC<{ onHamburgerClick: () => void }> = ({
  onHamburgerClick,
}) => {
  const { data: myProfileData } = useMyProfileQuery({});
  const profile = myProfileData?.result?.profileimage;

  const token = Cookies.get("token");
  let decodedToken: any = null;

  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (e) {
      decodedToken = null;
    }
  }

  const pathname = usePathname();

  const isNotificationActive = pathname === "/admin/notification";

  // Map current route to a page title
  const getPageTitle = () => {
    switch (pathname) {
      case "/admin/dashboard":
        return "Overview";
      case "/admin/users-management":
        return "User Management";
      case "/admin/employee-management":
        return "Employee Management";
      case "/admin/service-management":
        return "Service Management";
      case "/admin/quote-management":
        return "Quotes Management";
      case "/admin/invoice":
        return "Invoices Management";
      case "/admin/subscription":
        return "Subscription Plan";
      case "/admin/referral":
        return "Referral and Discount";
      case "/admin/gallery":
        return "Gallery Management";
      case "/admin/users":
        return "User Management";
      case "/admin/settings":
        return "Settings";
      default:
        return "Admin Panel";
    }
  };

  return (
    <header className="bg-white shadow-sm py-6 px-6 lg:px-16 w-full">
      <div className="flex justify-between items-center flex-wrap">
        {/* Hamburger Icon for Mobile */}
        <button
          className="lg:hidden text-2xl text-gray-700"
          onClick={onHamburgerClick}
        >
          <AiOutlineMenu />
        </button>

        {/* Dynamic Page Title */}
        <div className="flex items-center gap-6">
          <h1 className="text-[#161616] text-[16px] md:text-[24px] font-bold">
            {getPageTitle()}
          </h1>
        </div>

        {/* Notification & Profile */}
        <div className="flex items-center gap-5">
          <Link href="/admin/notification" className="relative">
            <div
              className={`relative p-1 rounded-full ${
                isNotificationActive ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              <MdOutlineNotifications size={25} />
            </div>
          </Link>
          <Link href={`/admin/settings`}>
            <Image
              src={profile || profileAvatar}
              className="w-10 h-10 rounded-full"
              alt="profile icon"
              width={40}
              height={40}
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
