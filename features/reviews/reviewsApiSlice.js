import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const reviewsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get reviews list (GET) - Admin
    getReviewList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/reviews${params}`,
        };
      },
      providesTags: ["reviews"],
    }),

    // Get single review (GET) - Admin
    getSingleReview: builder.query({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
      }),
      providesTags: ["reviews"],
    }),

    // Update review status (PATCH) - Admin
    updateReviewStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/reviews/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["reviews"],
    }),

    // Delete review (DELETE) - Admin
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["reviews"],
    }),
  }),
});

export const {
  useGetReviewListQuery,
  useGetSingleReviewQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} = reviewsApiSlice;
