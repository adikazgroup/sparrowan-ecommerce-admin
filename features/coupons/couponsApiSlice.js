import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const couponsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get coupons list (GET) - Admin
    getCouponList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/coupons${params}`,
        };
      },
      providesTags: ["coupons"],
    }),

    // Get single coupon (GET) - Admin
    getSingleCoupon: builder.query({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
      }),
      providesTags: ["coupons"],
    }),

    // Create coupon (POST) - Admin
    createCoupon: builder.mutation({
      query: (data) => ({
        url: "/admin/coupons",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["coupons"],
    }),

    // Update coupon (PATCH) - Admin
    updateCoupon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/coupons/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["coupons"],
    }),

    // Delete coupon (DELETE) - Admin
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupons"],
    }),
  }),
});

export const {
  useGetCouponListQuery,
  useGetSingleCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApiSlice;
