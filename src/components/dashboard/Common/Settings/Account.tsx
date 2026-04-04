"use client";

import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";

export default function Account() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (formData.newPassword !== formData.confirmPassword) {
  //     toast.error("Password does not match");
  //     return;
  //   }

  //   if (formData.newPassword.length < 8) {
  //     toast.error(" Password must be at least 8 characters");
  //     return;
  //   }

  //   try {
  //     const res = await changePassword({
  //       oldPassword: formData.oldPassword,
  //       newPassword: formData.newPassword,
  //     }).unwrap();

  //     toast.success(res?.message || " Password changed successfully");

  //     setFormData({
  //       oldPassword: "",
  //       newPassword: "",
  //       confirmPassword: "",
  //     });
  //   } catch (error: any) {
  //     toast.error(error?.data?.message || " Failed to change password");
  //   }
  // };

  return (
    <div className="min-h-screen bg-secondary rounded-2xl">
      <div className=" px-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8  border-b py-5">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 ">
            Password
          </h1>
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
        </div>

        <form className="space-y-6">
          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Old Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Input your old password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showOldPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Input your new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2  transition text-gray-400"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min 8 Characters with a combination of letters and numbers
            </p>
          </div>

          {/* Confirmation New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmation New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmation your new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2   transition text-gray-400"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="bg-primary text-white px-16 py-3 rounded-xl"
            >
              {/* {isLoading ? "Changing..." : "Save "} */} save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
