"use client";

import profile from "@/assets/navbar/profile.png";
import {
  useDeleteUserMutation,
  useGetEmployeesQuery,
  useGetSingleUserQuery,
  useUpdateUserMutation,
} from "@/redux/api/admin/adminDashboardApi";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { CustomModal } from "../modal/CustomModal";
import { EmployeeSchedule } from "./EmployeeSchedule";
import ReusableTable from "./ReusableTable";

interface EmployeeManagementProps {
  searchTerm?: string;
}

export default function EmployeeManagement({
  searchTerm = "",
}: EmployeeManagementProps) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit" | "add" | null>(
    null,
  );
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    profession: "",
    hiringDate: "",
    regularHours: 0,
    pwHours: 0,
    overTime: 0,
    totalHours: 0,
  });

  const { data: employeesList, isLoading } = useGetEmployeesQuery({
    page,
    limit: normalizedSearchTerm ? 200 : 20,
    searchTerm: normalizedSearchTerm,
  });

  const { data: singleEmployee, isLoading: isSingleLoading } = useGetSingleUserQuery(selectedRow?.id);
  const employee = singleEmployee?.result;

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const employees =
    employeesList?.result?.data?.map((emp: any) => ({
      id: emp.id,
      name: emp.fullName,
      email: emp.email,
      regularHours: Number(emp.regularHours),
      pwHours: Number(emp.pwHours),
      clockIn: emp.clockIn ?? "N/A",
      overtime: emp.overtime,
      status: emp.status?.toLowerCase(),
      fullName: emp.fullName,
      profession: emp.profession || "",
      createdAt: emp.createdAt,
    })) || [];

  const filteredEmployees = normalizedSearchTerm
    ? employees.filter((emp: any) => {
        const searchableText = [emp.name, emp.email, emp.profession, emp.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearchTerm);
      })
    : employees;

  const columns = [
    { key: "name", label: "Employee Name" },
    { key: "email", label: "Email Address" },
    { key: "regularHours", label: "Regular Hours" },
    { key: "pwHours", label: "PW Hours" },
    { key: "clockIn", label: "Clock In" },
    { key: "overtime", label: "Overtime" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  useEffect(() => {
    if (modalType === "edit" && selectedRow) {
      setFormData({
        fullName: selectedRow.fullName || "",
        email: selectedRow.email || "",
        profession: selectedRow.profession || "",
        hiringDate: selectedRow.hiringDate || "",
        regularHours: selectedRow.regularHours || 0,
        pwHours: selectedRow.pwHours || 0,
        overTime: selectedRow.overtimeHours || 0,
        totalHours: selectedRow.totalHours || 0,
      });
    }
  }, [modalType, selectedRow]);

  useEffect(() => {
    setPage(1);
  }, [normalizedSearchTerm]);

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(row.id).unwrap();

        Swal.fire({
          title: "Deleted!",
          text: "User has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.log(err);

        Swal.fire({
          title: "Error!",
          text: "Failed to delete user",
          icon: "error",
        });
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await updateUser({
        userId: selectedRow?.id,
        data: {
          fullName: formData.fullName,

          profession: formData.profession,
        },
      }).unwrap();

      toast.success("User updated successfully");
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleToggleStatus = async (row: any) => {
    try {
      const newStatus = row.status === "active" ? "INACTIVE" : "ACTIVE";
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to change the status to ${newStatus}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, change it!",
      });

      if (result.isConfirmed) {
        await updateUser({
          userId: row.id,
          data: {
            status: newStatus,
          },
        }).unwrap();
        toast.success(`User status updated to ${newStatus}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const totalPages = normalizedSearchTerm
    ? 1
    : employeesList?.result?.meta?.totalPages ||
      Math.ceil((employeesList?.result?.meta?.total || 0) / 20) ||
      1;

  return (
    <div className="border-t">
      <ReusableTable
        columns={columns}
        data={filteredEmployees}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onView={(row) => {
          setSelectedRow(row);
          setModalType("view");
          setModalOpen(true);
        }}
        onEdit={(row) => {
          setSelectedRow({
            id: row.id,
            fullName: row.fullName || row.name,
            email: row.email,
            profession: row.profession || "",
            hiringDate: row.createdAt
              ? new Date(row.createdAt).toISOString().split("T")[0]
              : "",
            regularHours: row.regularHours || 0,
            prevailingWageHours: row.pwHours || 0,
            overtimeHours: row.overtime || 0,
            totalHours:
              (row.regularHours || 0) +
              (row.pwHours || 0) +
              (row.overtime || 0),
          });
          setModalType("edit");
          setModalOpen(true);
        }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* VIEW MODAL */}
      <CustomModal
        open={modalOpen && modalType === "view"}
        onClose={() => setModalOpen(false)}
        title="Employee Details"
        maxWidth="3xl"
        actions={[
          {
            label: "Close",
            onClick: () => setModalOpen(false),
            variant: "secondary",
          },
          {
            label: "Edit",
            onClick: () => setModalType("edit"),
            variant: "primary",
          },
        ]}
      >
        {isSingleLoading ? (
          <div className="space-y-6">
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-between border-b p-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>

              <div className="flex justify-between border-b p-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </div>

              <div className="flex justify-between border-b p-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>

              <div className="flex justify-between border-b p-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 p-4 rounded text-center">
                    <div className="h-4 w-3/4 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="h-6 w-1/2 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <EmployeeSchedule data={[]} loading={true} />
          </div>
        ) : employee ? (
          <div className="space-y-6">
            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">User Name</p>
              <div className="flex items-center gap-3">
                <Image src={profile} alt="profile" width={30} height={30} />
                <p>{employee?.user?.fullName}</p>
              </div>
            </div>

            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">Email</p>
              <p>{employee?.user?.email}</p>
            </div>

            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">Profession</p>
              <p>{employee?.user?.profession || "N/A"}</p>
            </div>

            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">Hiring Date</p>
              <p>
                {employee?.user?.createdAt
                  ? new Date(employee.user.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "N/A"}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded text-center">
                <p>Regular Hours (This Week)</p>
                <p className="text-xl font-bold">
                  {employee?.weeklyTotals?.regularHours || 0}{" "}
                  <span className="text-xs"> HRS</span>
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded text-center">
                <p>Prevailing Wage Hours</p>
                <p className="text-xl font-bold">
                  {employee?.weeklyTotals?.pwHours || 0}{" "}
                  <span className="text-xs"> HRS</span>
                </p>
              </div>

              <div className="bg-red-100 p-4 rounded text-center">
                <p>Over Time Hours</p>
                <p className="text-xl font-bold">
                  {employee?.weeklyTotals?.overtimeHours || 0}{" "}
                  <span className="text-xs"> HRS</span>
                </p>
              </div>

              <div className="bg-orange-100 p-4 rounded text-center">
                <p>Total Hours (This Week)</p>
                <p className="text-xl font-bold">
                  {employee?.weeklyTotals?.totalHours || 0}
                  <span className="text-xs"> HRS</span>
                </p>
              </div>
            </div>

            <EmployeeSchedule
              data={singleEmployee?.result?.dailyDetails || []}
              loading={isSingleLoading}
            />
          </div>
        ) : (
          <p className="text-center py-10">No Data Found</p>
        )}
      </CustomModal>

      {/* EDIT MODAL */}
      <CustomModal
        open={modalOpen && modalType === "edit"}
        onClose={() => setModalOpen(false)}
        title="Edit Employee List"
        maxWidth="2xl"
        actions={[
          {
            label: "Cancel",
            onClick: () => setModalOpen(false),
            variant: "secondary",
          },
          {
            label: "Save",
            onClick: handleUpdate,
            variant: "primary",
          },
        ]}
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              User Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              readOnly
            />
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Hiring Date
            </label>
            <input
              type="date"
              name="hiringDate"
              value={formData.hiringDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Regular Hours (This Week)
            </label>
            <input
              type="text"
              name="regularHours"
              value={formData.regularHours}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              readOnly
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Prevailing Wage Hours
            </label>
            <input
              type="text"
              name="pwHours"
              value={formData.pwHours}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Over Time Hours
            </label>
            <input
              type="text"
              name="overTime"
              value={formData.overTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              readOnly
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Total Hours (This Week)
            </label>
            <input
              type="text"
              name="totalHours"
              value={formData.totalHours}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              readOnly
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
