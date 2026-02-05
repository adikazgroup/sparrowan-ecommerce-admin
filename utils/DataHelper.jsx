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
    path: "/users",
  },

  /* 3) CUSTOMERS */
  {
    id: 3,
    name: "Customers",
    key: "customers",
    icon: "hugeicons:user-group",
    path: "/customers",
  },

  /* 4) PRODUCTS */
  {
    id: 4,
    name: "Products",
    key: "products",
    icon: "hugeicons:shopping-bag-01",
    items: [
      {
        parentId: 4,
        subId: 41,
        subIcon: "hugeicons:box-01",
        subName: "All Products",
        subPath: "/products",
      },
      {
        parentId: 4,
        subId: 42,
        subIcon: "hugeicons:add-circle",
        subName: "Add Product",
        subPath: "/products/add",
      },
      {
        parentId: 4,
        subId: 43,
        subIcon: "hugeicons:folder-library",
        subName: "Collections",
        subPath: "/products/collections",
      },
    ],
  },

  /* 5) CATALOG SETTINGS */
  {
    id: 5,
    name: "Catalog Settings",
    key: "catalog-settings",
    icon: "hugeicons:settings-02",
    items: [
      {
        parentId: 5,
        subId: 51,
        subIcon: "hugeicons:tag-01",
        subName: "Categories",
        subPath: "/categories",
      },
      {
        parentId: 5,
        subId: 52,
        subIcon: "hugeicons:folder-open",
        subName: "Sub Categories",
        subPath: "/sub-categories",
      },
      {
        parentId: 5,
        subId: 53,
        subIcon: "hugeicons:folder-details",
        subName: "Child Categories",
        subPath: "/child-categories",
      },
      {
        parentId: 5,
        subId: 54,
        subIcon: "hugeicons:layers-01",
        subName: "Departments",
        subPath: "/departments",
      },
      {
        parentId: 5,
        subId: 55,
        subIcon: "hugeicons:star-badge",
        subName: "Brands",
        subPath: "/brands",
      },
      {
        parentId: 5,
        subId: 56,
        subIcon: "hugeicons:receipt",
        subName: "Tax Categories",
        subPath: "/tax-categories",
      },
      {
        parentId: 5,
        subId: 57,
        subIcon: "hugeicons:calculator-01",
        subName: "Tax Rules",
        subPath: "/tax-rules",
      },
    ],
  },

  /* 6) INVENTORY */
  {
    id: 6,
    name: "Inventory",
    key: "inventory",
    icon: "hugeicons:warehouse",
    items: [
      {
        parentId: 6,
        subId: 60,
        subIcon: "hugeicons:clipboard-list",
        subName: "Purchase Orders",
        subPath: "/inventory/purchase-orders",
      },
      {
        parentId: 6,
        subId: 61,
        subIcon: "hugeicons:home-04",
        subName: "Warehouses",
        subPath: "/inventory/warehouses",
      },
      {
        parentId: 6,
        subId: 62,
        subIcon: "hugeicons:truck-delivery",
        subName: "Suppliers",
        subPath: "/inventory/suppliers",
      },
      {
        parentId: 6,
        subId: 63,
        subIcon: "hugeicons:document-02",
        subName: "Stock Adjustments",
        subPath: "/inventory/adjustments",
      },
      {
        parentId: 6,
        subId: 64,
        subIcon: "hugeicons:time-schedule",
        subName: "Stock History",
        subPath: "/inventory/history",
      },
    ],
  },

  /* 7) MARKETING */
  {
    id: 7,
    name: "Marketing",
    key: "marketing",
    icon: "hugeicons:megaphone-01",
    items: [
      {
        parentId: 7,
        subId: 71,
        subIcon: "hugeicons:star",
        subName: "Reviews",
        subPath: "/reviews",
      },
      {
        parentId: 7,
        subId: 72,
        subIcon: "hugeicons:mail-01",
        subName: "Newsletter",
        subPath: "/newsletter",
      },
      {
        parentId: 7,
        subId: 73,
        subIcon: "hugeicons:image-02",
        subName: "Banners",
        subPath: "/banners",
      },
      {
        parentId: 7,
        subId: 74,
        subIcon: "hugeicons:edit-02",
        subName: "Blogs",
        subPath: "/blogs",
      },
      {
        parentId: 7,
        subId: 75,
        subIcon: "hugeicons:ticket-01",
        subName: "Coupons",
        subPath: "/coupons",
      },
    ],
  },

  /* 8) SETTINGS */
  {
    id: 8,
    name: "Settings",
    key: "settings",
    icon: "hugeicons:settings-01",
    items: [
      {
        parentId: 8,
        subId: 81,
        subIcon: "hugeicons:truck-delivery",
        subName: "Shipping Zones",
        subPath: "/shipping-zones",
      },
    ],
  },
];

// User Role Options (must match server USER_ROLE)
export const userRoleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
];

// User Status Options
export const userStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Attribute Type Options
export const attributeTypeOptions = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select (Dropdown)" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "boolean", label: "Boolean (Yes/No)" },
  { value: "date", label: "Date" },
  { value: "color", label: "Color" },
];

// Status Options
export const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Stock Adjustment Type Options
export const adjustmentTypeOptions = [
  { value: "increase", label: "Increase" },
  { value: "decrease", label: "Decrease" },
  { value: "set", label: "Set Value" },
];

// Stock Adjustment Status Options
export const adjustmentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Discount Type Options
export const discountTypeOptions = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "flat", label: "Flat Amount" },
];
