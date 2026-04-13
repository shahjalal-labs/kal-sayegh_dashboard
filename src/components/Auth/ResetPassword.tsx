"use client";

import type React from "react";

import { useResetPasswordMutation } from "@/redux/api/authApi";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const forgetToken = localStorage.getItem("forgetToken");

    console.log("forget", forgetToken);
    if (!forgetToken) {
      toast.error("Session expired. Please try again.");
      router.push("/forgot-password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({
        newPassword,
        forgetToken,
      }).unwrap();

      if (response.success) {
        toast.success("Password reset successfully");
        localStorage.removeItem("forgetToken");

        router.push("/login");
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Input the new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative w-full mb-6">
          <label
            htmlFor="newPassword"
            className="absolute -top-[10px] left-4 bg-white px-1 text-sm font-medium text-gray-700"
          >
            New password
          </label>

          {/* Input field */}
          <input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-full bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {/* Toggle eye button */}
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative w-full">
          <label
            htmlFor="confirmPassword"
            className="absolute -top-[10px] left-4 bg-white px-1 text-sm font-medium text-gray-700"
          >
            Confirm new password
          </label>

          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-full bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {/* Toggle eye button */}
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary text-white  rounded-2xl hover:bg-none font-semibold"
        >
          {isLoading ? "Updating..." : "Submit"}
        </button>
      </form>
    </AuthLayout>
  );
}
