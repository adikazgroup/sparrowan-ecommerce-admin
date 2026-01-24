"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  LuArrowLeft,
  LuSave,
  LuPlus,
  LuTrash2,
  LuImage,
  LuX,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateProductMutation } from "@/features/products/productsApiSlice";
import { useGetDepartmentsIdNameQuery } from "@/features/departments/departmentsApiSlice";
import { useGetBrandsIdNameQuery } from "@/features/brands/brandsApiSlice";
import { useGetCategoriesIdNameQuery } from "@/features/categories/categoriesApiSlice";
import { useGetSuppliersIdNameQuery } from "@/features/inventory/suppliersApiSlice";
import { handleToast } from "@/utils/handleToast";
import { statusOptions, discountTypeOptions } from "@/utils/DataHelper";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const getFileExtension = (filename) =>
  filename?.split(".").pop()?.toLowerCase() || "";

const variantStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of Stock" },
];

const dimensionUnitOptions = [
  { value: "cm", label: "cm" },
  { value: "inch", label: "inch" },
  { value: "m", label: "m" },
];

// Complete variant template with ALL fields
const createEmptyVariant = () => ({
  id: Date.now(),
  sku: "",
  barcode: "",
  attributes: { size: "", color: "", material: "", style: "" },
  pricing: {
    buyingPrice: "",
    sellingPrice: "",
    discount: { type: "", value: "" },
  },
  inventory: { stock: "0", lowStockThreshold: "10" },
  dimensions: { length: "", width: "", height: "", unit: "cm" },
  weight: "",
  image: null,
  status: "active",
  isDefault: false,
  isExpanded: true,
});

