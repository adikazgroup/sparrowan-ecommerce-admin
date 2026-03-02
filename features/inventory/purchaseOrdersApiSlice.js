import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const purchaseOrdersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: (data) => ({
        url: `/admin/purchase-orders${buildQueryParams(data)}`,
      }),
      providesTags: ["purchaseOrders"],
    }),
    getSinglePurchaseOrder: builder.query({
      query: (id) => ({ url: `/admin/purchase-orders/${id}` }),
      providesTags: ["purchaseOrders"],
    }),
    createPurchaseOrder: builder.mutation({
      query: (data) => ({
        url: "/admin/purchase-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["purchaseOrders"],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/purchase-orders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["purchaseOrders"],
    }),
    confirmPurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/purchase-orders/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: ["purchaseOrders"],
    }),
    receivePurchaseOrderItems: builder.mutation({
      query: (id) => ({
        url: `/admin/purchase-orders/${id}/receive`,
        method: "PATCH",
      }),
      invalidatesTags: [
        "purchaseOrders",
        "products",
        "productVariants",
        "stockLogs",
        "inventoryBatches",
      ],
    }),
    cancelPurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/purchase-orders/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["purchaseOrders"],
    }),
    deletePurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/purchase-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchaseOrders"],
    }),
    recordPurchaseOrderPayment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/purchase-orders/${id}/payment`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["purchaseOrders"],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetSinglePurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useConfirmPurchaseOrderMutation,
  useReceivePurchaseOrderItemsMutation,
  useCancelPurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useRecordPurchaseOrderPaymentMutation,
} = purchaseOrdersApiSlice;
