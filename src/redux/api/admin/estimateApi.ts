import baseApi from "../baseApi";

const estimateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation({
      query: (data) => ({
        url: "/estimate/create-client",
        method: "POST",
        body: data,
      }),
    }),
    getMyClients: builder.query({
      query: () => ({
        url: "/estimate/my-clients",
        method: "GET",
      }),
      providesTags: ["estimate"],
    }),

    createEstimate: builder.mutation({
      query: (formData) => ({
        url: "/estimate/create-estimate",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["estimate"],
    }),

    createItem: builder.mutation({
      query: (body) => ({
        url: "/estimate/create-item",
        method: "POST",
        body,
      }),
      invalidatesTags: ["estimate"],
    }),

    createTax: builder.mutation({
      query: (body) => ({
        url: "/estimate/create-tax",
        method: "POST",
        body,
      }),
      invalidatesTags: ["estimate"],
    }),

    createMarkup: builder.mutation({
      query: (body) => ({
        url: "/estimate/create-markup",
        method: "POST",
        body,
      }),
    }),

    getAllItems: builder.query({
      query: () => ({
        url: "/estimate/all-items",
        method: "GET",
      }),
      providesTags: ["estimate"],
    }),

    getAllTaxes: builder.query({
      query: () => ({
        url: "/estimate/all-taxes",
        method: "GET",
      }),
      providesTags: ["estimate"],
    }),

    getAllMarkups: builder.query<any, void>({
      query: () => ({
        url: "/estimate/all-markups",
        method: "GET",
      }),
    }),

    getEstimateById: builder.query({
      query: (estimateId: string) => ({
        url: `/estimate/estimate/${estimateId}`,
        method: "GET",
      }),
      providesTags: ["estimate"],
    }),

    getAllEstimates: builder.query({
      query: ({ limit, page, searchTerm }) => "/estimate/all-estimates",
      providesTags: ["estimate"],
    }),

    getAllEstimators: builder.query({
      query: ({ page = 1, limit = 20, searchTerm = "" }) => ({
        url: "/admin/estimator/all",
        method: "GET",
        params: {
          page,
          limit,
          searchTerm,
        },
      }),
    }),

    getAllOfficeAdministrator: builder.query({
      query: ({ page = 1, limit = 20, searchTerm = "" }) => ({
        url: "/admin/office-admin/all",
        method: "GET",
        params: {
          page,
          limit,
          searchTerm,
        },
      }),
    }),

    sendEstimateMail: builder.mutation({
      query: ({ estimateId, body }) => ({
        url: `/estimate/send-email/${estimateId}`,
        method: "POST",
        body,
      }),
    }),

    updateEstimateStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/estimate/update-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["estimate"],
    }),

    editEstimate: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/estimate/edit-estimate/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["estimate"],
    }),

    updateEstimateSignature: builder.mutation({
      query: ({
        estimateId,
        signedName,
        emailStatus,
      }: {
        estimateId: string;
        signedName?: string;
        emailStatus?: string;
      }) => ({
        url: `/estimate/update-email-sign/${estimateId}`,
        method: "PATCH",
        body: {
          ...(signedName ? { signedName } : {}),
          emailStatus: emailStatus || "READ",
        },
      }),
    }),
  }),
});

export const {
  useCreateClientMutation,
  useGetMyClientsQuery,
  useCreateEstimateMutation,
  useCreateItemMutation,
  useGetAllItemsQuery,
  useCreateTaxMutation,
  useGetAllTaxesQuery,
  useCreateMarkupMutation,
  useGetAllMarkupsQuery,
  useGetEstimateByIdQuery,
  useGetAllEstimatesQuery,
  useGetAllEstimatorsQuery,
  useGetAllOfficeAdministratorQuery,
  useSendEstimateMailMutation,
  useUpdateEstimateStatusMutation,
  useEditEstimateMutation,
  useUpdateEstimateSignatureMutation,
} = estimateApi;
