import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const taxCategoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get tax category list (GET) - Admin
    getTaxCategoryList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/tax-categories${params}`,
        };
      },
      providesTags: ["taxCategories"],
    }),

    // Get tax categories id-name list (GET) - Admin
    getTaxCategoriesIdName: builder.query({
      query: () => ({
        url: "/admin/tax-categories/id-name",
      }),
      providesTags: ["taxCategories"],
    }),

    // Get single tax category (GET) - Admin
    getTaxCategoryById: builder.query({
      query: (id) => ({
        url: `/admin/tax-categories/${id}`,
      }),
      providesTags: ["taxCategory"],
    }),

    // Create tax category (POST) - Admin
    createTaxCategory: builder.mutation({
      query: (taxCategoryData) => ({
        url: "/admin/tax-categories",
        method: "POST",
        body: taxCategoryData,
      }),
      invalidatesTags: ["taxCategories"],
    }),

    // Update tax category (PATCH) - Admin
    updateTaxCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/tax-categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["taxCategories", "taxCategory"],
    }),

    // Delete tax category (DELETE) - Admin
    deleteTaxCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/tax-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["taxCategories"],
    }),
  }),
});

export const {
  useGetTaxCategoryListQuery,
  useGetTaxCategoriesIdNameQuery,
  useGetTaxCategoryByIdQuery,
  useCreateTaxCategoryMutation,
  useUpdateTaxCategoryMutation,
  useDeleteTaxCategoryMutation,
} = taxCategoriesApiSlice;
