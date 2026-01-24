import { apiSlice } from "../api/apiSlice";

export const blogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get blog list with filters
    getBlogList: builder.query({
      query: (params) => ({
        url: "/admin/blogs",
        params,
      }),
      providesTags: ["Blog"],
    }),

    // Get single blog
    getSingleBlog: builder.query({
      query: (id) => `/admin/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    // Create blog
    createBlog: builder.mutation({
      query: (data) => ({
        url: "/admin/blogs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blog"],
    }),

    // Update blog
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/blogs/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Blog", id },
        "Blog",
      ],
    }),

    // Delete blog
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/admin/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetBlogListQuery,
  useGetSingleBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogsApiSlice;
