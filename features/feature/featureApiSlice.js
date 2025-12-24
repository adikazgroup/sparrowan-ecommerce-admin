import { apiSlice } from "../api/apiSlice";

const featureApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get category wise features (GET)
    getCategoryFeatureList: builder.query({
      query: () => ({
        url: `/feature/category-wise`,
      }),
    }),
  }),
});

// Export hooks for using the defined API endpoints
export const { useGetCategoryFeatureListQuery } = featureApiSlice;
