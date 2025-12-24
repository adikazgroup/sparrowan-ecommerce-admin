export const generateUserQueryObject = ({
  filters,
  searchTerm,
  page,
  limit,
}) => {
  const params = new URLSearchParams();

  // Add search input
  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }

  // Add pagination
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  // Helper to handle multi-value filters
  const appendFilters = (category) => {
    const entries = Object.entries(filters[category]);
    entries.forEach(([key, value]) => {
      if (value) {
        params.append(category, key);
      }
    });
  };

  appendFilters("role");
  appendFilters("status");

  return `?${params.toString()}`;
};
