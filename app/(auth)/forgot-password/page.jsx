"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { LuMail } from "react-icons/lu";
import { useRouter } from "next/navigation";
import logoImg from "@/public/img/logo/logo.png";
import { Input } from "@/components/ui/input/Input";
import forgotPassImgLight from "@/public/img/login/forgotPassword.png";
import forgotPassImgDark from "@/public/img/login/darkForgotPassword.png";
import { useForgotPasswordMutation } from "@/features/auth/authApiSlice";

export default function ForgotPassPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Sending reset link...");
    try {
      await forgotPassword({ email }).unwrap();
      toast.dismiss(loadingToast);

      toast.success("Reset link sent to your email.");
      setEmail("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(
        err?.data?.message || "Failed to send reset link. Try again later.",
      );
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-darkPrimary p-5">
      <div className="w-1/2 h-full center">
        <div className="max-w-md w-md mx-auto">
          <Image src={logoImg} alt="Logo" className="h-fit w-48" />
          <h1 className="text-3xl font-medium mt-5">Forgot Password?</h1>
          <p className="text-[#B0B0B0] mt-2">
            No worries! We'll send you a link to reset your password.
          </p>

          <form
            className="space-y-6 mt-10"
            onSubmit={handleSubmit}
            autoComplete="on"
          >
            <Input
              type="email"
              className="h-12 dark:bg-[#050B16] bg-[#DEEDFF26] dark:border-[#475569] border-[#B6DCFF80]"
              placeholder="Enter email"
              startIcon={<LuMail className="h-4 w-4" />}
              fullWidth
              value={email}
              onValueChange={(value) => setEmail(value)}
              error={
                email && !email.includes("@")
                  ? "Please enter a valid email"
                  : ""
              }
              name="email"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0067D2] text-white py-2.5 text-sm rounded hover:bg-[#0056b3] transition duration-200  disabled:bg-[#6ea8e0] disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="loader">Loading...</span>
              ) : (
                "Reset Password"
              )}
            </button>

            <Link
              href="/login"
              className="center gap-1  dark:text-[#0067D2] dark:hover:text-gray-400 text-gray-400 hover:text-[#0056b3] transition duration-200"
            >
              <Icon icon="basil:arrow-left-solid" className="size-7 mt-0.5" />
              <p className="text-sm text-center">Back to Login</p>
            </Link>
          </form>
        </div>
      </div>

      <div className="w-1/2 h-full bg-[#F2F7FF] dark:bg-[#091222] rounded-2xl center flex-col">
        <Image
          src={theme === "light" ? forgotPassImgLight : forgotPassImgDark}
          alt="Forgot Password"
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
