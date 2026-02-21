"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  useGetSingleProductQuery,
  useUpdateProductMutation,
} from "@/features/products/productsApiSlice";
import { useGetDepartmentsIdNameQuery } from "@/features/departments/departmentsApiSlice";
import { useGetBrandsIdNameQuery } from "@/features/brands/brandsApiSlice";
import {
  useGetCategoriesIdNameQuery,
  useGetChildrenByParentIdQuery,
} from "@/features/categories/categoriesApiSlice";
import { useGetTaxCategoriesIdNameQuery } from "@/features/taxCategories/taxCategoriesApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";
import { statusOptions, discountTypeOptions } from "@/utils/DataHelper";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import ConfirmVariantDeleteModal from "@/components/ui/modal/commonModal/ConfirmVariantDeleteModal";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const getFileExtension = (filename) =>
  filename?.split(".").pop()?.toLowerCase() || "";

const variantStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const dimensionUnitOptions = [
  { value: "cm", label: "cm" },
  { value: "inch", label: "inch" },
  { value: "m", label: "m" },
];

const createEmptyVariant = () => ({
  id: Date.now(),
  _id: null,
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
  existingImage: null,
  status: "active",
  isDefault: false,
  isExpanded: true,
});

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data, isLoading: isFetching, isError } = useGetSingleProductQuery(id);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

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
  const [existingImages, setExistingImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    variantId: null,
    variantDetails: null,
  });

  useEffect(() => {
    if (data?.data) {
      const product = data.data;
      // Get pricing/inventory from defaultVariantData (non-variant products)
      const dv = product.defaultVariantData;
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        // sku removed - now in Variant only
        department: product.department?._id || product.department || "",
        brand: product.brand?._id || product.brand || "",
        category: product.category?._id || product.category || "",
        subCategory: product.subCategory?._id || product.subCategory || "",
        childCategory:
          product.childCategory?._id || product.childCategory || "",
        taxCategory:
          product.taxCategories?.[0]?._id || product.taxCategories?.[0] || "",
        // Pricing from defaultVariant
        sellingPrice: dv?.pricing?.sellingPrice?.toString() || "",
        discount: {
          type: dv?.pricing?.discount?.type || "",
          value: dv?.pricing?.discount?.value?.toString() || "",
        },
        inventory: {
          stock: dv?.inventory?.stock?.toString() || "0",
          lowStockThreshold:
            dv?.inventory?.lowStockThreshold?.toString() || "10",
        },
        description: product.description || "",
        details: product.details || "",
        seo: {
          metaTitle: product.seo?.metaTitle || "",
          metaDescription: product.seo?.metaDescription || "",
        },
        status: product.status || "active",
      });
      setTags(product.tags || []);
      setFeatures(product.features || []);
      setSpecifications(product.specifications || []);
      if (product.images) setExistingImages(product.images);
      if (product.variants?.length > 0) {
        setVariants(
          product.variants.map((v, idx) => ({
            id: Date.now() + idx,
            _id: v._id,
            sku: v.sku || "",
            barcode: v.barcode || "",
            attributes: {
              size: v.attributes?.size || "",
              color: v.attributes?.color || "",
              material: v.attributes?.material || "",
              style: v.attributes?.style || "",
            },
            pricing: {
              sellingPrice: v.pricing?.sellingPrice?.toString() || "",
              discount: {
                type: v.pricing?.discount?.type || "",
                value: v.pricing?.discount?.value?.toString() || "",
              },
            },
            inventory: {
              stock: v.inventory?.stock?.toString() || "0",
              lowStockThreshold:
                v.inventory?.lowStockThreshold?.toString() || "10",
            },
            dimensions: {
              length: v.dimensions?.length?.toString() || "",
              width: v.dimensions?.width?.toString() || "",
              height: v.dimensions?.height?.toString() || "",
              unit: v.dimensions?.unit || "cm",
            },
            weight: v.weight?.toString() || "",
            image: null,
            existingImage: v.image?.url ? v.image : null,
            status: v.status || "active",
            isDefault: v.isDefault || false,
            isExpanded: false,
          })),
        );
      }
    }
  }, [data]);

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

  const handleSlugChange = (value) =>
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));

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
    const totalImages = images.length + existingImages.length;
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
      if (totalImages + validFiles.length >= 5) {
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
  const removeExistingImage = (index) =>
    setExistingImages((prev) => prev.filter((_, i) => i !== index));

  // Variant handling
  const addVariant = () =>
    setVariants((prev) => [...prev, createEmptyVariant()]);

  // Request variant deletion - show confirmation modal
  const requestDeleteVariant = (variant) => {
    setDeleteModal({
      isOpen: true,
      variantId: variant.id,
      variantDetails: {
        sku: variant.sku,
        attributes: variant.attributes,
        stock: variant.inventory?.stock,
      },
    });
  };

  // Confirm variant deletion - actually remove from state
  const confirmDeleteVariant = () => {
    setVariants((prev) => prev.filter((v) => v.id !== deleteModal.variantId));
    setDeleteModal({ isOpen: false, variantId: null, variantDetails: null });
    toast.success("Variant removed from form");
  };

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
              existingImage: null,
            }
          : v,
      ),
    );
  };

  const removeVariantImage = (variantId) =>
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, image: null, existingImage: null } : v,
      ),
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
        if (!variant.sku || !variant.sku.trim()) {
          newErrors[`variant_${index}_sku`] = "Variant SKU is required";
        }
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
      toast.error("Please fix the errors", { id: "update-product" });
      return;
    }

    const productData = cleanPayload({
      // Product metadata only
      name: formData.name,
      slug: formData.slug,
      // sku removed - now in Variant only
      // barcode removed from product - now in variant only
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
      existingImages: existingImages.map((img) => ({
        url: img.url,
        publicId: img.publicId,
      })),

      // All products use variants array (minimum 1)
      variants: variants.map((v) => ({
        _id: v._id || undefined,
        sku: v.sku,
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
        existingImage: v.existingImage || undefined,
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

    const loadingToast = toast.loading("Updating product...");
    const result = await updateProduct({ id, data: formDataPayload });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-product",
      message: "Product updated!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/products");
  };

  if (isFetching) return <PageSkeleton />;
  if (isError) return <ErrorBoundaryFetcher />;

  const allImages = [
    ...existingImages.map((img, i) => ({ ...img, isExisting: true, index: i })),
    ...images.map((img, i) => ({ ...img, isExisting: false, index: i })),
  ];

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
            Edit Product
          </h1>
          <p className="text-sm text-gray-500">Update product details</p>
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
                onValueChange={(val) => handleInputChange("name", val)}
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
              {/* sku and barcode removed - now in Variant only */}
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

              {/* Tax Categories */}
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
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
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
                {variants.map((variant, index) => {
                  const displayImage =
                    variant.image ||
                    (variant.existingImage
                      ? { url: variant.existingImage.url }
                      : null);
                  return (
                    <div
                      key={variant.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
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
                          {!variant.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteVariant(variant);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <LuTrash2 className="size-4" />
                            </button>
                          )}
                          {variant.isExpanded ? (
                            <LuChevronUp className="size-5 text-gray-400" />
                          ) : (
                            <LuChevronDown className="size-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      {variant.isExpanded && (
                        <div className="p-4 space-y-4">
                          {/* Row 1: Image + Basic Info */}
                          <div className="flex gap-4">
                            <div className="w-28 shrink-0">
                              {displayImage ? (
                                <div className="relative group">
                                  <img
                                    src={displayImage.url}
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
                                label="SKU"
                                placeholder="VAR-001"
                                value={variant.sku}
                                onValueChange={(val) =>
                                  updateVariant(
                                    variant.id,
                                    "sku",
                                    val.toUpperCase(),
                                  )
                                }
                                error={errors[`variant_${index}_sku`]}
                                requiredSign={true}
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
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                              Pricing
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-2">
                              <p className="text-[10px] text-blue-700 dark:text-blue-400">
                                Buying price auto-calculated from POs
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Input
                              label="Selling Price (৳)"
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

                          {/* Row 4: Inventory */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                Stock: {variant.inventory?.stock || 0}
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
                                  onChange={() => setDefaultVariant(variant.id)}
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
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Features
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Add feature (e.g., Wireless, Bluetooth 5.0)"
                  value={featureInput}
                  onValueChange={setFeatureInput}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                  <LuPlus className="size-4" />
                </Button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="hover:text-red-500"
                      >
                        <LuX className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Specifications
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecification}
                >
                  <LuPlus className="size-4" /> Add
                </Button>
              </div>
              {specifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  No specifications. Click "Add" to create one.
                </p>
              ) : (
                <div className="space-y-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Key (e.g., Weight)"
                        value={spec.key}
                        onValueChange={(val) =>
                          updateSpecification(index, "key", val)
                        }
                      />
                      <Input
                        placeholder="Value (e.g., 200g)"
                        value={spec.value}
                        onValueChange={(val) =>
                          updateSpecification(index, "value", val)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <LuTrash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Description
              </h2>
              <Textarea
                label="Description"
                placeholder="Brief product summary (max 500 characters)"
                value={formData.description}
                onValueChange={(val) => handleInputChange("description", val)}
                rows={2}
                maxLength={500}
              />
              <Textarea
                label="Details"
                placeholder="Full product details..."
                value={formData.details}
                onValueChange={(val) => handleInputChange("details", val)}
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
              {allImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {allImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          img.isExisting
                            ? removeExistingImage(img.index)
                            : removeImage(img.index)
                        }
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
              {allImages.length < 5 && (
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
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} loading={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>

      {/* Variant Delete Confirmation Modal */}
      <ConfirmVariantDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            variantId: null,
            variantDetails: null,
          })
        }
        onConfirm={confirmDeleteVariant}
        variantDetails={deleteModal.variantDetails}
      />
    </div>
  );
}
