import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const brandsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get brand list (GET) - Admin
    getBrandList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/brands${params}`,
        };
      },
      providesTags: ["brands"],
    }),

    // Get brands id-name list (GET) - Admin
    getBrandsIdName: builder.query({
      query: () => ({
        url: "/admin/brands/id-name",
      }),
      providesTags: ["brands"],
    }),

    // Get single brand (GET) - Admin
    getSingleBrand: builder.query({
      query: (id) => ({
        url: `/admin/brands/${id}`,
      }),
      providesTags: ["brands"],
    }),

    // Create brand (POST) - Admin
    createBrand: builder.mutation({
      query: (brandData) => ({
        url: "/admin/brands",
        method: "POST",
        body: brandData,
      }),
      invalidatesTags: ["brands"],
    }),

    // Update brand (PATCH) - Admin
    updateBrand: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/brands/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["brands"],
    }),

    // Delete brand (DELETE) - Admin
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/admin/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["brands"],
    }),
  }),
});

export const {
  useGetBrandListQuery,
  useGetBrandsIdNameQuery,
  useGetSingleBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApiSlice;
