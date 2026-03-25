"use client";

import { useEffect, useState } from "react";
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

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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
    // Simulate API call with timeout
    setTimeout(() => {
      setEmployees(employeesData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="border-t">
      <ReusableTable columns={columns} data={employees} isLoading={loading} />
    </div>
  );
}
