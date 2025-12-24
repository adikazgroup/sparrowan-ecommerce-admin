// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import { Icon } from "@iconify/react";
// import { LuTag } from "react-icons/lu";
// import { Input } from "@/components/ui/input/Input";
// import { Button } from "@/components/ui/button/Button";
// import { Select } from "@/components/ui/select/Select";
// import { Calendar } from "@/components/ui/calender/Calender";
// import { MultipleSearchSelect } from "@/components/ui/select/MultipleSearchSelect";
// import { useGetPackageIdAndNameListFromDBQuery } from "@/features/package/packageApiSlice";
// import { useCreateCouponMutation } from "@/features/coupon/couponApiSlice";
// import { handleToast } from "@/utils/handleToast";

// export default function CreateCouponPage() {
//   const initialState = {
//     description: "",
//     code: "",
//     couponType: "flat",
//     discountValue: "",
//     applicablePackages: [],
//     expiresAt: "",
//     status: "active",
//     usageLimit: "",
//   };

//   const { data } = useGetPackageIdAndNameListFromDBQuery(initialState);
//   const couponType = data?.data || [];

//   const formattedCouponType = couponType.map(({ _id, name }) => ({
//     value: _id,
//     label: name,
//   }));

//   // Form state with default applicablePackages
//   const [formData, setFormData] = useState({
//     description: "",
//     code: "",
//     couponType: "flat",
//     discountValue: "",
//     applicablePackages: [],
//     expiresAt: "",
//     status: "active",
//     usageLimit: "",
//   });

//   const handleFormChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]:
//         value && value.target && value.target.value !== undefined
//           ? value.target.value
//           : value,
//     }));
//   };
//   const typeOptions = [
//     { value: "flat", label: "Flat" },
//     { value: "percentage", label: "Percentage" },
//   ];

//   const statusOptions = [
//     { value: "active", label: "Active" },
//     { value: "inactive", label: "Inactive" },
//     { value: "expired", label: "Expired" },
//   ];

//   const [createCoupon, { isLoading }] = useCreateCouponMutation();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const result = await createCoupon(formData);
//     if (result?.data) {
//       handleToast(result);
//       setFormData(initialState);
//     } else {
//       handleToast(result, "error");
//     }
//   };

//   return (
//     <div className="bg-white minBody p-5 rounded-lg dark:bg-[#010611] dark:text-white space-y-5">
//       <div className="between mb-10">
//         <h1 className="text-2xl font-semibold text-gray-800 dark:text-white dark:font-medium">
//           Create Coupon
//         </h1>
//         <Link
//           href="/coupon"
//           className="text-sm font-medium px-3 py-1.5 rounded bg-gray-100 dark:bg-[#161F2D]"
//         >
//           Back
//         </Link>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className="max-w-3xl mx-auto p-6 shadow-lg shadow-gray-100 dark:shadow-none dark:border-gray-800 border border-gray-100 rounded-xl"
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <Input
//               label="Code"
//               value={formData.code}
//               onValueChange={(value) => handleFormChange("code", value)}
//               placeholder="Enter coupon code"
//               required
//               className=" h-12 dark:border-[#475569]"
//               fullWidth
//             />
//           </div>

//           <div>
//             <Input
//               label="Description"
//               value={formData.description}
//               onValueChange={(value) => handleFormChange("description", value)}
//               placeholder="Enter coupon description"
//               className=" h-12 dark:border-[#475569]"
//               fullWidth
//             />
//           </div>

//           <div>
//             <Select
//               label="Coupon Type"
//               options={typeOptions}
//               value={formData.couponType}
//               onValueChange={(value) => handleFormChange("couponType", value)}
//               required
//               className="h-12 dark:border-[#475569]"
//               fullWidth
//             />
//           </div>

//           <div>
//             <Input
//               label="Discount Value"
//               value={formData.discountValue}
//               onValueChange={(value) =>
//                 handleFormChange("discountValue", value)
//               }
//               placeholder="Enter discount value"
//               required
//               className="h-12 dark:border-[#475569]"
//               fullWidth
//             />
//           </div>

