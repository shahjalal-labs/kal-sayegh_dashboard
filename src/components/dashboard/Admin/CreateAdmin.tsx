"use client";

import { useCreateAdminMutation } from "@/redux/api/admin/adminDashboardApi";
import {
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateAdmin() {
  const [createOfficeAdmin, { isLoading }] = useCreateAdminMutation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    profession: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password || !form.profession) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await createOfficeAdmin(form).unwrap();
      toast.success("Office Admin created successfully!");
      setForm({
        fullName: "",
        email: "",
        password: "",
        profession: "",
      });
      // Optionally redirect
      // router.push("/admin/office-administration");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create Office Admin.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 rounded-2xl">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Create Admin
          </h1>
          <p className="text-gray-500">
            Add a new office administrator to manage dashboard activities.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border  focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50/50 hover:bg-gray-50"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50/50 hover:bg-gray-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Enter a secure password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50/50 hover:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Profession */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Profession <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.profession}
                    onChange={(e) =>
                      setForm({ ...form, profession: e.target.value })
                    }
                    placeholder="Office Administrator"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-gray-50/50 hover:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-primary/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Admin"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
