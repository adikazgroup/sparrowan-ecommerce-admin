import { buildQueryParams } from "@/utils/buildQueryParams";
import { apiSlice } from "../api/apiSlice";

const contactApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get contacts list (GET) - Admin
    getContactList: builder.query({
      query: (data) => {
        const params = buildQueryParams(data);
        return {
          url: `/admin/contacts${params}`,
        };
      },
      providesTags: ["contacts"],
    }),

    // Get single contact (GET) - Admin
    getSingleContact: builder.query({
      query: (id) => ({
        url: `/admin/contacts/${id}`,
      }),
      providesTags: ["contacts"],
    }),

    // Get contact stats (GET) - Admin
    getContactStats: builder.query({
      query: () => ({
        url: `/admin/contacts/stats`,
      }),
      providesTags: ["contacts"],
    }),

    // Update contact status (PATCH) - Admin
    updateContact: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/contacts/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["contacts"],
    }),

    // Delete contact (DELETE) - Admin
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/admin/contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["contacts"],
    }),
  }),
});

export const {
  useGetContactListQuery,
  useGetSingleContactQuery,
  useGetContactStatsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApiSlice;
