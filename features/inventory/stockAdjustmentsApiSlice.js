import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const stockAdjustmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockAdjustmentList: builder.query({
      query: (data) => ({
        url: `/admin/stock-adjustments${buildQueryParams(data)}`,
      }),
      providesTags: ["stockAdjustments"],
    }),
    getSingleStockAdjustment: builder.query({
      query: (id) => ({ url: `/admin/stock-adjustments/${id}` }),
      providesTags: ["stockAdjustments"],
    }),
    createStockAdjustment: builder.mutation({
      query: (data) => ({
        url: "/admin/stock-adjustments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stockAdjustments"],
    }),
    approveStockAdjustment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/stock-adjustments/${id}/approve`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["stockAdjustments"],
    }),
    deleteStockAdjustment: builder.mutation({
      query: (id) => ({
        url: `/admin/stock-adjustments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["stockAdjustments"],
    }),
  }),
});

export const {
  useGetStockAdjustmentListQuery,
  useGetSingleStockAdjustmentQuery,
  useCreateStockAdjustmentMutation,
  useApproveStockAdjustmentMutation,
  useDeleteStockAdjustmentMutation,
} = stockAdjustmentsApiSlice;
