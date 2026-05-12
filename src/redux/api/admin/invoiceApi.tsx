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
        payload:
          | string
          | {
              invoiceId: string;
              data?: {
                message: string;
                sendMeCopy: boolean;
                subject: string;
                to: string[];
              };
            },
      ) => {
        const invoiceId =
          typeof payload === "string" ? payload : payload.invoiceId;
        const data = typeof payload === "string" ? undefined : payload.data;

        return {
          url: `/invoice/send-email/${invoiceId}`,
          method: "POST",
          body: data,
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
