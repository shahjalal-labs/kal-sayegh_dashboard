"use client";

import { Clock, Search } from "lucide-react";
import { useState } from "react";

type Appointment = {
  id: string;
  title: string;
  location?: string;
  scopeOfWork?: string;
  startTime?: string;
  endTime?: string;
  type: "appointment" | "meeting" | "visit" | "internal";
};

type DayData = {
  date: number;
  month: number;
  year: number;
  appointments: Appointment[];
};

// Helper to generate days for a month
function generateMonthData(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthData: DayData[] = [];

  // Fill in days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    monthData.push({
      date: daysInPrevMonth - i,
      month: month - 1 < 0 ? 11 : month - 1,
      year: month - 1 < 0 ? year - 1 : year,
      appointments: [],
    });
  }

  // Fill in current month days
  for (let i = 1; i <= daysInMonth; i++) {
    monthData.push({
      date: i,
      month,
      year,
      appointments: [],
    });
  }

  // Fill in days for next month to complete the week grid
  while (monthData.length % 7 !== 0) {
    const nextMonth = month + 1 > 11 ? 0 : month + 1;
    const nextYear = month + 1 > 11 ? year + 1 : year;
    const nextDate = monthData.length - daysInMonth - firstDay + 1;
    monthData.push({
      date: nextDate,
      month: nextMonth,
      year: nextYear,
      appointments: [],
    });
  }

  return monthData;
}

// Sample data for January 2026 (month index 0)
const appointmentsData: Record<string, Appointment[]> = {
  "2026-0-2": [
    {
      id: "1",
      title: "New Client Appointment",
      location: "Rancho Cucamonga",
      scopeOfWork: "Asphalt Repair",
      startTime: "8am",
      endTime: "9am",
      type: "appointment",
    },
  ],
  "2026-0-3": [
    {
      id: "2",
      title: "Asphalt Repair",
      location: "Rancho Cucamonga",
      scopeOfWork: "Asphalt Repair",
      type: "appointment",
    },
  ],
  "2026-0-4": [
    {
      id: "3",
      title: "Asphalt Repair",
      location: "Rancho Cucamonga",
      scopeOfWork: "Asphalt Repair",
      type: "appointment",
    },
  ],
  "2026-0-5": [
    {
      id: "4",
      title: "Asphalt Repair",
      location: "Rancho Cucamonga",
      scopeOfWork: "Asphalt Repair",
      type: "appointment",
    },
  ],
  "2026-0-6": [
    {
      id: "5",
      title: "Asphalt Repair",
      location: "Rancho Cucamonga",
      scopeOfWork: "Asphalt Repair",
      type: "appointment",
    },
  ],
  "2026-0-7": [
    {
      id: "6",
      title: "Asphalt Repair",
      location: "Rancho Cucamonga",
      scopeOfWork: "Asphalt Repair",
      type: "appointment",
    },
  ],
  "2026-0-9": [
    {
      id: "7",
      title: "Asphalt Repair",
      location: "Corona",
      scopeOfWork: "Asphalt Repair",
      type: "appointment",
    },
  ],
  "2026-0-10": [
    {
      id: "8",
      title: "Asphalt Repair",
      location: "Irvine",
      scopeOfWork: "Asphalt Repair",
      type: "appointment",
    },
  ],
  "2026-0-17": [
    {
      id: "9",
      title: "Team Meeting",
      startTime: "9am",
      endTime: "10am",
      type: "meeting",
    },
  ],
  "2026-0-27": [
    {
      id: "10",
      title: "Onsite Visit",
      startTime: "11am",
      endTime: "12pm",
      type: "visit",
    },
  ],
  "2026-0-30": [
    {
      id: "11",
      title: "Internal Meeting",
      startTime: "11am",
      endTime: "12pm",
      type: "internal",
    },
  ],
  "2026-2-7": [
    {
      id: "12",
      title: "New Client Appointment",
      startTime: "8am",
      endTime: "9am",
      type: "appointment",
    },
  ],
};

// Helper to get appointments for a specific day
function getAppointmentsForDay(
  date: number,
  month: number,
  year: number,
): Appointment[] {
  const key = `${year}-${month}-${date}`;
  return appointmentsData[key] || [];
}

