import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const suppliersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSupplierList: builder.query({
      query: (data) => ({ url: `/admin/suppliers${buildQueryParams(data)}` }),
      providesTags: ["suppliers"],
    }),
    getSuppliersIdName: builder.query({
      query: () => ({ url: "/admin/suppliers/id-name" }),
      providesTags: ["suppliers"],
    }),
    getSingleSupplier: builder.query({
      query: (id) => ({ url: `/admin/suppliers/${id}` }),
      providesTags: ["suppliers"],
    }),
    createSupplier: builder.mutation({
      query: (data) => ({
        url: "/admin/suppliers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["suppliers"],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/suppliers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["suppliers"],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({ url: `/admin/suppliers/${id}`, method: "DELETE" }),
      invalidatesTags: ["suppliers"],
    }),
  }),
});

export const {
  useGetSupplierListQuery,
  useGetSuppliersIdNameQuery,
  useGetSingleSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApiSlice;
