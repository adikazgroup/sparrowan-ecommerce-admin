import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const newsletterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get subscribers list (GET) - Admin
    getSubscriberList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/newsletters${params}`,
        };
      },
      providesTags: ["newsletter"],
    }),

    // Get single subscriber (GET) - Admin
    getSingleSubscriber: builder.query({
      query: (id) => ({
        url: `/admin/newsletters/${id}`,
      }),
      providesTags: ["newsletter"],
    }),

    // Update subscriber status (PATCH) - Admin
    updateSubscriberStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/newsletters/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["newsletter"],
    }),

    // Delete subscriber (DELETE) - Admin
    deleteSubscriber: builder.mutation({
      query: (id) => ({
        url: `/admin/newsletters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["newsletter"],
    }),
  }),
});

export const {
  useGetSubscriberListQuery,
  useGetSingleSubscriberQuery,
  useUpdateSubscriberStatusMutation,
  useDeleteSubscriberMutation,
} = newsletterApiSlice;
