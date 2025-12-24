import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const couponApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create coupon (POST)
    createCoupon: builder.mutation({
      query: (data) => ({
        url: `/coupon`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["coupons"],
    }),

    // Get coupon list (GET)
    getCouponList: builder.query({
      query: (params) => {
        const queryString = buildQueryParams(params);
        return {
          url: `/coupon${queryString}`,
        };
      },
      providesTags: ["coupons"],
    }),

    // Update coupon (PATCH)
    updateCoupon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/coupon/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["coupons"],
    }),

    // Delete coupon (DELETE)
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupons"],
    }),
  }),
});

// Export hooks
export const {
  useCreateCouponMutation,
  useGetCouponListQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApiSlice;
