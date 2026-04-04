/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useForgotPasswordMutation } from "@/redux/api/authApi";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [forgotPassword] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword({ email }).unwrap();

      if (response?.success) {
        toast.success(
          "Email verification code sent successfully, Please check your email.",
        );
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error("Failed to send verification code");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative w-full">
          <label className="absolute -top-[10px] left-4 bg-secondary px-1 text-sm font-medium text-default">
            Email Address
          </label>

          <input
            type="email"
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-400 text-gray-600 placeholder-gray-500 bg-secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="text-sm text-gray-600">
          Remember the password?{" "}
          <Link href="/login" className="text-primary font-bold">
            Log in
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary text-white  rounded-2xl hover:bg-primary/90 transition-colors font-normal"
        >
          {isLoading ? "Sending..." : "Send code"}
        </button>
      </form>
    </AuthLayout>
  );
}
