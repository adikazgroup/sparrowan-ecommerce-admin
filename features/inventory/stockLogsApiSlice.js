import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const stockLogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockLogList: builder.query({
      query: (data) => ({ url: `/admin/stock-logs${buildQueryParams(data)}` }),
      providesTags: ["stockLogs"],
    }),
    getSingleStockLog: builder.query({
      query: (id) => ({ url: `/admin/stock-logs/${id}` }),
      providesTags: ["stockLogs"],
    }),
    getStockLogsByProduct: builder.query({
      query: ({ productId, ...data }) => ({
        url: `/admin/stock-logs/product/${productId}${buildQueryParams(data)}`,
      }),
      providesTags: ["stockLogs"],
    }),
  }),
});

export const {
  useGetStockLogListQuery,
  useGetSingleStockLogQuery,
  useGetStockLogsByProductQuery,
} = stockLogsApiSlice;
