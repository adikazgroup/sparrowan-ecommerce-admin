import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrderList: builder.query({
      query: (data) => ({ url: `/admin/orders${buildQueryParams(data)}` }),
      providesTags: ["orders"],
    }),
    getSingleOrder: builder.query({
      query: (id) => ({ url: `/admin/orders/${id}` }),
      providesTags: ["orders"],
    }),
    getOrderStats: builder.query({
      query: () => ({ url: `/admin/orders/stats` }),
      providesTags: ["orders"],
    }),
    getOrderIdAndNumberList: builder.query({
      query: () => ({ url: `/admin/orders/id-and-number-list` }),
      providesTags: ["orders"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: ["orders"],
    }),
    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/orders/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["orders"],
    }),
    processReturn: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/return`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["orders"],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({ url: `/admin/orders/${id}`, method: "DELETE" }),
      invalidatesTags: ["orders"],
    }),
  }),
});

export const {
  useGetOrderListQuery,
  useGetSingleOrderQuery,
  useGetOrderStatsQuery,
  useGetOrderIdAndNumberListQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useProcessReturnMutation,
  useDeleteOrderMutation,
} = ordersApiSlice;
