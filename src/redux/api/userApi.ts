import { IResponse } from "@/types/common.type";
import { CreateUserPayload, IUser } from "@/types/user.Type";
import baseApi from "./baseApi";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation<IResponse<IUser>, CreateUserPayload>({
      query: (data) => ({
        url: "/user/create",
        method: "POST",
        body: data,
      }),
    }),

    getAllUsers: builder.query({
      query: () => ({
        url: "/users/all",
        method: "GET",
      }),
      providesTags: ["user"],
    }),
  }),
});

export const { useCreateUserMutation, useGetAllUsersQuery } = userApi;