export default function AddProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const { data: departmentsData } = useGetDepartmentsIdNameQuery();
  const { data: brandsData } = useGetBrandsIdNameQuery();
  const { data: categoriesData } = useGetCategoriesIdNameQuery();
  const { data: suppliersData } = useGetSuppliersIdNameQuery();

  const departmentOptions = departmentsData?.data || [];
  const brandOptions = brandsData?.data || [];
  const categoryOptions = categoriesData?.data || [];
  const supplierOptions = suppliersData?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    barcode: "",
    department: "",
    brand: "",
    category: "",
    subCategory: "",
    childCategory: "",
    supplier: "",
    buyingPrice: "",
    sellingPrice: "",
    discount: { type: "", value: "" },
    inventory: { stock: "0", lowStockThreshold: "10" },
    hasVariants: false,
    shortDescription: "",
    description: "",
    weight: "",
    seo: { metaTitle: "", metaDescription: "", focusKeyword: "" },
    status: "active",
  });

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const generateSlug = (text) =>
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  const generateSku = (text) =>
    text
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-")
      .replace(/[^A-Z0-9-]/g, "")
      .substring(0, 20);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNameChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: isSlugManuallyEdited ? prev.slug : generateSlug(value),
      sku: prev.sku || generateSku(value),
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleSlugChange = (value) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
  };

  // Product image handling
  const processImageFiles = (files) => {
    const validFiles = [];
    for (const file of files) {
      const ext = getFileExtension(file.name);
      if (!IMAGE_FORMATS.includes(ext)) {
        toast.error(`Invalid format: ${file.name}`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`);
        continue;
      }
      if (images.length + validFiles.length >= 5) {
        toast.error("Maximum 5 images allowed");
        break;
      }
      validFiles.push({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      });
    }
    setImages((prev) => [...prev, ...validFiles]);
  };
  const handleImageUpload = (e) =>
    processImageFiles(Array.from(e.target.files || []));
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processImageFiles(Array.from(e.dataTransfer.files || []));
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // Variant handling
  const addVariant = () =>
    setVariants((prev) => [...prev, createEmptyVariant()]);
  const removeVariant = (id) =>
    setVariants((prev) => prev.filter((v) => v.id !== id));
  const toggleVariant = (id) =>
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isExpanded: !v.isExpanded } : v)),
    );
  const setDefaultVariant = (id) =>
    setVariants((prev) => prev.map((v) => ({ ...v, isDefault: v.id === id })));

  const updateVariant = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const parts = field.split(".");
        if (parts.length === 3) {
          const [p1, p2, p3] = parts;
          return {
            ...v,
            [p1]: { ...v[p1], [p2]: { ...v[p1][p2], [p3]: value } },
          };
        } else if (parts.length === 2) {
          const [parent, child] = parts;
          return { ...v, [parent]: { ...v[parent], [child]: value } };
        }
        return { ...v, [field]: value };
      }),
    );
  };

  const handleVariantImageUpload = (variantId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = getFileExtension(file.name);
    if (!IMAGE_FORMATS.includes(ext)) {
      toast.error("Invalid format");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              image: { file, url: URL.createObjectURL(file), name: file.name },
            }
          : v,
      ),
    );
  };
  const removeVariantImage = (variantId) =>
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, image: null } : v)),
    );

  // Tags
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = (tagToRemove) =>
    setTags(tags.filter((t) => t !== tagToRemove));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.hasVariants) {
      if (!formData.buyingPrice || parseFloat(formData.buyingPrice) < 0)
        newErrors.buyingPrice = "Valid buying price is required";
      if (!formData.sellingPrice || parseFloat(formData.sellingPrice) < 0)
        newErrors.sellingPrice = "Valid selling price is required";
      if (
        formData.inventory.stock === "" ||
        parseInt(formData.inventory.stock) < 0
      )
        newErrors["inventory.stock"] = "Valid stock is required";
    }
    if (formData.hasVariants && variants.length === 0) {
      toast.error("Add at least one variant");
      return false;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    const productData = {
      ...formData,
      tags,
      buyingPrice: formData.hasVariants ? 0 : parseFloat(formData.buyingPrice),
      sellingPrice: formData.hasVariants
        ? 0
        : parseFloat(formData.sellingPrice),
      discount: formData.discount.type
        ? {
            type: formData.discount.type,
            value: parseFloat(formData.discount.value) || 0,
          }
        : undefined,
      inventory: formData.hasVariants
        ? { stock: 0, lowStockThreshold: 10 }
        : {
            stock: parseInt(formData.inventory.stock) || 0,
            lowStockThreshold:
              parseInt(formData.inventory.lowStockThreshold) || 10,
          },
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      subCategory: formData.subCategory || undefined,
      childCategory: formData.childCategory || undefined,
      supplier: formData.supplier || undefined,
      variants: formData.hasVariants
        ? variants.map((v) => ({
            sku: v.sku,
            barcode: v.barcode || undefined,
            attributes: Object.fromEntries(
              Object.entries(v.attributes).filter(([_, val]) => val),
            ),
            pricing: {
              buyingPrice: parseFloat(v.pricing.buyingPrice) || 0,
              sellingPrice: parseFloat(v.pricing.sellingPrice) || 0,
              discount: v.pricing.discount.type
                ? {
                    type: v.pricing.discount.type,
                    value: parseFloat(v.pricing.discount.value) || 0,
                  }
                : undefined,
            },
            inventory: {
              stock: parseInt(v.inventory.stock) || 0,
              lowStockThreshold: parseInt(v.inventory.lowStockThreshold) || 10,
            },
            dimensions:
              v.dimensions.length || v.dimensions.width || v.dimensions.height
                ? {
                    length: parseFloat(v.dimensions.length) || undefined,
                    width: parseFloat(v.dimensions.width) || undefined,
                    height: parseFloat(v.dimensions.height) || undefined,
                    unit: v.dimensions.unit,
                  }
                : undefined,
            weight: v.weight ? parseFloat(v.weight) : undefined,
            status: v.status,
            isDefault: v.isDefault,
          }))
        : undefined,
    };

    const formDataPayload = new FormData();
    formDataPayload.append("data", JSON.stringify(productData));
    images.forEach((img) => formDataPayload.append("images", img.file));
    if (formData.hasVariants) {
      variants.forEach((v) => {
        if (v.image?.file)
          formDataPayload.append("variantImages", v.image.file);
      });
    }

    const loadingToast = toast.loading("Creating product...");
    const result = await createProduct(formDataPayload);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-product",
      message: "Product created!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/products");
  };

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/products"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Product
          </h1>
          <p className="text-sm text-gray-500">Create a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <Input
                label="Product Name"
                placeholder="iPhone 15 Pro Max"
                value={formData.name}
                onValueChange={handleNameChange}
                error={errors.name}
                requiredSign={true}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Slug"
                  placeholder="iphone-15-pro-max"
                  value={formData.slug}
                  onValueChange={handleSlugChange}
                  error={errors.slug}
                  requiredSign={true}
                />
                <Input
                  label="SKU"
                  placeholder="IPHONE-15-PRO"
                  value={formData.sku}
                  onValueChange={(val) =>
                    handleInputChange("sku", val.toUpperCase())
                  }
                  error={errors.sku}
                  requiredSign={true}
                />
              </div>
              <Input
                label="Barcode"
                placeholder="1234567890123"
                value={formData.barcode}
                onValueChange={(val) => handleInputChange("barcode", val)}
              />
            </div>

            {/* Category & Relations */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Category & Relations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Department"
                  options={[
                    { value: "", label: "Select Department" },
                    ...departmentOptions.map((d) => ({
                      value: d.value,
                      label: d.label,
                    })),
                  ]}
                  value={formData.department}
                  onValueChange={(val) => handleInputChange("department", val)}
                  error={errors.department}
                  requiredSign={true}
                />
                <Select
                  label="Brand"
                  options={[
                    { value: "", label: "Select Brand" },
                    ...brandOptions.map((b) => ({
                      value: b.value,
                      label: b.label,
                    })),
                  ]}
                  value={formData.brand}
                  onValueChange={(val) => handleInputChange("brand", val)}
                  error={errors.brand}
                  requiredSign={true}
                />
                <Select
                  label="Category"
                  options={[
                    { value: "", label: "Select Category" },
                    ...categoryOptions.map((c) => ({
                      value: c.value,
                      label: c.label,
                    })),
                  ]}
                  value={formData.category}
                  onValueChange={(val) => handleInputChange("category", val)}
                  error={errors.category}
                  requiredSign={true}
                />
              </div>
            </div>

            {/* Pricing - Only show if no variants */}
            {!formData.hasVariants && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Buying Price (৳)"
                    type="number"
                    placeholder="0.00"
                    value={formData.buyingPrice}
                    onValueChange={(val) =>
                      handleInputChange("buyingPrice", val)
                    }
                    error={errors.buyingPrice}
                    requiredSign={true}
                  />
                  <Input
                    label="Selling Price (৳)"
                    type="number"
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onValueChange={(val) =>
                      handleInputChange("sellingPrice", val)
                    }
                    error={errors.sellingPrice}
                    requiredSign={true}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Discount Type"
                    options={[
                      { value: "", label: "No Discount" },
                      ...discountTypeOptions,
                    ]}
                    value={formData.discount.type}
                    onValueChange={(val) =>
                      handleInputChange("discount.type", val)
                    }
                  />
                  {formData.discount.type && (
                    <Input
                      label="Discount Value"
                      type="number"
                      placeholder="0"
                      value={formData.discount.value}
                      onValueChange={(val) =>
                        handleInputChange("discount.value", val)
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {/* Inventory - Only show if no variants */}
            {!formData.hasVariants && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Inventory
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Stock: 0
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                      Managed via Purchase Orders
                    </p>
                  </div>
                  <Input
                    label="Low Stock Alert"
                    type="number"
                    placeholder="10"
                    value={formData.inventory.lowStockThreshold}
                    onValueChange={(val) =>
                      handleInputChange("inventory.lowStockThreshold", val)
                    }
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    placeholder="0.5"
                    value={formData.weight}
                    onValueChange={(val) => handleInputChange("weight", val)}
                  />
                </div>
              </div>
            )}

            {/* COMPLETE Variants Section */}
            {formData.hasVariants && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Product Variants
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                  >
                    <LuPlus className="size-4" /> Add Variant
                  </Button>
                </div>
                {variants.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No variants added. Click "Add Variant" to create one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        {/* Variant Header */}
                        <div
                          className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 cursor-pointer"
                          onClick={() => toggleVariant(variant.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Variant #{index + 1}
                            </span>
                            {variant.sku && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {variant.sku}
                              </span>
                            )}
                            {variant.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVariant(variant.id);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <LuTrash2 className="size-4" />
                            </button>
                            {variant.isExpanded ? (
                              <LuChevronUp className="size-5 text-gray-400" />
                            ) : (
                              <LuChevronDown className="size-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Variant Body - Collapsible */}
                        {variant.isExpanded && (
                          <div className="p-4 space-y-4">
                            {/* Row 1: Image + Basic Info */}
                            <div className="flex gap-4">
                              <div className="w-28 shrink-0">
                                {variant.image ? (
                                  <div className="relative group">
                                    <img
                                      src={variant.image.url}
                                      alt="Variant"
                                      className="w-28 h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeVariantImage(variant.id)
                                      }
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <LuX className="size-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                    <LuImage className="size-6 text-gray-400" />
                                    <span className="text-[10px] text-gray-400 mt-1">
                                      Image
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleVariantImageUpload(variant.id, e)
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                                <Input
                                  label="SKU *"
                                  placeholder="VAR-001"
                                  value={variant.sku}
                                  onValueChange={(val) =>
                                    updateVariant(
                                      variant.id,
                                      "sku",
                                      val.toUpperCase(),
                                    )
                                  }
                                />
                                <Input
                                  label="Barcode"
                                  placeholder="123456789"
                                  value={variant.barcode}
                                  onValueChange={(val) =>
                                    updateVariant(variant.id, "barcode", val)
                                  }
                                />
                                <Select
                                  label="Status"
                                  options={variantStatusOptions}
                                  value={variant.status}
                                  onValueChange={(val) =>
                                    updateVariant(variant.id, "status", val)
                                  }
                                />
                              </div>
                            </div>

                            {/* Row 2: Attributes */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Input
                                label="Size"
                                placeholder="M, L, XL"
                                value={variant.attributes.size}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "attributes.size",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Color"
                                placeholder="Red, Blue"
                                value={variant.attributes.color}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "attributes.color",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Material"
                                placeholder="Cotton"
                                value={variant.attributes.material}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "attributes.material",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Style"
                                placeholder="Casual"
                                value={variant.attributes.style}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "attributes.style",
                                    val,
                                  )
                                }
                              />
                            </div>

                            {/* Row 3: Pricing */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Input
                                label="Buying Price (৳)"
                                type="number"
                                placeholder="0"
                                value={variant.pricing.buyingPrice}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "pricing.buyingPrice",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Selling Price (৳) *"
                                type="number"
                                placeholder="0"
                                value={variant.pricing.sellingPrice}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "pricing.sellingPrice",
                                    val,
                                  )
                                }
                              />
                              <Select
                                label="Discount Type"
                                options={[
                                  { value: "", label: "No Discount" },
                                  ...discountTypeOptions,
                                ]}
                                value={variant.pricing.discount.type}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "pricing.discount.type",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Discount Value"
                                type="number"
                                placeholder="0"
                                value={variant.pricing.discount.value}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "pricing.discount.value",
                                    val,
                                  )
                                }
                                disabled={!variant.pricing.discount.type}
                              />
                            </div>

                            {/* Row 4: Inventory & Settings */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                  Stock: 0
                                </p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                                  Managed via Purchase Orders
                                </p>
                              </div>
                              <Input
                                label="Low Stock Alert"
                                type="number"
                                placeholder="10"
                                value={variant.inventory.lowStockThreshold}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "inventory.lowStockThreshold",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Weight (kg)"
                                type="number"
                                placeholder="0.5"
                                value={variant.weight}
                                onValueChange={(val) =>
                                  updateVariant(variant.id, "weight", val)
                                }
                              />
                              <div className="flex items-center">
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer mt-6">
                                  <input
                                    type="radio"
                                    name="defaultVariant"
                                    checked={variant.isDefault}
                                    onChange={() =>
                                      setDefaultVariant(variant.id)
                                    }
                                    className="w-4 h-4"
                                  />
                                  Set as Default
                                </label>
                              </div>
                            </div>

                            {/* Row 5: Dimensions */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Input
                                label="Length"
                                type="number"
                                placeholder="0"
                                value={variant.dimensions.length}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "dimensions.length",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Width"
                                type="number"
                                placeholder="0"
                                value={variant.dimensions.width}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "dimensions.width",
                                    val,
                                  )
                                }
                              />
                              <Input
                                label="Height"
                                type="number"
                                placeholder="0"
                                value={variant.dimensions.height}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "dimensions.height",
                                    val,
                                  )
                                }
                              />
                              <Select
                                label="Unit"
                                options={dimensionUnitOptions}
                                value={variant.dimensions.unit}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "dimensions.unit",
                                    val,
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Description
              </h2>
              <Textarea
                label="Short Description"
                placeholder="Brief product description..."
                value={formData.shortDescription}
                onValueChange={(val) =>
                  handleInputChange("shortDescription", val)
                }
                rows={2}
                maxLength={500}
              />
              <Textarea
                label="Full Description"
                placeholder="Detailed product description..."
                value={formData.description}
                onValueChange={(val) => handleInputChange("description", val)}
                rows={5}
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Product Images */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuImage className="size-4" /> Product Images
              </h2>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <LuX className="size-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {images.length < 5 && (
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700 hover:border-primary"}`}
                >
                  <LuImage className="size-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Drop images or click</p>
                  <p className="text-[10px] text-gray-400">
                    Max 5 images, 5MB each
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Status & Settings */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Settings
              </h2>
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(val) => handleInputChange("status", val)}
              />
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={(e) =>
                    handleInputChange("hasVariants", e.target.checked)
                  }
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">
                    Has Variants
                  </p>
                  <p className="text-xs text-gray-500">
                    Enable size, color variants
                  </p>
                </div>
              </label>
            </div>

            {/* Tags */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Tags
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onValueChange={setTagInput}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <LuPlus className="size-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500"
                      >
                        <LuTrash2 className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* SEO */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                SEO
              </h2>
              <Input
                label="Meta Title"
                placeholder="SEO Title"
                value={formData.seo.metaTitle}
                onValueChange={(val) => handleInputChange("seo.metaTitle", val)}
                maxLength={60}
              />
              <Textarea
                label="Meta Description"
                placeholder="SEO Description"
                value={formData.seo.metaDescription}
                onValueChange={(val) =>
                  handleInputChange("seo.metaDescription", val)
                }
                rows={2}
                maxLength={160}
              />
              <Input
                label="Focus Keyword"
                placeholder="main keyword"
                value={formData.seo.focusKeyword}
                onValueChange={(val) =>
                  handleInputChange("seo.focusKeyword", val)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
