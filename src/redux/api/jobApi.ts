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
  }),
});

export const {
  useCreateOfficeMutation,
  useGetOfficesQuery,
  useCreateJobRequestMutation,
} = jobApi;
