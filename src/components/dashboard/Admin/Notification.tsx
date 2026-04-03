"use client";

import { Bell, Clock, CreditCard, Eye, User } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "clock_in" | "late_clock" | "estimate" | "payment";
  location?: string;
  amount?: string;
}

export default function Notification() {
  const notifications = {
    today: [
      {
        id: "1",
        title: "John Smith clocked in",
        description:
          "Clocked in at 8:05 AM for Regular Hours. Location: Office.",
        time: "10 mins ago",
        type: "clock_in" as const,
        location: "Office",
      },
      {
        id: "2",
        title: "Late Clock-in Detected",
        description: "Karim Sheikh clocked in 15 mins late for Job Site shift.",
        time: "1 hour ago",
        type: "late_clock" as const,
        location: "Job Site",
      },
    ],
    yesterday: [
      {
        id: "3",
        title: "Estimate #1024 Viewed",
        description: "Customer (Emily Brown) viewed the estimate you sent.",
        time: "30 mins ago",
        type: "estimate" as const,
      },
      {
        id: "4",
        title: "Invoice #905 Paid",
        description: "Payment of $2,500 received from John Smith.",
        time: "3 hours ago",
        type: "payment" as const,
        amount: "$2,500",
      },
    ],
  };

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

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto p-4">
        {notifications.today.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold  uppercase tracking-wide px-4 mb-3">
              Today
            </h2>
            <div className="space-y-5">
              {notifications.today.map((notification) => {
                return (
                  <div
                    key={notification.id}
                    className="bg-[#E279320D] hover:bg-[#a843000d] rounded-2xl p-4  transition-colors cursor-pointer border border-gray-100"
                  >
                    <div className="flex gap-3">
                      <div
                        className={` rounded-full p-2 h-16 w-16 flex items-center justify-center bg-primary text-secondary`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start  gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {notification.description}
                            </p>

                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {notifications.yesterday.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide px-4 mb-3">
              Yesterday
            </h2>
            <div className="space-y-5">
              {notifications.yesterday.map((notification) => {
                return (
                  <div
                    key={notification.id}
                    className="rounded-2xl p-4 bg-[#E279320D] hover:bg-[#a843000d]  transition-colors cursor-pointer border border-gray-100"
                  >
                    <div className="flex gap-3">
                      <div
                        className={` rounded-full p-2 h-16 w-16 flex items-center justify-center bg-primary text-secondary`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {notification.description}
                            </p>

                            <div className="mt-2">
                              <span className="inline-flex items-center">
                                <div className="flex items-center gap-1 mt-2">
                                  <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {notification.time}
                                  </span>
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {notifications.today.length === 0 &&
          notifications.yesterday.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No notifications
              </h3>
              <p className="text-sm text-gray-500">
                You&apos;re all caught up!
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
