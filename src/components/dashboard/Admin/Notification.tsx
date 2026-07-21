"use client";

import {
  useGetMyNotificationsQuery,
  useReadAllNotificationsMutation,
} from "@/redux/api/admin/notificationApi";
import { formatDistanceToNow } from "date-fns";
import { Bell, Clock, CreditCard, Eye, User } from "lucide-react";
import { ColorRing } from "react-loader-spinner";

export default function Notification() {
  const { data, isLoading, error } = useGetMyNotificationsQuery({});

  const [readAllNotifications] = useReadAllNotificationsMutation();

  const handleReadAllNotifications = async () => {
    await readAllNotifications({ isRead: true });
  };

  // use date-fns for human-readable relative times
  // e.g. "5 minutes ago", "2 months ago"
  // formatDistanceToNow returns phrases like "about 1 hour" so add suffix
  const getRelativeTime = (date: Date) =>
    formatDistanceToNow(date, { addSuffix: true });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "clock_in":
        return <User className="w-5 h-5" />;
      case "late_clock":
        return <Clock className="w-5 h-5" />;
      case "estimate":
        return <Eye className="w-5 h-5" />;
      case "payment":
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const groupNotificationsByDay = (notifications: any[]) => {
    const grouped: Record<string, any[]> = {};

    notifications.forEach((item) => {
      const date = new Date(item.createdAt);

      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const formatted = {
        id: item.id,
        title: item.title,
        description: item.body,
        time: getRelativeTime(date),
        type: item.type,
        createdAt: item.createdAt,
        // normalize read flag from backend (support multiple possible field names)
        isRead: item.isRead ?? item.read ?? item.is_read ?? false,
      };

      if (!grouped[dayName]) {
        grouped[dayName] = [];
      }

      grouped[dayName].push(formatted);
    });

    return grouped;
  };

  const rawNotifications =
    data?.result?.data
      ?.slice()
      ?.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ) || [];

  const groupedNotifications = groupNotificationsByDay(rawNotifications);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <ColorRing
          visible={true}
          height="70"
          width="70"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </div>
    );

  const hasData = Object.keys(groupedNotifications).length > 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4">
        {hasData ? (
          Object.entries(groupedNotifications).map(([day, items]) => (
            <div key={day} className="">
              <div className="flex justify-between items-center py-3">
                <h2 className="text-xl font-semibold uppercase tracking-wide px-4 ">
                  {day}
                </h2>
                <button
                  type="button"
                  onClick={handleReadAllNotifications}
                  className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg"
                >
                  Read All
                </button>
              </div>

              <div className="space-y-5">
                {items.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`rounded-2xl p-4 transition-colors cursor-pointer border border-gray-100 ${
                      notification.isRead
                        ? "bg-secondary"
                        : "bg-[#E279320D] hover:bg-[#a843000d]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="rounded-full p-2 h-16 w-16 flex items-center justify-center bg-primary text-secondary">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-base">
                          {notification.title}
                        </p>
                        <p className="text-base text-gray-600 mt-0.5">
                          {notification.description}
                        </p>

                        <div className="mt-2">
                          <span className="text-base text-gray-400">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 ">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 " />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              No notifications
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
