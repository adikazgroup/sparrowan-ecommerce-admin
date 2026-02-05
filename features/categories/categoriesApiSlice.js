import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get category list (GET) - Admin
    getCategoryList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/categories${params}`,
        };
      },
      providesTags: ["categories"],
    }),

    // Get categories id-name list (GET) - Admin
    getCategoriesIdName: builder.query({
      query: (data = {}) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/categories/id-name${params}`,
        };
      },
      providesTags: ["categories"],
    }),

    // Get categories by department (GET) - Admin
    getCategoriesByDepartment: builder.query({
      query: ({ departmentId, level }) => {
        const levelParam = level !== undefined ? `?level=${level}` : "";
        return {
          url: `/admin/categories/by-department/${departmentId}${levelParam}`,
        };
      },
      providesTags: ["categories"],
    }),

    // Get children by parent ID (GET) - Public
    getChildrenByParentId: builder.query({
      query: (parentId) => ({
        url: `/categories/${parentId}/children`,
      }),
      providesTags: ["categories"],
    }),

    // Get single category (GET) - Admin
    getSingleCategory: builder.query({
      query: (id) => ({
        url: `/admin/categories/${id}`,
      }),
      providesTags: ["categories"],
    }),

    // Create category (POST) - Admin
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "/admin/categories",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["categories"],
    }),

    // Update category (PATCH) - Admin
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["categories"],
    }),

    // Delete category (DELETE) - Admin
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["categories"],
    }),
  }),
});

export const {
  useGetCategoryListQuery,
  useGetCategoriesIdNameQuery,
  useGetCategoriesByDepartmentQuery,
  useGetChildrenByParentIdQuery,
  useGetSingleCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApiSlice;
