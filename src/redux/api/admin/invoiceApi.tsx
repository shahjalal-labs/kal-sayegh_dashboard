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

    getInvoiceById: builder.query({
      async queryFn(invoiceId: string, _api, _extraOptions, baseQuery) {
        const candidateUrls = [
          `/invoice/invoice/${invoiceId}`,
          `/invoice/${invoiceId}`,
          `/invoice/details/${invoiceId}`,
          `/invoice/single-invoice/${invoiceId}`,
        ];

        for (const url of candidateUrls) {
          const result = await baseQuery({
            url,
            method: "GET",
          });

          if (!result.error) {
            return { data: result.data };
          }
        }

        return {
          error: {
            status: 404,
            data: { message: "Invoice details endpoint not found" },
          },
        };
      },
    }),

    sendInvoiceMail: builder.mutation({
      query: (
        payload: string | { invoiceId: string; recipientEmail?: string },
      ) => {
        const invoiceId =
          typeof payload === "string" ? payload : payload.invoiceId;
        const recipientEmail =
          typeof payload === "string" ? undefined : payload.recipientEmail;

        return {
          url: `/invoice/send-mail/${invoiceId}`,
          method: "POST",
          body: recipientEmail
            ? { email: recipientEmail, recipientEmail }
            : undefined,
        };
      },
    }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetAllInvoiceQuery,
  useGetInvoiceByIdQuery,
  useSendInvoiceMailMutation,
} = invoiceApi;
