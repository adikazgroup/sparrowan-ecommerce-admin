import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const taxRulesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get tax rule list (GET) - Admin
    getTaxRuleList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/tax-rules${params}`,
        };
      },
      providesTags: ["taxRules"],
    }),

    // Get tax rules id-name list (GET) - Admin
    getTaxRulesIdName: builder.query({
      query: () => ({
        url: "/admin/tax-rules/id-name",
      }),
      providesTags: ["taxRules"],
    }),

    // Get single tax rule (GET) - Admin
    getTaxRuleById: builder.query({
      query: (id) => ({
        url: `/admin/tax-rules/${id}`,
      }),
      providesTags: ["taxRule"],
    }),

    // Create tax rule (POST) - Admin
    createTaxRule: builder.mutation({
      query: (taxRuleData) => ({
        url: "/admin/tax-rules",
        method: "POST",
        body: taxRuleData,
      }),
      invalidatesTags: ["taxRules"],
    }),

    // Update tax rule (PATCH) - Admin
    updateTaxRule: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/tax-rules/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["taxRules", "taxRule"],
    }),

    // Delete tax rule (DELETE) - Admin
    deleteTaxRule: builder.mutation({
      query: (id) => ({
        url: `/admin/tax-rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["taxRules"],
    }),
  }),
});

export const {
  useGetTaxRuleListQuery,
  useGetTaxRulesIdNameQuery,
  useGetTaxRuleByIdQuery,
  useCreateTaxRuleMutation,
  useUpdateTaxRuleMutation,
  useDeleteTaxRuleMutation,
} = taxRulesApiSlice;
