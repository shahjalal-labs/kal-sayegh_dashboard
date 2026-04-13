import baseApi from "./baseApi";

const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOffice: builder.mutation({
      query: (data) => ({
        url: "/job-request/office-create",
        method: "POST",
        body: data,
      }),
    }),

    createJobRequest: builder.mutation({
      query: (formData) => ({
        url: "/job-request/create-job-request",
        method: "POST",
        body: formData,
      }),
    }),

    getOffices: builder.query({
      query: () => ({
        url: "/job-request/office",
        method: "GET",
      }),
    }),

    getAllJobRequests: builder.query({
      query: () => ({
        url: "/job-request/all",
        method: "GET",
      }),
    }),

    updateJobRequest: builder.mutation({
      query: ({ jobRequestId, data }) => ({
        url: `/job-request/update-job-request/${jobRequestId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["jobs"],
    }),

    getJobRequestDetails: builder.query({
      query: (jobRequestId) => ({
        url: `/job-request/details/${jobRequestId}`,
        method: "GET",
      }),
      providesTags: ["jobs"],
    }),
  }),
});

export const {
  useCreateOfficeMutation,
  useUpdateJobRequestMutation,
  useGetOfficesQuery,
  useCreateJobRequestMutation,
  useGetAllJobRequestsQuery,
  useGetJobRequestDetailsQuery,
} = jobApi;
