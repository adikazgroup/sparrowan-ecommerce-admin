import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const customersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerList: builder.query({
      query: (data) => ({ url: `/admin/customers${buildQueryParams(data)}` }),
      providesTags: ["customers"],
    }),
    getSingleCustomer: builder.query({
      query: (id) => ({ url: `/admin/customers/${id}` }),
      providesTags: ["customers"],
    }),
    createCustomer: builder.mutation({
      query: (data) => ({
        url: "/admin/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["customers"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/customers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["customers"],
    }),
    updateCustomerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/customers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["customers"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: `/admin/customers/${id}`, method: "DELETE" }),
      invalidatesTags: ["customers"],
    }),
  }),
});

export const {
  useGetCustomerListQuery,
  useGetSingleCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useUpdateCustomerStatusMutation,
  useDeleteCustomerMutation,
} = customersApiSlice;
