"use client";

import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { ArrowLeft, ArrowRight, MoveLeft } from "lucide-react";
import { useState, useRef } from "react";
import {
  LuArrowRight,
  LuChevronDown,
  LuChevronUp,
  LuPackage,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";

export default function PricingDuration({
  formData,
  updateFormData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({});
  const [packages, setPackages] = useState(
    formData.packages || [
      {
        id: 1,
        name: "Package 1",
        isCollapsed: false,
        billingCycle: "",
        billingValue: "",
        duration: "",
        durationValue: "",
        discount: "",
        discountValue: "",
        currency: "",
        price: "",
      },
    ],
  );

  const bottomRef = useRef(null);

  const handlePackageChange = (id, field, value) => {
    const updatedPackages = packages.map((pkg) =>
      pkg.id === id ? { ...pkg, [field]: value } : pkg,
    );
    setPackages(updatedPackages);
    updateFormData({ packages: updatedPackages });
  };

  const addPackage = () => {
    const newPackage = {
      id: Date.now(),
      name: `Package ${packages.length + 1}`,
      isCollapsed: false,
      billingCycle: "",
      billingValue: "",
      duration: "",
      durationValue: "",
      discount: "",
      discountValue: "",
      currency: "",
      price: "",
    };

    const updatedPackages = [...packages, newPackage];
    setPackages(updatedPackages);
    updateFormData({ packages: updatedPackages });
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const removePackage = (id) => {
    if (packages.length > 1) {
      const updatedPackages = packages.filter((pkg) => pkg.id !== id);
      const renamedPackages = updatedPackages.map((pkg, index) => ({
        ...pkg,
        name: `Package ${index + 1}`,
      }));
      setPackages(renamedPackages);
      updateFormData({ packages: renamedPackages });
    }
  };

  const toggleCollapse = (id) => {
    setPackages(
      packages.map((pkg) =>
        pkg.id === id ? { ...pkg, isCollapsed: !pkg.isCollapsed } : pkg,
      ),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    let isValid = true;

    packages.forEach((pkg) => {
      if (!pkg.billingCycle.trim()) {
        newErrors[`billingCycle_${pkg.id}`] = "Billing cycle is required";
        isValid = false;
      }

      if (!pkg.duration.trim()) {
        newErrors[`duration_${pkg.id}`] = "Duration is required";
        isValid = false;
      }

      if (!pkg.currency) {
        newErrors[`currency_${pkg.id}`] = "Currency is required";
        isValid = false;
      }

      if (!pkg.price.trim()) {
        newErrors[`price_${pkg.id}`] = "Price is required";
        isValid = false;
      }

      if (!pkg.billingValue) {
        newErrors[`billingValue_${pkg.id}`] = "Billing value is required";
        isValid = false;
      }

      if (!pkg.durationValue) {
        newErrors[`durationValue_${pkg.id}`] = "Duration value is required";
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      onNext();
    } else {
      setPackages(
        packages.map((pkg) => {
          if (
            newErrors[`billingCycle_${pkg.id}`] ||
            newErrors[`duration_${pkg.id}`] ||
            newErrors[`currency_${pkg.id}`] ||
            newErrors[`price_${pkg.id}`] ||
            newErrors[`billingValue_${pkg.id}`] ||
            newErrors[`durationValue_${pkg.id}`]
          ) {
            return { ...pkg, isCollapsed: false };
          }
          return pkg;
        }),
      );

      // Scroll to the first error
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        if (firstErrorKey) {
          const packageId = firstErrorKey.split("_")[1];
          const packageElement = document.getElementById(
            `package-${packageId}`,
          );
          if (packageElement) {
            const rect = packageElement.getBoundingClientRect();
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;
            const elementTop = rect.top + scrollTop;

            window.scrollTo({
              top: elementTop - 80,
              behavior: "smooth",
            });
          }
        }
      }, 100);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-gradient-to-r from-blue-50 dark:from-[#010611] dark:to-[#01091a] to-indigo-50 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
          Pricing & Duration
        </h2>
        <p className="text-gray-600 dark:text-gray-500 text-sm">
          Configure your package pricing and duration options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id}
              id={`package-${pkg.id}`}
              className={`w-full relative transition-all duration-300 rounded-md border  ${
                Object.keys(errors).some((key) => key.includes(`_${pkg.id}`))
                  ? "border-red-300 dark:border-red-900"
                  : "border-gray-200 dark:border-[#161F2D]"
              }`}
            >
              <div
                className={`flex flex-row items-center justify-between p-4 cursor-pointer  transition-colors bg-[#F6F6F6] dark:bg-[#161F2D] ani3 ${pkg.isCollapsed ? "rounded-md" : "rounded-t-md"} ${
                  Object.keys(errors).some((key) => key.includes(`_${pkg.id}`))
                    ? "bg-red-50"
                    : ""
                }`}
                onClick={() => toggleCollapse(pkg.id)}
              >
                <div className="flex items-center gap-3">
                  <LuPackage className="h-5 w-5 text-black dark:text-primary" />
                  <h3 className="text-lg font-medium">Package {idx + 1}</h3>
                  {Object.keys(errors).some((key) =>
                    key.includes(`_${pkg.id}`),
                  ) && (
                    <span className="text-xs text-red-500 dark:text-red-300 font-medium px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
                      Missing required fields
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {packages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePackage(pkg.id);
                      }}
                      className="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <LuTrash2 className="h-4 w-4" />
                      <span className="sr-only">Remove package</span>
                    </button>
                  )}
                  {pkg.isCollapsed ? (
                    <LuChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <LuChevronUp className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </div>

              <div
                className={`transition-all duration-300 ${pkg.isCollapsed ? "max-h-0 opacity-0 invisible" : "max-h-[1000px] opacity-100 visible"}`}
              >
                <div className="p-6">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`billingCycle_${pkg.id}`}
                          label="Billing Cycle"
                          placeholder="Select billing cycle"
                          options={[
                            { value: "daily", label: "Daily" },
                            { value: "weekly", label: "Weekly" },
                            { value: "monthly", label: "Monthly" },
                            { value: "yearly", label: "Yearly" },
                            { value: "one_time", label: "One Time" },
                          ]}
                          fullWidth
                          requiredSign
                          defaultValue={pkg.billingCycle}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "billingCycle",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`billingCycle_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`billingCycle_${pkg.id}`] &&
                            `${errors[`billingCycle_${pkg.id}`]}`
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Input
                          id={`billingValue_${pkg.id}`}
                          label="Value"
                          type="number"
                          placeholder="Value"
                          fullWidth
                          requiredSign
                          value={pkg.billingValue}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "billingValue",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`billingValue_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`billingValue_${pkg.id}`] &&
                            `${errors[`billingValue_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`duration_${pkg.id}`}
                          label="Duration"
                          placeholder="Select duration"
                          options={[
                            { value: "day", label: "Day" },
                            { value: "week", label: "Week" },
                            { value: "month", label: "Month" },
                            { value: "year", label: "Year" },
                            { value: "one_time", label: "One Time" },
                          ]}
                          fullWidth
                          requiredSign
                          defaultValue={pkg.duration}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "duration",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`duration_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`duration_${pkg.id}`] &&
                            `${errors[`duration_${pkg.id}`]}`
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Input
                          id={`durationValue_${pkg.id}`}
                          label="Value"
                          type="number"
                          placeholder="Value"
                          fullWidth
                          requiredSign
                          value={pkg.durationValue}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "durationValue",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`durationValue_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`durationValue_${pkg.id}`] &&
                            `${errors[`durationValue_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`discount_${pkg.id}`}
                          label="Discount"
                          placeholder="Select discount type"
                          options={[
                            { value: "flat", label: "Flat" },
                            { value: "percentage", label: "Percentage" },
                          ]}
                          fullWidth
                          defaultValue={pkg.discount}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "discount",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`discount_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`discount_${pkg.id}`] &&
                            `${errors[`discount_${pkg.id}`]}`
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Input
                          id={`discountValue_${pkg.id}`}
                          label="Value"
                          type="number"
                          placeholder="Value"
                          fullWidth
                          value={pkg.discountValue}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "discountValue",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`discountValue_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`discountValue_${pkg.id}`] &&
                            `${errors[`discountValue_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`currency_${pkg.id}`}
                          label="Currency"
                          placeholder="Select currency"
                          options={[{ value: "USD", label: "USD" }]}
                          fullWidth
                          className="h-11 dark:border-[#475569]"
                          requiredSign
                          defaultValue={pkg.currency}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "currency",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`currency_${pkg.id}`]: "",
                            }));
                          }}
                          error={
                            errors[`currency_${pkg.id}`] &&
                            `${errors[`currency_${pkg.id}`]}`
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          id={`price_${pkg.id}`}
                          label="Price"
                          type="number"
                          placeholder="Price"
                          fullWidth
                          requiredSign
                          value={pkg.price}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "price",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`price_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`price_${pkg.id}`] &&
                            `${errors[`price_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          {packages.length > 1 ? (
            <div className="flex justify-center ">
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 dark:border-[#1f2f46] border border-gray-200 rounded-full">
                {packages.length} packages configured
              </span>
            </div>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={addPackage}
            className="order-2 sm:order-1 flex items-center justify-center gap-2  text-primary hover:text-blue-800  font-medium transition-colors text-sm"
          >
            <div className="bg-primary/50 h-7 w-7 rounded-full center ">
              <LuPlus className="h-5 w-5 text-white" />
            </div>
            Create Another Package
          </button>
        </div>

        <div className="bg-white/90 dark:bg-[#161F2D] dark:border-[#2d3a4d] backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-md dark:shadow-none shadow-gray-100 z-10 mt-6">
          <div className="order-1 sm:order-2 flex flex-col justify-between sm:flex-row gap-4 ">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-md transition-colors text-sm"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            <button
              type="submit"
              className=" flex items-center justify-center gap-2 bg-primary hover:bg-[#005bd2] text-white py-3 px-4 rounded-md transition-colors text-sm font-normal"
            >
              Continue to Discount System
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      <div ref={bottomRef} />
    </div>
  );
}
