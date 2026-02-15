import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const shipmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShipmentList: builder.query({
      query: (data) => ({
        url: `/admin/shipments${buildQueryParams(data)}`,
      }),
      providesTags: ["shipments"],
    }),
    getSingleShipment: builder.query({
      query: (id) => ({ url: `/admin/shipments/${id}` }),
      providesTags: ["shipments"],
    }),
    getShipmentByOrder: builder.query({
      query: (orderId) => ({
        url: `/admin/shipments/order/${orderId}`,
      }),
      providesTags: ["shipments"],
    }),
    createShipment: builder.mutation({
      query: (body) => ({
        url: "/admin/shipments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["shipments", "orders"],
    }),
    updateTrackingStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/shipments/${id}/tracking`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["shipments", "orders"],
    }),
    // Pathao helpers
    getPathaoStores: builder.query({
      query: () => ({ url: "/admin/shipments/pathao/stores" }),
    }),
    getPathaoCities: builder.query({
      query: () => ({ url: "/admin/shipments/pathao/cities" }),
    }),
    getPathaoZones: builder.query({
      query: (cityId) => ({
        url: `/admin/shipments/pathao/zones/${cityId}`,
      }),
    }),
    getPathaoAreas: builder.query({
      query: (zoneId) => ({
        url: `/admin/shipments/pathao/areas/${zoneId}`,
      }),
    }),
  }),
});

export const {
  useGetShipmentListQuery,
  useGetSingleShipmentQuery,
  useGetShipmentByOrderQuery,
  useCreateShipmentMutation,
  useUpdateTrackingStatusMutation,
  useGetPathaoStoresQuery,
  useGetPathaoCitiesQuery,
  useGetPathaoZonesQuery,
  useGetPathaoAreasQuery,
} = shipmentsApiSlice;
