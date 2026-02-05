"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuArrowLeft,
  LuSave,
  LuPlus,
  LuTrash2,
  LuLoader,
} from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import {
  useGetSingleShippingZoneQuery,
  useUpdateShippingZoneMutation,
} from "@/features/shippingZones/shippingZonesApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const rateTypeOptions = [
  { value: "flat", label: "Flat Rate" },
  { value: "weight_based", label: "Weight Based" },
  { value: "price_based", label: "Price Based" },
];

export default function EditShippingZonePage() {
  const router = useRouter();
  const params = useParams();
  const zoneId = params.id;

  const { data: zoneData, isLoading: isFetching } =
    useGetSingleShippingZoneQuery(zoneId);
  const [updateZone, { isLoading }] = useUpdateShippingZoneMutation();

  const [formData, setFormData] = useState({
    name: "",
    countries: ["Bangladesh"],
    cities: "",
    freeShippingEnabled: false,
    freeShippingThreshold: "",
    priority: 0,
    status: "active",
    rates: [
      {
        name: "Standard Shipping",
        rateType: "flat",
        flatRate: "",
        estimatedDeliveryDays: { min: 1, max: 3 },
        isDefault: true,
      },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (zoneData?.data) {
      const zone = zoneData.data;
      setFormData({
        name: zone.name || "",
        countries: zone.countries || ["Bangladesh"],
        cities: zone.cities?.join(", ") || "",
        freeShippingEnabled: zone.freeShippingEnabled || false,
        freeShippingThreshold: zone.freeShippingThreshold || "",
        priority: zone.priority || 0,
        status: zone.status || "active",
        rates: zone.rates?.length
          ? zone.rates.map((r) => ({
              name: r.name || "",
              rateType: r.rateType || "flat",
              flatRate: r.flatRate || "",
              estimatedDeliveryDays: r.estimatedDeliveryDays || {
                min: 1,
                max: 3,
              },
              isDefault: r.isDefault || false,
            }))
          : [
              {
                name: "Standard Shipping",
                rateType: "flat",
                flatRate: "",
                estimatedDeliveryDays: { min: 1, max: 3 },
                isDefault: true,
              },
            ],
      });
    }
  }, [zoneData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRateChange = (index, field, value) => {
    const newRates = [...formData.rates];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newRates[index][parent][child] = value;
    } else {
      newRates[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const addRate = () => {
    setFormData((prev) => ({
      ...prev,
      rates: [
        ...prev.rates,
        {
          name: "",
          rateType: "flat",
          flatRate: "",
          estimatedDeliveryDays: { min: 1, max: 3 },
          isDefault: false,
        },
      ],
    }));
  };

  const removeRate = (index) => {
    if (formData.rates.length <= 1) {
      toast.error("At least one rate is required");
      return;
    }
    const newRates = formData.rates.filter((_, i) => i !== index);
    if (!newRates.some((r) => r.isDefault) && newRates.length > 0) {
      newRates[0].isDefault = true;
    }
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const setDefaultRate = (index) => {
    const newRates = formData.rates.map((r, i) => ({
      ...r,
      isDefault: i === index,
    }));
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.countries.length)
      newErrors.countries = "At least one country is required";

    formData.rates.forEach((rate, index) => {
      if (!rate.name.trim()) {
        newErrors[`rate_${index}_name`] = "Rate name is required";
      }
      if (
        rate.rateType === "flat" &&
        (!rate.flatRate || Number(rate.flatRate) < 0)
      ) {
        newErrors[`rate_${index}_flatRate`] = "Valid rate is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const citiesArray = formData.cities
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);

    const zonePayload = cleanPayload({
      name: formData.name,
      countries: formData.countries,
      cities: citiesArray.length > 0 ? citiesArray : [],
      freeShippingEnabled: formData.freeShippingEnabled,
      freeShippingThreshold:
        formData.freeShippingEnabled && formData.freeShippingThreshold
          ? Number(formData.freeShippingThreshold)
          : null,
      priority: Number(formData.priority),
      status: formData.status,
      rates: formData.rates.map((r) => ({
        name: r.name,
        rateType: r.rateType,
        flatRate: Number(r.flatRate),
        estimatedDeliveryDays: {
          min: Number(r.estimatedDeliveryDays.min),
          max: Number(r.estimatedDeliveryDays.max),
        },
        isDefault: r.isDefault,
      })),
    });

    const loadingToast = toast.loading("Updating shipping zone...");
    const result = await updateZone({ id: zoneId, data: zonePayload });

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-zone",
      message: "Shipping zone updated successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/shipping-zones");
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
            href="/shipping-zones"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Shipping Zone
            </h1>
            <p className="text-sm text-gray-500">Update: {formData.name}</p>
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
                Zone Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Zone Name"
                  placeholder="Inside Dhaka"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <Input
                  label="Country"
                  placeholder="Bangladesh"
                  value={formData.countries[0]}
                  onValueChange={(val) => handleInputChange("countries", [val])}
                  error={errors.countries}
                  requiredSign={true}
                />
              </div>
              <Input
                label="Cities (comma separated)"
                placeholder="Dhaka, Mirpur, Uttara, Dhanmondi..."
                value={formData.cities}
                onValueChange={(val) => handleInputChange("cities", val)}
              />
            </div>

            {/* Shipping Rates */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Shipping Rates
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRate}
                >
                  <LuPlus className="size-4" /> Add Rate
                </Button>
              </div>

              {formData.rates.map((rate, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    rate.isDefault
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="defaultRate"
                        checked={rate.isDefault}
                        onChange={() => setDefaultRate(index)}
                        className="text-primary"
                      />
                      <span className="text-sm text-gray-500">
                        Default Rate
                      </span>
                    </div>
                    {formData.rates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRate(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <LuTrash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      label="Rate Name"
                      placeholder="Standard"
                      value={rate.name}
                      onValueChange={(val) =>
                        handleRateChange(index, "name", val)
                      }
                      error={errors[`rate_${index}_name`]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Rate Type
                      </label>
                      <Select
                        options={rateTypeOptions}
                        value={rate.rateType}
                        onValueChange={(val) =>
                          handleRateChange(index, "rateType", val)
                        }
                        className="w-full"
                      />
                    </div>
                    <Input
                      label="Rate (৳)"
                      type="number"
                      placeholder="60"
                      value={rate.flatRate}
                      onValueChange={(val) =>
                        handleRateChange(index, "flatRate", val)
                      }
                      error={errors[`rate_${index}_flatRate`]}
                    />
                    <div className="flex gap-2">
                      <Input
                        label="Min Days"
                        type="number"
                        value={rate.estimatedDeliveryDays.min}
                        onValueChange={(val) =>
                          handleRateChange(
                            index,
                            "estimatedDeliveryDays.min",
                            val,
                          )
                        }
                      />
                      <Input
                        label="Max Days"
                        type="number"
                        value={rate.estimatedDeliveryDays.max}
                        onValueChange={(val) =>
                          handleRateChange(
                            index,
                            "estimatedDeliveryDays.max",
                            val,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
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
              <Input
                label="Priority"
                type="number"
                placeholder="0"
                value={formData.priority}
                onValueChange={(val) => handleInputChange("priority", val)}
              />
              <p className="text-xs text-gray-500">
                Higher priority zones are matched first
              </p>
            </div>

            {/* Free Shipping */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Free Shipping
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={formData.freeShippingEnabled}
                  onChange={(e) =>
                    handleInputChange("freeShippingEnabled", e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="freeShipping"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Enable free shipping
                </label>
              </div>
              {formData.freeShippingEnabled && (
                <Input
                  label="Free Shipping Threshold (৳)"
                  type="number"
                  placeholder="1000"
                  value={formData.freeShippingThreshold}
                  onValueChange={(val) =>
                    handleInputChange("freeShippingThreshold", val)
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/shipping-zones">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isLoading}>
            <LuSave className="size-4" />
            Update Zone
          </Button>
        </div>
      </form>
    </div>
  );
}
