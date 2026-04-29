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

    getInvoicePayments: builder.query({
      query: (invoiceId) => ({
        url: `/invoice/payments/${invoiceId}`,
        method: "GET",
      }),
    }),

    sendReminderEmail: builder.mutation({
      query: (payload) => {
        const normalizedPayload =
          payload && typeof payload === "object"
            ? payload
            : { invoiceId: payload };

        const rawInvoiceId =
          normalizedPayload.invoiceId ??
          normalizedPayload.id ??
          normalizedPayload._id;

        const invoiceId =
          typeof rawInvoiceId === "string" || typeof rawInvoiceId === "number"
            ? String(rawInvoiceId)
            : String(rawInvoiceId?.id ?? rawInvoiceId?._id ?? "");

        const {
          invoiceId: _invoiceId,
          id: _id,
          _id: _rawId,
          ...body
        } = normalizedPayload;

        return {
          url: `/invoice/send-email/${invoiceId}`,
          method: "POST",
          body,
        };
      },
    }),

    getInvoiceDetails: builder.query({
      query: (invoiceId) => ({
        url: `/invoice/details/${invoiceId}`,
        method: "GET",
      }),
    }),

    invoiceManualPayment: builder.mutation({
      query: ({ invoiceId, payload }) => ({
        url: `/invoice/record-payment/${invoiceId}`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetAllInvoiceQuery,
  useGetInvoiceByIdQuery,
  useSendInvoiceMailMutation,
  useGetInvoicePaymentsQuery,
  useSendReminderEmailMutation,
  useGetInvoiceDetailsQuery,
  useInvoiceManualPaymentMutation,
} = invoiceApi;