//           <div>
//             <MultipleSearchSelect
//               label="Applicable Packages"
//               placeholder="Select your Packages"
//               searchPlaceholder="Search for Packages..."
//               options={formattedCouponType}
//               startIcon={<LuTag className="h-4 w-4" />}
//               fullWidth
//               value={formData.applicablePackages}
//               onChange={(value) =>
//                 handleFormChange("applicablePackages", value)
//               }
//             />
//           </div>

//           <div>
//             <Input
//               label="Usage Limit"
//               value={formData.usageLimit}
//               onValueChange={(value) => handleFormChange("usageLimit", value)}
//               placeholder="Enter usage limit"
//               required
//               className="h-12 dark:border-[#475569]"
//               fullWidth
//             />
//           </div>

//           <div>
//             <Calendar
//               label="Expiry Date"
//               value={formData.expiresAt}
//               onChange={(value) => handleFormChange("expiresAt", value)}
//               minDate={new Date()}
//               required
//               inputClass="h-12 dark:border-[#475569]"
//             />
//           </div>

//           <div>
//             <Select
//               label="Status"
//               options={statusOptions}
//               value={formData.status}
//               onValueChange={(value) => handleFormChange("status", value)}
//               required
//               className=" h-12 dark:border-[#475569]"
//               fullWidth
//             />
//           </div>
//         </div>

//         <div className="mt-6">
//           <Button
//             type="submit"
//             className="w-full dark:font-normal bg-blue-600 hover:bg-blue-700"
//             disabled={isLoading}
//             endIcon={
//               isLoading ? (
//                 <Icon
//                   icon="eos-icons:loading"
//                   className="size-5 animate-spin"
//                 />
//               ) : (
//                 <Icon
//                   icon="material-symbols:arrow-right-alt-rounded"
//                   className="size-5"
//                 />
//               )
//             }
//           >
//             {isLoading ? "Creating..." : "Create Coupon"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Input } from "@/components/ui/input/Input";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Calendar } from "@/components/ui/calender/Calender";
import { MultipleSearchSelect } from "@/components/ui/select/MultipleSearchSelect";
import { LuTag } from "react-icons/lu";
import Link from "next/link";
import { Icon } from "@iconify/react";

