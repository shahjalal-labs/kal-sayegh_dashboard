"use client";

import {
  useMyProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api/authApi";
import Cookies from "js-cookie";
import { ChevronRightIcon, Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Account from "./Account";

import { useRouter, useSearchParams } from "next/navigation";

function ProfileInfo() {
  const { data } = useMyProfileQuery(undefined);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    profession: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  useEffect(() => {
    if (data?.result) {
      setForm({
        fullName: data?.result?.fullName || "",
        email: data?.result?.email || "",
        profession: data?.result?.profession || "",
      });
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      const body = new FormData();

      const bodyData = {
        fullName: form.fullName,
        profession: form.profession,
      };

      body.append("bodyData", JSON.stringify(bodyData));

      if (file) body.append("profileImage", file);

      await updateProfile(body).unwrap();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="bg-secondary p-6 rounded-2xl shadow-sm">
      <h2 className="text-lg md:text-xl font-semibold pb-6 border-b">
        Profile Information
      </h2>

      <div className="mt-4">
        <h3 className="font-medium text-lg mb-2">Profile Photo</h3>

        <div className="relative w-24 h-24 bg-gray-100 rounded-lg">
          {(preview || data?.result?.profileImage) && (
            <Image
              src={preview || data?.result?.profileImage}
              alt="Profile"
              width={96}
              height={96}
              className="w-24 h-24 rounded-lg object-cover border"
            />
          )}

          <button
            onClick={handleFileClick}
            className="absolute bottom-0 right-0 bg-white p-2 rounded-lg shadow-md"
          >
            <Pencil size={16} />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="" className="font-normal text-base">
            Display Name
          </label>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="" className="font-normal text-base">
            Email
          </label>
          <input
            type="email"
            className="w-full border px-4 py-2 rounded-lg bg-primary text-white placeholder:text-white focus:outline-none"
            value={form.email}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="" className="font-normal text-base">
            Profession
          </label>
          <input
            type="text"
            placeholder="Profession"
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.profession}
            onChange={(e) => handleChange("profession", e.target.value)}
          />
        </div>
        {/* <div className="flex gap-4">
        
          <div className="flex-1">
            <label className="font-normal text-base">Country</label>
            <input
              type="text"
              placeholder="Country"
              className="w-full border px-4 py-2 rounded-lg focus:outline-none"
              value={form.country}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  country: e.target.value,
                }))
              }
            />
          </div>

         
          <div className="flex-1">
            <label className="font-normal text-base">City</label>
            <input
              type="text"
              placeholder="City"
              className="w-full border px-4 py-2 rounded-lg focus:outline-none"
              value={form.city}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
            />
          </div>
        </div> */}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`mt-6 text-white px-16 py-3 rounded-xl bg-primary hover:bg-primary/90 transition-all`}
      >
        {isLoading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const userPlan = "basic";

  useEffect(() => {
    const userRole =
      Cookies.get("role") || localStorage.getItem("role") || "Admin";
    setRole(userRole);
    setIsLoading(false);
  }, []);

  const tabs = [
    ...(userPlan === "basic"
      ? [
          {
            key: "basic",
            label: "Basic",
            component: <ProfileInfo />,
          },
        ]
      : []),

    {
      key: "account",
      label: "Account",
      component: <Account />,
    },
  ];

  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabFromUrl || tabs[0]?.key);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    router.push(`?tab=${tabKey}`);
  };

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="md:w-[348px] h-80 bg-white flex flex-col gap-4 p-6 rounded-2xl shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`w-full px-4 py-3 rounded-lg flex justify-between items-center
            ${activeTab === tab.key ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            <ChevronRightIcon size={20} />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {tabs.find((tab) => tab.key === activeTab)?.component}
      </div>
    </div>
  );
}
