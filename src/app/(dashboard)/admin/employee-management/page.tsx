"use client";

import AdministorManagement from "@/components/table/AdministorManagement";
import EmployeeManagement from "@/components/table/EmployeeManagement";
import { Search } from "lucide-react";
import { useState } from "react";

export default function EmployeeManagementPage() {
  const [activeTab, setActiveTab] = useState<"employee" | "admin">("employee");
  const [search, setSearch] = useState("");

  return (
    <div className="bg-secondary p-6 rounded-2xl">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("employee")}
            className={`px-6 md:px-20 py-1 md:py-4 rounded-lg transition-all ${
              activeTab === "employee"
                ? "bg-primary text-secondary"
                : "border border-primary text-primary"
            }`}
          >
            Employee
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 xl:px-10 py-1 xl:py-4 rounded-lg transition-all md:mr-8 ${
              activeTab === "admin"
                ? "bg-primary text-secondary"
                : "border border-primary text-primary"
            }`}
          >
            Office Administration
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-6">
        {activeTab === "employee" ? (
          <EmployeeManagement searchTerm={search} />
        ) : (
          <AdministorManagement searchTerm={search} />
        )}
      </div>
    </div>
  );
}
