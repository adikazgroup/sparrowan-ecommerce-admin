import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const subscriptionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all subscriptions list (GET)
    getSubscriptionList: builder.query({
      query: (data) => {
        const queryParams = buildQueryParams(data);
        return { url: `/subscription${queryParams}` };
      },
    }),

    // ✅ Get single subscription (GET)
    getSingleSubscription: builder.query({
      query: (id) => ({
        url: `/subscription/${id}`,
      }),
    }),
  }),
});

// ✅ Export hooks
export const { useGetSubscriptionListQuery, useGetSingleSubscriptionQuery } =
  subscriptionApiSlice;
