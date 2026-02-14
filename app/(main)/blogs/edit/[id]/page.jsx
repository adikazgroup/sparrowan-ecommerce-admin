"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuSave, LuImage, LuX, LuLoader } from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import {
  useGetSingleBlogQuery,
  useUpdateBlogMutation,
} from "@/features/blogs/blogsApiSlice";
import {
  useGetCategoriesIdNameQuery,
  useGetChildrenByParentIdQuery,
} from "@/features/categories/categoriesApiSlice";
import generateFormData from "@/utils/generateFormData";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

const getFileExtension = (filename) => {
  return filename?.split(".").pop()?.toLowerCase() || "";
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id;

  const { data: blogData, isLoading: isFetching } = useGetSingleBlogQuery(
    blogId,
    { skip: !blogId },
  );
  const [updateBlog, { isLoading }] = useUpdateBlogMutation();
  const { data: categoriesData } = useGetCategoriesIdNameQuery({ level: 0 });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    subCategory: "",
    childCategory: "",
    tags: [],
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    featuredImage: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Fetch subcategories when category is selected
  const { data: subCategoriesData } = useGetChildrenByParentIdQuery(
    formData.category,
    { skip: !formData.category },
  );

  // Fetch child categories when subcategory is selected
  const { data: childCategoriesData } = useGetChildrenByParentIdQuery(
    formData.subCategory,
    { skip: !formData.subCategory },
  );

  const categoryOptions =
    categoriesData?.data?.map((cat) => ({
      value: cat.value,
      label: cat.label,
    })) || [];

  const subCategoryOptions =
    subCategoriesData?.data?.map((cat) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  const childCategoryOptions =
    childCategoriesData?.data?.map((cat) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  useEffect(() => {
    if (blogData?.data) {
      const blog = blogData.data;
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        content: blog.content || "",
        category: blog.category?._id || blog.category || "",
        subCategory: blog.subCategory?._id || blog.subCategory || "",
        childCategory: blog.childCategory?._id || blog.childCategory || "",
        tags: blog.tags || [],
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        status: blog.status || "draft",
        featuredImage: blog.featuredImage
          ? {
              url: blog.featuredImage.url,
              publicId: blog.featuredImage.publicId,
            }
          : null,
      });
      setExistingImage(blog.featuredImage || null);
    }
  }, [blogData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
      subCategory: "",
      childCategory: "",
    }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleSubCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      subCategory: value,
      childCategory: "",
    }));
  };

  const generateSlug = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSlugChange = (value) => {
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const processImageFile = (file) => {
    if (!file) return;

    const ext = getFileExtension(file.name);
    const maxSize = 5 * 1024 * 1024;

    if (!IMAGE_FORMATS.includes(ext)) {
      toast.error("Only JPG, JPEG, PNG, WebP formats allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      featuredImage: {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isNew: true,
      },
    }));
  };

  const handleImageUpload = (e) => {
    processImageFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processImageFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, featuredImage: null }));
    setExistingImage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const blogPayload = cleanPayload({
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      category: formData.category,
      subCategory: formData.subCategory,
      childCategory: formData.childCategory,
      tags: formData.tags,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      status: formData.status,
    });

    // Handle featuredImage: new upload, keep existing, or delete
    if (formData.featuredImage?.file) {
      // New upload - file sent via FormData
    } else if (existingImage) {
      blogPayload.featuredImage = existingImage;
    } else {
      blogPayload.featuredImage = { url: "", publicId: "" };
    }

    const payload = { data: JSON.stringify(blogPayload) };
    if (formData.featuredImage?.file) {
      payload.featuredImage = formData.featuredImage.file;
    }

    const loadingToast = toast.loading("Updating blog...");
    const result = await updateBlog({
      id: blogId,
      data: generateFormData(payload),
    });

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-blog",
      message: "Blog updated successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/blogs");
    }
  };

  if (isFetching) {
    return (
      <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl flex items-center justify-center">
        <LuLoader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/blogs"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Blog
            </h1>
            <p className="text-sm text-gray-500">Update blog post details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Blog Title"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onValueChange={(val) => handleInputChange("title", val)}
                  error={errors.title}
                  requiredSign={true}
                />
                <Input
                  label="Slug"
                  placeholder="blog-slug"
                  value={formData.slug}
                  onValueChange={handleSlugChange}
                  error={errors.slug}
                  requiredSign={true}
                />
              </div>
              <Textarea
                label="Content"
                placeholder="Write your blog content here..."
                value={formData.content}
                onValueChange={(val) => handleInputChange("content", val)}
                error={errors.content}
                rows={10}
                requiredSign={true}
              />
            </div>

            {/* Categories */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={categoryOptions}
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                    placeholder="Select category"
                    className="w-full"
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Sub Category
                  </label>
                  <Select
                    options={subCategoryOptions}
                    value={formData.subCategory}
                    onValueChange={handleSubCategoryChange}
                    placeholder="Select subcategory"
                    className="w-full"
                    disabled={
                      !formData.category || subCategoryOptions.length === 0
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Child Category
                  </label>
                  <Select
                    options={childCategoryOptions}
                    value={formData.childCategory}
                    onValueChange={(val) =>
                      handleInputChange("childCategory", val)
                    }
                    placeholder="Select child category"
                    className="w-full"
                    disabled={
                      !formData.subCategory || childCategoryOptions.length === 0
                    }
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                SEO
              </h2>
              <Input
                label="Meta Title"
                placeholder="SEO title"
                value={formData.metaTitle}
                onValueChange={(val) => handleInputChange("metaTitle", val)}
              />
              <Textarea
                label="Meta Description"
                placeholder="SEO description"
                value={formData.metaDescription}
                onValueChange={(val) =>
                  handleInputChange("metaDescription", val)
                }
                rows={3}
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

            {/* Tags */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Tags
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a tag"
                  value={formData.newTag || ""}
                  onValueChange={(val) => handleInputChange("newTag", val)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const tag = formData.newTag?.trim();
                      if (tag && !formData.tags.includes(tag)) {
                        setFormData((prev) => ({
                          ...prev,
                          tags: [...prev.tags, tag],
                          newTag: "",
                        }));
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const tag = formData.newTag?.trim();
                    if (tag && !formData.tags.includes(tag)) {
                      setFormData((prev) => ({
                        ...prev,
                        tags: [...prev.tags, tag],
                        newTag: "",
                      }));
                    }
                  }}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <LuX className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Image */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuImage className="size-4" />
                Featured Image
              </h2>
              {formData.featuredImage ? (
                <div className="relative group">
                  <img
                    src={formData.featuredImage.url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LuX className="size-4" />
                  </button>
                  {formData.featuredImage.name && (
                    <p className="text-xs text-gray-500 mt-2 text-center truncate">
                      {formData.featuredImage.name}
                    </p>
                  )}
                  {formData.featuredImage.isExisting && (
                    <p className="text-xs text-blue-500 mt-1 text-center">
                      Current image
                    </p>
                  )}
                </div>
              ) : (
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <LuImage className="size-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP (Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/blogs">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Blog"}
          </Button>
        </div>
      </form>
    </div>
  );
}
