import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const networkApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all networks (GET)
    getNetworks: builder.query({
      query: (data) => {
        const queryParams = buildQueryParams(data);
        return { url: `/network/admin${queryParams}` };
      },
      providesTags: ["network"],
    }),

    // Get network by ID (GET)
    getNetworkById: builder.query({
      query: (id) => `/network/admin/${id}`,
      providesTags: ["network"],
    }),

    // Update network (PUT)
    updateNetwork: builder.mutation({
      query: ({ networkId, data }) => ({
        url: `/network/${networkId}/admin`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["network"],
    }),

    // Delete network (DELETE)
    deleteNetwork: builder.mutation({
      query: (networkId) => ({
        url: `/network/${networkId}/admin`,
        method: "DELETE",
      }),
      invalidatesTags: ["network"],
    }),

    // Create network (POST)
    createNetwork: builder.mutation({
      query: (data) => ({
        url: `/network/admin`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["network"],
    }),
  }),
});

// Export hooks
export const {
  useGetNetworksQuery,
  useCreateNetworkMutation,
  useDeleteNetworkMutation,
  useUpdateNetworkMutation,
} = networkApiSlice;
