import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductList: builder.query({
      query: (data) => ({ url: `/admin/products${buildQueryParams(data)}` }),
      providesTags: ["products"],
    }),
    getProductsIdName: builder.query({
      query: () => ({ url: "/admin/products/id-name" }),
      providesTags: ["products"],
    }),
    getSingleProduct: builder.query({
      query: (id) => ({ url: `/admin/products/${id}` }),
      providesTags: ["products"],
    }),
    createProduct: builder.mutation({
      query: (data) => ({ url: "/admin/products", method: "POST", body: data }),
      invalidatesTags: ["products"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["products"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["products"],
    }),
  }),
});

export const {
  useGetProductListQuery,
  useGetProductsIdNameQuery,
  useGetSingleProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
