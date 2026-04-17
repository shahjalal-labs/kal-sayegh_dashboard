import baseApi from "../baseApi";

const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: (formData) => ({
        url: "/invoice/create",
        method: "POST",
        body: formData,
      }),
    }),

    getAllInvoice: builder.query({
      query: ({ limit, page, searchTerm }) => ({
        url: "/invoice/all-invoices",
        method: "GET",
        params: {
          limit,
          page,
          searchTerm,
        },
      }),
      providesTags: ["estimate"],
    }),
  }),
});

export const { useCreateInvoiceMutation, useGetAllInvoiceQuery } = invoiceApi;
