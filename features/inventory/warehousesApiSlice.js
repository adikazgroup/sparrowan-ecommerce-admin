import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const warehousesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouseList: builder.query({
      query: (data) => ({ url: `/admin/warehouses${buildQueryParams(data)}` }),
      providesTags: ["warehouses"],
    }),
    getWarehousesIdName: builder.query({
      query: () => ({ url: "/admin/warehouses/id-name" }),
      providesTags: ["warehouses"],
    }),
    getSingleWarehouse: builder.query({
      query: (id) => ({ url: `/admin/warehouses/${id}` }),
      providesTags: ["warehouses"],
    }),
    createWarehouse: builder.mutation({
      query: (data) => ({
        url: "/admin/warehouses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["warehouses"],
    }),
    updateWarehouse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/warehouses/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["warehouses"],
    }),
    deleteWarehouse: builder.mutation({
      query: (id) => ({ url: `/admin/warehouses/${id}`, method: "DELETE" }),
      invalidatesTags: ["warehouses"],
    }),
  }),
});

export const {
  useGetWarehouseListQuery,
  useGetWarehousesIdNameQuery,
  useGetSingleWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehousesApiSlice;
