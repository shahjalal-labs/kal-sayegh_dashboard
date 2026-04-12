"use client";

import profile from "@/assets/navbar/profile.png";
import {
  useDeleteUserMutation,
  useGetEmployeesQuery,
  useGetSingleUserQuery,
  useUpdateUserMutation,
} from "@/redux/api/admin/adminDashboardApi";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { CustomModal } from "../modal/CustomModal";
import DynamicForm, { FormField } from "./DynamicForm";
import { EmployeeSchedule } from "./EmployeeSchedule";
import ReusableTable from "./ReusableTable";

const employeeFormFields: FormField[] = [
  {
    name: "fullName",
    label: "User Name",
    type: "text",
    placeholder: "User Name",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Email Address",
  },
  {
    name: "profession",
    label: "Profession",
    type: "text",
    placeholder: "Profession",
  },
  {
    name: "hiringDate",
    label: "Hiring Date",
    type: "date",
    readOnly: true,
  },
  {
    name: "regularHours",
    label: "Regular Hours (This Week)",
    type: "number",
    step: "0.5",
    readOnly: true,
  },
  {
    name: "prevailingWageHours",
    label: "Prevailing Wage Hours",
    type: "number",
    step: "0.5",
    readOnly: true,
  },
  {
    name: "overtimeHours",
    label: "Over Time Hours",
    type: "number",
    step: "0.5",
    readOnly: true,
  },
  {
    name: "totalHours",
    label: "Total Hours (This Week)",
    type: "number",
    step: "0.5",
    readOnly: true,
  },
];

export default function EmployeeManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit" | "add" | null>(
    null,
  );
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [page, setPage] = useState(1);

  const { data: employeesList, isLoading } = useGetEmployeesQuery({
    page,
    limit: 20,
  });

  const { data: singleEmployee } = useGetSingleUserQuery(selectedRow?.id);
  const employee = singleEmployee?.result;

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

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

  const handleUpdate = async (formData: any) => {
    const updateData = {
      email: formData?.email,
      fullName: formData?.fullName,
      profession: formData?.profession,
    };

    try {
      await updateUser({
        userId: selectedRow?.id,
        data: updateData,
      }).unwrap();

      toast.success("User updated successfully");
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <div className="border-t">
      <ReusableTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        page={page}
        totalPages={employeesList?.result?.meta?.totalPages}
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
        {isLoading ? (
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

      {/* EDIT MODAL */}
      <CustomModal
        open={modalOpen && modalType === "edit"}
        onClose={() => setModalOpen(false)}
        title="Edit Employee"
        maxWidth="2xl"
        actions={[
          {
            label: "Cancel",
            onClick: () => setModalOpen(false),
            variant: "secondary",
          },
          {
            label: "Save",
            onClick: () => handleUpdate(selectedRow), // Pass selectedRow directly
            variant: "primary",
          },
        ]}
      >
        <DynamicForm
          fields={employeeFormFields}
          initialData={selectedRow || {}} // Use selectedRow, not formValues
          onSubmit={handleUpdate}
        />
      </CustomModal>
    </div>
  );
}
