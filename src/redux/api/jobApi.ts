import baseApi from "./baseApi";

const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOffice: builder.mutation({
      query: (data) => ({
        url: "/job-request/office-create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["offices"],
    }),

    createJobRequest: builder.mutation({
      query: (formData) => ({
        url: "/job-request/create-job-request",
        method: "POST",
        body: formData,
      }),
    }),

    jobRequestByImage: builder.mutation({
      query: (formData) => ({
        url: "/job-request/create-job-request-by-image",
        method: "POST",
        body: formData,
      }),
    }),

    getOffices: builder.query({
      query: () => ({
        url: "/job-request/office",
        method: "GET",
      }),
      providesTags: ["offices"],
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

    officeDelete: builder.mutation({
      query: (officeId) => ({
        url: `/job-request/office-delete/${officeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["jobs", "offices"],
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
  useJobRequestByImageMutation,
  useOfficeDeleteMutation,
} = jobApi;
