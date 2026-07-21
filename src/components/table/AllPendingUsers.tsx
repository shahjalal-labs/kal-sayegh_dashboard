"use client";

import {
  useGetPendingUserQuery,
  useUpdateUserMutation,
} from "@/redux/api/admin/adminDashboardApi";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import ReusableTable from "./ReusableTable";

export default function AllPendingUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data: usersData, isLoading } = useGetPendingUserQuery({
    page,
    limit,
    searchTerm,
  });
  const [updateUser] = useUpdateUserMutation();

  const allUsers = usersData?.result?.data || [];
  const totalPages = usersData?.result?.meta?.totalPages || 1;

  const handleToggleStatus = async (row: any) => {
    try {
      // For pending users, we typically want to activate them
      const newStatus = "ACTIVE";
      const result = await Swal.fire({
        title: "Activate User?",
        text: `Do you want to change the status of ${row.fullName} to ACTIVE?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, activate!",
      });

      if (result.isConfirmed) {
        await updateUser({
          userId: row.id,
          data: {
            status: newStatus,
          },
        }).unwrap();
        toast.success(`User ${row.fullName} activated successfully`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  const tableData = allUsers
    .filter((user: any) => user?.status?.toUpperCase() === "PENDING")
    .map((user: any) => ({
      ...user,
      fullName: user.fullName || "Unknown",
    }));

  return (
    <div className="space-y-7 bg-secondary p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex flex-wrap gap-4">
          <h2 className="text-lg md:text-2xl font-normal text-[#1B2559]">
            Pending Users
          </h2>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email..."
            className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <ReusableTable
          columns={columns}
          data={tableData}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
}
