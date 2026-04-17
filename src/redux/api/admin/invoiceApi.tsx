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
  }),
});

export const { useCreateInvoiceMutation } = invoiceApi;
