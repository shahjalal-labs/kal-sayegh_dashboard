"use client";

import profile from "@/assets/navbar/profile.png";
import { useGetEmployeesQuery } from "@/redux/api/admin/adminDashboardApi";
import Image from "next/image";
import { useState } from "react";
import { CustomModal } from "../modal/CustomModal";
import DynamicForm, { FormField } from "./DynamicForm";
import { EmployeeSchedule } from "./EmployeeSchedule";
import ReusableTable from "./ReusableTable";

const employeeFormFields: FormField[] = [
  {
    name: "userName",
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
    required: true,
  },
  {
    name: "profession",
    label: "Profession",
    type: "text",
    placeholder: "Profession",
  },
  { name: "hiringDate", label: "Hiring Date", type: "date" },
  {
    name: "regularHours",
    label: "Regular Hours (This Week)",
    type: "number",
    step: "0.5",
  },
  {
    name: "prevailingWageHours",
    label: "Prevailing Wage Hours",
    type: "number",
    step: "0.5",
  },
  {
    name: "overtimeHours",
    label: "Over Time Hours",
    type: "number",
    step: "0.5",
  },
  {
    name: "totalHours",
    label: "Total Hours (This Week)",
    type: "number",
    step: "0.5",
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

  const handleSaveEmployee = (formData: any) => {
    console.log("Saving employee data:", formData);
    setModalOpen(false);
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
          setSelectedRow(row);
          setModalType("edit");
          setModalOpen(true);
        }}
      />

      {/* VIEW MODAL */}
      <CustomModal
        open={modalOpen && modalType === "view"}
        onClose={() => setModalOpen(false)}
        title="Employee Details"
        maxWidth="2xl"
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
        {selectedRow && (
          <div className="space-y-6">
            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">User Name</p>
              <div className="flex items-center gap-3">
                <Image src={profile} alt="profile" width={30} height={30} />
                <p>{selectedRow.name}</p>
              </div>
            </div>

            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">Email</p>
              <p>{selectedRow.email}</p>
            </div>

            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">Profession</p>
              <p>Foreman</p>
            </div>

            <div className="flex justify-between border-b p-3">
              <p className="text-sm text-gray-500">Hiring Date</p>
              <p>January 15, 2022</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded text-center">
                <p>Regular Hours</p>
                <p className="text-xl font-bold">
                  {selectedRow.regularHours} HRS
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded text-center">
                <p>PW Hours</p>
                <p className="text-xl font-bold">{selectedRow.pwHours} HRS</p>
              </div>

              <div className="bg-red-100 p-4 rounded text-center">
                <p>Overtime</p>
                <p className="text-xl font-bold">{selectedRow.overtime} HRS</p>
              </div>

              <div className="bg-orange-100 p-4 rounded text-center">
                <p>Total</p>
                <p className="text-xl font-bold">
                  {selectedRow.regularHours +
                    selectedRow.pwHours +
                    selectedRow.overtime}{" "}
                  HRS
                </p>
              </div>
            </div>

            <EmployeeSchedule />
          </div>
        )}
      </CustomModal>

      {/* EDIT MODAL */}
      <CustomModal
        open={modalOpen && modalType === "edit"}
        onClose={() => setModalOpen(false)}
        title="Edit Employee"
        maxWidth="xl"
        actions={[
          {
            label: "Cancel",
            onClick: () => setModalOpen(false),
            variant: "secondary",
          },
          {
            label: "Save",
            onClick: handleSaveEmployee,
            variant: "primary",
          },
        ]}
      >
        <DynamicForm
          fields={employeeFormFields}
          initialData={selectedRow}
          onSubmit={handleSaveEmployee}
        />
      </CustomModal>
    </div>
  );
}
