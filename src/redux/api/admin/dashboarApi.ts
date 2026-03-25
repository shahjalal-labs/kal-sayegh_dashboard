/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import baseApi from "../baseApi";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query({
      query: (type) => ({
        url: `/order/admin-overview?type=${type}`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),

    getDashboardOverviewUser: builder.query({
      query: (type) => ({
        url: `/order/admin-overview/users?type=${type}`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),

    myProfile: builder.query({
      query: () => ({
        url: `/auth/profile`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: `/auth/set-profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["dashboard"],
    }),

    getAllUserList: builder.query({
      query: ({ page, limit, searchTerm, profession }) => {
        const params: Record<string, any> = {};

        if (searchTerm) params.searchTerm = searchTerm;
        if (profession) params.profession = profession;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        return {
          url: `/users`,
          method: "GET",
          params,
        };
      },
      providesTags: ["dashboard"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["dashboard"],
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/send-otp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["dashboard"],
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: `/auth/verify-otp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["dashboard"],
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["dashboard"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: `/auth/change-password`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["dashboard"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetDashboardOverviewUserQuery,
  useMyProfileQuery,
  useUpdateProfileMutation,
  useGetAllUserListQuery,
  useDeleteUserMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = dashboardApi;
