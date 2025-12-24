"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ImagePlus, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import generateFormData from "@/utils/generateFormData";
import { LuEye, LuEyeOff, LuArrowRight, LuCamera } from "react-icons/lu";
import { employeRoleOptions } from "@/utils/DataHelper";

export default function AddEmployeForm() {
  const isLoading = false;

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    status: "active",
    role: "admin",
    profileImage: null,
    designation: "",
  });

  const router = useRouter();
  // RTK Query mutation hook

  // Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    status: "",
    role: "",
    profileImage: "",
    designation: "",
  });

  // Form submission state
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        profileImage: {
          file,
          url: imageUrl,
        },
      }));

      // Clear profile image error
      setErrors((prev) => ({
        ...prev,
        profileImage: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate full name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Validate designation
    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
      isValid = false;
    }

    // Validate profile image
    if (!formData.profileImage) {
      newErrors.profileImage = "Profile image is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const payload = {
        data: JSON.stringify(formData),
      };
      if (formData.profileImage?.file) {
        payload.image = formData.profileImage.file;
      }
      const formattedData = generateFormData(payload);

      // Loading toast
      const loadingToast = toast.loading("Creating employe...");

      try {
        console.log("formData".formData);
        toast.dismiss(loadingToast);
        toast.success("Employe created successfully!");
        setTimeout(() => {
          router.push("/employe");
        }, 1000);
      } catch (error) {
        toast.dismiss(loadingToast);
        if (error.status === 409) {
          toast.error("A employe with this email already exists");
        } else if (error.data?.message) {
          toast.error(error.data.message);
        } else {
          toast.error("Failed to create employe. Please try again.");
        }
      }
    } else {
      // Show validation error toast
      toast.error("Please fix the errors in the form");

      // Scroll to the first error
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-6 rounded-xl space-y-6">
      <div className="flex justify-between items-center mb-4 p-5">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white dark:text-medium">
          Add Employe
        </h1>
        <Link
          href="/employe"
          className=" text-primary hover:text-gray-800 px-5 py-1.5 rounded  center gap-3"
        >
          <MoveLeft className="size-5" />
          All Employe
        </Link>
      </div>
      <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-[#161F2D] rounded-xl border border-gray-200">
        <h1 className="text-xl font-semibold dark:font-medium mb-6">
          Add Employe
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <Input
              label={
                <span>
                  Full Name <span className="text-red-500">*</span>
                </span>
              }
              placeholder="Mr. Abu Taher"
              value={formData.name}
              onValueChange={(value) => handleInputChange("name", value)}
              fullWidth
              className="h-12 dark:border-[#475569]"
              error={errors.name}
            />

            {/* Email Address */}
            <Input
              label={
                <span>
                  Email Address <span className="text-red-500">*</span>
                </span>
              }
              type="email"
              placeholder="abutaher@gmail.com"
              value={formData.email}
              onValueChange={(value) => handleInputChange("email", value)}
              fullWidth
              className="h-12 dark:border-[#475569]"
              error={errors.email}
            />

            {/* Phone Number */}
            <Input
              label={
                <span>
                  Phone Number <span className="text-red-500">*</span>
                </span>
              }
              placeholder="+8801334144130"
              value={formData.phoneNumber}
              onValueChange={(value) => handleInputChange("phoneNumber", value)}
              fullWidth
              type="tel"
              className="h-12 dark:border-[#475569]"
              error={errors.phoneNumber}
            />

            {/* Password */}
            <Input
              label={
                <span>
                  Password <span className="text-red-500">*</span>
                </span>
              }
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••••••••••"
              value={formData.password}
              onValueChange={(value) => handleInputChange("password", value)}
              fullWidth
              className="h-12 dark:border-[#475569]"
              error={errors.password}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              }
            />

            {/* Designation */}
            <Input
              label={
                <span>
                  Designation <span className="text-red-500">*</span>
                </span>
              }
              placeholder="Software Engineer"
              value={formData.designation}
              onValueChange={(value) => handleInputChange("designation", value)}
              fullWidth
              className="h-12 dark:border-[#475569]"
              error={errors.designation}
            />

            {/* Status */}
            <Select
              label={"Status"}
              options={statusOptions}
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              fullWidth
              className="h-12 dark:border-[#475569]"
              error={errors.status}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* employe Role */}
            <div>
              <Select
                label={"Employe Role"}
                options={employeRoleOptions}
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                fullWidth
                className="h-12 dark:border-[#475569]"
                error={errors.role}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 dark:font-normal mb-2 text-sm font-medium">
                Employe Profile <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#434F69] rounded-full flex items-center justify-center text-white overflow-hidden">
                  {formData.profileImage?.url ? (
                    <img
                      src={formData.profileImage.url || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LuCamera className="h-6 w-6" />
                  )}
                </div>
                <label className="flex-1 border-2 border-dashed border-gray-300 rounded-md px-4 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex justify-center items-center gap-3">
                    <ImagePlus className="text-primary" />
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Drag your image here, or{" "}
                        <span className="text-blue-500 font-medium">
                          Browse
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Supports JPG, PNG, GIF (Max 2MB)
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {errors.profileImage && (
                <p className="text-xs text-red-500 mt-1.5 error-message">
                  {errors.profileImage}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end ">
            <div className="w-fit">
              <Button
                type="submit"
                className="w-full  h-11"
                endIcon={<LuArrowRight />}
                disabled={isLoading}
              >
                {isLoading ? "Creating Employe..." : "Create Employe"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
