import baseApi from "../baseApi";

const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSchedule: builder.mutation({
      query: (data) => ({
        url: "/schedule/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["schedule"],
    }),

    getAllSchedules: builder.query({
      query: ({ month, year, search }) => ({
        url: "/schedule/all-schedules",
        method: "GET",
        params: {
          month,
          year,
          search,
        },
      }),
      providesTags: ["schedule"],
    }),

    updateSchedule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/schedule/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["schedule"],
    }),

    deleteSchedule: builder.mutation({
      query: (id) => ({
        url: `/schedule/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["schedule"],
    }),
  }),
});

export const {
  useCreateScheduleMutation,
  useGetAllSchedulesQuery,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi;
