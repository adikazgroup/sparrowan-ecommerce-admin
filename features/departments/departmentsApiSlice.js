import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const departmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get department list (GET) - Admin
    getDepartmentList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/departments${params}`,
        };
      },
      providesTags: ["departments"],
    }),

    // Get departments id-name list (GET) - Admin
    getDepartmentsIdName: builder.query({
      query: () => ({
        url: "/admin/departments/id-name",
      }),
      providesTags: ["departments"],
    }),

    // Get single department (GET) - Admin
    getSingleDepartment: builder.query({
      query: (id) => ({
        url: `/admin/departments/${id}`,
      }),
      providesTags: ["departments"],
    }),

    // Create department (POST) - Admin
    createDepartment: builder.mutation({
      query: (departmentData) => ({
        url: "/admin/departments",
        method: "POST",
        body: departmentData,
      }),
      invalidatesTags: ["departments"],
    }),

    // Update department (PATCH) - Admin
    updateDepartment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/departments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["departments"],
    }),

    // Delete department (DELETE) - Admin
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/admin/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["departments"],
    }),
  }),
});

export const {
  useGetDepartmentListQuery,
  useGetDepartmentsIdNameQuery,
  useGetSingleDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApiSlice;
