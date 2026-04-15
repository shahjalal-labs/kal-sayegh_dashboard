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
} = estimateApi;
