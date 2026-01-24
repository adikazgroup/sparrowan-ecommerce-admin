import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const bannersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get banners list (GET) - Admin
    getBannerList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/banners${params}`,
        };
      },
      providesTags: ["banners"],
    }),

    // Get single banner (GET) - Admin
    getSingleBanner: builder.query({
      query: (id) => ({
        url: `/admin/banners/${id}`,
      }),
      providesTags: ["banners"],
    }),

    // Create banner (POST) - Admin
    createBanner: builder.mutation({
      query: (data) => ({
        url: "/admin/banners",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["banners"],
    }),

    // Update banner (PATCH) - Admin
    updateBanner: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/banners/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["banners"],
    }),

    // Delete banner (DELETE) - Admin
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/admin/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["banners"],
    }),
  }),
});

export const {
  useGetBannerListQuery,
  useGetSingleBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannersApiSlice;
