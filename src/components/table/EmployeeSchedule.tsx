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

export function EmployeeSchedule({ data }: { data: any[] }) {
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

  const sortedData = [...(data || [])].sort(
    (a, b) => dayOrder.indexOf(a.dayName) - dayOrder.indexOf(b.dayName),
  );

  return (
    <div className="space-y-6">
      {sortedData.map((day) => (
        <div
          key={day.day}
          className="flex items-start bg-[#F7F8F8] border border-[#FBEBE04D] gap-4 p-4 rounded-xl"
        >
          <div className="min-w-[70px] bg-[#E279321A] flex flex-col items-center p-2 rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {getShortDayName(day?.dayName)}
            </p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {day?.date.toString().padStart(2, "0")}
            </p>
          </div>

          <div className="flex-1 ">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {getShortDayName(day?.dayName)}
            </h3>

            {day.isDayOff ? (
              <p className="text-sm text-gray-600">Day Off</p>
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
