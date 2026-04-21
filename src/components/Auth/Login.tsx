"use client";

import type React from "react";

import { Eye, EyeOff } from "lucide-react";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLoginMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/ReduxFunction";
import Cookies from "js-cookie";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [login] = useLoginMutation();
  const dispatch = useDispatch();

  const getLoginErrorMessage = (err: unknown) => {
    const fallbackMessage =
      "Login failed. Please check your email and password.";

    if (!err || typeof err !== "object") {
      return fallbackMessage;
    }

    const apiError = err as {
      status?: number;
      data?: {
        message?: string;
        error?: string;
        errors?: Array<{ message?: string } | string>;
      };
      message?: string;
    };

    const errors = apiError.data?.errors;
    const arrayMessage =
      Array.isArray(errors) && errors.length > 0
        ? typeof errors[0] === "string"
          ? errors[0]
          : errors[0]?.message
        : undefined;

    const rawMessage =
      apiError.data?.message ||
      apiError.data?.error ||
      arrayMessage ||
      apiError.message ||
      "";

    const normalizedMessage = rawMessage.toLowerCase();
    const isCredentialError =
      apiError.status === 401 ||
      normalizedMessage.includes("password") ||
      normalizedMessage.includes("credential") ||
      normalizedMessage.includes("unauthorized") ||
      normalizedMessage.includes("invalid");

    if (isCredentialError) {
      return "Incorrect email or password.";
    }

    return rawMessage || fallbackMessage;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password }).unwrap();

      if (response.success && response.result) {
        const user = response.result;
        toast.success("Login successful");

        Cookies.set("token", user.accessToken);

        router.push("/admin/dashboard");

        dispatch(
          setUser({
            role: user.role,
            token: user.accessToken,
            email: email,
            me: user,
          }),
        );
      } else {
        toast.error("Login failed");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      toast.error(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Let's login into your account first ">
      <form onSubmit={handleLogin} className="space-y-6 ">
        <div className="relative w-full">
          <label className="absolute -top-2 left-5 bg-secondary px-2 text-sm text-gray-600">
            Email Address
          </label>

          <input
            type="email"
            placeholder="example@gmail.com"
            className="w-full h-12 px-5 rounded-full border border-gray-300 bg-secondary
    text-gray-700 placeholder-gray-400 
    focus:outline-none focus:ring-1 focus:ring-orange-400  transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative w-full">
          <label className="absolute -top-2 left-5 bg-secondary px-2 text-sm text-gray-600">
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 px-5 pr-12 rounded-full bg-secondary border border-gray-300 
    text-gray-700 placeholder-gray-400 
    focus:outline-none focus:ring-1 focus:ring-orange-400  transition"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-base text-primary font-semibold transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-colors font-normal"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
