"use client";

import profile from "@/assets/navbar/profile.png";
import {
  useDeleteUserMutation,
  useGetSingleUserQuery,
  useUpdateUserMutation,
} from "@/redux/api/admin/adminDashboardApi";
import { useGetAllEstimatorsQuery } from "@/redux/api/admin/estimateApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { CustomModal } from "../modal/CustomModal";
import { EmployeeSchedule } from "./EmployeeSchedule";
import ReusableTable from "./ReusableTable";

interface Estimator {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

interface EstimatorFormData {
  fullName: string;
  email: string;
  profession: string;
  hiringDate: string;
  regularHours: number;
  pwHours: number;
  overTime: number;
  totalHours: number;
}

export default function EstimatorManagement() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit" | null>(null);
  const [selectedRow, setSelectedRow] = useState<Estimator | null>(null);
  const [formData, setFormData] = useState<EstimatorFormData>({
    fullName: "",
    email: "",
    profession: "",
    hiringDate: "",
    regularHours: 0,
    pwHours: 0,
    overTime: 0,
    totalHours: 0,
  });

  const normalizedSearchTerm = searchTerm.trim();

  const { data, isLoading, error, refetch } = useGetAllEstimatorsQuery({
    page,
    limit: 20,
    searchTerm: normalizedSearchTerm,
  });

  const { data: singleEmployee, isLoading: isSingleLoading } =
    useGetSingleUserQuery(selectedRow?.id ?? skipToken);
  const employee = singleEmployee?.result;

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    setPage(1);
  }, [normalizedSearchTerm]);

  useEffect(() => {
    if (modalType === "edit" && selectedRow) {
      setFormData({
        fullName: employee?.user?.fullName || selectedRow.fullName || "",
        email: employee?.user?.email || selectedRow.email || "",
        profession: employee?.user?.profession || "",
        hiringDate: employee?.user?.createdAt
          ? new Date(employee.user.createdAt).toISOString().split("T")[0]
          : "",
        regularHours: Number(employee?.weeklyTotals?.regularHours || 0),
        pwHours: Number(employee?.weeklyTotals?.pwHours || 0),
        overTime: Number(employee?.weeklyTotals?.overtimeHours || 0),
        totalHours: Number(employee?.weeklyTotals?.totalHours || 0),
      });
    }
  }, [modalType, selectedRow, employee]);

  const columns = [
    { key: "fullName", label: "Estimator Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  const estimators: Estimator[] = data?.result?.data ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (row: Estimator) => {
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
        await refetch();

        Swal.fire({
          title: "Deleted!",
          text: "Estimator has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.log(err);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete estimator",
          icon: "error",
        });
      }
    }
  };

  const handleUpdate = async () => {
    if (!selectedRow?.id) return;

    try {
      await updateUser({
        userId: selectedRow.id,
        data: {
          fullName: formData.fullName,

          profession: formData.profession,
        },
      }).unwrap();

      toast.success("Estimator updated successfully");
      setModalOpen(false);
      await refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-7 bg-secondary p-6 rounded-2xl">
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
          onView={(row) => {
            setSelectedRow(row as Estimator);
            setModalType("view");
            setModalOpen(true);
          }}
          onEdit={(row) => {
            setSelectedRow(row as Estimator);
            setModalType("edit");
            setModalOpen(true);
          }}
          onDelete={(row) => handleDelete(row as Estimator)}
        />
      </div>

      <CustomModal
        open={modalOpen && modalType === "view"}
        onClose={() => setModalOpen(false)}
        title="Estimator Details"
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
          <p className="text-center py-10">Loading...</p>
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
            />
          </div>
        ) : (
          <p className="text-center py-10">No Data Found</p>
        )}
      </CustomModal>

      <CustomModal
        open={modalOpen && modalType === "edit"}
        onClose={() => setModalOpen(false)}
        title="Edit Estimator List"
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
