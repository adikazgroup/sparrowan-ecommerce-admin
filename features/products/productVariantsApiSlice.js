import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const productVariantsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductVariantList: builder.query({
      query: (data) => ({
        url: `/admin/product-variants${buildQueryParams(data)}`,
      }),
      providesTags: ["productVariants"],
    }),
    getVariantsByProduct: builder.query({
      query: (productId) => ({
        url: `/admin/product-variants/product/${productId}`,
      }),
      providesTags: ["productVariants"],
    }),
    getSingleProductVariant: builder.query({
      query: (id) => ({ url: `/admin/product-variants/${id}` }),
      providesTags: ["productVariants"],
    }),
    createProductVariant: builder.mutation({
      query: (data) => ({
        url: "/admin/product-variants",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["productVariants"],
    }),
    updateProductVariant: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/product-variants/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["productVariants"],
    }),
    deleteProductVariant: builder.mutation({
      query: (id) => ({
        url: `/admin/product-variants/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productVariants"],
    }),
  }),
});

export const {
  useGetProductVariantListQuery,
  useGetVariantsByProductQuery,
  useGetSingleProductVariantQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productVariantsApiSlice;
