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
  }),
});

export const { useCreateClientMutation } = estimateApi;
