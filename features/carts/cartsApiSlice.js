import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const cartsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCartList: builder.query({
      query: (data) => ({ url: `/admin/carts${buildQueryParams(data)}` }),
      providesTags: ["carts"],
    }),
    getSingleCart: builder.query({
      query: (id) => ({ url: `/admin/carts/${id}` }),
      providesTags: ["carts"],
    }),
  }),
});

export const { useGetCartListQuery, useGetSingleCartQuery } = cartsApiSlice;
