import baseApi from "./baseApi";

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query({
      query: ({ page, limit }) => ({
        url: "/notify/my",
        method: "GET",
        params: {
          page,
          limit,
        },
      }),
      providesTags: ["notifications"],
    }),

    getMyNotificationCount: builder.query({
      query: () => ({
        url: "/notify/unread-count",
        method: "GET",
      }),
      providesTags: ["notifications"],
    }),

    readAllNotifications: builder.mutation({
      query: (body) => ({
        url: "/notify/mark-all",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["notifications"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetMyNotificationCountQuery,
  useReadAllNotificationsMutation,
} = notificationApi;
