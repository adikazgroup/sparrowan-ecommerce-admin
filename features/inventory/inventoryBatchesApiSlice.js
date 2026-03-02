import { apiSlice } from "../api/apiSlice";

const inventoryBatchesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBatchesByVariant: builder.query({
      query: (variantId) => ({
        url: `/admin/inventory-batches/variant/${variantId}`,
      }),
      providesTags: ["inventoryBatches"],
    }),
    getSingleInventoryBatch: builder.query({
      query: (id) => ({ url: `/admin/inventory-batches/${id}` }),
      providesTags: ["inventoryBatches"],
    }),
  }),
});

export const { useGetBatchesByVariantQuery, useGetSingleInventoryBatchQuery } =
  inventoryBatchesApiSlice;
