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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password }).unwrap();
      console.log("Login response:", response);

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
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err?.data?.message || "Login failed");
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
            className="text-base text-primary font-semibold transition-colors"
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
