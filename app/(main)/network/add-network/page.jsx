"use client";

import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { RadioGroup } from "@/components/ui/radio/RadioGroup";
import { useGetPackageIdAndNameListFromDBQuery } from "@/features/package/packageApiSlice";
import { useCreateNetworkMutation } from "@/features/network/networkApiSlice";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CreateNetwork() {
  const { data } = useGetPackageIdAndNameListFromDBQuery();
  const exitingPackage = data?.data || [];

  const packageOptions = [
    ...exitingPackage.map(({ _id, name }) => ({
      value: _id,
      label: name,
    })),
    {
      value: "custom",
      label: "Custom",
    },
  ];

  const initialFormData = {
    networkName: "",
    networkDomain: "",
    email: "",
    packageId: "",
    billingCycle: "",
    billingValue: "",
    durationUnit: "",
    durationValue: "",
    currency: "USD",
    currencyValue: "",
  };
  const [createNetwork, { isLoading }] = useCreateNetworkMutation();
  const [selectedPricingOptions, setSelectedPricingOptions] = useState([]);
  const [selectedPricingOptionId, setSelectedPricingOptionId] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isCustomPackage = formData.packageId === "custom";

  const billingCycleOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "one_time", label: "One time" },
  ];

  const durationOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "one_time", label: "One time" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("creating...");
    try {
      let payload;

      if (isCustomPackage) {
        payload = {
          email: formData.email,
          networkName: formData.networkName,
          networkDomain: formData.networkDomain,
          packageData: {
            pricingOptions: [
              {
                billing: {
                  cycleType: formData.billingCycle.toLowerCase(),
                  cycleValue: parseInt(formData.billingValue),
                },
                duration: {
                  unit: formData.durationUnit.toLowerCase(),
                  value: parseInt(formData.durationValue),
                },
                currency: formData.currency.toUpperCase(),
                price: parseFloat(formData.currencyValue),
              },
            ],
            packageType: "custom",
          },
        };
      } else {
        const selectedPricing = selectedPricingOptions.find(
          (option) =>
            `${option.duration.value} ${option.duration.unit}` ===
            selectedPricingOptionId,
        );

        if (!selectedPricing) {
          toast.dismiss(loadingToast);
          toast.error("Please select a Package duration.");
          return;
        }

        payload = {
          email: formData.email,
          networkName: formData.networkName,
          networkDomain: formData.networkDomain,
          packageId: formData.packageId,
          pricingOptionId: selectedPricing._id,
        };
      }

      await createNetwork(payload).unwrap();
      toast.success("Network created successfully!", { id: "success" });
      toast.dismiss(loadingToast);
      setFormData(initialFormData);
      setSelectedPricingOptions([]);
      setSelectedPricingOptionId("");
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong!", {
        id: "error",
      });
      toast.dismiss(loadingToast);
      setFormData(initialFormData);
      setSelectedPricingOptions([]);
      setSelectedPricingOptionId("");
    }
  };

  return (
    <div className="max-w-full bg-white dark:bg-[#010611] p-5 rounded-xl minBody">
      <div className="between">
        <h1 className="text-2xl font-medium md:mb-8 mb-5">Create Network</h1>
        <Link
          href="/network/manage-network"
          className="bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-900/50 dark:text-gray-300 hover:bg-gray-300 text-gray-800 px-5 py-1.5 rounded-md text-sm"
        >
          Show Networks
        </Link>
      </div>

      <div className="bg-white dark:bg-[#161F2D] shadow-lg dark:shadow-none p-5 md:p-8 rounded-lg border border-gray-100 dark:border-[#161F2D] max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-6">Create Network</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Network Name"
              placeholder="Enter Network Name"
              value={formData.networkName}
              onValueChange={(value) => handleInputChange("networkName", value)}
              required
              className="h-12 dark:border-[#475569]"
              fullWidth
            />

            <Input
              label="Network Domain"
              placeholder="brandtech.com"
              value={formData.networkDomain}
              onValueChange={(value) =>
                handleInputChange("networkDomain", value)
              }
              required
              className="h-12 dark:border-[#475569]"
              fullWidth
            />

            <Input
              label="Email"
              type="email"
              placeholder="brand@gmail.com"
              value={formData.email}
              onValueChange={(value) => handleInputChange("email", value)}
              required
              className="h-12 dark:border-[#475569]"
              fullWidth
            />

            <Select
              label="Package"
              options={packageOptions}
              value={formData.packageId}
              onValueChange={(value) => {
                handleInputChange("packageId", value);

                if (value === "custom") {
                  setSelectedPricingOptions([]);
                  setSelectedPricingOptionId("");
                } else {
                  const matched = exitingPackage.find(
                    (pkg) => pkg._id === value,
                  );
                  setSelectedPricingOptions(matched?.pricingOptions || []);
                  setSelectedPricingOptionId("");
                }
              }}
              required
              className="h-12 dark:border-[#475569]"
              fullWidth
            />

            {/* Show Payment Options if not custom */}
            {!isCustomPackage && selectedPricingOptions.length > 0 && (
              <div className="md:col-span-2">
                <RadioGroup
                  label="Package Duration"
                  options={selectedPricingOptions.map((option) => ({
                    value: `${option.duration.value} ${option.duration.unit}`,
                    label: `${option.duration.value} ${option.duration.unit}`,
                  }))}
                  name="payment"
                  value={selectedPricingOptionId}
                  onValueChange={(value) => {
                    setSelectedPricingOptionId(value);
                  }}
                  orientation=""
                />
              </div>
            )}

            {/* Show custom fields if "Custom" */}
            {isCustomPackage && (
              <>
                <Select
                  label="Billing Cycle"
                  options={billingCycleOptions}
                  value={formData.billingCycle}
                  onValueChange={(value) =>
                    handleInputChange("billingCycle", value)
                  }
                  placeholder="Monthly, Quarterly, One time"
                  required
                  className="h-12 dark:border-[#475569]"
                />

                <Input
                  label="Billing Value"
                  placeholder="12"
                  value={formData.billingValue}
                  onValueChange={(value) =>
                    handleInputChange("billingValue", value)
                  }
                  required
                  type="number"
                  className="h-12 dark:border-[#475569]"
                  fullWidth
                />

                <Select
                  label="Duration Unit"
                  options={durationOptions}
                  value={formData.durationUnit}
                  onValueChange={(value) =>
                    handleInputChange("durationUnit", value)
                  }
                  placeholder="Day, Month, Year"
                  required
                  className="h-12 dark:border-[#475569]"
                  fullWidth
                />

                <Input
                  label="Duration Value"
                  placeholder="12"
                  value={formData.durationValue}
                  onValueChange={(value) =>
                    handleInputChange("durationValue", value)
                  }
                  required
                  type="number"
                  className="h-12 dark:border-[#475569]"
                  fullWidth
                />

                <Select
                  label="Currency"
                  options={[{ value: "USD", label: "USD" }]}
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                  placeholder="usd, eur"
                  required
                  className="h-12 dark:border-[#475569]"
                  fullWidth
                />
                <Input
                  label="Currency Value"
                  placeholder="399"
                  type="number"
                  value={formData.currencyValue}
                  onValueChange={(value) =>
                    handleInputChange("currencyValue", value)
                  }
                  required
                  className="h-12 dark:border-[#475569]"
                  fullWidth
                />
              </>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            endIcon={!isLoading && <LuArrowRight />}
          >
            {isLoading ? "Creating..." : "Create Network"}
          </Button>
        </form>
      </div>
    </div>
  );
}
