"use client";

import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useGetAllSchedulesQuery,
  useUpdateScheduleMutation,
} from "@/redux/api/admin/scheduleApi";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { CiEdit } from "react-icons/ci";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { CustomModal } from "../../modal/CustomModal";

type EventType =
  | "asphaltRepair"
  | "internalMeeting"
  | "teamMeeting"
  | "onsiteVisit"
  | "newClient"
  | "corona"
  | "others";

type Appointment = {
  id: string;
  title: string;
  location?: string;
  workScope?: string;
  startTime?: string;
  endTime?: string;
  type: EventType;
  scheduleDate?: string;
};

type DayData = {
  date: number;
  month: number;
  year: number;
  appointments: Appointment[];
};

// Event color
const getEventBgColor = (type: EventType): string => {
  switch (type) {
    case "asphaltRepair":
      return "#F9B6B0";
    case "internalMeeting":
      return "#7D34D8";
    case "teamMeeting":
      return "#EEBA00";
    case "onsiteVisit":
      return "#A8DEFA";
    case "newClient":
      return "#F1F8E9";
    case "corona":
      return "#FFEBEE";
    case "others":
      return "#F00000";
    default:
      return "#FFFFFF";
  }
};

const getEventBgClass = (type: EventType): string => {
  switch (type) {
    case "asphaltRepair":
      return "bg-[#F9B6B0]";
    case "internalMeeting":
      return "bg-[#7D34D8]";
    case "teamMeeting":
      return "bg-[#EEBA00]";
    case "onsiteVisit":
      return "bg-[#A8DEFA]";
    case "newClient":
      return "bg-[#F1F8E9]";
    case "corona":
      return "bg-[#FFEBEE]";
    case "others":
      return "bg-[#F00000]";
    default:
      return "bg-white";
  }
};

// Function to determine text color based on event type
const getEventTextColor = (type: EventType): string => {
  switch (type) {
    case "newClient":
    case "corona":
      return "text-black";
    default:
      return "text-white";
  }
};

function getDayBackgroundColor(appointments: Appointment[]): string {
  if (appointments.length === 0) return "bg-white";

  if (appointments.length > 1) {
    return "bg-gradient-to-br from-[#EEBA00] to-[#A8DEFA]";
  }

  return getEventBgClass(appointments[0].type);
}

