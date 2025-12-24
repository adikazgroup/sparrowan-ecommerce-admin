const { apiSlice } = require("../api/apiSlice");

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST : Login User
    loginUser: builder.mutation({
      query: (data) => ({
        url: `/auth/login`,
        method: "POST",
        body: data,
      }),
    }),

    // POST : Forgot Password
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password-request`,
        method: "POST",
        body: data,
      }),
    }),

    // POST : Reset Password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password-confirm`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApiSlice;
