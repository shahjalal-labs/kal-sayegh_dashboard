import baseApi from "../baseApi";

const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addContract: builder.mutation({
      query: (body) => ({
        url: `/contract/create-contract`,
        method: "POST",
        body,
      }),
    }),

    getAllContracts: builder.query({
      query: () => ({
        url: `/contract/all-contracts`,
        method: "GET",
      }),
    }),

    deleteContract: builder.mutation({
      query: (contractId) => ({
        url: `/contract/delete-contract/${contractId}`,
        method: "DELETE",
      }),
    }),

    updateContract: builder.mutation({
      query: ({ contractId, ...body }) => ({
        url: `/contract/update-contract/${contractId}`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useAddContractMutation,
  useGetAllContractsQuery,
  useDeleteContractMutation,
  useUpdateContractMutation,
} = contractApi;
