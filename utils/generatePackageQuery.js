export const generatePackageQueryObject = ({
  filters,
  sortOption,
  searchInput,
  page,
  limit,
}) => {
  const params = new URLSearchParams();

  // Add sort option
  if (sortOption) {
    if (sortOption === "lowToHigh") {
      params.append("sortBy", "price");
      params.append("sortOrder", 1);
    } else if (sortOption === "highToLow") {
      params.append("sortBy", "price");
      params.append("sortOrder", -1);
    }
  }

  // Add search input
  if (searchInput) {
    params.append("searchTerm", searchInput);
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

  appendFilters("status");
  appendFilters("packageType");
  appendFilters("billingCycle");

  return `?${params.toString()}`;
};
