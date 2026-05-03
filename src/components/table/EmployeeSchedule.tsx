// EmployeeSchedule.tsx
interface ScheduleDay {
  day: string;
  date: number;
  timeRange?: string;
  isDayOff?: boolean;
  regularTag?: boolean;
  pwTag?: boolean;
  otTag?: boolean;
  hours: number;
}

export function EmployeeSchedule({ data, loading = false }: { data: any[]; loading?: boolean }) {
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getShortDayName = (dayName: string) => {
    const shortNames: { [key: string]: string } = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };
    return shortNames[dayName] || dayName;
  };

  // Ensure we always render a full week. If a day is missing, create a default.
  const fullWeek = dayOrder.map((dayName) => {
    const found = (data || []).find((d: any) => d.dayName === dayName);
    if (found)
      return {
        ...found,
        // treat Friday as off explicitly
        isDayOff: found.isDayOff ?? found.dayName === "Friday",
      } as any;

    return {
      dayName,
      date: String(new Date().getDate()).padStart(2, "0"),
      month: new Date().toLocaleString("en-US", { month: "short" }),
      sessions: [],
      totalHours: 0,
      // Make Friday off by default
      isDayOff: dayName === "Friday",
    } as any;
  });

  const sortedData = fullWeek; // already in correct order from dayOrder

  if (loading) {
    // Simple skeleton while loading
    return (
      <div className="space-y-6">
        {dayOrder.map((d) => (
          <div
            key={d}
            className="flex items-start bg-[#F7F8F8] border border-[#FBEBE04D] gap-4 p-4 rounded-xl animate-pulse"
          >
            <div className="min-w-[70px] bg-[#E279321A] flex flex-col items-center p-2 rounded-xl">
              <div className="h-4 w-12 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 w-8 bg-gray-300 rounded"></div>
            </div>

            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
              <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedData.map((day) => (
        <div
          key={day.dayName}
          className="flex items-start bg-[#F7F8F8] border border-[#FBEBE04D] gap-4 p-4 rounded-xl"
        >
          <div className="min-w-[70px] bg-white flex flex-col items-center p-2 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              {(day?.month ?? new Date().toLocaleString("en-US", { month: "short" })).toUpperCase()}
            </p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {String(day?.date ?? new Date().getDate()).padStart(2, "0")}
            </p>
          </div>

          <div className="flex-1 ">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {day?.dayName}
            </h3>

            {day.isDayOff ? (
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm text-gray-400 mb-1">-- -- --</p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                    Day Off
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  {day.sessions.map((s: any, i: any) => (
                    <p
                      key={i}
                      className="text-xs text-gray-700 mb-2 whitespace-pre-wrap"
                    >
                      {s.startTime} - {s.endTime}
                    </p>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {day.sessions.map((s: any, i: any) => (
                    <span
                      key={i}
                      className={`px-4 py-2 text-xs rounded ${
                        s.type === "Regular"
                          ? "bg-[#2196F333] text-[#2196F3]"
                          : s.type === "PW"
                            ? "bg-[#52C41A33] text-[#52C41A]"
                            : "bg-[#FAAD1433] text-[#FAAD14]"
                      }`}
                    >
                      {s.type}
                    </span>
                  ))}

                  <span className="text-sm font-normal text-gray-900 ml-1">
                    {day.totalHours} hrs
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
