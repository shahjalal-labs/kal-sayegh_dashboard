import baseApi from "../baseApi";

const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: (formData) => ({
        url: "/invoice/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["invoice"],
    }),

    getAllInvoice: builder.query({
      query: ({ limit, page, searchTerm, status }) => ({
        url: "/invoice/all-invoices",
        method: "GET",
        params: {
          limit,
          page,
          searchTerm,
          ...(status && { status }),
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
      providesTags: ["invoice"],
    }),

    sendInvoiceMail: builder.mutation({
      query: ({ payload, invoiceId }) => ({
        url: `/invoice/send-email/${invoiceId}`,
        method: "POST",
        body: payload,
      }),
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

    refundPayment: builder.mutation({
      query: ({ paymentId, payload }) => ({
        url: `/invoice/refund-payment/${paymentId}`,
        method: "POST",
        body: payload,
      }),
    }),

    // Payment: builder.mutation({
    //   query: ({ invoiceId, payload }) => ({
    //     url: `/invoice/pay-with-stripe/${invoiceId}`,
    //     body: payload,
    //   }),
    // }),

    updateEmailStatus: builder.mutation({
      query: ({ invoiceId, payload }) => ({
        url: `/invoice/update-email-sign/${invoiceId}`,
        method: "POST",
        body: payload,
      }),
    }),

    publicInvoiceDetails: builder.query({
      query: (invoiceId) => ({
        url: `/invoice/public-invoice/${invoiceId}`,
        method: "GET",
      }),
    }),

    generateFromEstimate: builder.mutation({
      query: ({ estimateId }) => ({
        url: `/invoice/generate-from-estimate/${estimateId}`,
        method: "POST",
      }),
    }),

    paymentIntent: builder.mutation({
      query: ({ invoiceId }) => ({
        url: `/invoice/create-payment-intent/${invoiceId}`,
        method: "POST",
      }),
    }),

    updateInvoice: builder.mutation({
      query: ({ invoiceId, formData }) => ({
        url: `/invoice/update/${invoiceId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["invoice"],
    }),

    duplicateInvoice: builder.mutation({
      query: ({ invoiceId, formData }) => ({
        url: `/invoice/duplicate/${invoiceId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["invoice"],
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
  useRefundPaymentMutation,
  usePublicInvoiceDetailsQuery,

  useUpdateEmailStatusMutation,
  useGenerateFromEstimateMutation,
  usePaymentIntentMutation,
  useUpdateInvoiceMutation,
  useDuplicateInvoiceMutation,
} = invoiceApi;
