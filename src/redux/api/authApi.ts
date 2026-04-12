import { IResponse } from "@/types/common.type";
import { IUser } from "@/types/user.Type";
import baseApi from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      IResponse<IUser>,
      { email: string; password: string }
    >({
      query: (data) => ({
        url: `/auth/login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["auth"],
    }),

    myProfile: builder.query({
      query: () => ({
        url: `/auth/profile`,
        method: "GET",
      }),
      providesTags: ["auth"],
    }),

    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: "/auth/send-forgot-otp",
        method: "POST",
        body: { email },
      }),
    }),

    verifyOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/auth/verify-forgot-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),

    resetPassword: builder.mutation({
      query: (data: { newPassword: string }) => ({
        url: "/auth/reset-password",
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
  }),
});

export const {
  useLoginMutation,
  useMyProfileQuery,
  useForgotPasswordMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
} = authApi;
