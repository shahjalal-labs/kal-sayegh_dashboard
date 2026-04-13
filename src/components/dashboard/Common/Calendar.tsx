"use client";

import { useCreateClientMutation } from "@/redux/api/admin/estimateApi";
import { Clock, Search } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiEdit } from "react-icons/ci";
import { FaRegCalendarAlt } from "react-icons/fa";
import { toast } from "sonner";
import { CustomModal } from "../../modal/CustomModal";

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

  for (let i = 1; i <= daysInMonth; i++) {
    monthData.push({
      date: i,
      month,
      year,
      appointments: [],
    });
  }

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
    return "bg-[#EEBA00]";
  }
  if (types.includes("appointment") && types.includes("visit")) {
    return "bg-[#7D34D8]";
  }
  if (types.includes("meeting") && types.includes("visit")) {
    return "bg-[#A8DEFA]";
  }
  if (types.includes("internal") && types.includes("appointment")) {
    return "bg-[#F9B6B0]";
  }

  // Single type colors
  if (types.includes("appointment")) return "bg-[#EEBA00]";
  if (types.includes("meeting")) return "bg-[#A8DEFA]";
  if (types.includes("visit")) return "bg-[#7D34D8]";
  if (types.includes("internal")) return "bg-[#F9B6B0]";

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
  const [isOpen, setIsOpen] = useState(false);

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const [openStartPicker, setOpenStartPicker] = useState(false);
  const [openEndPicker, setOpenEndPicker] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);

  const monthData = generateMonthData(currentYear, currentMonth);

  const [createSchedule] = useCreateClientMutation();

  const [form, setForm] = useState({
    scheduleDate: "",
    workScope: "",
    location: "",
    startTime: "",
    endTime: "",
  });

  const handleDateClick = (day: DayData) => {
    const appointments = getAppointmentsForDay(day.date, day.month, day.year);

    const dateStr = new Date(day.year, day.month, day.date)
      .toISOString()
      .split("T")[0];

    setForm((prev) => ({
      ...prev,
      scheduleDate: dateStr,
    }));

    setSelectedDate({ ...day, appointments });
  };

  const buildISO = (date: string, time: string) => {
    if (!date || !time) return null;

    // Create date object from the date string
    const dateObj = new Date(date);

    // Parse time string (format: "HH:MM")
    const [hours, minutes] = time.split(":");

    // Set the time on the date object
    dateObj.setHours(parseInt(hours, 10));
    dateObj.setMinutes(parseInt(minutes, 10));
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);

    // Check if valid
    if (isNaN(dateObj.getTime())) return null;

    // Return ISO string
    return dateObj.toISOString();
  };

  const handleCreateSchedule = async () => {
    try {
      // Validate required fields
      if (!form.scheduleDate) {
        toast.error("Please select a date");
        return;
      }

      if (!form.workScope) {
        toast.error("Please enter scope of work");
        return;
      }

      if (!form.startTime) {
        toast.error("Please select start time");
        return;
      }

      if (!form.endTime) {
        toast.error("Please select end time");
        return;
      }

      // Build ISO strings for start and end times
      const startTimeISO = buildISO(form.scheduleDate, form.startTime);
      const endTimeISO = buildISO(form.scheduleDate, form.endTime);

      if (!startTimeISO || !endTimeISO) {
        toast.error("Invalid date or time format");
        return;
      }

      // Create schedule date in ISO format (start of day)
      const scheduleDateObj = new Date(form.scheduleDate);
      scheduleDateObj.setHours(0, 0, 0, 0);

      const payload = {
        scheduleDate: scheduleDateObj.toISOString(), // ISO format for the date
        workScope: form.workScope,
        location: form.location || null, // Send null if empty
        startTime: startTimeISO,
        endTime: endTimeISO,
      };

      console.log("PAYLOAD:", payload);
      console.log("Start Time ISO:", startTimeISO);
      console.log("End Time ISO:", endTimeISO);

      const response = await createSchedule(payload).unwrap();

      toast.success("Schedule created successfully");
      setOpenScheduleModal(false);

      // Reset form
      setForm({
        scheduleDate: "",
        workScope: "",
        location: "",
        startTime: "",
        endTime: "",
      });
    } catch (error: any) {
      console.log("CREATE SCHEDULE ERROR:", error);
      toast.error(error?.data?.message || "Failed to create schedule");
    }
  };

  return (
    <div className="min-h-screen bg-white rounded-2xl md:p-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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

          <button
            onClick={() => setOpenScheduleModal(true)}
            className="px-8 py-4 rounded-xl bg-primary text-white text-base font-normal hover:bg-primary/90 transition-colors"
          >
            + Add Schedule
          </button>
        </div>
      </div>
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 ">
        <div className="grid grid-cols-7 gap-px bg-gray-200 ">
          {weekDays.map((day) => (
            <div key={day} className="bg-gray-50 p-2">
              <span className=" font-semibold text-base tracking-wide">
                {day}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 ">
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
                <div className={`mb-1 flex justify-between`}>
                  <span
                    className={`text-lg inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? "" : ""}`}
                  >
                    {day.date}
                  </span>

                  {appointments.length > 0 && (
                    <CiEdit
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                        handleDateClick(day);
                      }}
                      size={25}
                      className="font-bold cursor-pointer"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  {appointments.slice(0, 2).map((apt, i) => (
                    <div
                      key={i}
                      className={`text-xs p-1 rounded truncate`}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CustomModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit January 03, 2026"
        maxWidth="2xl"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setIsOpen(false),
          },
          {
            label: "Save Changes",
            variant: "primary",
            onClick: () => {
              console.log("Saved");
            },
          },
        ]}
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Location Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Location Name"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Scope */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Scope Of Work
            </label>
            <input
              type="text"
              placeholder="Scope Of Work"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Time Row */}

          <div className="flex justify-between ">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Time (From) <span className="text-gray-400">Optional</span>
              </label>

              <div className="relative mt-2">
                <DatePicker
                  selected={startTime}
                  onChange={(date: any) => setStartTime(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="hh:mm aa"
                  open={openStartPicker}
                  onClickOutside={() => setOpenStartPicker(false)}
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholderText="08:00 AM"
                />

                <Clock
                  onClick={() => setOpenStartPicker(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Time To */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Time (To) <span className="text-gray-400">Optional</span>
              </label>

              <div className="relative mt-2">
                <DatePicker
                  selected={endTime}
                  onChange={(date: any) => setEndTime(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="hh:mm aa"
                  open={openEndPicker}
                  onClickOutside={() => setOpenEndPicker(false)}
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholderText="09:00 AM"
                />

                <FaRegCalendarAlt
                  onClick={() => setOpenEndPicker(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        title="Add New Schedule"
        maxWidth="2xl"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setOpenScheduleModal(false),
          },
          {
            label: "Submit",
            variant: "primary",
            onClick: handleCreateSchedule,
          },
        ]}
      >
        <div className="space-y-5">
          {/* Scope */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Scope Of Work
            </label>

            <input
              type="text"
              value={form.workScope}
              onChange={(e) => setForm({ ...form, workScope: e.target.value })}
              placeholder="Scope Of Work"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              ScheduleDate
            </label>

            <input
              type="text"
              value={form.scheduleDate}
              onChange={(e) =>
                setForm({ ...form, scheduleDate: e.target.value })
              }
              placeholder="scheduleDate"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Location Name (Optional)
            </label>

            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location Name"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Time */}
          <div className="flex gap-4">
            {/* From */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">
                Time (From)
              </label>

              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* To */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">
                Time (To)
              </label>

              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
