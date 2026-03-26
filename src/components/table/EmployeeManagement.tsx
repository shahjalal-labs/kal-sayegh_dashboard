"use client";

import { useEffect, useState } from "react";
import { CustomModal } from "../modal/CustomModal";

import profile from "@/assets/navbar/profile.png";
import Image from "next/image";
import DynamicForm, { FormField } from "./DynamicForm";
import { EmployeeSchedule } from "./EmployeeSchedule";
import ReusableTable from "./ReusableTable";

// Mock data for the new table
interface Employee {
  id: number;
  name: string;
  email: string;
  regularHours: number;
  pwHours: number;
  travelHours: number;
  clockIn: string;
  overtime: number;
  status: "Active" | "Inactive" | "Pending";
}

const employeesData: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    regularHours: 40,
    pwHours: 5,
    travelHours: 3,
    clockIn: "09:00 AM",
    overtime: 2,
    status: "Pending",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    regularHours: 38,
    pwHours: 4,
    travelHours: 2,
    clockIn: "09:30 AM",
    overtime: 1,
    status: "Inactive",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
    regularHours: 40,
    pwHours: 6,
    travelHours: 0,
    clockIn: "08:45 AM",
    overtime: 3,
    status: "Active",
  },
];

// Define form fields dynamically
const employeeFormFields: FormField[] = [
  {
    name: "userName",
    label: "User Name",
    type: "text",
    placeholder: "John Martinez",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "crusader@yahoo.com",
    required: true,
  },
  {
    name: "profession",
    label: "Profession",
    type: "text",
    placeholder: "Foreman",
  },
  { name: "hiringDate", label: "Hiring Date", type: "date" },
  {
    name: "regularHours",
    label: "Regular Hours (This Week)",
    type: "number",
    placeholder: "16.5",
    step: "0.5",
  },
  {
    name: "prevailingWageHours",
    label: "Prevailing Wage Hours",
    type: "number",
    placeholder: "6.0",
    step: "0.5",
  },
  {
    name: "overtimeHours",
    label: "Over Time Hours",
    type: "number",
    placeholder: "8.5",
    step: "0.5",
  },
  {
    name: "totalHours",
    label: "Total Hours (This Week)",
    type: "number",
    placeholder: "3.0",
    step: "0.5",
  },
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit" | "add" | null>(
    null,
  );
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const columns = [
    { key: "name", label: "Employee Name" },
    { key: "email", label: "Email Address" },
    { key: "regularHours", label: "Regular Hours" },
    { key: "pwHours", label: "PW Hours" },
    { key: "travelHours", label: "Travel Hours" },
    { key: "clockIn", label: "Clock In" },
    { key: "overtime", label: "Overtime" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  useEffect(() => {
    setTimeout(() => {
      setEmployees(employeesData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveEmployee = (formData: any) => {
    console.log("Saving employee data:", formData);
    // Handle save logic here
    setModalOpen(false);
  };

  const handleDeleteEmployee = () => {
    console.log("Deleting employee:", selectedRow);
    // Handle delete logic here
    setModalOpen(false);
  };

  return (
    <div className="border-t">
      <ReusableTable
        columns={columns}
        data={employees}
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
        isLoading={loading}
      />

      <CustomModal
        open={modalOpen && modalType === "view"}
        onClose={() => setModalOpen(false)}
        title="Employee List"
        maxWidth="2xl"
        actions={[
          {
            label: "Close",
            onClick: () => setModalOpen(false),
            variant: "secondary",
          },
          {
            label: "Edit",
            onClick: () => {
              setModalType("edit");
            },
            variant: "primary",
          },
        ]}
      >
        {selectedRow && (
          <div className="space-y-6">
            <div className=" gap-y-6">
              <div className="flex justify-between space-y-3 border-b p-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">User Name</p>
                </div>
                <div className="flex gap-3 items-center">
                  <Image src={profile} alt="profile" height={30} width={30} />
                  <p className="text-base font-normal text-gray-900">
                    {selectedRow.name}
                  </p>
                </div>
              </div>

              <div className="flex justify-between space-y-3 border-b p-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                </div>
                <div className="flex gap-3 items-center">
                  <p className="text-base font-normal text-gray-900">
                    {selectedRow.email}
                  </p>
                </div>
              </div>

              <div className="flex justify-between space-y-3 border-b p-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Profession</p>
                </div>
                <div className="flex gap-3 items-center">
                  <p className="text-base text-gray-900">Foreman</p>
                </div>
              </div>

              <div className="flex justify-between space-y-3 border-b p-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hiring Date</p>
                </div>
                <div className="flex gap-3 items-center">
                  <p className="text-base text-gray-900">January 15, 2022</p>
                </div>
              </div>
            </div>

            {/* Hours Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#2196F31A] rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  REGULAR HOURS (THIS WEEK)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRow.regularHours}{" "}
                  <span className="text-xs"> HRS</span>
                </p>
              </div>
              <div className="bg-[#65CD4C1A] rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  PREVAILING WAGE HOURS
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRow.pwHours} <span className="text-xs"> HRS</span>
                </p>
              </div>
              <div className="bg-[#FF00001A] rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">OVER TIME HOURS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRow.overtime} <span className="text-xs"> HRS</span>
                </p>
              </div>
              <div className="bg-[#FF61641A] rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  TOTAL HOURS (THIS WEEK)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRow.regularHours +
                    selectedRow.pwHours +
                    selectedRow.overtime}{" "}
                  <span className="text-xs"> HRS</span>
                </p>
              </div>
            </div>

            {/* Weekly Schedule */}
            <EmployeeSchedule />
          </div>
        )}
      </CustomModal>

      <CustomModal
        open={modalOpen && (modalType === "edit" || modalType === "add")}
        onClose={() => setModalOpen(false)}
        title={modalType === "edit" ? "Edit Employee List" : ""}
        maxWidth="xl"
        actions={[
          {
            label: "Cancel",
            onClick: () => setModalOpen(false),
            variant: "secondary" as const,
          },
          {
            label: modalType === "edit" ? "Save " : "Add Employee",
            onClick: (data: any) => handleSaveEmployee(data),
            variant: "primary" as const,
          },
        ].filter(Boolean)}
      >
        <DynamicForm
          fields={employeeFormFields}
          initialData={modalType === "edit" ? selectedRow : null}
          onSubmit={handleSaveEmployee}
        />
      </CustomModal>
    </div>
  );
}
