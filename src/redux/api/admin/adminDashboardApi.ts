import baseApi from "../baseApi";

const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: ({ page = 1, limit = 20, searchTerm = "" }) => ({
        url: "/admin/employees",
        method: "GET",
        params: {
          page,
          limit,
          searchTerm,
          // Keep legacy key for backward compatibility if backend still reads `search`.
          search: searchTerm,
        },
      }),
      providesTags: ["user"],
    }),

    deleteUser: builder.mutation({
      query: (userId: string) => ({
        url: `/admin/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"],
    }),

    getSingleUser: builder.query({
      query: (userId: string) => ({
        url: `/admin/${userId}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    updateUser: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/admin/${userId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),

    getAdminOverview: builder.query({
      query: () => ({
        url: "/admin/overview",
        method: "GET",
      }),
    }),

    getHoursTrend: builder.query({
      query: (period = "daily") => ({
        url: "/admin/hours-trend",
        method: "GET",
        params: { period },
      }),
    }),

    getPendingUser: builder.query({
      query: ({ page = 1, limit = 20, searchTerm = "" }) => ({
        url: "/admin/pending-users/all",
        method: "GET",
        params: {
          page,
          limit,
          searchTerm,
        },
      }),
      providesTags: ["user"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetAdminOverviewQuery,
  useDeleteUserMutation,
  useGetSingleUserQuery,
  useUpdateUserMutation,
  useGetHoursTrendQuery,
  useGetPendingUserQuery,
} = adminDashboardApi;
