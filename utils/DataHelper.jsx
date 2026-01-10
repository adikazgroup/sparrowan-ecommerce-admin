export const menuItems = [
  /* 1) DASHBOARD */
  {
    id: 1,
    name: "Dashboard",
    key: "dashboard",
    icon: "hugeicons:chart-bar-line",
    path: "/",
  },

  /* 2) USER MANAGEMENT */
  {
    id: 2,
    name: "User Management",
    key: "users",
    icon: "clarity:employee-line",
    path: "/user",
  },

  /* 3) CATALOG SETTINGS */
  {
    id: 3,
    name: "Catalog Settings",
    key: "catalog-settings",
    icon: "hugeicons:settings-02",
    items: [
      {
        parentId: 3,
        subId: 31,
        subIcon: "hugeicons:tag-01",
        subName: "Categories",
        subPath: "/categories",
      },
      {
        parentId: 3,
        subId: 32,
        subIcon: "hugeicons:folder-open",
        subName: "Sub Categories",
        subPath: "/sub-categories",
      },
      {
        parentId: 3,
        subId: 33,
        subIcon: "hugeicons:folder-details",
        subName: "Child Categories",
        subPath: "/child-categories",
      },
      {
        parentId: 3,
        subId: 34,
        subIcon: "hugeicons:layers-01",
        subName: "Departments",
        subPath: "/departments",
      },
      {
        parentId: 3,
        subId: 35,
        subIcon: "hugeicons:star-badge",
        subName: "Brands",
        subPath: "/brands",
      },
      {
        parentId: 3,
        subId: 36,
        subIcon: "hugeicons:receipt",
        subName: "Tax Categories",
        subPath: "/tax-categories",
      },
      {
        parentId: 3,
        subId: 37,
        subIcon: "hugeicons:calculator-01",
        subName: "Tax Rules",
        subPath: "/tax-rules",
      },
    ],
  },
];

// User Role Options
export const userRoleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

// User Status Options
export const userStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Email Verified Options
export const emailVerifiedOptions = [
  { value: true, label: "Verified" },
  { value: false, label: "Not Verified" },
];
