import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession, signOut } from "next-auth/react";

const BaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const baseQuery = fetchBaseQuery({
  baseUrl: BaseUrl,
  prepareHeaders: async (headers, { getState: _getState }) => {
    const session = await getSession();
    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result?.error?.data?.message === "jwt expired") {
    await signOut({ redirect: false });
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReAuth,
  tagTypes: ["network", "user", "auth", "admin"],
  endpoints: () => ({}),
  refetchOnReconnect: true,
});