const discountTypeOptions = [
  { value: "flat", label: "Flat Amount" },
  { value: "percentage", label: "Percentage" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];

export default function CreateCouponForm({ createModal, onCouponCreate }) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "flat",
    discountValue: "",
    applicablePackages: [],
    minOrderAmount: "",
    isPublic: true,
    eligibleUsers: "",
    usageLimit: "",
    expiresAt: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
      isValid = false;
    }
    if (!formData.type) {
      newErrors.type = "Type is required";
      isValid = false;
    }
    if (!formData.discountValue || isNaN(formData.discountValue)) {
      newErrors.discountValue = "Valid discount value is required";
      isValid = false;
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
      isValid = false;
    }

    if (!formData.expiresAt) {
      newErrors.expiresAt = "Expiration date is required";
      isValid = false;
    }

    if (!formData.isPublic && !formData.eligibleUsers.trim()) {
      newErrors.eligibleUsers = "Eligible users required for private coupon";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onCouponCreate(formData);
      toast.success("Coupon created successfully!");
      createModal.close();
      setFormData({
        code: "",
        description: "",
        type: "flat",
        discountValue: "",
        applicablePackages: "",
        minOrderAmount: "",
        isPublic: true,
        eligibleUsers: "",
        usageLimit: "",
        expiresAt: "",
        status: "active",
      });
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  return (
    <div className="bg-white minBody p-5 rounded-lg dark:bg-[#010611] dark:text-white space-y-5">
      <div className="between mb-5">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white dark:font-medium">
          Create Coupon
        </h1>
        <Link
          href="/coupon"
          className="text-sm font-medium px-3 py-1.5 rounded bg-gray-100 dark:bg-[#161F2D] center gap-2"
        >
          <Icon icon="mynaui:arrow-left" className="size-4" />
          Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4  border border-gray-200 p-5 rounded-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Coupon Code *"
            placeholder="Enter coupon code"
            value={formData.code}
            onValueChange={(value) => handleChange("code", value)}
            error={errors.code}
            className="h-12"
          />

          <Select
            label="Type"
            options={discountTypeOptions}
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
            error={errors.type}
            className="h-12"
          />

          <Input
            label={
              formData.type === "percentage"
                ? "Discount Value (%) *"
                : "Discount Value ($) *"
            }
            type="number"
            placeholder={formData.type === "percentage" ? "10" : "20"}
            value={formData.discountValue}
            onValueChange={(value) => handleChange("discountValue", value)}
            error={errors.discountValue}
            className="h-12"
          />

          <div>
            <MultipleSearchSelect
              label="Applicable Packages"
              placeholder="Select your Packages"
              searchPlaceholder="Search for Packages..."
              options={[
                { value: "pk1", label: "Bangkok Explorer - 5 Days" },
                { value: "pk2", label: "Paris Romantic Getaway" },
                { value: "pk3", label: "Bali Beach Retreat" },
                { value: "pk4", label: "New York City Highlights" },
                { value: "pk5", label: "Dubai Desert Adventure" },
                { value: "pk6", label: "Tokyo Cultural Tour" },
                { value: "pk7", label: "London City Experience" },
                { value: "pk8", label: "Maldives Honeymoon Package" },
                { value: "pk9", label: "Rome & Venice Historic Tour" },
                { value: "pk10", label: "Swiss Alps Family Escape" },
              ]}
              startIcon={<LuTag className="h-4 w-4" />}
              fullWidth
              value={formData.applicablePackages}
              onValueChange={(value) =>
                handleChange("applicablePackages", value)
              }
              className="h-12"
            />
          </div>

          <Input
            label="Minimum Order Amount"
            type="number"
            placeholder="0.00"
            value={formData.minOrderAmount}
            onValueChange={(value) => handleChange("minOrderAmount", value)}
            className="h-12"
          />

          <div>
            <Calendar
              label="Expiry Date"
              value={formData.expiresAt}
              onChange={(value) => handleChange("expiresAt", value)}
              minDate={new Date()}
              required
              inputClass="h-12 dark:border-[#475569]"
            />
          </div>

          <Select
            label="Is Public?"
            options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]}
            value={formData.isPublic}
            onValueChange={(value) => handleChange("isPublic", value)}
            className="h-12"
          />

          {!formData.isPublic && (
            <MultipleSearchSelect
              label="Eligible Users"
              placeholder="Select your users"
              searchPlaceholder="Search for user..."
              options={[
                { value: "user1", label: "Arif Shikder" },
                { value: "user2", label: "Moshiur Rahman" },
                { value: "user3", label: "Jannatul Ferdous" },
                { value: "user4", label: "Tariqul Islam" },
                { value: "user5", label: "Sadia Hossain" },
                { value: "user6", label: "Rahim Uddin" },
                { value: "user7", label: "Farhana Akter" },
                { value: "user8", label: "Md. Shahin Alam" },
                { value: "user9", label: "Nusrat Jahan" },
                { value: "user10", label: "Tanvir Hasan" },
              ]}
              startIcon={<LuTag className="h-4 w-4" />}
              fullWidth
              value={formData.eligibleUsers}
              onValueChange={(value) => handleChange("eligibleUsers", value)}
              className="h-12"
            />
          )}

          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
            error={errors.status}
            className="h-12"
          />

          <Input
            label="Usage Limit"
            type="number"
            placeholder="100"
            value={formData.usageLimit}
            onValueChange={(value) => handleChange("usageLimit", value)}
            className="h-12"
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Enter coupon description"
          value={formData.description}
          onValueChange={(value) => handleChange("description", value)}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Coupon
          </Button>
        </div>
      </form>
    </div>
  );
}
