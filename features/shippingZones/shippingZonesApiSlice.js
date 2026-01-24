import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const shippingZonesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get shipping zones list (GET) - Admin
    getShippingZoneList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/shipping-zones${params}`,
        };
      },
      providesTags: ["shippingZones"],
    }),

    // Get single shipping zone (GET) - Admin
    getSingleShippingZone: builder.query({
      query: (id) => ({
        url: `/admin/shipping-zones/${id}`,
      }),
      providesTags: ["shippingZones"],
    }),

    // Create shipping zone (POST) - Admin
    createShippingZone: builder.mutation({
      query: (data) => ({
        url: "/admin/shipping-zones",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["shippingZones"],
    }),

    // Update shipping zone (PATCH) - Admin
    updateShippingZone: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/shipping-zones/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["shippingZones"],
    }),

    // Delete shipping zone (DELETE) - Admin
    deleteShippingZone: builder.mutation({
      query: (id) => ({
        url: `/admin/shipping-zones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["shippingZones"],
    }),
  }),
});

export const {
  useGetShippingZoneListQuery,
  useGetSingleShippingZoneQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
} = shippingZonesApiSlice;
