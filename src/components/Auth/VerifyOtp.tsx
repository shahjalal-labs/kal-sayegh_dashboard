/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useVerifyOTPMutation } from "@/redux/api/authApi";
import AuthLayout from "./AuthLayout";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const [verifyOtp] = useVerifyOTPMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 4 || !email) return;

    setIsLoading(true);
    try {
      const response = await verifyOtp({ email, otp: otpValue }).unwrap();

      if (response?.success) {
        localStorage.setItem("forgetToken", response?.result?.forgetToken);

        toast.success("OTP verified successfully");
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toast.error("Invalid OTP, please try again.");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Check your Email ">
      <form onSubmit={handleSubmit} className="space-y-6 ">
        <div className="flex items-start gap-3 ">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full h-[55px] text-center text-lg font-semibold border border-gray-300 rounded-2xl md:rounded-full focus:outline-none focus:ring-1 focus:ring-[#FC961A] focus:border-[#FC961A]"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-white font-medium py-6 rounded-2xl "
        >
          {isLoading ? "Verifying..." : "Submit"}
        </Button>
      </form>
    </AuthLayout>
  );
}
