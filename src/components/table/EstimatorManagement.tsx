"use client";

import { useGetAllEstimatorsQuery } from "@/redux/api/admin/estimateApi";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import ReusableTable from "./ReusableTable";

interface Estimator {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

export default function EstimatorManagement() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useGetAllEstimatorsQuery({
    page,
    limit: 20,
    searchTerm,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const columns = [
    { key: "fullName", label: "Estimator Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  const estimators: Estimator[] = data?.result?.data ?? [];

  return (
    <div className=" space-y-7 bg-secondary p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex flex-wrap gap-4">
          <h2 className="text-lg md:text-2xl font-normal ">
            Estimator Management
          </h2>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      <div className="border-t">
        <ReusableTable
          columns={columns}
          data={estimators}
          isLoading={isLoading}
          error={error?.toString?.()}
          page={page}
          totalPages={data?.result?.meta?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
