"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
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

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateProductMutation } from "@/features/products/productsApiSlice";
import { useGetDepartmentsIdNameQuery } from "@/features/departments/departmentsApiSlice";
import { useGetBrandsIdNameQuery } from "@/features/brands/brandsApiSlice";
import {
  useGetCategoriesIdNameQuery,
  useGetChildrenByParentIdQuery,
} from "@/features/categories/categoriesApiSlice";
import { useGetTaxCategoriesIdNameQuery } from "@/features/taxCategories/taxCategoriesApiSlice";
import generateFormData from "@/utils/generateFormData";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";
import { statusOptions, discountTypeOptions } from "@/utils/DataHelper";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const getFileExtension = (filename) =>
  filename?.split(".").pop()?.toLowerCase() || "";

const dimensionUnitOptions = [
  { value: "cm", label: "cm" },
  { value: "inch", label: "inch" },
  { value: "m", label: "m" },
];

const createEmptyVariant = () => ({
  id: Date.now(),
  sku: "",
  barcode: "",
  attributes: { size: "", color: "", material: "", style: "" },
  pricing: {
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

  // API Hooks
  const { data: departmentsData } = useGetDepartmentsIdNameQuery();
  const { data: brandsData } = useGetBrandsIdNameQuery();
  const { data: categoriesData } = useGetCategoriesIdNameQuery({ level: 0 });
  const { data: taxCategoriesData } = useGetTaxCategoriesIdNameQuery();

  const departmentOptions = departmentsData?.data || [];
  const brandOptions = brandsData?.data || [];
  const categoryOptions =
    categoriesData?.data?.map((c) => ({ value: c.value, label: c.label })) ||
    [];
  const taxCategoryOptions =
    taxCategoriesData?.data?.map((t) => ({ value: t.value, label: t.label })) ||
    [];

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    // sku removed - now in Variant only
    department: "",
    brand: "",
    category: "",
    subCategory: "",
    childCategory: "",
    taxCategory: "",
    description: "",
    details: "",
    seo: { metaTitle: "", metaDescription: "" },
    status: "active",
  });

  // Cascading categories
  const { data: subCategoriesData } = useGetChildrenByParentIdQuery(
    formData.category,
    { skip: !formData.category },
  );
  const { data: childCategoriesData } = useGetChildrenByParentIdQuery(
    formData.subCategory,
    { skip: !formData.subCategory },
  );

  const subCategoryOptions =
    subCategoriesData?.data?.map((c) => ({ value: c._id, label: c.name })) ||
    [];
  const childCategoryOptions =
    childCategoriesData?.data?.map((c) => ({ value: c._id, label: c.name })) ||
    [];

  const [images, setImages] = useState([]);
  // Initialize with one default variant
  const [variants, setVariants] = useState([createEmptyVariant()]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [specifications, setSpecifications] = useState([]);
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
    setFormData((prev) => {
      const newState = { ...prev, name: value };
      if (!isSlugManuallyEdited) {
        newState.slug = generateSlug(value);
      }
      return newState;
    });
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
    if (!isSlugManuallyEdited && errors.slug)
      setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const handleSlugChange = (value) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
  };

  // Cascading category handlers
  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
      subCategory: "",
      childCategory: "",
    }));
    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
  };

  const handleSubCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      subCategory: value,
      childCategory: "",
    }));
  };

  // Image handling
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
      if (images.length + validFiles.length >= 10) {
        toast.error("Maximum 10 images allowed");
        break;
      }
      validFiles.push({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        isPrimary: images.length + validFiles.length === 0,
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
  const setPrimaryImage = (index) =>
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );

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

  // Features
  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };
  const removeFeature = (featureToRemove) =>
    setFeatures(features.filter((f) => f !== featureToRemove));

  // Specifications
  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };
  const updateSpecification = (index, field, value) => {
    setSpecifications((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
    );
  };
  const removeSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    // sku removed - now in Variant only
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.category) newErrors.category = "Category is required";

    // All products must have at least one variant
    if (variants.length === 0) {
      newErrors.variants = "At least one variant is required";
    } else {
      variants.forEach((variant, index) => {
        if (
          !variant.pricing.sellingPrice ||
          parseFloat(variant.pricing.sellingPrice) <= 0
        ) {
          newErrors[`variant_${index}_sellingPrice`] =
            "Selling Price is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors", { id: "create-product" });
      return;
    }

    const productData = cleanPayload({
      // Product metadata only
      name: formData.name,
      slug: formData.slug,
      // sku removed - now in Variant only
      department: formData.department,
      brand: formData.brand,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      childCategory: formData.childCategory || undefined,
      taxCategories: formData.taxCategory ? [formData.taxCategory] : undefined,
      tags: tags.length > 0 ? tags : undefined,
      features: features.length > 0 ? features : undefined,
      specifications:
        specifications.filter((s) => s.key && s.value).length > 0
          ? specifications.filter((s) => s.key && s.value)
          : undefined,
      description: formData.description || undefined,
      details: formData.details || undefined,
      seo:
        formData.seo.metaTitle || formData.seo.metaDescription
          ? formData.seo
          : undefined,
      status: formData.status,

      // All products use variants array (minimum 1)
      variants: variants.map((v) => ({
        sku: v.sku?.trim() || undefined,
        barcode: v.barcode || undefined,
        attributes: Object.fromEntries(
          Object.entries(v.attributes).filter(([_, val]) => val),
        ),
        pricing: {
          sellingPrice: parseFloat(v.pricing.sellingPrice) || 0,
          discount: v.pricing.discount.type
            ? {
                type: v.pricing.discount.type,
                value: parseFloat(v.pricing.discount.value) || 0,
              }
            : undefined,
        },
        inventory: {
          stock: 0, // Always 0 - managed via Purchase Orders
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
      })),
    });

    const formDataPayload = new FormData();
    formDataPayload.append("data", JSON.stringify(productData));
    images.forEach((img) => formDataPayload.append("images", img.file));

    // Variant images with indexed field names for proper mapping
    variants.forEach((v, index) => {
      if (v.image?.file) {
        formDataPayload.append(`variant_${index}_image`, v.image.file);
      }
    });

    const loadingToast = toast.loading("Creating product...");
    const result = await createProduct(formDataPayload);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-product",
      message: "Product created successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/products");
  };

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/products"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Product
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
              </div>
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
                    ...categoryOptions,
                  ]}
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                  error={errors.category}
                  requiredSign={true}
                />
              </div>

              {/* Cascading Sub/Child Categories */}
              {subCategoryOptions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Sub Category"
                    options={[
                      { value: "", label: "Select Sub Category" },
                      ...subCategoryOptions,
                    ]}
                    value={formData.subCategory}
                    onValueChange={handleSubCategoryChange}
                  />
                  {childCategoryOptions.length > 0 && (
                    <Select
                      label="Child Category"
                      options={[
                        { value: "", label: "Select Child Category" },
                        ...childCategoryOptions,
                      ]}
                      value={formData.childCategory}
                      onValueChange={(val) =>
                        handleInputChange("childCategory", val)
                      }
                    />
                  )}
                </div>
              )}

              {/* Tax Category */}
              {taxCategoryOptions.length > 0 && (
                <Select
                  label="Tax Category"
                  options={[
                    { value: "", label: "Select Tax Category" },
                    ...taxCategoryOptions,
                  ]}
                  value={formData.taxCategory}
                  onValueChange={(val) => handleInputChange("taxCategory", val)}
                />
              )}
            </div>

            {/* Product Variants - Always Shown */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Product Variants
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Every product needs at least one variant. For simple
                    products, create one variant without size/color attributes.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addVariant}
                  size="sm"
                  variant="outline"
                >
                  <LuPlus className="size-4" /> Add Variant
                </Button>
              </div>

              {variants.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No variants added. Click "Add Variant" to create one.
                </p>
              )}

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {/* Variant Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleVariant(variant.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {variant.isExpanded ? (
                            <LuChevronUp className="size-4" />
                          ) : (
                            <LuChevronDown className="size-4" />
                          )}
                        </button>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Variant #{index + 1}
                          {variant.sku && ` - ${variant.sku}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={variant.isDefault}
                            onChange={() => setDefaultVariant(variant.id)}
                            className="rounded"
                          />
                          <span className="text-gray-600 dark:text-gray-400">
                            Default
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <LuTrash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Variant Fields */}
                    {variant.isExpanded && (
                      <div className="p-4 space-y-4">
                        {/* Row 1: Image + Basic Info */}
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Image Section */}
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
                                  onClick={() => removeVariantImage(variant.id)}
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

                          {/* Basic Info */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              label="Variant SKU"
                              placeholder="SKU-45154"
                              value={variant.sku}
                              onValueChange={(val) =>
                                updateVariant(
                                  variant.id,
                                  "sku",
                                  val.toUpperCase(),
                                )
                              }
                              error={errors[`variant_${index}_sku`]}
                            />
                            <Input
                              label="Barcode"
                              placeholder="1234567890123"
                              value={variant.barcode}
                              onValueChange={(val) =>
                                updateVariant(variant.id, "barcode", val)
                              }
                            />
                            <Select
                              label="Status"
                              options={statusOptions}
                              value={variant.status}
                              onValueChange={(val) =>
                                updateVariant(variant.id, "status", val)
                              }
                            />
                          </div>
                        </div>

                        {/* Row 2: Attributes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attributes
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Input
                              placeholder="Size"
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
                              placeholder="Color"
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
                              placeholder="Material"
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
                              placeholder="Style"
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
                        </div>

                        {/* Row 3: Pricing */}
                        <div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                            Pricing
                          </p>
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-2">
                            <p className="text-[10px] text-blue-700 dark:text-blue-400">
                              Buying price auto-calculated from POs
                            </p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <Input
                              label="Selling Price (৳)"
                              type="number"
                              placeholder="0.00"
                              value={variant.pricing.sellingPrice}
                              onValueChange={(val) =>
                                updateVariant(
                                  variant.id,
                                  "pricing.sellingPrice",
                                  val,
                                )
                              }
                              error={errors[`variant_${index}_sellingPrice`]}
                              requiredSign={true}
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
                            {variant.pricing.discount.type && (
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
                              />
                            )}
                          </div>
                        </div>

                        {/* Row 4: Inventory & Stock */}
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
                            helpText="Alert when stock falls below this level"
                          />
                        </div>

                        {/* Row 5: Dimensions & Weight */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dimensions & Weight
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                            <Input
                              label="Weight (kg)"
                              type="number"
                              placeholder="0.0"
                              value={variant.weight}
                              onValueChange={(val) =>
                                updateVariant(variant.id, "weight", val)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags & Features */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Tags & Features
              </h2>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <LuPlus className="size-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-600"
                        >
                          <LuX className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a feature"
                    value={featureInput}
                    onValueChange={setFeatureInput}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                  />
                  <Button type="button" onClick={addFeature} size="sm">
                    <LuPlus className="size-4" />
                  </Button>
                </div>
                {features.length > 0 && (
                  <div className="space-y-1">
                    {features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <span className="text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <LuX className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Specifications
                </h2>
                <Button
                  type="button"
                  onClick={addSpecification}
                  size="sm"
                  variant="outline"
                >
                  <LuPlus className="size-4" /> Add Specification
                </Button>
              </div>

              {specifications.length > 0 && (
                <div className="space-y-2">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Specification name"
                        value={spec.key}
                        onValueChange={(val) =>
                          updateSpecification(idx, "key", val)
                        }
                      />
                      <Input
                        placeholder="Specification value"
                        value={spec.value}
                        onValueChange={(val) =>
                          updateSpecification(idx, "value", val)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <LuTrash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Descriptions */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Descriptions
              </h2>
              <Textarea
                label="Description"
                placeholder="Brief product summary (max 500 characters)"
                value={formData.description}
                onValueChange={(val) => handleInputChange("description", val)}
                rows={3}
                maxLength={500}
              />
              <Textarea
                label="Details"
                placeholder="Full product details"
                value={formData.details}
                onValueChange={(val) => handleInputChange("details", val)}
                rows={6}
              />
            </div>

            {/* SEO */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                SEO
              </h2>
              <Input
                label="Meta Title"
                placeholder="SEO title (max 60 characters)"
                value={formData.seo.metaTitle}
                onValueChange={(val) => handleInputChange("seo.metaTitle", val)}
                maxLength={60}
              />
              <Textarea
                label="Meta Description"
                placeholder="SEO description (max 160 characters)"
                value={formData.seo.metaDescription}
                onValueChange={(val) =>
                  handleInputChange("seo.metaDescription", val)
                }
                rows={3}
                maxLength={160}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Status
              </h2>
              <Select
                options={statusOptions}
                value={formData.status}
                onValueChange={(val) => handleInputChange("status", val)}
                className="w-full"
              />
            </div>

            {/* Product Images */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuImage className="size-4" />
                Product Images
              </h2>

              {/* Upload Area */}
              {images.length < 10 && (
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <LuImage className="size-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drag & drop or click</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max 10 images (5MB each)
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

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.url}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className={`p-1.5 rounded ${
                            img.isPrimary
                              ? "bg-primary text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                          title="Set as primary"
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <LuX className="size-3" />
                        </button>
                      </div>
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 px-2 py-0.5 bg-primary text-white text-[10px] rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} loading={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
