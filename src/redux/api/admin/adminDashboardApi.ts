import baseApi from "../baseApi";

const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: ({ page, limit }) => ({
        url: "/admin/employees",
        method: "GET",
        params: { page, limit },
      }),
    }),
  }),
});

export const { useGetEmployeesQuery } = adminDashboardApi;
