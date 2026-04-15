"use client";

import { useMyProfileQuery } from "@/redux/api/authApi";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import { LuCalendarRange } from "react-icons/lu";
import { MdOutlineNotifications } from "react-icons/md";

const Topbar: React.FC<{ onHamburgerClick: () => void }> = ({
  onHamburgerClick,
}) => {
  const { data: myProfileData } = useMyProfileQuery({});
  const profile = myProfileData?.result;

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
  const isCalendarActive = pathname === "/calendar";
  const isNotificationActive = pathname === "/admin/notification";

  const getPageTitle = () => {
    if (pathname.includes("/estimate")) {
      return "Estimate";
    }
    if (pathname.includes("/dashboard")) {
      return "Overview";
    }
    if (pathname.includes("/employee-management")) {
      return "Employee Management";
    }
    if (pathname.includes("/estimator-management")) {
      return "Estimator Management";
    }
    if (pathname.includes("/invoice")) {
      return "Invoices Management";
    }
    if (pathname.includes("/office-administration")) {
      return "Office Administration";
    }
    if (pathname.includes("/calendar")) {
      return "Calendar";
    }
    if (pathname.includes("/message")) {
      return "Messages";
    }
    if (pathname.includes("/settings")) {
      return "Settings";
    }

    return "";
  };

  return (
    <header className="bg-white shadow-sm  p-6 w-full">
      <div className="flex justify-between items-center flex-wrap">
        <button
          className="lg:hidden text-2xl text-gray-700"
          onClick={onHamburgerClick}
        >
          <AiOutlineMenu />
        </button>

        <div className="flex items-center gap-6">
          <h1 className="text-[#161616] text-[14px] md:text-[24px] font-bold">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center md:gap-5">
          <Link href={"/calendar"}>
            <div
              className={`relative p-2 rounded-full cursor-pointer ${
                isCalendarActive ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              <LuCalendarRange size={20} />
            </div>
          </Link>

          <Link href={"/admin/notification"}>
            <div
              className={`relative p-1 rounded-full  ${
                isNotificationActive ? "bg-primary text-white" : "text-gray-700"
              }`}
            >
              <MdOutlineNotifications size={25} />
            </div>
          </Link>

          {profile?.profileImage ? (
            <Image
              src={profile.profileImage}
              className="w-10 h-10 rounded-full bg-gray-200"
              alt="profile"
              width={40}
              height={40}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
