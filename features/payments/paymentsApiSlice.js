import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const paymentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentList: builder.query({
      query: (data) => ({ url: `/admin/payments${buildQueryParams(data)}` }),
      providesTags: ["payments"],
    }),
    getSinglePayment: builder.query({
      query: (id) => ({ url: `/admin/payments/${id}` }),
      providesTags: ["payments"],
    }),
    getPaymentByOrder: builder.query({
      query: (orderId) => ({ url: `/admin/payments/order/${orderId}` }),
      providesTags: ["payments"],
    }),
    processRefund: builder.mutation({
      query: ({ id, reason, refundAmount }) => ({
        url: `/admin/payments/${id}/refund`,
        method: "POST",
        body: { reason, refundAmount },
      }),
      invalidatesTags: ["payments", "orders"],
    }),
    markCODCollected: builder.mutation({
      query: (id) => ({
        url: `/admin/payments/${id}/cod-collected`,
        method: "PATCH",
      }),
      invalidatesTags: ["payments", "orders"],
    }),
  }),
});

export const {
  useGetPaymentListQuery,
  useGetSinglePaymentQuery,
  useGetPaymentByOrderQuery,
  useProcessRefundMutation,
  useMarkCODCollectedMutation,
} = paymentsApiSlice;
