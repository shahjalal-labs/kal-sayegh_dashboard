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
  }),
});

export const { useGetMyNotificationsQuery } = notificationApi;
