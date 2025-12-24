"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import logoImg from "@/public/img/logo/logo.png";
import { Input } from "@/components/ui/input/Input";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/features/auth/authApiSlice";
import forgotPassImgDark from "@/public/img/login/resetPasswordDark.png";
import forgotPassImgLight from "@/public/img/login/resetPasswordLight.png";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [formValues, setFormValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValues.password || !formValues.confirmPassword) {
      toast.error("Please fill in both fields.", {
        id: "empty-fields",
      });
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      toast.error("Passwords do not match.", {
        id: "password-mismatch",
      });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Resetting password...");

    try {
      await resetPassword({
        email,
        token,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
      }).unwrap();

      toast.dismiss(loadingToast);
      toast.success("Password reset successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-darkPrimary p-5">
      <div className="w-1/2 h-full center">
        <div className="max-w-md w-md mx-auto">
          <Image src={logoImg} alt="Logo" className="h-fit w-48" />

          <h1 className="text-3xl font-medium mt-5">Create New Password</h1>
          <p className="text-[#B0B0B0] mt-2">
            Your new password must be different from previously used ones.
          </p>

          <form className="space-y-6 mt-10" onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              required
              className="h-12 dark:bg-[#050B16] bg-[#DEEDFF26] dark:border-[#475569] border-[#B6DCFF80]"
              startIcon={<LuLock className="h-4 w-4" />}
              endIcon={
                showPassword ? (
                  <LuEye
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <LuEyeOff
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )
              }
              fullWidth
              value={formValues.password}
              onValueChange={(value) =>
                setFormValues((prev) => ({ ...prev, password: value }))
              }
              name="password"
            />

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              required
              className="h-12 dark:bg-[#050B16] bg-[#DEEDFF26] dark:border-[#475569] border-[#B6DCFF80]"
              startIcon={<LuLock className="h-4 w-4" />}
              endIcon={
                showConfirmPassword ? (
                  <LuEye
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <LuEyeOff
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => setShowConfirmPassword(true)}
                  />
                )
              }
              fullWidth
              value={formValues.confirmPassword}
              onValueChange={(value) =>
                setFormValues((prev) => ({
                  ...prev,
                  confirmPassword: value,
                }))
              }
              name="confirmPassword"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0067D2] text-white py-2.5 text-sm rounded hover:bg-[#0056b3] transition duration-200 mt-5 disabled:bg-[#6ea8e0] disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      <div className="w-1/2 h-full bg-[#F2F7FF] dark:bg-[#091222] rounded-2xl center flex-col">
        <Image
          src={theme === "light" ? forgotPassImgLight : forgotPassImgDark}
          alt="Reset Password"
          className="rounded-2xl "
        />
      </div>
    </div>
  );
}
