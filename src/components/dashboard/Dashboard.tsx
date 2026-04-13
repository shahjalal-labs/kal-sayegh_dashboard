/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import cardBg1 from "@/assets/dashboard/cardBg1.png";
import cardBg2 from "@/assets/dashboard/cardBg2.png";
import cardBg3 from "@/assets/dashboard/cardBg3.png";

import d1 from "@/assets/dashboard/d1.png";
import d2 from "@/assets/dashboard/d2.png";
import d3 from "@/assets/dashboard/d3.png";
import { useGetAdminOverviewQuery } from "@/redux/api/admin/adminDashboardApi";
import Link from "next/link";
import EmployeeManagement from "../table/EmployeeManagement";

const result = {
  summary: {
    newQuotes: 24,
    totalEmploys: 32.5,
    pendingPayments: 8,
    referralDiscounts: 15,
  },
  revenueChart: {
    chartData: [
      { label: "Jan", totalRevenue: 12000 },
      { label: "Feb", totalRevenue: 15000 },
      { label: "Mar", totalRevenue: 18000 },
      { label: "Apr", totalRevenue: 22000 },
      { label: "May", totalRevenue: 25000 },
      { label: "Jun", totalRevenue: 30000 },
    ],
  },
  ringChartData: {
    pending: 12,
    inRoute: 18,
    delivered: 45,
    cancelled: 6,
  },
};

export default function Dashboard() {
  const [selected, setSelected] = useState("monthly");
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useGetAdminOverviewQuery({});

  const overviewData = data?.result;

  if (isLoading) return <p className="p-4">Loading dashboard...</p>;

  // Stats Cards
  const stats = [
    {
      title: "Active Employees",
      value: overviewData.activeEmployees || 0,
      description: "Clocked in today",
      icon: d1,
      bg: cardBg1,
    },
    {
      title: "Today's Work Hours",
      value: overviewData.todaysWorkHours + "h" || 0,
      description: "Regular + PW + Travel",
      icon: d2,
      bg: cardBg2,
    },
    {
      title: "Pending Estimates",
      value: overviewData.pendingEstimates || 0,
      description: "Awaiting client response",
      icon: d3,
      bg: cardBg3,
    },
  ];

  // Full month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Map short names from API to full names
  const monthMap: Record<string, string> = {
    jan: "January",
    feb: "February",
    mar: "March",
    apr: "April",
    may: "May",
    jun: "June",
    jul: "July",
    aug: "August",
    sep: "September",
    sept: "September",
    oct: "October",
    nov: "November",
    dec: "December",
  };

  // Short names for display
  const shortMonths: Record<string, string> = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
  };

  // Prepare chart data
  const chartData = months.map((month) => {
    const item = result?.revenueChart?.chartData?.find(
      (d: any) => monthMap[d.label.toLowerCase()] === month,
    );

    return {
      label: shortMonths[month],
      totalRevenue: item ? item.totalRevenue : 0,
    };
  });

  const maxRevenue = Math.max(...chartData.map((d) => d.totalRevenue), 1);

  const serviceData = [
    {
      name: "Active (Clock In)",
      value: 18,
      color: "#6140E6",
    },
    {
      name: "Inactive (Clock Out)",
      value: 6,
      color: "#FF0000",
    },
  ];

  const options = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const customTooltipStyle = {
    backgroundColor: "#FFFFFF",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "#374151",
    fontSize: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  };

  return (
    <div className=" min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6  bg-secondary p-5 rounded-2xl">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="relative shadow-sm border-0 overflow-hidden"
          >
            <div className="absolute inset-0">
              <Image
                src={stat.bg}
                alt="card background"
                fill
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="pt-8 rounded-full text-white">
                  <Image src={stat.icon} alt="icon" width={40} height={40} />
                </div>
                <p className="text-sm mb-1 pt-8">{stat.title}</p>
              </div>
              <div className="space-y-3">
                <p className="text-2xl md:text-3xl font-semibold">
                  {stat.value}
                </p>
                <p className="text-base font-medium text-gray-600">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 ">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 bg-secondary  rounded-lg border-none">
          <div className="flex justify-between items-center p-4 relative">
            <CardHeader>
              <CardTitle className="flex-grow">Weekly Hours Trend</CardTitle>
            </CardHeader>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2  py-1 px-3 text-sm text-gray-700 focus:outline-none"
              >
                {options.find((o) => o.value === selected)?.label || "Monthly"}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelected(option.value);
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CardContent>
            <div className="h-72 w-full ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    domain={[0, maxRevenue * 2]}
                  />
                  <Tooltip cursor={false} contentStyle={customTooltipStyle} />
                  <Bar
                    barSize={40}
                    dataKey="totalRevenue"
                    radius={[8, 8, 0, 0]}
                    minPointSize={5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.totalRevenue === maxRevenue
                            ? "#E27932"
                            : "#F6D5BF"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Employ Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip cursor={false} contentStyle={customTooltipStyle} />
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6 w-full">
              {serviceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-secondary p-6 brounded-2xl space-y-6">
        <div className="flex justify-between">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">
            Employee List
          </h1>
          <Link
            href={"/admin/employee-management"}
            className="bg-primary text-secondary px-6 py-2 rounded-lg font-normal text-base"
          >
            See All
          </Link>
        </div>
        <EmployeeManagement />
      </div>
    </div>
  );
}
