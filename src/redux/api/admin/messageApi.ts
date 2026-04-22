import baseApi from "../baseApi";

const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createGroup: builder.mutation({
      query: (data) => ({
        url: "/group/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["messages"],
    }),

    inviteGroup: builder.mutation({
      query: ({ groupId, memberIds }) => ({
        url: `/group/invite-group/${groupId}`,
        method: "POST",
        body: { memberIds },
      }),
      invalidatesTags: ["messages"],
    }),

    generateUrl: builder.mutation({
      query: (data) => ({
        url: "/message/generate-urls",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["messages"],
    }),
  }),
});

export const { useCreateGroupMutation, useInviteGroupMutation, useGenerateUrlMutation } = messageApi;
