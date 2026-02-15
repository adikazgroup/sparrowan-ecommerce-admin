import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const transactionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactionList: builder.query({
      query: (data) => ({
        url: `/admin/transactions${buildQueryParams(data)}`,
      }),
      providesTags: ["transactions"],
    }),
    getSingleTransaction: builder.query({
      query: (id) => ({ url: `/admin/transactions/${id}` }),
      providesTags: ["transactions"],
    }),
    getTransactionByOrder: builder.query({
      query: (orderId) => ({
        url: `/admin/transactions/order/${orderId}`,
      }),
      providesTags: ["transactions"],
    }),
    processRefund: builder.mutation({
      query: ({ id, reason, refundAmount }) => ({
        url: `/admin/transactions/${id}/refund`,
        method: "POST",
        body: { reason, refundAmount },
      }),
      invalidatesTags: ["transactions", "orders"],
    }),
    markCODCollected: builder.mutation({
      query: (id) => ({
        url: `/admin/transactions/${id}/cod-collected`,
        method: "PATCH",
      }),
      invalidatesTags: ["transactions", "orders"],
    }),
  }),
});

export const {
  useGetTransactionListQuery,
  useGetSingleTransactionQuery,
  useGetTransactionByOrderQuery,
  useProcessRefundMutation,
  useMarkCODCollectedMutation,
} = transactionsApiSlice;
