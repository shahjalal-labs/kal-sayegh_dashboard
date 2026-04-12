import baseApi from "../baseApi";

const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: ({ page, limit }) => ({
        url: "/admin/employees",
        method: "GET",
        params: { page, limit },
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
  }),
});

export const {
  useGetEmployeesQuery,
  useDeleteUserMutation,
  useGetSingleUserQuery,
  useUpdateUserMutation,
} = adminDashboardApi;
