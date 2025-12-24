"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "../ui/button/Button";
import { Checkbox } from "../ui/checkbox/Checkbox";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Textarea } from "../ui/textarea/Textarea";
import { Calendar } from "../ui/calender/Calender";
import { LuCalendar } from "react-icons/lu";

const initialData = {
  title: "Explore the Wonders of Bali",
  duration: "5 Days 4 Nights",
  maxPeople: "20",
  location: "Bali, Indonesia",
  price: {
    adultPrice: "450",
    babyPrice: "100",
    childPrice: "250",
    bookingAmount: "100",
  },
  discount: {
    type: "percentage",
    value: "10",
  },
  images: [],
  highlights: [
    "Visit to Uluwatu Temple",
    "Traditional Balinese Dance Show",
    "Sunset Dinner at Jimbaran Beach",
  ],
  overview:
    "This Bali tour offers a perfect blend of culture, nature, and relaxation. Enjoy iconic temples, cultural performances, pristine beaches, and luxurious accommodations.",
  inclusion: ["Hotel accommodation", "Daily breakfast", "Airport transfers"],
  exclusions: ["Personal expenses", "Travel insurance", "Visa fees"],
  itinerary: [
    {
      label: "Day 1 - Arrival & Check-in",
      activities: [
        {
          time: "10:00 AM",
          title: "Arrival at Airport",
          location: "Ngurah Rai International Airport",
          description: "Meet and greet, transfer to hotel, welcome drink.",
        },
        {
          time: "5:00 PM",
          title: "Free Time",
          location: "Hotel",
          description: "Relax and enjoy hotel amenities.",
        },
      ],
    },
    {
      label: "Day 2 - Temple Visit",
      activities: [
        {
          time: "9:00 AM",
          title: "Visit Uluwatu Temple",
          location: "Uluwatu",
          description: "Explore ancient sea temple and cliff views.",
        },
        {
          time: "6:00 PM",
          title: "Kecak Dance Performance",
          location: "Uluwatu Stage",
          description: "Watch cultural performance during sunset.",
        },
      ],
    },
  ],
  isFeatured: true,
  bookingDeadline: "2025-08-15",
  status: "active",
  packagePdf: {
    file: null,
    name: "bali-package-details.pdf",
  },
  tipsAndTricks: [
    "Carry light clothes and sunscreen",
    "Respect temple dress codes",
    "Keep emergency contact handy",
  ],
  faq: [
    {
      question: "Is airfare included?",
      answer: "No, this package does not include international airfare.",
    },
    {
      question: "Can I extend my stay?",
      answer: "Yes, please contact support to customize your package.",
    },
  ],
};