// Get background color based on appointment types
function getDayBackgroundColor(appointments: Appointment[]): string {
  if (appointments.length === 0) return "bg-white";

  const types = appointments.map((a) => a.type);

  // If multiple types, use a gradient or mixed color
  if (types.includes("appointment") && types.includes("meeting")) {
    return "bg-gradient-to-br from-blue-100 to-purple-100";
  }
  if (types.includes("appointment") && types.includes("visit")) {
    return "bg-gradient-to-br from-blue-100 to-red-100";
  }
  if (types.includes("meeting") && types.includes("visit")) {
    return "bg-gradient-to-br from-purple-100 to-red-100";
  }
  if (types.includes("internal") && types.includes("appointment")) {
    return "bg-gradient-to-br from-pink-100 to-blue-100";
  }

  // Single type colors
  if (types.includes("appointment")) return "bg-blue-400";
  if (types.includes("meeting")) return "bg-purple-400";
  if (types.includes("visit")) return "bg-red-400";
  if (types.includes("internal")) return "bg-pink-400";

  return "bg-white";
}

const monthNames = [
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
const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Calendar() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedDate, setSelectedDate] = useState<DayData | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(
    new Date(2026, 0, 1),
  );

  const monthData = generateMonthData(currentYear, currentMonth);

  const handleDateClick = (day: DayData) => {
    const appointments = getAppointmentsForDay(day.date, day.month, day.year);
    setSelectedDate({ ...day, appointments });
  };

  return (
    <div className="min-h-screen bg-white rounded-2xl p-6 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          <select
            value={currentMonth}
            onChange={(e) => {
              const newMonth = Number(e.target.value);
              setCurrentMonth(newMonth);
              setCurrentDate(new Date(currentYear, newMonth, 1));
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {monthNames.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => {
              const newYear = Number(e.target.value);
              setCurrentYear(newYear);
              setCurrentDate(new Date(newYear, currentMonth, 1));
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button className="px-8 py-4 rounded-xl bg-primary text-white text-base font-normal hover:bg-primary/90 transition-colors">
            + New Job Request
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="bg-gray-50 py-3 text-center">
              <span className="text-xs font-semibold text-gray-500 tracking-wide">
                {day}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {monthData.map((day, idx) => {
            const isCurrentMonth = day.month === currentMonth;
            const appointments = getAppointmentsForDay(
              day.date,
              day.month,
              day.year,
            );
            const bgColorClass = getDayBackgroundColor(appointments);
            const isToday =
              day.date === new Date().getDate() &&
              day.month === new Date().getMonth() &&
              day.year === new Date().getFullYear();

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`min-h-[120px] p-2 transition-all cursor-pointer rounded-md ${bgColorClass} ${!isCurrentMonth ? "" : ""} ${isToday ? "ring-1 ring-primary ring-inset" : ""}`}
              >
                <div
                  className={`text-right mb-1 ${!isCurrentMonth ? "text-gray-400" : "text-gray-700"}`}
                >
                  <span
                    className={`text-sm inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? " text-white" : ""}`}
                  >
                    {day.date}
                  </span>
                </div>

                <div className="space-y-1">
                  {appointments.slice(0, 2).map((apt, i) => (
                    <div
                      key={i}
                      className={`text-xs p-1 rounded truncate `}
                      title={apt.title}
                    >
                      {apt.startTime && (
                        <Clock className="w-3 h-3 inline mr-0.5" />
                      )}
                      {apt.title.length > 18
                        ? apt.title.substring(0, 16) + "..."
                        : apt.title}
                    </div>
                  ))}
                  {appointments.length > 2 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{appointments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedDate.appointments.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {monthNames[selectedDate.month]} {selectedDate.date},{" "}
            {selectedDate.year}
          </h3>
          <div className="space-y-2">
            {selectedDate.appointments.map((apt) => (
              <div
                key={apt.id}
                className={`p-3 rounded-lg border-l-4  bg-gray-50`}
              >
                <div className="font-medium text-gray-800">{apt.title}</div>
                {apt.startTime && (
                  <div className="text-sm text-gray-600">
                    {apt.startTime} - {apt.endTime}
                  </div>
                )}
                {apt.location && (
                  <div className="text-sm text-gray-600">📍 {apt.location}</div>
                )}
                {apt.scopeOfWork && (
                  <div className="text-sm text-gray-600">
                    📋 Scope: {apt.scopeOfWork}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
