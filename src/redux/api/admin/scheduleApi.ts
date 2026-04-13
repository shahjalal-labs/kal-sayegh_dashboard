import baseApi from "../baseApi";

const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSchedule: builder.mutation({
      query: (data) => ({
        url: "/schedule/create",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useCreateScheduleMutation } = scheduleApi;
