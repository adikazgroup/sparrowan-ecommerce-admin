import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const productCollectionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductCollectionList: builder.query({
      query: (data) => ({
        url: `/admin/product-collections${buildQueryParams(data)}`,
      }),
      providesTags: ["productCollections"],
    }),
    getProductCollectionsIdName: builder.query({
      query: () => ({ url: "/admin/product-collections/id-name" }),
      providesTags: ["productCollections"],
    }),
    getSingleProductCollection: builder.query({
      query: (id) => ({ url: `/admin/product-collections/${id}` }),
      providesTags: ["productCollections"],
    }),
    createProductCollection: builder.mutation({
      query: (data) => ({
        url: "/admin/product-collections",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["productCollections"],
    }),
    updateProductCollection: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/product-collections/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["productCollections"],
    }),
    deleteProductCollection: builder.mutation({
      query: (id) => ({
        url: `/admin/product-collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productCollections"],
    }),
  }),
});

export const {
  useGetProductCollectionListQuery,
  useGetProductCollectionsIdNameQuery,
  useGetSingleProductCollectionQuery,
  useCreateProductCollectionMutation,
  useUpdateProductCollectionMutation,
  useDeleteProductCollectionMutation,
} = productCollectionsApiSlice;
