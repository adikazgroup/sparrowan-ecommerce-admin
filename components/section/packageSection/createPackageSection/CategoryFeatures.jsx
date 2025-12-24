"use client";

import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { useGetCategoryFeatureListQuery } from "@/features/feature/featureApiSlice";
import { useEffect, useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuChevronDown,
  LuChevronUp,
  LuSkipForward,
} from "react-icons/lu";

export default function CategoryFeatures({
  formData,
  updateFormData,
  onNext,
  onBack,
  onlyBody = false,
  expandedSections = {},
  toggleSection,
}) {
  const { data, isLoading } = useGetCategoryFeatureListQuery();
  const categories = data?.data || [];
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (!activeTab && categories.length > 0) {
      const defaultCategory = categories[0]?.category;
      setActiveTab(defaultCategory);
      updateFormData({ category: defaultCategory });
    }
  }, [categories, activeTab, formData.category, updateFormData]);

  const handleCategoryChange = (category) => {
    setActiveTab(category);
    updateFormData({ category });
  };

  const handleFeatureToggle = (featureId) => {
    const currentFeatures = formData.features || [];
    if (currentFeatures.includes(featureId)) {
      updateFormData({
        features: currentFeatures.filter((id) => id !== featureId),
      });
    } else {
      updateFormData({
        features: [...currentFeatures, featureId],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const handleSkip = () => {
    onNext();
  };

  const handleSectionClick = () => {
    if (onlyBody && typeof toggleSection === "function") {
      console.log("first");
      toggleSection("categoryFeatures");
    }
  };

  const shouldShowBody = !onlyBody || expandedSections.categoryFeatures;
  console.log(
    "expandedSections.categoryFeatures",
    expandedSections.categoryFeatures,
  );
  return (
    <div className="w-full space-y-6">
      {!onlyBody && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#010611] dark:to-[#01091a] p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
            Category & Features
          </h2>
          <p className="text-gray-600 dark:text-gray-500 text-sm">
            Select a category and choose features for your package
          </p>
        </div>
      )}

      <div
        className={`bg-white dark:bg-[#161F2D] dark:border-[#303e52]  rounded-lg border border-gray-200 shadow-sm ${!onlyBody ? "p-6" : "p-4"} `}
      >
        <div
          className={`flex justify-between items-center  cursor-pointer ${shouldShowBody && "mb-6"} ${!onlyBody && "mb-6"}`}
          onClick={handleSectionClick}
        >
          <h2 className={` font-medium ${onlyBody ? "text-lg" : "text-xl"}`}>
            Category & Features
          </h2>
          {!onlyBody ? (
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-500 text-sm font-medium"
            >
              Skip now
            </button>
          ) : expandedSections.categoryFeatures ? (
            <LuChevronUp className="h-5 w-5 text-blue-500" />
          ) : (
            <LuChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {shouldShowBody && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 border border-gray-300 dark:border-[#475569] p-5 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Category
                </label>

                <div className="flex flex-wrap gap-3 pb-2 mb-2">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 text-sm rounded mr-2 bg-gray-200 dark:bg-gray-700 animate-pulse w-24 h-8"
                        />
                      ))
                    : categories.map((catObj) => (
                        <button
                          key={catObj.category}
                          type="button"
                          className={`px-4 py-2 text-sm whitespace-nowrap rounded mr-2 border ${
                            activeTab === catObj.category
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-transparent text-gray-700 dark:text-gray-300 border-gray-400 hover:border-gray-200"
                          }`}
                          onClick={() => handleCategoryChange(catObj.category)}
                        >
                          {catObj.category}
                        </button>
                      ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Select Features
                </label>

                <div className="space-y-5">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 animate-pulse"
                        >
                          <div className="w-4 h-4 rounded-sm bg-gray-300 dark:bg-gray-700" />
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-40" />
                        </div>
                      ))
                    : categories
                        .find((cat) => cat.category === activeTab)
                        ?.features.map((feature) => (
                          <div key={feature.id} className="flex items-center">
                            <Checkbox
                              label={
                                feature?.value
                                  ? `${feature?.value} ${feature?.label}`
                                  : `${feature?.label}`
                              }
                              size="xs"
                              checked={
                                formData.features?.includes(feature.id) || false
                              }
                              onValueChange={() =>
                                handleFeatureToggle(feature.id)
                              }
                            />
                          </div>
                        ))}
                </div>
              </div>
            </div>

            {!onlyBody && (
              <div className="mt-10 flex justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-md transition-colors"
                >
                  <LuArrowLeft className="h-5 w-5" />
                  Back
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-[#005bd2] text-white py-3 px-4 rounded-md transition-colors text-sm font-normal"
                >
                  Continue to Review & Submit
                  <LuArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
