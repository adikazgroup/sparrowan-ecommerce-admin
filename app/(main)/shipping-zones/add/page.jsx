"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuPlus, LuTrash2, LuX } from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { useCreateShippingZoneMutation } from "@/features/shippingZones/shippingZonesApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const rateTypeOptions = [
  { label: "Flat Rate", value: "flat" },
  { label: "Weight Based", value: "weight_based" },
  { label: "Price Based", value: "price_based" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const countryOptions = [
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "India", value: "India" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "Nepal", value: "Nepal" },
  { label: "Sri Lanka", value: "Sri Lanka" },
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Canada", value: "Canada" },
  { label: "Australia", value: "Australia" },
];

export default function AddShippingZonePage() {
  const router = useRouter();
  const [createZone, { isLoading }] = useCreateShippingZoneMutation();

  const [formData, setFormData] = useState({
    name: "",
    countries: ["Bangladesh"],
    states: [],
    cities: [],
    freeShippingEnabled: false,
    freeShippingThreshold: "",
    priority: 0,
    status: "active",
    rates: [
      {
        name: "Standard Shipping",
        rateType: "flat",
        flatRate: "",
        weightRanges: [],
        priceRanges: [],
        estimatedDeliveryDays: { min: 1, max: 3 },
        isDefault: true,
      },
    ],
  });

  const [tempInputs, setTempInputs] = useState({
    state: "",
    city: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Add state/city handlers
  const addState = () => {
    const trimmed = tempInputs.state.trim();
    if (!trimmed) {
      toast.error("Please enter a state/division name");
      return;
    }
    if (formData.states.includes(trimmed)) {
      toast.error("This state/division already exists");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      states: [...prev.states, trimmed],
    }));
    setTempInputs((prev) => ({ ...prev, state: "" }));
  };

  const removeState = (index) => {
    setFormData((prev) => ({
      ...prev,
      states: prev.states.filter((_, i) => i !== index),
    }));
  };

  const addCity = () => {
    const trimmed = tempInputs.city.trim();
    if (!trimmed) {
      toast.error("Please enter a city name");
      return;
    }
    if (formData.cities.includes(trimmed)) {
      toast.error("This city already exists");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      cities: [...prev.cities, trimmed],
    }));
    setTempInputs((prev) => ({ ...prev, city: "" }));
  };

  const removeCity = (index) => {
    setFormData((prev) => ({
      ...prev,
      cities: prev.cities.filter((_, i) => i !== index),
    }));
  };

  // Rate handlers
  const handleRateChange = (index, field, value) => {
    const newRates = [...formData.rates];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newRates[index][parent][child] = value;
    } else {
      newRates[index][field] = value;

      // Auto-add range if switching type and empty
      if (field === "rateType") {
        if (
          value === "weight_based" &&
          (!newRates[index].weightRanges ||
            newRates[index].weightRanges.length === 0)
        ) {
          newRates[index].weightRanges = [
            { minWeight: 0, maxWeight: 0, rate: 0 },
          ];
        }
        if (
          value === "price_based" &&
          (!newRates[index].priceRanges ||
            newRates[index].priceRanges.length === 0)
        ) {
          newRates[index].priceRanges = [{ minPrice: 0, maxPrice: 0, rate: 0 }];
        }
      }
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
          weightRanges: [],
          priceRanges: [],
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
    const newRates = formData.rates.map((rate, i) => ({
      ...rate,
      isDefault: i === index,
    }));
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  // Weight range handlers
  const addWeightRange = (rateIndex) => {
    const newRates = [...formData.rates];
    if (!newRates[rateIndex].weightRanges) {
      newRates[rateIndex].weightRanges = [];
    }
    newRates[rateIndex].weightRanges.push({
      minWeight: 0,
      maxWeight: 0,
      rate: 0,
    });
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const removeWeightRange = (rateIndex, rangeIndex) => {
    const newRates = [...formData.rates];
    newRates[rateIndex].weightRanges = newRates[rateIndex].weightRanges.filter(
      (_, i) => i !== rangeIndex,
    );
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const handleWeightRangeChange = (rateIndex, rangeIndex, field, value) => {
    const newRates = [...formData.rates];
    newRates[rateIndex].weightRanges[rangeIndex][field] = value;
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  // Price range handlers
  const addPriceRange = (rateIndex) => {
    const newRates = [...formData.rates];
    if (!newRates[rateIndex].priceRanges) {
      newRates[rateIndex].priceRanges = [];
    }
    newRates[rateIndex].priceRanges.push({
      minPrice: 0,
      maxPrice: 0,
      rate: 0,
    });
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const removePriceRange = (rateIndex, rangeIndex) => {
    const newRates = [...formData.rates];
    newRates[rateIndex].priceRanges = newRates[rateIndex].priceRanges.filter(
      (_, i) => i !== rangeIndex,
    );
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const handlePriceRangeChange = (rateIndex, rangeIndex, field, value) => {
    const newRates = [...formData.rates];
    newRates[rateIndex].priceRanges[rangeIndex][field] = value;
    setFormData((prev) => ({ ...prev, rates: newRates }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (formData.countries.length === 0)
      newErrors.countries = "Select at least one country";
    if (formData.states.length === 0)
      newErrors.states = "Add at least one state";
    if (
      formData.priority === "" ||
      formData.priority === null ||
      formData.priority === undefined
    )
      newErrors.priority = "Required";

    if (formData.freeShippingEnabled && !formData.freeShippingThreshold) {
      newErrors.freeShippingThreshold = "Required";
    }

    formData.rates.forEach((rate, index) => {
      if (!rate.name.trim()) newErrors[`rate_${index}_name`] = "Required";

      if (rate.rateType === "flat" && !rate.flatRate)
        newErrors[`rate_${index}_flatRate`] = "Required";

      if (rate.rateType === "weight_based") {
        if (!rate.weightRanges || rate.weightRanges.length === 0) {
          newErrors[`rate_${index}_weightRanges`] =
            "Add at least one weight range";
        } else {
          rate.weightRanges.forEach((wr, wrIndex) => {
            if (!wr.maxWeight)
              newErrors[`rate_${index}_wr_${wrIndex}_maxWeight`] = "Required";
            if (!wr.rate)
              newErrors[`rate_${index}_wr_${wrIndex}_rate`] = "Required";
          });
        }
      }

      if (rate.rateType === "price_based") {
        if (!rate.priceRanges || rate.priceRanges.length === 0) {
          newErrors[`rate_${index}_priceRanges`] =
            "Add at least one price range";
        } else {
          rate.priceRanges.forEach((pr, prIndex) => {
            if (!pr.maxPrice)
              newErrors[`rate_${index}_pr_${prIndex}_maxPrice`] = "Required";
            if (!pr.rate)
              newErrors[`rate_${index}_pr_${prIndex}_rate`] = "Required";
          });
        }
      }

      if (!rate.estimatedDeliveryDays.min)
        newErrors[`rate_${index}_minDays`] = "Required";
      if (!rate.estimatedDeliveryDays.max)
        newErrors[`rate_${index}_maxDays`] = "Required";
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

    const zoneData = cleanPayload({
      name: formData.name,
      countries: formData.countries,
      states: formData.states.length > 0 ? formData.states : [],
      cities: formData.cities.length > 0 ? formData.cities : [],
      freeShippingEnabled: formData.freeShippingEnabled,
      freeShippingThreshold:
        formData.freeShippingEnabled && formData.freeShippingThreshold
          ? Number(formData.freeShippingThreshold)
          : null,
      priority: Number(formData.priority),
      status: formData.status,
      rates: formData.rates.map((r) => {
        const rateData = {
          name: r.name,
          rateType: r.rateType,
          estimatedDeliveryDays: {
            min: Number(r.estimatedDeliveryDays.min),
            max: Number(r.estimatedDeliveryDays.max),
          },
          isDefault: r.isDefault,
        };

        if (r.rateType === "flat") {
          rateData.flatRate = Number(r.flatRate);
        } else if (r.rateType === "weight_based") {
          rateData.weightRanges = r.weightRanges.map((wr) => ({
            minWeight: Number(wr.minWeight),
            maxWeight: Number(wr.maxWeight),
            rate: Number(wr.rate),
          }));
        } else if (r.rateType === "price_based") {
          rateData.priceRanges = r.priceRanges.map((pr) => ({
            minPrice: Number(pr.minPrice),
            maxPrice: Number(pr.maxPrice),
            rate: Number(pr.rate),
          }));
        }

        return rateData;
      }),
    });

    const loadingToast = toast.loading("Creating shipping zone...");
    const result = await createZone(zoneData);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-zone",
      message: "Shipping zone created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/shipping-zones");
    }
  };

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add Shipping Zone
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new shipping zone with rates and coverage areas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Zone Information
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Define the basic details and geographic coverage
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Zone Name"
                  placeholder="e.g., Dhaka City, International"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={countryOptions}
                    value={formData.countries[0]}
                    onValueChange={(val) =>
                      handleInputChange("countries", [val])
                    }
                    className="w-full"
                  />
                  {errors.countries && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.countries}
                    </p>
                  )}
                </div>
              </div>

              {/* States/Divisions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  States/Divisions <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Dhaka, Chittagong"
                    value={tempInputs.state}
                    onValueChange={(val) =>
                      setTempInputs((prev) => ({ ...prev, state: val }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addState();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addState}
                    variant="outline"
                    className="shrink-0"
                  >
                    <LuPlus className="size-4" />
                  </Button>
                </div>
                {formData.states.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.states.map((state, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        {state}
                        <button
                          type="button"
                          onClick={() => removeState(index)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-full p-0.5"
                        >
                          <LuX className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.states && (
                  <p className="text-xs text-red-500 mt-1">{errors.states}</p>
                )}
              </div>

              {/* Cities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Cities
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Mirpur, Uttara"
                    value={tempInputs.city}
                    onValueChange={(val) =>
                      setTempInputs((prev) => ({ ...prev, city: val }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCity();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addCity}
                    variant="outline"
                    className="shrink-0"
                  >
                    <LuPlus className="size-4" />
                  </Button>
                </div>
                {formData.cities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.cities.map((city, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-full text-sm"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => removeCity(index)}
                          className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                        >
                          <LuX className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Rates */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Shipping Rates
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Configure pricing based on flat, weight, or order value
                  </p>
                </div>
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

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        label="Rate Name"
                        placeholder="Standard"
                        value={rate.name}
                        onValueChange={(val) =>
                          handleRateChange(index, "name", val)
                        }
                        error={errors[`rate_${index}_name`]}
                        requiredSign={true}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Rate Type <span className="text-red-500">*</span>
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
                          error={errors[`rate_${index}_minDays`]}
                          requiredSign={true}
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
                          error={errors[`rate_${index}_maxDays`]}
                          requiredSign={true}
                        />
                      </div>
                    </div>

                    {/* Flat Rate */}
                    {rate.rateType === "flat" && (
                      <Input
                        label="Flat Rate (৳)"
                        type="number"
                        placeholder="60"
                        value={rate.flatRate}
                        onValueChange={(val) =>
                          handleRateChange(index, "flatRate", val)
                        }
                        error={errors[`rate_${index}_flatRate`]}
                        requiredSign={true}
                      />
                    )}

                    {/* Weight Based */}
                    {rate.rateType === "weight_based" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Weight Ranges (kg){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addWeightRange(index)}
                          >
                            <LuPlus className="size-3" /> Add Range
                          </Button>
                        </div>
                        {rate.weightRanges?.map((wr, wrIndex) => (
                          <div
                            key={wrIndex}
                            className="flex gap-2 items-start bg-white dark:bg-gray-800 p-3 rounded"
                          >
                            <Input
                              label="Min Weight"
                              type="number"
                              placeholder="0"
                              value={wr.minWeight}
                              onValueChange={(val) =>
                                handleWeightRangeChange(
                                  index,
                                  wrIndex,
                                  "minWeight",
                                  val,
                                )
                              }
                              requiredSign={true}
                            />
                            <Input
                              label="Max Weight"
                              type="number"
                              placeholder="5"
                              value={wr.maxWeight}
                              onValueChange={(val) =>
                                handleWeightRangeChange(
                                  index,
                                  wrIndex,
                                  "maxWeight",
                                  val,
                                )
                              }
                              error={
                                errors[`rate_${index}_wr_${wrIndex}_maxWeight`]
                              }
                              requiredSign={true}
                            />
                            <Input
                              label="Rate (৳)"
                              type="number"
                              placeholder="60"
                              value={wr.rate}
                              onValueChange={(val) =>
                                handleWeightRangeChange(
                                  index,
                                  wrIndex,
                                  "rate",
                                  val,
                                )
                              }
                              error={errors[`rate_${index}_wr_${wrIndex}_rate`]}
                              requiredSign={true}
                            />
                            <div className="pt-7">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  removeWeightRange(index, wrIndex)
                                }
                                className="shrink-0 h-10 w-10 p-0"
                              >
                                <LuTrash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {errors[`rate_${index}_weightRanges`] && (
                          <p className="text-xs text-red-500">
                            {errors[`rate_${index}_weightRanges`]}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Price Based */}
                    {rate.rateType === "price_based" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Price Ranges (৳){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addPriceRange(index)}
                          >
                            <LuPlus className="size-3" /> Add Range
                          </Button>
                        </div>
                        {rate.priceRanges?.map((pr, prIndex) => (
                          <div
                            key={prIndex}
                            className="flex gap-2 items-start bg-white dark:bg-gray-800 p-3 rounded"
                          >
                            <Input
                              label="Min Price"
                              type="number"
                              placeholder="0"
                              value={pr.minPrice}
                              onValueChange={(val) =>
                                handlePriceRangeChange(
                                  index,
                                  prIndex,
                                  "minPrice",
                                  val,
                                )
                              }
                              requiredSign={true}
                            />
                            <Input
                              label="Max Price"
                              type="number"
                              placeholder="1000"
                              value={pr.maxPrice}
                              onValueChange={(val) =>
                                handlePriceRangeChange(
                                  index,
                                  prIndex,
                                  "maxPrice",
                                  val,
                                )
                              }
                              error={
                                errors[`rate_${index}_pr_${prIndex}_maxPrice`]
                              }
                              requiredSign={true}
                            />
                            <Input
                              label="Rate (৳)"
                              type="number"
                              placeholder="60"
                              value={pr.rate}
                              onValueChange={(val) =>
                                handlePriceRangeChange(
                                  index,
                                  prIndex,
                                  "rate",
                                  val,
                                )
                              }
                              error={errors[`rate_${index}_pr_${prIndex}_rate`]}
                              requiredSign={true}
                            />
                            <div className="pt-7">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removePriceRange(index, prIndex)}
                                className="shrink-0 h-10 w-10 p-0"
                              >
                                <LuTrash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {errors[`rate_${index}_priceRanges`] && (
                          <p className="text-xs text-red-500">
                            {errors[`rate_${index}_priceRanges`]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Zone Settings */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Zone Settings
              </h2>
              {/* Priority & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Priority"
                  type="number"
                  placeholder="0"
                  value={formData.priority}
                  onValueChange={(val) =>
                    setFormData({ ...formData, priority: val })
                  }
                  error={errors.priority}
                  requiredSign={true}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={statusOptions}
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({ ...formData, status: val })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Free Shipping */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="freeShipping"
                  checked={formData.freeShippingEnabled}
                  onValueChange={(checked) =>
                    setFormData({ ...formData, freeShippingEnabled: checked })
                  }
                />
                <label
                  htmlFor="freeShipping"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Enable Free Shipping
                </label>
              </div>

              {formData.freeShippingEnabled && (
                <Input
                  label="Free Shipping Threshold (৳)"
                  type="number"
                  placeholder="5000"
                  value={formData.freeShippingThreshold}
                  onValueChange={(val) =>
                    setFormData({ ...formData, freeShippingThreshold: val })
                  }
                  error={errors.freeShippingThreshold}
                  requiredSign={true}
                />
              )}
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/shipping-zones")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Zone"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
