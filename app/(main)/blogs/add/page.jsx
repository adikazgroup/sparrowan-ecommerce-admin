"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuSave, LuImage, LuX } from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateBlogMutation } from "@/features/blogs/blogsApiSlice";
import { useGetCategoriesIdNameQuery } from "@/features/categories/categoriesApiSlice";
import generateFormData from "@/utils/generateFormData";
import { handleToast } from "@/utils/handleToast";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

const getFileExtension = (filename) => {
  return filename?.split(".").pop()?.toLowerCase() || "";
};

export default function AddBlogPage() {
  const router = useRouter();
  const [createBlog, { isLoading }] = useCreateBlogMutation();
  const { data: categoriesData } = useGetCategoriesIdNameQuery();

  const categoryOptions =
    categoriesData?.data?.map((cat) => ({
      value: cat.value,
      label: cat.label,
    })) || [];

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    subCategory: "",
    childCategory: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    featuredImage: null,
  });

  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const generateSlug = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTitleChange = (value) => {
    setFormData((prev) => {
      const newState = { ...prev, title: value };
      if (!isSlugManuallyEdited) {
        newState.slug = generateSlug(value);
      }
      return newState;
    });
    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
    if (!isSlugManuallyEdited && errors.slug)
      setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const handleSlugChange = (value) => {
    setIsSlugManuallyEdited(true);
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
      },
    }));
    if (errors.featuredImage) {
      setErrors((prev) => ({ ...prev, featuredImage: "" }));
    }
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

    const blogData = {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      category: formData.category,
      subCategory: formData.subCategory || null,
      childCategory: formData.childCategory || null,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      metaTitle: formData.metaTitle || null,
      metaDescription: formData.metaDescription || null,
      status: formData.status,
    };

    const payload = { data: JSON.stringify(blogData) };
    if (formData.featuredImage?.file)
      payload.featuredImage = formData.featuredImage.file;

    const loadingToast = toast.loading("Creating blog...");
    const result = await createBlog(generateFormData(payload));

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-blog",
      message: "Blog created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/blogs");
    }
  };

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
              Add New Blog
            </h1>
            <p className="text-sm text-gray-500">Create a new blog post</p>
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
                  onValueChange={handleTitleChange}
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
                    onValueChange={(val) => handleInputChange("category", val)}
                    placeholder="Select category"
                    className="w-full"
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
                <Input
                  label="Sub Category ID"
                  placeholder="Optional"
                  value={formData.subCategory}
                  onValueChange={(val) => handleInputChange("subCategory", val)}
                />
                <Input
                  label="Child Category ID"
                  placeholder="Optional"
                  value={formData.childCategory}
                  onValueChange={(val) =>
                    handleInputChange("childCategory", val)
                  }
                />
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
              <Input
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onValueChange={(val) => handleInputChange("tags", val)}
              />
              <p className="text-xs text-gray-500">Separate tags with commas</p>
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
                  <p className="text-xs text-gray-500 mt-2 text-center truncate">
                    {formData.featuredImage.name}
                  </p>
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
            {isLoading ? "Creating..." : "Create Blog"}
          </Button>
        </div>
      </form>
    </div>
  );
}
