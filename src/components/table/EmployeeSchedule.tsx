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

const scheduleData: ScheduleDay[] = [
  {
    day: "Tuesday",
    date: 3,
    timeRange: "8:00 AM - 12:00 PM   01:00 PM - 04:00 PM",
    regularTag: true,
    pwTag: true,
    otTag: false,
    hours: 8.0,
  },
  {
    day: "Wednesday",
    date: 4,
    timeRange: "8:00 AM - 12:00 PM   01:00 PM - 05:00 PM",
    regularTag: true,
    pwTag: true,
    otTag: true,
    hours: 9.0,
  },
  {
    day: "Thursday",
    date: 5,
    timeRange: "8:00 AM - 12:00 PM   01:00 PM - 04:00 PM",
    regularTag: true,
    pwTag: true,
    otTag: false,
    hours: 8.0,
  },
  {
    day: "Friday",
    date: 6,
    isDayOff: true,
    regularTag: false,
    pwTag: false,
    otTag: false,
    hours: 0,
  },
  {
    day: "Saturday",
    date: 7,
    timeRange: "8:00 AM - 12:00 PM   01:00 PM - 05:00 PM",
    regularTag: true,
    pwTag: true,
    otTag: true,
    hours: 9.0,
  },
  {
    day: "Sunday",
    date: 8,
    timeRange: "8:00 AM - 12:00 PM   01:00 PM - 04:00 PM",
    regularTag: true,
    pwTag: true,
    otTag: false,
    hours: 4.5,
  },
];

export function EmployeeSchedule() {
  return (
    <div className="space-y-6">
      {scheduleData.map((day) => (
        <div key={day.day} className="flex items-start  gap-4">
          <div className="min-w-[70px] bg-[#E279321A] flex flex-col items-center p-2 rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase">MAR</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {day.date.toString().padStart(2, "0")}
            </p>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {day.day}
            </h3>

            {day.isDayOff ? (
              <p className="text-sm text-gray-600">Day Off</p>
            ) : (
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                    {day.timeRange}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {day.regularTag && (
                    <span className="px-4 py-2 bg-[#2196F333] text-[#2196F3] text-xs rounded ">
                      Regular
                    </span>
                  )}
                  {day.pwTag && (
                    <span className="px-4 py-2 bg-[#52C41A33] text-[#52C41A] text-xs rounded ">
                      PW
                    </span>
                  )}
                  {day.otTag && (
                    <span className="px-4 py-2 bg-[#FAAD1433] text-[#52C41A] text-xs rounded ">
                      OT
                    </span>
                  )}
                  <span className="text-sm font-normal text-gray-900 ml-1">
                    {day.hours} hrs
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
