import baseApi from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `/auth/admin-login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    myProfile: builder.query({
      query: () => ({
        url: `/auth/me`,
        method: "GET",
      }),
      providesTags: ["auth"],
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-pass",
        method: "PATCH",
        body: data,
      }),
    }),

    updateProfile: builder.mutation({
      query: (formData: FormData) => ({
        url: "/auth/update-profile",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["auth"],
    }),

    createTips: builder.mutation({
      query: (data) => ({
        url: "/auth/create-tips",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    allTips: builder.query({
      query: () => ({
        url: "/auth/all-tips",
        method: "GET",
      }),
      providesTags: ["auth"],
    }),

    createTrade: builder.mutation({
      query: (formData: FormData) => ({
        url: "/auth/create-trade",
        method: "POST",
        body: formData,
      }),
    }),

    allTrades: builder.query({
      query: ({ page, limit }) => ({
        url: "/auth/all-trades",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["auth"],
    }),

    getAllGallery: builder.query({
      query: () => ({
        url: "/auth/gallery-images",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useMyProfileQuery,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useCreateTipsMutation,
  useAllTipsQuery,
  useCreateTradeMutation,
  useAllTradesQuery,
  useGetAllGalleryQuery,
} = authApi;
