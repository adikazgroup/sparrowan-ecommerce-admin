import { apiSlice } from "../api/apiSlice";

const packageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all packages list (GET)
    getPackageList: builder.query({
      query: (queryParams) => ({
        url: `/package${queryParams}`,
      }),
      providesTags: ["packages"],
    }),

    // Create package (POST)
    createPackage: builder.mutation({
      query: (data) => ({
        url: `/package`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["packages"],
    }),

    // Update package (PATCH)
    updatePackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["packages", "package"],
    }),

    // Get all packages id, name list (GET)
    getPackageIdAndNameListFromDB: builder.query({
      query: () => ({
        url: "/package/id-name",
      }),
    }),

    // Get archived packages list (GET)
    getArchivedPackageList: builder.query({
      query: (queryParams) => ({
        url: `/package/status/archived${queryParams}`,
      }),
      providesTags: ["archived-packages"],
    }),

    // Get single package (GET)
    getSinglePackage: builder.query({
      query: (id) => ({
        url: `/package/${id}`,
      }),
      providesTags: ["package"],
    }),

    // Remove package (DELETE)
    removePackage: builder.mutation({
      query: (id) => ({
        url: `/package/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["packages"],
    }),

    // Restore package (PATCH)
    restorePackage: builder.mutation({
      query: (id) => ({
        url: `/package/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["archived-packages", "packages"],
    }),

    // Delete package (DELETE)
    deletePackage: builder.mutation({
      query: (id) => ({
        url: `/package/${id}/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["archived-packages"],
    }),
  }),
});

// Export hooks
export const {
  useGetPackageListQuery,
  useCreatePackageMutation,
  useGetPackageIdAndNameListFromDBQuery,
  useGetArchivedPackageListQuery,
  useGetSinglePackageQuery,
  useUpdatePackageMutation,
  useRemovePackageMutation,
  useRestorePackageMutation,
  useDeletePackageMutation,
} = packageApiSlice;
