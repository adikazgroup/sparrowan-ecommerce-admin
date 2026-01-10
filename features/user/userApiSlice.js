import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user list (GET)
    getUserList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/users${params}`,
        };
      },
      providesTags: ["users"],
    }),

    // Get user profile (GET)
    getProfile: builder.query({
      query: () => ({
        url: "/users/me",
      }),
      providesTags: ["user"],
    }),

    // Create user (POST)
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/admin/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["users", "user"],
    }),

    // Update user (PATCH)
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["users", "user"],
    }),

    // Delete user (DELETE)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

// Export hooks for using the defined API endpoints
export const {
  useGetUserListQuery,
  useCreateUserMutation,
  useGetProfileQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