function generateMonthData(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthData: DayData[] = [];

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

const mapToEventType = (workScope: string): EventType => {
  switch (workScope) {
    case "asphaltRepair":
      return "asphaltRepair";
    case "internalMeeting":
      return "internalMeeting";
    case "teamMeeting":
      return "teamMeeting";
    case "onsiteVisit":
      return "onsiteVisit";
    case "newClient":
      return "newClient";
    case "corona":
      return "corona";
    case "others":
      return "others";
    default:
      return "others";
  }
};

export default function Calendar() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<DayData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, refetch } = useGetAllSchedulesQuery({
    month: String(currentMonth + 1).padStart(2, "0"),
    year: currentYear,
    search: searchTerm,
  });

  const [createSchedule, { isLoading }] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const schedules = data?.result || [];

  const [form, setForm] = useState({
    title: "",
    scheduleDate: "",
    workScope: "",
    location: "",
    startTime: "",
    endTime: "",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    scheduleDate: "",
    workScope: "",
    location: "",
    startTime: "",
    endTime: "",
  });

  const scopeOptions = [
    {
      value: "asphaltRepair",
      label: "Asphalt Repair",
      color: "#F9B6B0",
      textColor: "white",
    },
    {
      value: "internalMeeting",
      label: "Internal Meeting",
      color: "#7D34D8",
      textColor: "white",
    },
    {
      value: "teamMeeting",
      label: "Team Meeting",
      color: "#EEBA00",
      textColor: "white",
    },
    {
      value: "onsiteVisit",
      label: "Onsite Visit",
      color: "#A8DEFA",
      textColor: "white",
    },
    {
      value: "newClient",
      label: "New Client",
      color: "#F1F8E9",
      textColor: "black",
    },
    { value: "corona", label: "Corona", color: "#FFEBEE", textColor: "black" },
    { value: "others", label: "Others", color: "#F00000", textColor: "white" },
  ];

  const formatTimeFromISO = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateForInput = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
  };

  const mapSchedulesToCalendar = (schedules: any[]) => {
    const map: Record<string, Appointment[]> = {};

    schedules.forEach((item) => {
      if (!item || !item.scheduleDate) return;
      const date = new Date(item.scheduleDate);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!map[key]) map[key] = [];

      const startTimeFormatted = item.startTime
        ? new Date(item.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const endTimeFormatted = item.endTime
        ? new Date(item.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      map[key].push({
        id: item.id,
        title: item.title || item.workScope,
        location: item.location,
        workScope: item.workScope,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        scheduleDate: item.scheduleDate,
        type: mapToEventType(item.workScope),
      });
    });

    return map;
  };

  const mappedAppointments = mapSchedulesToCalendar(schedules);

  function getAppointmentsForDay(
    date: number,
    month: number,
    year: number,
    mappedData: Record<string, Appointment[]>,
  ): Appointment[] {
    const key = `${year}-${month}-${date}`;
    return mappedData[key] || [];
  }

  const handleEditClick = (
    e: React.MouseEvent,
    day: DayData,
    appointment: Appointment,
  ) => {
    e.stopPropagation();

    const dateStr = formatDateForInput(appointment.scheduleDate || "");

    setEditForm({
      id: appointment.id,
      title: appointment.title,
      scheduleDate: dateStr,
      workScope: appointment.workScope || appointment.title,
      location: appointment.location || "",
      startTime: formatTimeFromISO(appointment.scheduleDate || ""),
      endTime: formatTimeFromISO(appointment.scheduleDate || ""),
    });

    setSelectedDate({ ...day, appointments: [appointment] });
    setIsOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteSchedule(id).unwrap();

      await Swal.fire({
        title: "Deleted!",
        text: "Schedule has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      refetch();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error?.data?.message || "Failed to delete schedule",
        icon: "error",
      });
    }
  };

  const buildISO = (date: string, time: string) => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(":");
    const dateObj = new Date(date);
    dateObj.setHours(parseInt(hours, 10));
    dateObj.setMinutes(parseInt(minutes, 10));
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);
    if (isNaN(dateObj.getTime())) return null;
    return dateObj.toISOString();
  };

  const handleCreateSchedule = async () => {
    try {
      if (!form.scheduleDate) {
        toast.error("Please select a date");
        return;
      }

      if (!form.workScope) {
        toast.error("Please select scope of work");
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

      const startTimeISO = buildISO(form.scheduleDate, form.startTime);
      const endTimeISO = buildISO(form.scheduleDate, form.endTime);

      if (!startTimeISO || !endTimeISO) {
        toast.error("Invalid date or time format");
        return;
      }

      const scheduleDateObj = new Date(form.scheduleDate);
      scheduleDateObj.setHours(0, 0, 0, 0);

      const payload = {
        scheduleDate: scheduleDateObj.toISOString(),
        workScope: form.workScope,
        title: form.title || form.workScope,
        location: form.location || null,
        startTime: startTimeISO,
        endTime: endTimeISO,
      };

      await createSchedule(payload).unwrap();
      toast.success("Schedule created successfully");
      setOpenScheduleModal(false);

      setTimeout(() => {
        refetch();
      }, 500);

      setForm({
        title: "",
        scheduleDate: "",
        workScope: "",
        location: "",
        startTime: "",
        endTime: "",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create schedule");
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      if (!editForm.scheduleDate) {
        toast.error("Please select a date");
        return;
      }

      if (!editForm.workScope) {
        toast.error("Please select scope of work");
        return;
      }

      if (!editForm.startTime) {
        toast.error("Please select start time");
        return;
      }

      if (!editForm.endTime) {
        toast.error("Please select end time");
        return;
      }

      const startTimeISO = buildISO(editForm.scheduleDate, editForm.startTime);
      const endTimeISO = buildISO(editForm.scheduleDate, editForm.endTime);

      if (!startTimeISO || !endTimeISO) {
        toast.error("Invalid date or time format");
        return;
      }

      const scheduleDateObj = new Date(editForm.scheduleDate);
      scheduleDateObj.setHours(0, 0, 0, 0);

      const payload = {
        id: editForm.id,
        scheduleDate: scheduleDateObj.toISOString(),
        workScope: editForm.workScope,
        title: editForm.title || editForm.workScope,
        location: editForm.location || null,
        startTime: startTimeISO,
        endTime: endTimeISO,
      };

      await updateSchedule(payload).unwrap();
      toast.success("Schedule updated successfully");
      setIsOpen(false);

      setTimeout(() => {
        refetch();
      }, 500);

      setEditForm({
        id: "",
        title: "",
        scheduleDate: "",
        workScope: "",
        location: "",
        startTime: "",
        endTime: "",
      });
    } catch (error: any) {
      console.log("UPDATE SCHEDULE ERROR:", error);
      toast.error(error?.data?.message || "Failed to update schedule");
    }
  };

  const getFormattedDateTitle = () => {
    if (!selectedDate) return "Edit Schedule";
    const date = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.date,
    );
    return `Edit ${date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const monthData = generateMonthData(currentYear, currentMonth);

  return (
    <div className="min-h-screen bg-white rounded-2xl p-4 md:p-6 font-sans">
      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <select
            value={currentMonth}
            onChange={(e) => {
              const newMonth = Number(e.target.value);
              setCurrentMonth(newMonth);
            }}
            className="px-4 py-2 rounded-lg text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
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

        <div className="flex flex-col-reverse sm:flex-row md:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => setOpenScheduleModal(true)}
            className="px-8 py-4 rounded-xl bg-primary text-white text-base font-normal hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            + Add Schedule
          </button>
        </div>
      </div>

      {/* Color Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg flex flex-wrap gap-3">
        {scopeOptions.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: option.color }}
            />
            <span
              className={`text-[8px] md:text-base ${option.textColor === "black" ? "text-black" : "text-gray-600"}`}
            >
              {option.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100">
        <div className="grid grid-cols-7 gap-px bg-gray-200 text-[8px] md:text-base ">
          {weekDays.map((day) => (
            <div key={day} className="bg-gray-50 p-2 md:p-4">
              <span className="font-semibold  tracking-wide text-xs md:text-base">
                {day}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 md:gap-px bg-gray-200 border-2 p-[0.5px] ">
          {monthData.map((day, idx) => {
            const isCurrentMonth = day.month === currentMonth;
            const appointments = getAppointmentsForDay(
              day.date,
              day.month,
              day.year,
              mappedAppointments,
            );
            const bgColorClass = getDayBackgroundColor(appointments);
            const isToday =
              day.date === new Date().getDate() &&
              day.month === new Date().getMonth() &&
              day.year === new Date().getFullYear();

            return (
              <div
                key={idx}
                className={`min-h-[100px] md:min-h-[120px]  md:p-2 transition-all border rounded-md ${bgColorClass} ${
                  !isCurrentMonth ? "opacity-50" : ""
                }`}
              >
                <div className="mb-1 flex justify-between items-center">
                  <span
                    className={`text-xs md:text-lg inline-flex items-center justify-center  md:w-6 md:h-6  rounded-full ${
                      appointments.length > 0
                        ? appointments[0]?.type === "newClient" ||
                          appointments[0]?.type === "corona"
                          ? "text-black"
                          : "text-white"
                        : "text-black"
                    } ${isToday ? "" : ""}`}
                  >
                    {day.date}
                  </span>

                  {appointments.length > 0 && (
                    <div className="flex gap-1">
                      <CiEdit
                        onClick={(e) => {
                          e.stopPropagation();
                          if (appointments[0]) {
                            handleEditClick(e, day, appointments[0]);
                          }
                        }}
                        className={`font-bold cursor-pointer hover:opacity-80 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6   ${
                          appointments[0]?.type === "newClient" ||
                          appointments[0]?.type === "corona"
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
                      <Trash2
                        onClick={(e) =>
                          handleDeleteClick(e, appointments[0].id)
                        }
                        className={`font-bold cursor-pointer hover:opacity-80 w-3 h-3 sm:w-3 sm:h-3 md:w-5 md:h-5  ${
                          appointments[0]?.type === "newClient" ||
                          appointments[0]?.type === "corona"
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {appointments.slice(0, 2).map((apt, i) => (
                    <div
                      key={i}
                      className={`text-[8px] md:text-base md:p-1 rounded cursor-pointer  ${getEventTextColor(apt.type)}`}
                      style={{
                        borderLeft: `3px solid ${getEventBgColor(apt.type)}`,
                      }}
                      title={`${apt.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(e, day, apt);
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:gap-2 text-[8px] text-wrap md:text-sm">
                        <p>Time: {apt.startTime} </p> - <p>{apt.endTime}</p>
                      </div>
                      <div className="font-medium">
                        {apt.title.length > 15
                          ? apt.title.substring(0, 13) + "..."
                          : apt.title}
                      </div>
                      <div className="text-[8px] md:text-base ">
                        {apt.workScope?.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  ))}
                  {appointments.length > 2 && (
                    <div className="text-[8px] text-gray-600 font-medium bg-white/50 rounded p-1">
                      +{appointments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      <CustomModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditForm({
            id: "",
            title: "",
            scheduleDate: "",
            workScope: "",
            location: "",
            startTime: "",
            endTime: "",
          });
        }}
        title={getFormattedDateTitle()}
        maxWidth="2xl"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => {
              setIsOpen(false);
              setEditForm({
                id: "",
                title: "",
                scheduleDate: "",
                workScope: "",
                location: "",
                startTime: "",
                endTime: "",
              });
            },
          },
          {
            label: "Save Changes",
            variant: "primary",
            onClick: handleUpdateSchedule,
          },
        ]}
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              placeholder="Enter title"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Scope Of Work <span className="text-red-500">*</span>
            </label>
            <select
              value={editForm.workScope}
              onChange={(e) =>
                setEditForm({ ...editForm, workScope: e.target.value })
              }
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 hover:border-gray-400 transition-all"
            >
              <option value="">Select scope of work</option>
              {scopeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Location Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              placeholder="Enter location name"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Schedule Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={editForm.scheduleDate}
              onChange={(e) =>
                setEditForm({ ...editForm, scheduleDate: e.target.value })
              }
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={editForm.startTime}
                onChange={(e) =>
                  setEditForm({ ...editForm, startTime: e.target.value })
                }
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={editForm.endTime}
                onChange={(e) =>
                  setEditForm({ ...editForm, endTime: e.target.value })
                }
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Create Schedule Modal */}
      <CustomModal
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        title="Add New Schedule"
        maxWidth="2xl"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setOpenScheduleModal(false),
          },
          {
            label: isLoading ? "Creating..." : "Create Schedule",
            variant: "primary",
            onClick: handleCreateSchedule,
            disabled: isLoading,
          },
        ]}
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Scope Of Work <span className="text-red-500">*</span>
            </label>
            <select
              value={form.workScope}
              onChange={(e) => setForm({ ...form, workScope: e.target.value })}
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select scope of work</option>
              {scopeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Location Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Enter location name"
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Schedule Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.scheduleDate}
              onChange={(e) =>
                setForm({ ...form, scheduleDate: e.target.value })
              }
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