export default function PackageEditForm() {
  // Form data state
  const [formData, setFormData] = useState(initialData);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePriceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        [field]: value,
      },
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleDiscountChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      discount: {
        ...prev.discount,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          {
            file,
            url: imageUrl,
            publicId: `temp_${Date.now()}_${Math.random()}`,
          },
        ],
      }));
    });

    if (errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        packagePdf: {
          file,
          name: file.name,
        },
      }));
    }
  };

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ""],
    }));
  };

  const removeHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const updateHighlight = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addInclusion = () => {
    setFormData((prev) => ({
      ...prev,
      inclusion: [...prev.inclusion, ""],
    }));
  };

  const removeInclusion = (index) => {
    setFormData((prev) => ({
      ...prev,
      inclusion: prev.inclusion.filter((_, i) => i !== index),
    }));
  };

  const updateInclusion = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      inclusion: prev.inclusion.map((item, i) => (i === index ? value : item)),
    }));
  };

  const addExclusion = () => {
    setFormData((prev) => ({
      ...prev,
      exclusions: [...prev.exclusions, ""],
    }));
  };

  const removeExclusion = (index) => {
    setFormData((prev) => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index),
    }));
  };

  const updateExclusion = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      exclusions: prev.exclusions.map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addItineraryDay = () => {
    const dayNumber = formData.itinerary.length + 1;
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          label: `Day ${dayNumber}`,
          activities: [
            {
              time: "",
              title: "",
              location: "",
              description: "",
            },
          ],
        },
      ],
    }));
  };

  const removeItineraryDay = (dayIndex) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== dayIndex),
    }));
  };

  const updateItineraryDay = (dayIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === dayIndex ? { ...day, [field]: value } : day
      ),
    }));
  };

  const addActivity = (dayIndex) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              activities: [
                ...day.activities,
                {
                  time: "",
                  title: "",
                  location: "",
                  description: "",
                },
              ],
            }
          : day
      ),
    }));
  };

  const removeActivity = (dayIndex, activityIndex) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              activities: day.activities.filter((_, j) => j !== activityIndex),
            }
          : day
      ),
    }));
  };

  const updateActivity = (dayIndex, activityIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              activities: day.activities.map((activity, j) =>
                j === activityIndex ? { ...activity, [field]: value } : activity
              ),
            }
          : day
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Basic validation
    if (!formData.title.trim()) {
      newErrors.title = "Package title is required";
      isValid = false;
    }

    if (!formData.duration) {
      newErrors.duration = "Duration is required";
      isValid = false;
    }

    if (!formData.maxPeople) {
      newErrors.maxPeople = "Maximum people is required";
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    if (!formData.price.adultPrice) {
      newErrors.adultPrice = "Adult price is required";
      isValid = false;
    }

    if (!formData.overview.trim()) {
      newErrors.overview = "Overview is required";
      isValid = false;
    }

    if (formData.images.length === 0) {
      newErrors.images = "At least one image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      const loadingToast = toast.loading("Creating package...");

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.dismiss(loadingToast);
        toast.success("Package updated successfully!");

        setTimeout(() => {
          router.push("/packages");
        }, 1000);
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Failed to update package. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const discountTypeOptions = [
    { value: "flat", label: "Flat Amount" },
    { value: "percentage", label: "Percentage" },
  ];

  return (
    <div className="bg-white dark:bg-[#010611]  p-6 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 p-5">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Eidf Package
        </h1>
        <Link
          href="/packages"
          className="text-primary hover:text-gray-800 px-5 py-1.5 rounded flex items-center gap-3"
        >
          <Icon icon="lucide:arrow-left" className="size-5" />
          All Packages
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-[#161F2D] rounded-xl border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:file-text" className="size-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={"Package Title "}
                placeholder="Amazing Bali Adventure Tour"
                value={formData.title}
                onValueChange={(value) => handleInputChange("title", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
                error={errors.title}
                requiredSign={true}
              />

              <Input
                label={"Duration"}
                placeholder="5 Days 4 Nights"
                value={formData.duration}
                onValueChange={(value) => handleInputChange("duration", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
                error={errors.duration}
                requiredSign={true}
              />

              <Input
                label={"Maximum People"}
                type="number"
                placeholder="20"
                value={formData.maxPeople}
                onValueChange={(value) => handleInputChange("maxPeople", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
                error={errors.maxPeople}
                requiredSign={true}
              />

              <Input
                label={"Location"}
                placeholder="Bali, Indonesia"
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
                error={errors.location}
                requiredSign={true}
              />

              <Calendar
                label="Booking Deadline"
                value={formData.bookingDeadline}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, bookingDeadline: value }))
                }
                startIcon={<LuCalendar className="h-4 w-4" />}
                required
                requiredSign={true}
                className="h-12 dark:border-[#475569] w-full"
              />

              <Select
                label="Package Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
              />
            </div>

            <div>
              <Textarea
                label={"Package Overview"}
                placeholder="Describe your package in detail. Include what makes it special, key attractions, and what travelers can expect..."
                value={formData.overview}
                onValueChange={(value) => handleInputChange("overview", value)}
                fullWidth
                className="min-h-[120px] dark:border-[#475569]"
                error={errors.overview}
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:dollar-sign" className="size-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                Pricing Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Input
                label={"Adult Price"}
                type="number"
                placeholder="500"
                value={formData.price.adultPrice}
                onValueChange={(value) =>
                  handlePriceChange("adultPrice", value)
                }
                fullWidth
                className="h-12 dark:border-[#475569]"
                error={errors.adultPrice}
                requiredSign={true}
              />

              <Input
                label="Child Price"
                type="number"
                placeholder="300"
                value={formData.price.childPrice}
                onValueChange={(value) =>
                  handlePriceChange("childPrice", value)
                }
                fullWidth
                className="h-12 dark:border-[#475569]"
                requiredSign={true}
              />

              <Input
                label="Baby Price"
                type="number"
                placeholder="100"
                value={formData.price.babyPrice}
                onValueChange={(value) => handlePriceChange("babyPrice", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
                requiredSign={true}
              />

              <Input
                label="Booking Amount"
                type="number"
                placeholder="100"
                value={formData.price.bookingAmount}
                onValueChange={(value) =>
                  handlePriceChange("bookingAmount", value)
                }
                fullWidth
                className="h-12 dark:border-[#475569]"
                requiredSign={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Discount Type"
                options={discountTypeOptions}
                value={formData.discount.type}
                onValueChange={(value) => handleDiscountChange("type", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
              />

              <Input
                label={`Discount Value ${formData.discount.type === "percentage" ? "(%)" : "($)"}`}
                type="number"
                placeholder={
                  formData.discount.type === "percentage" ? "10" : "50"
                }
                value={formData.discount.value}
                onValueChange={(value) => handleDiscountChange("value", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
              />
            </div>
          </div>

          {/* Package Images */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:image" className="size-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                Package Images
              </h2>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Icon
                  icon="lucide:image-plus"
                  className="mx-auto h-12 w-12 text-gray-400 mb-3"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Package image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Icon icon="lucide:x" className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.images && (
              <p className="text-xs text-red-500 error-message">
                {errors.images}
              </p>
            )}
          </div>

          {/* Package Highlights */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:star" className="size-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                Package Highlights
              </h2>
            </div>

            <div className="space-y-4">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    placeholder="Enter package highlight (e.g., Visit iconic temples)"
                    value={highlight}
                    onValueChange={(value) => updateHighlight(index, value)}
                    fullWidth
                    className="h-12 dark:border-[#475569]"
                  />
                  {formData.highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Icon icon="lucide:trash-2" className="size-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addHighlight}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:plus" className="size-5" />
                Add Highlight
              </button>
            </div>
          </div>

          {/* Inclusion & Exclusions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inclusions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon
                  icon="lucide:check-circle"
                  className="size-5 text-green-500"
                />
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                  What's Included
                </h2>
              </div>

              <div className="space-y-4">
                {formData.inclusion.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="What's included (e.g., Hotel accommodation)"
                      value={item}
                      onValueChange={(value) => updateInclusion(index, value)}
                      fullWidth
                      className="h-12 dark:border-[#475569]"
                    />
                    {formData.inclusion.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInclusion(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Icon icon="lucide:trash-2" className="size-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInclusion}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:plus" className="size-5" />
                  Add Inclusion
                </button>
              </div>
            </div>

            {/* Exclusions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="lucide:x-circle" className="size-5 text-red-500" />
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                  What's Excluded
                </h2>
              </div>

              <div className="space-y-4">
                {formData.exclusions.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="What's excluded (e.g., Personal expenses)"
                      value={item}
                      onValueChange={(value) => updateExclusion(index, value)}
                      fullWidth
                      className="h-12 dark:border-[#475569]"
                    />
                    {formData.exclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExclusion(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Icon icon="lucide:trash-2" className="size-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExclusion}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:plus" className="size-5" />
                  Add Exclusion
                </button>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon
                icon="lucide:calendar-days"
                className="size-5 text-primary"
              />
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                Itinerary
              </h2>
            </div>

            <div className="space-y-6">
              {formData.itinerary.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <Input
                      placeholder="Day label (e.g., Day 1 - Arrival)"
                      value={day.label}
                      onValueChange={(value) =>
                        updateItineraryDay(dayIndex, "label", value)
                      }
                      className="w-96 h-12 border-gray-100 bg-gray-100"
                    />
                    {formData.itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(dayIndex)}
                        className="size-10 center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Icon icon="lucide:trash-2" className="size-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {day.activities.map((activity, activityIndex) => (
                      <div
                        key={activityIndex}
                        className=" p-8 relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3  bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Input
                          label="Activity Time"
                          placeholder="Time (e.g., 09:00 AM)"
                          value={activity.time}
                          onValueChange={(value) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              "time",
                              value
                            )
                          }
                          className="h-12 dark:border-[#475569]"
                        />
                        <Input
                          label="Activity Title"
                          placeholder="Activity title"
                          value={activity.title}
                          onValueChange={(value) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              "title",
                              value
                            )
                          }
                          className="h-12 dark:border-[#475569]"
                        />
                        <Input
                          label="Location"
                          placeholder="Location"
                          value={activity.location}
                          onValueChange={(value) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              "location",
                              value
                            )
                          }
                          className="h-12 dark:border-[#475569]"
                        />
                        <div className="flex gap-2 lg:col-span-3">
                          <Textarea
                            label="Description"
                            placeholder="Description"
                            value={activity.description}
                            onValueChange={(value) =>
                              updateActivity(
                                dayIndex,
                                activityIndex,
                                "description",
                                value
                              )
                            }
                            fullWidth
                            className="flex-1 dark:border-[#475569]"
                          />
                        </div>
                        {day.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeActivity(dayIndex, activityIndex)
                            }
                            className="absolute top-1 right-1 px-2 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          >
                            <Icon
                              icon="proicons:cancel-square"
                              className="size-6"
                            />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addActivity(dayIndex)}
                    className="w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="lucide:plus" className="size-4" />
                    Add Activity
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addItineraryDay}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:plus" className="size-5" />
                Add Day
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:info" className="size-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                Additional Information
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tips & Tricks
                </label>

                {formData.tipsAndTricks.map((tip, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="e.g., Best time to visit is March to May"
                      value={tip}
                      onValueChange={(value) => {
                        const updated = [...formData.tipsAndTricks];
                        updated[index] = value;
                        setFormData((prev) => ({
                          ...prev,
                          tipsAndTricks: updated,
                        }));
                      }}
                      fullWidth
                      className="h-12 dark:border-[#475569]"
                    />
                    {formData.tipsAndTricks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            tipsAndTricks: prev.tipsAndTricks.filter(
                              (_, i) => i !== index
                            ),
                          }));
                        }}
                        className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Icon icon="lucide:trash-2" className="size-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      tipsAndTricks: [...prev.tipsAndTricks, ""],
                    }))
                  }
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:plus" className="size-5" />
                  Add Tip
                </button>
              </div>

              <div className="space-y-5 mt-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Package PDF
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex items-center gap-3"
                    >
                      <Icon
                        icon="lucide:file-text"
                        className="h-8 w-8 text-gray-400"
                      />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.packagePdf
                            ? formData.packagePdf.name
                            : "Click to upload package PDF"}
                        </p>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={formData.isFeatured}
                    onValueChange={(value) =>
                      handleInputChange("isFeatured", value)
                    }
                    label="Mark as Featured Package"
                    helperText="Featured packages will be highlighted on the homepage"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Frequently Asked Questions (FAQ)
              </label>

              {formData.faq.map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 border p-4 rounded-lg border-gray-300 dark:border-gray-600"
                >
                  <Input
                    label="Question"
                    placeholder="e.g., What is included in the package?"
                    value={item.question}
                    onValueChange={(value) => {
                      const updated = [...formData.faq];
                      updated[index].question = value;
                      setFormData((prev) => ({ ...prev, faq: updated }));
                    }}
                    fullWidth
                    className="h-12 dark:border-[#475569]"
                  />
                  <Textarea
                    label="Answer"
                    placeholder="e.g., Hotel, meals, transport, and activities are included..."
                    value={item.answer}
                    onValueChange={(value) => {
                      const updated = [...formData.faq];
                      updated[index].answer = value;
                      setFormData((prev) => ({ ...prev, faq: updated }));
                    }}
                    className="min-h-[100px] dark:border-[#475569]"
                  />
                  <div className="flex justify-end">
                    {formData.faq.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            faq: prev.faq.filter((_, i) => i !== index),
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:hover:bg-red-900/20 px-3 py-2 rounded-md transition-colors center gap-2 text-sm"
                      >
                        <Icon icon="lucide:trash-2" className="size-4" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    faq: [...prev.faq, { question: "", answer: "" }],
                  }))
                }
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:plus" className="size-5" />
                Add FAQ
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <div className="w-fit">
              <Button
                type="submit"
                className="w-full h-11 px-8"
                endIcon={<Icon icon="lucide:arrow-right" className="size-4" />}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Package"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
