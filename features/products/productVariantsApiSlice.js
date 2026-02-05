import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

/**
 * ProductVariant API Slice
 * NOTE: Variants are created/updated/deleted through Product API
 * These endpoints are for READ-ONLY operations (used in Purchase Orders)
 */

const productVariantsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const { useGetVariantsByProductQuery, useGetSingleProductVariantQuery } =
  productVariantsApiSlice;
